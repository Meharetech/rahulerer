// Post Scheduling JavaScript - Modern UI
let selectedAssemblies = [];
let availableExcelFiles = {};
let selectedExcelFiles = [];
let currentStep = 1;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAssemblies();
    loadScheduledPosts();
    setupEventListeners();
    
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
        if (currentStep === 2 && selectedExcelFiles.length === 0) {
            showError('Please select at least one Excel file to continue.');
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
        nextStep2.disabled = selectedExcelFiles.length === 0;
    }
}

// Load assemblies with their Excel files
async function loadAssemblies() {
    try {
        const response = await fetch('/api/assemblies-with-groups');
        const data = await response.json();
        
        if (data.success) {
            displayAssemblies(data.assemblies);
            availableExcelFiles = data.assemblies.reduce((acc, assembly) => {
                acc[assembly.id] = assembly.excel_files;
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
    updateExcelFileSelection();
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

// Update Excel file selection based on selected assemblies
function updateExcelFileSelection() {
    if (selectedAssemblies.length === 0) {
        return;
    }
    
    // Get all Excel files from selected assemblies
    const allExcelFiles = [];
    selectedAssemblies.forEach(assemblyId => {
        const files = availableExcelFiles[assemblyId] || [];
        files.forEach(fileName => {
            if (!allExcelFiles.includes(fileName)) {
                allExcelFiles.push(fileName);
            }
        });
    });
    
    // Display Excel files
    displayExcelFiles(allExcelFiles);
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
                    <input type="checkbox" value="${fileName}" checked onchange="toggleExcelFile('${fileName}')">
                    <span class="group-name">${fileName}</span>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Initialize selected Excel files
    selectedExcelFiles = [...files];
    totalCount.textContent = files.length;
    selectedCount.textContent = files.length;
    
    updateNextButtonStates();
}

// Toggle group card selection
function toggleGroupCard(fileName) {
    const checkbox = document.querySelector(`input[value="${fileName}"]`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        toggleExcelFile(fileName);
    }
}

// Toggle Excel file selection
function toggleExcelFile(fileName) {
    const checkbox = document.querySelector(`input[value="${fileName}"]`);
    const card = checkbox.closest('.group-card');
    
    if (checkbox.checked) {
        if (!selectedExcelFiles.includes(fileName)) {
            selectedExcelFiles.push(fileName);
        }
        card.classList.add('selected');
    } else {
        selectedExcelFiles = selectedExcelFiles.filter(name => name !== fileName);
        card.classList.remove('selected');
    }
    
    // Update counters
    document.getElementById('selectedGroupsCount').textContent = selectedExcelFiles.length;
    updateNextButtonStates();
}

// Select all Excel files
function selectAllGroups() {
    const checkboxes = document.querySelectorAll('#groupsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            toggleExcelFile(checkbox.value);
        }
    });
}

// Deselect all Excel files
function deselectAllGroups() {
    const checkboxes = document.querySelectorAll('#groupsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            toggleExcelFile(checkbox.value);
        }
    });
}

// Form submission
document.getElementById('postScheduleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (selectedExcelFiles.length === 0) {
        showError('Please select at least one Excel file.');
        return;
    }
    
    // Get submit button and show loading state
    const submitButton = this.querySelector('button[type="submit"]');
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
    
    // Add selected Excel files
    selectedExcelFiles.forEach(fileName => {
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
        
        const response = await fetch('/api/create-scheduled-post', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Hide loading modal
        hideLoadingModal();
        
        if (data.success) {
            showSuccess('Post scheduled successfully! You will receive an email confirmation shortly.');
            resetForm();
            loadScheduledPosts();
        } else {
            showError('Failed to schedule post: ' + data.message);
        }
    } catch (error) {
        // Hide loading modal
        hideLoadingModal();
        showError('Error scheduling post: ' + error.message);
    } finally {
        // Restore button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});

// Load scheduled posts
async function loadScheduledPosts() {
    try {
        const response = await fetch('/api/scheduled-posts');
        const data = await response.json();
        
        if (data.success) {
            displayScheduledPosts(data.posts);
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
    selectedExcelFiles = [];
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
    const modal = document.getElementById('successModal');
    const modalMessage = document.getElementById('successMessage');
    
    if (modalMessage) modalMessage.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Show error modal
function showError(message) {
    const modal = document.getElementById('errorModal');
    const modalMessage = document.getElementById('errorMessage');
    
    if (modalMessage) modalMessage.textContent = message;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
