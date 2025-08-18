// Post Scheduling JavaScript
let selectedAssemblies = [];
let availableExcelFiles = {};
let selectedExcelFiles = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAssemblies();
    loadScheduledPosts();
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('scheduled_date').value = tomorrow.toISOString().split('T')[0];
    
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('scheduled_time').value = now.toTimeString().slice(0, 5);
});

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
            <div class="assembly-card">
                <label class="assembly-checkbox">
                    <input type="checkbox" value="${assembly.id}" onchange="toggleAssembly(${assembly.id})">
                    <span class="checkmark"></span>
                    <div class="assembly-info">
                        <h5>${assembly.name}</h5>
                        <span class="group-count">${fileCount} Total Groups available </span>
                    </div>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Toggle assembly selection
function toggleAssembly(assemblyId) {
    const checkbox = document.querySelector(`input[value="${assemblyId}"]`);
    
    if (checkbox.checked) {
        if (!selectedAssemblies.includes(assemblyId)) {
            selectedAssemblies.push(assemblyId);
        }
    } else {
        selectedAssemblies = selectedAssemblies.filter(id => id !== assemblyId);
    }
    
    updateExcelFileSelection();
}

// Update Excel file selection based on selected assemblies
function updateExcelFileSelection() {
    if (selectedAssemblies.length === 0) {
        document.getElementById('groupSelectionSection').style.display = 'none';
        document.getElementById('schedulingSection').style.display = 'none';
        return;
    }
    
    // Show Excel file selection
    document.getElementById('groupSelectionSection').style.display = 'block';
    
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
    
    // Show scheduling section
    document.getElementById('schedulingSection').style.display = 'block';
}

// Display Excel files with checkboxes
function displayExcelFiles(files) {
    const container = document.getElementById('groupsContainer');
    
    if (files.length === 0) {
        container.innerHTML = '<p class="no-data">No Excel files found in selected assemblies.</p>';
        return;
    }
    
    let html = '<div class="groups-grid">';
    files.forEach(fileName => {
        html += `
            <div class="group-card">
                <label class="group-checkbox">
                    <input type="checkbox" value="${fileName}" checked onchange="toggleExcelFile('${fileName}')">
                    <span class="checkmark"></span>
                    <span class="group-name">${fileName}</span>
                </label>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
    
    // Initialize selected Excel files
    selectedExcelFiles = [...files];
}

// Toggle Excel file selection
function toggleExcelFile(fileName) {
    const checkbox = document.querySelector(`input[value="${fileName}"]`);
    
    if (checkbox.checked) {
        if (!selectedExcelFiles.includes(fileName)) {
            selectedExcelFiles.push(fileName);
        }
    } else {
        selectedExcelFiles = selectedExcelFiles.filter(name => name !== fileName);
    }
}

// Select all Excel files
function selectAllGroups() {
    const checkboxes = document.querySelectorAll('#groupsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        if (!selectedExcelFiles.includes(checkbox.value)) {
            selectedExcelFiles.push(checkbox.value);
        }
    });
}

// Deselect all Excel files
function deselectAllGroups() {
    const checkboxes = document.querySelectorAll('#groupsContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedExcelFiles = [];
}

// Form submission
document.getElementById('postScheduleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (selectedExcelFiles.length === 0) {
        showError('Please select at least one Excel file.');
        return;
    }
    
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
        const response = await fetch('/api/create-scheduled-post', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Post scheduled successfully!');
            resetForm();
            loadScheduledPosts();
        } else {
            showError('Failed to schedule post: ' + data.message);
        }
    } catch (error) {
        showError('Error scheduling post: ' + error.message);
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
                <div class="post-cell title-cell">${post.title}</div>
                <div class="post-cell date-cell">${formatDateTime(scheduledDateTime)}</div>
                <div class="post-cell files-cell">${post.target_groups.length}</div>
                <div class="post-cell message-cell">${post.message_text ? post.message_text.substring(0, 50) + (post.message_text.length > 50 ? '...' : '') : 'No message'}</div>
                <div class="post-cell content-cell">${contentText}</div>
                <div class="post-cell status-cell">
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
    
    // Uncheck all assembly checkboxes
    document.querySelectorAll('#assemblySelection input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Hide sections
    document.getElementById('groupSelectionSection').style.display = 'none';
    document.getElementById('schedulingSection').style.display = 'none';
    
    // Set default date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('scheduled_date').value = tomorrow.toISOString().split('T')[0];
    
    const now = new Date();
    now.setHours(now.getHours() + 1);
    document.getElementById('scheduled_time').value = now.toTimeString().slice(0, 5);
}

// Show success modal
function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').style.display = 'block';
}

// Show error modal
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
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
