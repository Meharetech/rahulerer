// Modern Post Scheduling JavaScript - Enhanced UI
let selectedAssemblies = [];
let availableCsvFiles = {};
let selectedCsvFiles = [];
let currentStep = 1;
let filteredGroups = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAssemblies();
    loadScheduledPosts();
    setupEventListeners();
    setupFormSubmission();
    updateQuickStats();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('scheduled_date').value = tomorrow.toISOString().split('T')[0];
    
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('scheduled_time').value = now.toTimeString().slice(0, 5);
});

// Setup event listeners
function setupEventListeners() {
    // Character counter for message text
    const messageTextarea = document.getElementById('message_text');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', function() {
            const charCount = this.value.length;
            document.getElementById('charCount').textContent = charCount;
        });
    }
    
    // Group search functionality
    const groupSearch = document.getElementById('groupSearch');
    if (groupSearch) {
        groupSearch.addEventListener('input', function() {
            filterGroups();
        });
    }
}

// Update quick stats in header
function updateQuickStats() {
    document.getElementById('quickSelectedAssemblies').textContent = selectedAssemblies.length;
    document.getElementById('quickSelectedGroups').textContent = selectedCsvFiles.length;
    
    // Update scheduled posts count (this would need to be fetched from API)
    // For now, we'll set it to 0 and update it when we load scheduled posts
    document.getElementById('quickScheduledPosts').textContent = '0';
}

// Filter groups based on search input
function filterGroups() {
    const searchTerm = document.getElementById('groupSearch').value.toLowerCase();
    const groupCards = document.querySelectorAll('.group-card');
    
    groupCards.forEach(card => {
        const groupName = card.querySelector('.group-name').textContent.toLowerCase();
        // Search in the display name (without .csv extension)
        if (groupName.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Preview post functionality
function previewPost() {
    if (selectedCsvFiles.length === 0) {
        showError('Please select at least one group to preview the post.');
        return;
    }
    
    const title = document.getElementById('title').value;
    const message = document.getElementById('message_text').value;
    const scheduledDate = document.getElementById('scheduled_date').value;
    const scheduledTime = document.getElementById('scheduled_time').value;
    
    if (!title) {
        showError('Please enter a post title to preview.');
        return;
    }
    
    // Create preview content
    let previewContent = `
        <div class="preview-content">
            <h3>Post Preview</h3>
            <div class="preview-section">
                <h4>Title:</h4>
                <p>${title}</p>
            </div>
            <div class="preview-section">
                <h4>Message:</h4>
                <p>${message || 'No message text'}</p>
            </div>
            <div class="preview-section">
                <h4>Schedule:</h4>
                <p>${scheduledDate} at ${scheduledTime}</p>
            </div>
            <div class="preview-section">
                <h4>Target Groups:</h4>
                <p>${selectedCsvFiles.length} groups selected</p>
                <ul>
                    ${selectedCsvFiles.map(fileName => {
                        const displayName = fileName.replace(/\.csv$/i, '');
                        return `<li>${displayName}</li>`;
                    }).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // Show preview in a modal (you can create a preview modal)
    showSuccess('Post preview generated successfully!');
}

// Test function to manually submit form (for debugging)
function testFormSubmission() {
    console.log('Testing form submission...');
    const form = document.getElementById('postScheduleForm');
    if (form) {
        console.log('Form found, triggering submit event');
        form.dispatchEvent(new Event('submit'));
    } else {
        console.log('Form not found!');
    }
}

// Make test function available globally for debugging
window.testFormSubmission = testFormSubmission;

// Function to check if form is ready for submission
function checkFormReady() {
    console.log('=== FORM READINESS CHECK ===');
    console.log('Selected assemblies:', selectedAssemblies);
    console.log('Selected CSV files:', selectedCsvFiles);
    console.log('Current step:', currentStep);
    
    const title = document.getElementById('title')?.value?.trim();
    const scheduledDate = document.getElementById('scheduled_date')?.value;
    const scheduledTime = document.getElementById('scheduled_time')?.value;
    
    console.log('Title:', title);
    console.log('Scheduled date:', scheduledDate);
    console.log('Scheduled time:', scheduledTime);
    
    const isReady = title && scheduledDate && scheduledTime && selectedAssemblies.length > 0 && selectedCsvFiles.length > 0;
    console.log('Form ready for submission:', isReady);
    console.log('========================');
    
    return isReady;
}

// Make check function available globally for debugging
window.checkFormReady = checkFormReady;

// Test function to show success modal
function testSuccessModal() {
    console.log('Testing success modal...');
    showSuccess('Test success message - Post scheduled successfully!');
}

// Test function to show error modal
function testErrorModal() {
    console.log('Testing error modal...');
    showError('Test error message - Something went wrong!');
}

// Make test functions available globally for debugging
window.testSuccessModal = testSuccessModal;
window.testErrorModal = testErrorModal;

// Enhanced display functions with better UI
function displayAssemblies(assemblies) {
    const container = document.getElementById('assemblySelection');
    
    if (assemblies.length === 0) {
        container.innerHTML = '<p class="no-data">No assemblies found. Please contact an administrator.</p>';
        return;
    }
    
    let html = '<div class="assemblies-grid">';
    assemblies.forEach(assembly => {
        const fileCount = assembly.total_files;
        html += `
            <div class="assembly-card" onclick="toggleAssemblyCard(${assembly.id})">
                <label class="assembly-checkbox">
                    <input type="checkbox" value="${assembly.id}" onchange="toggleAssembly(${assembly.id})">
                    <div class="assembly-info">
                        <h5>${assembly.name}</h5>
                        <span class="group-count">${fileCount} Total Groups available</span>
                    </div>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Enhanced display functions for groups
function displayCsvFiles(files) {
    const container = document.getElementById('groupsContainer');
    const totalCount = document.getElementById('totalGroupsCount');
    const selectedCount = document.getElementById('selectedGroupsCount');
    
    if (files.length === 0) {
        container.innerHTML = '<p class="no-data">No CSV files found in selected assemblies.</p>';
        totalCount.textContent = '0';
        selectedCount.textContent = '0';
        return;
    }
    
    let html = '<div class="groups-grid">';
    files.forEach(fileName => {
        // Remove .csv extension from display name
        const displayName = fileName.replace(/\.csv$/i, '');
        html += `
            <div class="group-card" onclick="toggleGroupCard('${fileName}')">
                <label class="group-checkbox">
                    <input type="checkbox" value="${fileName}" checked onchange="toggleCsvFile('${fileName}')">
                    <span class="group-name">${displayName}</span>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Initialize selected CSV files
    selectedCsvFiles = [...files];
    filteredGroups = [...files];
    totalCount.textContent = files.length;
    selectedCount.textContent = files.length;
    
    updateNextButtonStates();
    updateQuickStats();
}

// Media Preview Functions
function previewMedia(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (!file) {
        preview.style.display = 'none';
        return;
    }
    
    // Validate file size
    const maxSizes = {
        'image_file': 5 * 1024 * 1024, // 5MB
        'audio_file': 10 * 1024 * 1024, // 10MB
        'video_file': 50 * 1024 * 1024 // 50MB
    };
    
    if (file.size > maxSizes[inputId]) {
        showError(`File size too large. Maximum size is ${maxSizes[inputId] / (1024 * 1024)}MB.`);
        input.value = '';
        preview.style.display = 'none';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        switch(inputId) {
            case 'image_file':
                const img = document.getElementById('imagePreviewImg');
                img.src = e.target.result;
                break;
            case 'audio_file':
                const audio = document.getElementById('audioPreviewPlayer');
                audio.src = e.target.result;
                break;
            case 'video_file':
                const video = document.getElementById('videoPreviewPlayer');
                video.src = e.target.result;
                break;
        }
        preview.style.display = 'block';
    };
    
    reader.readAsDataURL(file);
}

function removeMedia(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    input.value = '';
    preview.style.display = 'none';
    
    // Clear the preview source
    switch(inputId) {
        case 'image_file':
            document.getElementById('imagePreviewImg').src = '';
            break;
        case 'audio_file':
            document.getElementById('audioPreviewPlayer').src = '';
            break;
        case 'video_file':
            document.getElementById('videoPreviewPlayer').src = '';
            break;
    }
}

// Step Navigation Functions
function nextStep() {
    if (currentStep < 3) {
        // Validate current step
        if (currentStep === 1 && selectedAssemblies.length === 0) {
            showError('Please select at least one assembly to continue.');
            return;
        }
        if (currentStep === 2 && selectedCsvFiles.length === 0) {
            showError('Please select at least one CSV file to continue.');
            return;
        }
        
        currentStep++;
        updateStepDisplay();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // Hide all sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSection = document.getElementById(getSectionId(currentStep));
    if (currentSection) {
        currentSection.classList.add('active');
    }
    
    // Update progress steps
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else if (index + 1 < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update next button states
    updateNextButtonStates();
}

function getSectionId(step) {
    switch(step) {
        case 1: return 'assemblySection';
        case 2: return 'groupSection';
        case 3: return 'schedulingSection';
        default: return 'assemblySection';
    }
}

function updateNextButtonStates() {
    const nextStep1 = document.getElementById('nextStep1');
    const nextStep2 = document.getElementById('nextStep2');
    
    if (nextStep1) {
        nextStep1.disabled = selectedAssemblies.length === 0;
    }
    if (nextStep2) {
        nextStep2.disabled = selectedCsvFiles.length === 0;
    }
}

// Load assemblies with their CSV files
async function loadAssemblies() {
    try {
        const response = await fetch('/api/assemblies-with-groups');
        const data = await response.json();
        
        if (data.success) {
            displayAssemblies(data.assemblies);
            availableCsvFiles = data.assemblies.reduce((acc, assembly) => {
                acc[assembly.id] = assembly.csv_files || assembly.excel_files; // Support both for backward compatibility
                return acc;
            }, {});
        } else {
            showError('Failed to load assemblies: ' + data.message);
        }
    } catch (error) {
        showError('Error loading assemblies: ' + error.message);
    }
}

// Display assemblies with checkboxes
function displayAssemblies(assemblies) {
    const container = document.getElementById('assemblySelection');
    
    if (assemblies.length === 0) {
        container.innerHTML = '<p class="no-data">No assemblies found. Please contact an administrator.</p>';
        return;
    }
    
    let html = '<div class="assemblies-grid">';
    assemblies.forEach(assembly => {
        const fileCount = assembly.total_files;
        html += `
            <div class="assembly-card" onclick="toggleAssemblyCard(${assembly.id})">
                <label class="assembly-checkbox">
                    <input type="checkbox" value="${assembly.id}" onchange="toggleAssembly(${assembly.id})">
                    <div class="assembly-info">
                        <h5>${assembly.name}</h5>
                        <span class="group-count">${fileCount} Total Groups available</span>
                    </div>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Toggle assembly card selection
function toggleAssemblyCard(assemblyId) {
    const checkbox = document.querySelector(`input[value="${assemblyId}"]`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        toggleAssembly(assemblyId);
    }
}

// Toggle assembly selection
function toggleAssembly(assemblyId) {
    const checkbox = document.querySelector(`input[value="${assemblyId}"]`);
    const card = checkbox.closest('.assembly-card');
    
    if (checkbox.checked) {
        if (!selectedAssemblies.includes(assemblyId)) {
            selectedAssemblies.push(assemblyId);
        }
        card.classList.add('selected');
    } else {
        selectedAssemblies = selectedAssemblies.filter(id => id !== assemblyId);
        card.classList.remove('selected');
    }
    
    updateNextButtonStates();
    updateCsvFileSelection();
    updateQuickStats();
}

// Select all assemblies
function selectAllAssemblies() {
    const checkboxes = document.querySelectorAll('#assemblySelection input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            toggleAssembly(parseInt(checkbox.value));
        }
    });
}

// Clear all assemblies
function clearAllAssemblies() {
    const checkboxes = document.querySelectorAll('#assemblySelection input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            toggleAssembly(parseInt(checkbox.value));
        }
    });
}

// Update CSV file selection based on selected assemblies
function updateCsvFileSelection() {
    if (selectedAssemblies.length === 0) {
        return;
    }
    
    // Get all CSV files from selected assemblies
    const allCsvFiles = [];
    selectedAssemblies.forEach(assemblyId => {
        const files = availableCsvFiles[assemblyId] || [];
        files.forEach(fileName => {
            if (!allCsvFiles.includes(fileName)) {
                allCsvFiles.push(fileName);
            }
        });
    });
    
    // Display CSV files
    displayCsvFiles(allCsvFiles);
}

// Display Excel files with checkboxes
function displayExcelFiles(files) {
    const container = document.getElementById('groupsContainer');
    const totalCount = document.getElementById('totalGroupsCount');
    const selectedCount = document.getElementById('selectedGroupsCount');
    
    if (files.length === 0) {
        container.innerHTML = '<p class="no-data">No Excel files found in selected assemblies.</p>';
        totalCount.textContent = '0';
        selectedCount.textContent = '0';
        return;
    }
    
    let html = '<div class="groups-grid">';
    files.forEach(fileName => {
        html += `
            <div class="group-card" onclick="toggleGroupCard('${fileName}')">
                <label class="group-checkbox">
                    <input type="checkbox" value="${fileName}" checked onchange="toggleCsvFile('${fileName}')">
                    <span class="group-name">${fileName}</span>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Initialize selected CSV files
    selectedCsvFiles = [...files];
    totalCount.textContent = files.length;
    selectedCount.textContent = files.length;
    
    updateNextButtonStates();
}

// Toggle group card selection
function toggleGroupCard(fileName) {
    const checkbox = document.querySelector(`input[value="${fileName}"]`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        toggleCsvFile(fileName);
    }
}

// Toggle CSV file selection
function toggleCsvFile(fileName) {
    const checkbox = document.querySelector(`input[value="${fileName}"]`);
    const card = checkbox.closest('.group-card');
    
    if (checkbox.checked) {
        if (!selectedCsvFiles.includes(fileName)) {
            selectedCsvFiles.push(fileName);
        }
        card.classList.add('selected');
    } else {
        selectedCsvFiles = selectedCsvFiles.filter(name => name !== fileName);
        card.classList.remove('selected');
    }
    
    // Update counters
    document.getElementById('selectedGroupsCount').textContent = selectedCsvFiles.length;
    updateNextButtonStates();
    updateQuickStats();
}

// Select all CSV files
function selectAllGroups() {
    const checkboxes = document.querySelectorAll('#groupsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            toggleCsvFile(checkbox.value);
        }
    });
}

// Deselect all CSV files
function deselectAllGroups() {
    const checkboxes = document.querySelectorAll('#groupsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            toggleCsvFile(checkbox.value);
        }
    });
}

// Setup form submission with retry mechanism
function setupFormSubmission() {
    const form = document.getElementById('postScheduleForm');
    if (form) {
        console.log('Form found, setting up submission listener');
        form.addEventListener('submit', handleFormSubmission);
        
        // Also add click event to submit button as backup
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                console.log('Submit button clicked');
                // Let the form submission handle it
            });
        }
    } else {
        console.log('Form not found, retrying in 1 second...');
        setTimeout(setupFormSubmission, 1000);
    }
}

// Form submission handler
async function handleFormSubmission(e) {
    e.preventDefault();
    console.log('Form submission started');
    
    if (selectedCsvFiles.length === 0) {
        showError('Please select at least one CSV file.');
        return;
    }
    
    console.log('Selected CSV files:', selectedCsvFiles);
    console.log('Selected assemblies:', selectedAssemblies);
    
    // Validate required fields
    const title = document.getElementById('title').value.trim();
    const scheduledDate = document.getElementById('scheduled_date').value;
    const scheduledTime = document.getElementById('scheduled_time').value;
    
    if (!title) {
        showError('Please enter a post title.');
        return;
    }
    
    if (!scheduledDate) {
        showError('Please select a scheduled date.');
        return;
    }
    
    if (!scheduledTime) {
        showError('Please select a scheduled time.');
        return;
    }
    
    if (selectedAssemblies.length === 0) {
        showError('Please select at least one assembly.');
        return;
    }
    
    console.log('All validations passed');
    
    // Check if we're on the right step
    if (currentStep !== 3) {
        showError('Please complete all steps before submitting.');
        return;
    }
    
    // Get submit button and show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    if (!submitButton) {
        showError('Submit button not found. Please try again.');
        return;
    }
    
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
    
    // Show loading modal
    showLoadingModal('Scheduling your post...', 'Please wait while we process your request.');
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('message_text', document.getElementById('message_text').value);
    formData.append('scheduled_date', document.getElementById('scheduled_date').value);
    formData.append('scheduled_time', document.getElementById('scheduled_time').value);
    formData.append('assembly_id', selectedAssemblies[0]); // Use first selected assembly
    
    // Add selected CSV files
    selectedCsvFiles.forEach(fileName => {
        formData.append('selected_groups[]', fileName);
    });
    
    // Add files
    const imageFile = document.getElementById('image_file').files[0];
    const audioFile = document.getElementById('audio_file').files[0];
    const videoFile = document.getElementById('video_file').files[0];
    
    if (imageFile) formData.append('image_file', imageFile);
    if (audioFile) formData.append('audio_file', audioFile);
    if (videoFile) formData.append('video_file', videoFile);
    
    try {
        // Simulate some processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Sending request to /api/create-scheduled-post');
        console.log('Form data contents:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        
        const response = await fetch('/api/create-scheduled-post', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        // Hide loading modal
        hideLoadingModal();
        
        if (data.success) {
            console.log('Post scheduled successfully, showing success message');
            showSuccess('Post scheduled successfully! You will receive an email confirmation shortly.');
            resetForm();
            loadScheduledPosts();
        } else {
            console.log('Post scheduling failed:', data.message);
            showError('Failed to schedule post: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Form submission error:', error);
        // Hide loading modal
        hideLoadingModal();
        showError('Error scheduling post: ' + error.message);
    } finally {
        // Restore button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
}

// Load scheduled posts
async function loadScheduledPosts() {
    try {
        const response = await fetch('/api/scheduled-posts');
        const data = await response.json();
        
        if (data.success) {
            displayScheduledPosts(data.posts);
            // Update quick stats with scheduled posts count
            document.getElementById('quickScheduledPosts').textContent = data.posts.length;
        } else {
            showError('Failed to load scheduled posts: ' + data.message);
        }
    } catch (error) {
        showError('Error loading scheduled posts: ' + error.message);
    }
}

// Display scheduled posts
function displayScheduledPosts(posts) {
    const container = document.getElementById('scheduledPosts');
    
    if (posts.length === 0) {
        container.innerHTML = '<p class="no-data">No scheduled posts found.</p>';
        return;
    }
    
    let html = `
        <div class="posts-list-header">
            <div class="post-header-row">
                <div class="post-header-cell">Title</div>
                <div class="post-header-cell">Scheduled Date/Time</div>
                <div class="post-header-cell">Excel Files</div>
                <div class="post-header-cell">Message</div>
                <div class="post-header-cell">Content</div>
                <div class="post-header-cell">Status</div>
            </div>
        </div>
        <div class="posts-list-body">
    `;
    
    posts.forEach(post => {
        const scheduledDateTime = new Date(post.scheduled_date + 'T' + post.scheduled_time);
        const isPast = scheduledDateTime < new Date();
        
        // Get content types
        const contentTypes = [];
        if (post.image_file) contentTypes.push('Image');
        if (post.audio_file) contentTypes.push('Audio');
        if (post.video_file) contentTypes.push('Video');
        const contentText = contentTypes.length > 0 ? contentTypes.join(', ') : 'Text Only';
        
        html += `
            <div class="post-list-row status-${post.status}">
                <div class="post-cell title-cell" data-label="Title">${post.title}</div>
                <div class="post-cell date-cell" data-label="Scheduled">${formatDateTime(scheduledDateTime)}</div>
                <div class="post-cell files-cell" data-label="Files">${post.target_groups.length}</div>
                <div class="post-cell message-cell" data-label="Message">${post.message_text ? post.message_text.substring(0, 50) + (post.message_text.length > 50 ? '...' : '') : 'No message'}</div>
                <div class="post-cell content-cell" data-label="Content">${contentText}</div>
                <div class="post-cell status-cell" data-label="Status">
                    <span class="status-badge ${post.status}">${post.status.toUpperCase()}</span>
                    ${post.status === 'completed' && post.completion_file ? 
                        `<br><button class="btn btn-sm btn-outline-success" onclick="downloadCompletionFile(${post.id})" title="Download Completion File">
                            <i class="fas fa-download"></i> Completion File
                        </button>` : ''
                    }
                    ${post.status.toLowerCase() === 'pending' ? 
                        `<br><button class="btn btn-sm btn-outline-danger" onclick="confirmDeletePost(${post.id}, '${post.title}')" title="Delete Post">
                            <i class="fas fa-trash"></i> Delete
                        </button>` : ''
                    }
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Format date and time
function formatDateTime(dateTime) {
    return dateTime.toLocaleDateString() + ' ' + dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Reset form
function resetForm() {
    document.getElementById('postScheduleForm').reset();
    
    // Reset selections
    selectedAssemblies = [];
    selectedCsvFiles = [];
    currentStep = 1;
    
    // Uncheck all assembly checkboxes
    document.querySelectorAll('#assemblySelection input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Remove selected classes
    document.querySelectorAll('.assembly-card, .group-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset step display
    updateStepDisplay();
    
    // Reset counters
    document.getElementById('selectedGroupsCount').textContent = '0';
    document.getElementById('totalGroupsCount').textContent = '0';
    document.getElementById('charCount').textContent = '0';
    
    // Clear media previews
    removeMedia('image_file', 'imagePreview');
    removeMedia('audio_file', 'audioPreview');
    removeMedia('video_file', 'videoPreview');
    
    // Set default date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('scheduled_date').value = tomorrow.toISOString().split('T')[0];
    
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('scheduled_time').value = now.toTimeString().slice(0, 5);
}

// Show loading modal
function showLoadingModal(title, message) {
    const modal = document.getElementById('loadingModal');
    const modalTitle = document.getElementById('loadingModalTitle');
    const modalMessage = document.getElementById('loadingModalMessage');
    
    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide loading modal
function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show success modal
function showSuccess(message) {
    console.log('Showing success modal with message:', message);
    const modal = document.getElementById('successModal');
    const modalMessage = document.getElementById('successMessage');
    
    if (!modal) {
        console.error('Success modal not found!');
        return;
    }
    
    if (!modalMessage) {
        console.error('Success modal message element not found!');
        return;
    }
    
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log('Success modal displayed');
}

// Show error modal
function showError(message) {
    console.log('Showing error modal with message:', message);
    const modal = document.getElementById('errorModal');
    const modalMessage = document.getElementById('errorMessage');
    
    if (!modal) {
        console.error('Error modal not found!');
        return;
    }
    
    if (!modalMessage) {
        console.error('Error modal message element not found!');
        return;
    }
    
    modalMessage.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    console.log('Error modal displayed');
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Download completion file
async function downloadCompletionFile(postId) {
    try {
        const response = await fetch(`/api/download-completion-file/${postId}`);
        
        if (response.ok) {
            // Create a blob from the response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `completion_file_post_${postId}.xlsx`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showSuccess('Completion file downloaded successfully');
        } else {
            const data = await response.json();
            showError(`Download failed: ${data.message}`);
        }
    } catch (error) {
        showError('Error downloading completion file: ' + error.message);
    }
}

// Delete post functionality
let postToDelete = null;

function confirmDeletePost(postId, postTitle) {
    postToDelete = postId;
    document.getElementById('deletePostTitle').textContent = postTitle;
    openModal('deleteConfirmModal');
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

async function deletePost() {
    if (!postToDelete) {
        showError('No post selected for deletion');
        return;
    }
    
    try {
        // Show loading state
        const deleteBtn = document.querySelector('#deleteConfirmModal .btn-danger');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;
        
        const response = await fetch(`/api/scheduled-posts/${postToDelete}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Post deleted successfully');
            closeModal('deleteConfirmModal');
            
            // Reload the scheduled posts list
            loadScheduledPosts();
            
            // Reset
            postToDelete = null;
        } else {
            showError('Failed to delete post: ' + data.message);
        }
    } catch (error) {
        showError('Error deleting post: ' + error.message);
    } finally {
        // Reset button state
        const deleteBtn = document.querySelector('#deleteConfirmModal .btn-danger');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Post';
        deleteBtn.disabled = false;
    }
}
