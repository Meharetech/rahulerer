// Manage Topics JavaScript
let availableLabels = [];
let currentAssembly = null;
let assemblyGroups = [];
let filteredGroups = [];
let groupLabelsCache = {}; // Cache for group labels

// Pagination variables
let currentPage = 1;
let groupsPerPage = 20;
let totalPages = 1;

// Check if user session is valid
async function checkSession() {
    try {
        const response = await fetch('/api/check-session', {
            method: 'GET',
            credentials: 'same-origin'
        });
        
        if (!response.ok || response.status === 401) {
            console.log('Session invalid, redirecting to login');
            window.location.href = '/auth/user/login';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Manage Topics page loaded');
    
    // Check session first
    const sessionValid = await checkSession();
    if (!sessionValid) {
        return;
    }
    
    loadAssemblies();
    loadAvailableLabels();
});

// Load available assemblies
async function loadAssemblies() {
    try {
        const response = await fetch('/api/assemblies-with-groups', {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        
        if (data.success) {
            const select = document.getElementById('assemblySelect');
            select.innerHTML = '<option value="">Select an assembly...</option>';
            
            data.assemblies.forEach(assembly => {
                const option = document.createElement('option');
                option.value = assembly.name;
                option.textContent = assembly.name;
                select.appendChild(option);
            });
        } else {
            showError('Failed to load assemblies: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading assemblies:', error);
        if (error.message.includes('Unexpected token')) {
            showError('Authentication required. Please log in and try again.');
        } else {
            showError('Error loading assemblies: ' + error.message);
        }
    }
}

// Load available labels from CSV
async function loadAvailableLabels() {
    try {
        const response = await fetch('/api/get-labels', {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        
        if (data.success) {
            availableLabels = data.labels;
            displayAvailableLabels();
        } else {
            console.error('Failed to load labels:', data.message);
            // Fallback: load from CSV file
            await loadLabelsFromCSV();
        }
    } catch (error) {
        console.error('Error loading labels:', error);
        // Fallback: load from CSV file
        await loadLabelsFromCSV();
    }
}

// Fallback: Load labels from CSV file
async function loadLabelsFromCSV() {
    try {
        const response = await fetch('/static/label.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        availableLabels = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const [name, color, description] = line.split(',');
                if (name && color) {
                    availableLabels.push({
                        name: name.trim(),
                        color: color.trim(),
                        description: description ? description.trim() : ''
                    });
                }
            }
        }
        
        displayAvailableLabels();
    } catch (error) {
        console.error('Error loading labels from CSV:', error);
        showError('Error loading labels');
    }
}

// Display available labels
function displayAvailableLabels() {
    const container = document.getElementById('availableLabels');
    if (!container) return;
    
    // Update label count
    document.getElementById('totalLabelsCount').textContent = `${availableLabels.length} label${availableLabels.length !== 1 ? 's' : ''}`;
    
    if (availableLabels.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tags"></i><h4>No Labels</h4><p>No labels available. Add some labels to get started.</p></div>';
        return;
    }
    
    let html = '';
    availableLabels.forEach(label => {
        html += `
            <div class="label-item" style="background-color: ${label.color}" onclick="showLabelGroups('${label.name}')" title="Click to see groups using this label">
                <span class="label-name">${label.name}</span>
                <span class="label-description">${label.description}</span>
                <button class="remove-label" onclick="event.stopPropagation(); removeLabel('${label.name}')" title="Remove label">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load groups for selected assembly
async function loadGroupsForAssembly() {
    const select = document.getElementById('assemblySelect');
    const selectedAssembly = select.value;
    
    if (!selectedAssembly) {
        document.getElementById('groupsLabelsSection').style.display = 'none';
        return;
    }
    
    currentAssembly = selectedAssembly;
    
    // Clear cache when switching assemblies
    groupLabelsCache = {};
    
    // Reset pagination when switching assemblies
    currentPage = 1;
    
    try {
        // Show loading
        document.getElementById('groupsLabelsSection').style.display = 'block';
        document.getElementById('groupsContainer').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i>Loading groups and labels...</div>';
        
        // Load groups from CSV files
        const response = await fetch(`/api/assembly-groups`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assembly_name: selectedAssembly
            })
        });
        
        console.log('Assembly groups response status:', response.status);
        
        // Check if response is HTML (login page) instead of JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Received non-JSON response, likely login page. Status:', response.status);
            showError('Session expired. Please refresh the page and login again.');
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            assemblyGroups = data.groups || [];
            filteredGroups = [...assemblyGroups]; // Copy for filtering
            
            // Load all group labels at once for better performance
            await loadAllGroupLabels();
            
            displayGroups();
            updateGroupsStats();
        } else {
            throw new Error(data.message || 'Failed to load groups');
        }
        
    } catch (error) {
        console.error('Error loading groups:', error);
        document.getElementById('groupsContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Error Loading Groups</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Display groups with their labels
async function displayGroups() {
    const container = document.getElementById('groupsContainer');
    if (!container) return;
    
    if (filteredGroups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h4>No Groups Found</h4>
                <p>No groups found matching your search criteria.</p>
            </div>
        `;
        // Clear pagination when no groups
        updatePaginationControls();
        return;
    }
    
    // Calculate pagination
    calculatePagination();
    
    // Get current page groups
    const currentPageGroups = getCurrentPageGroups();
    
    // Show loading
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i>Loading group labels...</div>';
    
    let html = '';
    
    // Process groups using cached labels (no API calls needed)
    for (const group of currentPageGroups) {
        // Skip groups without valid group_name
        if (!group.group_name || group.group_name.trim() === '') {
            console.warn('Skipping group with invalid name:', group);
            continue;
        }
        
        const groupLabels = getGroupLabels(group.group_name);
        
        html += `
            <div class="group-item" data-group-name="${group.group_name.toLowerCase()}">
                <div class="group-header">
                    <div class="group-name">${group.group_name}</div>
                    <div class="group-phone-count">
                        <i class="fas fa-phone"></i>
                        ${group.phone_count || 0} phones
                    </div>
                </div>
                
                <div class="group-labels" id="labels-${group.group_name}">
                    ${groupLabels.map(label => `
                        <div class="group-label" style="background-color: ${label.color}">
                            ${label.name}
                            <button class="remove-group-label" onclick="removeLabelFromGroup('${group.group_name}', '${label.name}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="add-label-to-group">
                    <select id="addLabel-${group.group_name}" class="form-control">
                        <option value="">Select a label to add...</option>
                        ${availableLabels.filter(label => !groupLabels.some(gl => gl.name === label.name)).map(label => `
                            <option value="${label.name}">${label.name}</option>
                        `).join('')}
                    </select>
                    <button onclick="addLabelToGroup('${group.group_name}')">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    updateGroupsStats();
    updateLabelsStats();
    updatePaginationControls();
}

// Load all group labels for the current assembly at once
async function loadAllGroupLabels() {
    try {
        if (!currentAssembly) {
            console.error('No assembly selected');
            return {};
        }
        
        console.log('Loading all group labels for assembly:', currentAssembly);
        
        const response = await fetch('/api/get-all-group-labels', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assembly_name: currentAssembly
            })
        });
        
        console.log('Load all labels response status:', response.status);
        
        // Check if response is HTML (login page) instead of JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Received non-JSON response, likely login page. Status:', response.status);
            showError('Session expired. Please refresh the page and login again.');
            return {};
        }
        
        const data = await response.json();
        
        if (data.success) {
            groupLabelsCache = data.group_labels || {};
            console.log('Loaded group labels cache:', groupLabelsCache);
            return groupLabelsCache;
        } else {
            console.error('Error loading all group labels:', data.message);
            return {};
        }
    } catch (error) {
        console.error('Error loading all group labels:', error);
        if (error.message.includes('Unexpected token')) {
            showError('Session expired. Please refresh the page and login again.');
        }
        return {};
    }
}

// Get labels for a specific group (from cache)
function getGroupLabels(groupName) {
    try {
        // Check if currentAssembly is set
        if (!currentAssembly) {
            console.error('No assembly selected');
            return [];
        }
        
        // Check if groupName is valid
        if (!groupName || groupName.trim() === '') {
            console.error('Invalid group name:', groupName);
            return [];
        }
        
        // Get labels from cache
        const labelNames = groupLabelsCache[groupName] || [];
        return availableLabels.filter(label => labelNames.includes(label.name));
    } catch (error) {
        console.error('Error getting group labels from cache:', error);
        return [];
    }
}

// Update only a specific group's display (much faster than reloading all)
function updateGroupDisplay(groupName) {
    try {
        const groupElement = document.querySelector(`[data-group-name="${groupName.toLowerCase()}"]`);
        if (!groupElement) {
            console.warn('Group element not found for:', groupName);
            return;
        }
        
        const group = assemblyGroups.find(g => g.group_name === groupName);
        if (!group) {
            console.warn('Group data not found for:', groupName);
            return;
        }
        
        const groupLabels = getGroupLabels(groupName);
        
        // Update the labels section
        const labelsContainer = groupElement.querySelector('.group-labels');
        if (labelsContainer) {
            if (groupLabels.length === 0) {
                labelsContainer.innerHTML = '<span class="no-labels">No labels assigned</span>';
            } else {
                labelsContainer.innerHTML = groupLabels.map(label => `
                    <span class="label-tag">
                        ${label.name}
                        <button class="remove-label-btn" onclick="removeLabelFromGroup('${groupName}', '${label.name}')" title="Remove label">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `).join('');
            }
        }
        
        // Update the add label dropdown
        const addLabelSelect = groupElement.querySelector(`#addLabel-${groupName}`);
        if (addLabelSelect) {
            const currentLabelNames = groupLabels.map(label => label.name);
            const availableOptions = availableLabels.filter(label => !currentLabelNames.includes(label.name));
            
            addLabelSelect.innerHTML = '<option value="">Select a label...</option>' +
                availableOptions.map(label => `<option value="${label.name}">${label.name}</option>`).join('');
        }
        
        // Update labels statistics
        updateLabelsStats();
        
    } catch (error) {
        console.error('Error updating group display:', error);
    }
}

// Add label to group
async function addLabelToGroup(groupName) {
    const select = document.getElementById(`addLabel-${groupName}`);
    const selectedLabel = select.value;
    
    if (!selectedLabel) {
        showError('Please select a label to add');
        return;
    }
    
    // Show loading state
    const groupElement = document.querySelector(`[data-group-name="${groupName.toLowerCase()}"]`);
    if (groupElement) {
        const labelsContainer = groupElement.querySelector('.group-labels');
        if (labelsContainer) {
            labelsContainer.innerHTML = '<span class="loading-label"><i class="fas fa-spinner fa-spin"></i> Adding label...</span>';
        }
    }
    
    try {
        // Validate group name
        if (!groupName || groupName.trim() === '') {
            showError('Invalid group name');
            return;
        }
        
        // Get current labels
        const currentLabels = await getGroupLabels(groupName);
        const labelNames = currentLabels.map(label => label.name);
        
        if (!labelNames.includes(selectedLabel)) {
            labelNames.push(selectedLabel);
            
            // Save to server
            const response = await fetch('/api/save-group-labels', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assembly_name: currentAssembly,
                    group_name: groupName,
                    labels: labelNames
                })
            });
            
            console.log('Save labels response status:', response.status);
            
            // Check if response is HTML (login page) instead of JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Received non-JSON response, likely login page. Status:', response.status);
                showError('Session expired. Please refresh the page and login again.');
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Update cache
                if (!groupLabelsCache[groupName]) {
                    groupLabelsCache[groupName] = [];
                }
                if (!groupLabelsCache[groupName].includes(selectedLabel)) {
                    groupLabelsCache[groupName].push(selectedLabel);
                }
                
                // Update only this group's display (much faster)
                updateGroupDisplay(groupName);
                showSuccess(`Label "${selectedLabel}" added to group "${groupName}"`);
            } else {
                throw new Error(data.message || 'Failed to save label');
            }
        } else {
            showError('Label already exists for this group');
        }
    } catch (error) {
        console.error('Error adding label to group:', error);
        showError('Error adding label to group: ' + error.message);
        
        // Restore the display on error
        updateGroupDisplay(groupName);
    }
}

// Remove label from group
async function removeLabelFromGroup(groupName, labelName) {
    try {
        // Validate group name
        if (!groupName || groupName.trim() === '') {
            showError('Invalid group name');
            return;
        }
        
        // Show loading state
        const groupElement = document.querySelector(`[data-group-name="${groupName.toLowerCase()}"]`);
        if (groupElement) {
            const labelsContainer = groupElement.querySelector('.group-labels');
            if (labelsContainer) {
                labelsContainer.innerHTML = '<span class="loading-label"><i class="fas fa-spinner fa-spin"></i> Removing label...</span>';
            }
        }
        
        // Get current labels
        const currentLabels = await getGroupLabels(groupName);
        let labelNames = currentLabels.map(label => label.name);
        
        labelNames = labelNames.filter(name => name !== labelName);
        
        // Save to server
        const response = await fetch('/api/save-group-labels', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assembly_name: currentAssembly,
                group_name: groupName,
                labels: labelNames
            })
        });
        
        console.log('Remove labels response status:', response.status);
        
        // Check if response is HTML (login page) instead of JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Received non-JSON response, likely login page. Status:', response.status);
            showError('Session expired. Please refresh the page and login again.');
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Update cache
            if (groupLabelsCache[groupName]) {
                groupLabelsCache[groupName] = groupLabelsCache[groupName].filter(name => name !== labelName);
            }
            
            // Update only this group's display (much faster)
            updateGroupDisplay(groupName);
            showSuccess(`Label "${labelName}" removed from group "${groupName}"`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error removing label from group:', error);
        showError('Error removing label from group: ' + error.message);
        
        // Restore the display on error
        updateGroupDisplay(groupName);
    }
}

// Show add label modal
function showAddLabelModal() {
    const modal = document.getElementById('addLabelModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('newLabelName').focus();
    }
}

// Close add label modal
function closeAddLabelModal() {
    const modal = document.getElementById('addLabelModal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Clear form
    document.getElementById('newLabelName').value = '';
    document.getElementById('newLabelColor').value = '#667eea';
    document.getElementById('newLabelDescription').value = '';
}

// Add new label
async function addNewLabel() {
    const name = document.getElementById('newLabelName').value.trim();
    const color = document.getElementById('newLabelColor').value;
    const description = document.getElementById('newLabelDescription').value.trim();
    
    if (!name) {
        showError('Please enter a label name');
        return;
    }
    
    // Check if label already exists
    if (availableLabels.some(label => label.name.toLowerCase() === name.toLowerCase())) {
        showError('A label with this name already exists');
        return;
    }
    
    const newLabel = {
        name: name,
        color: color,
        description: description
    };
    
    try {
        // Add to local array
        availableLabels.push(newLabel);
        
        // Save to server
        const response = await fetch('/api/save-labels', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                labels: availableLabels
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAvailableLabels();
            closeAddLabelModal();
            showSuccess(`Label "${name}" added successfully`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error adding new label:', error);
        showError('Error adding new label: ' + error.message);
    }
}

// Remove label
async function removeLabel(labelName) {
    if (confirm(`Are you sure you want to remove the label "${labelName}"? This will remove it from all groups.`)) {
        try {
            // Remove from local array
            availableLabels = availableLabels.filter(label => label.name !== labelName);
            
            // Remove from all groups
            if (currentAssembly) {
                for (const group of assemblyGroups) {
                    try {
                        // Skip groups without valid group_name
                        if (!group.group_name || group.group_name.trim() === '') {
                            console.warn('Skipping group with invalid name in removeLabelFromAllGroups:', group);
                            continue;
                        }
                        
                        const currentLabels = getGroupLabels(group.group_name);
                        let labelNames = currentLabels.map(label => label.name);
                        labelNames = labelNames.filter(name => name !== labelName);
                        
                        // Save updated labels
                        await fetch('/api/save-group-labels', {
                            method: 'POST',
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                assembly_name: currentAssembly,
                                group_name: group.group_name,
                                labels: labelNames
                            })
                        });
                    } catch (error) {
                        console.error('Error removing label from group:', error);
                    }
                }
                
                // Refresh groups display
                displayGroups();
            }
            
            // Save labels to server
            const response = await fetch('/api/save-labels', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    labels: availableLabels
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                displayAvailableLabels();
                showSuccess(`Label "${labelName}" removed successfully`);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error removing label:', error);
            showError('Error removing label: ' + error.message);
        }
    }
}



// Show success message
function showSuccess(message) {
    try {
        const modal = document.getElementById('successModal');
        const messageElement = document.getElementById('successMessage');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.style.display = 'flex';
        } else {
            console.warn('Success modal not found, falling back to alert');
            alert('Success: ' + message);
        }
        
    } catch (error) {
        console.error('Error showing success message:', error);
        alert('Success: ' + message);
    }
}

// Filter groups based on search
function filterGroups() {
    const searchTerm = document.getElementById('groupSearch').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredGroups = [...assemblyGroups];
    } else {
        filteredGroups = assemblyGroups.filter(group => 
            group.group_name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Reset to first page when filtering
    currentPage = 1;
    displayGroups();
}

// Update groups statistics
function updateGroupsStats() {
    const groupsCount = filteredGroups.length;
    const totalPhones = filteredGroups.reduce((sum, group) => sum + (group.phone_count || 0), 0);
    
    document.getElementById('groupsCount').textContent = `${groupsCount} group${groupsCount !== 1 ? 's' : ''} found`;
    document.getElementById('totalPhones').textContent = `${totalPhones.toLocaleString()} total phones`;
}

// Update available labels statistics
function updateLabelsStats() {
    const totalLabels = availableLabels.length;
    const usedLabels = new Set();
    
    // Count how many labels are actually being used
    Object.values(groupLabelsCache).forEach(labelNames => {
        labelNames.forEach(labelName => usedLabels.add(labelName));
    });
    
    const labelsCountElement = document.getElementById('labelsCount');
    if (labelsCountElement) {
        labelsCountElement.textContent = `${totalLabels} available labels`;
    }
    
    const usedLabelsElement = document.getElementById('usedLabels');
    if (usedLabelsElement) {
        usedLabelsElement.textContent = `${usedLabels.size} labels in use`;
    }
}

// Pagination functions
function calculatePagination() {
    totalPages = Math.ceil(filteredGroups.length / groupsPerPage);
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
}

function getCurrentPageGroups() {
    const startIndex = (currentPage - 1) * groupsPerPage;
    const endIndex = startIndex + groupsPerPage;
    return filteredGroups.slice(startIndex, endIndex);
}

function updatePaginationControls() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})" title="Previous page">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled title="Previous page">
            <i class="fas fa-chevron-left"></i>
        </button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})" title="Next page">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled title="Next page">
            <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginationHTML += '</div>';
    
    // Add page info
    const startIndex = (currentPage - 1) * groupsPerPage + 1;
    const endIndex = Math.min(currentPage * groupsPerPage, filteredGroups.length);
    paginationHTML += `<div class="pagination-info">Showing ${startIndex}-${endIndex} of ${filteredGroups.length} groups</div>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        displayGroups();
        updatePaginationControls();
        
        // Scroll to top of groups section
        const groupsSection = document.getElementById('groupsContainer');
        if (groupsSection) {
            groupsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Show groups using a specific label
async function showLabelGroups(labelName) {
    if (!currentAssembly) {
        showError('Please select an assembly first');
        return;
    }
    
    try {
        // Find groups that use this label
        const groupsUsingLabel = [];
        
        for (const group of assemblyGroups) {
            // Skip groups without valid group_name
            if (!group.group_name || group.group_name.trim() === '') {
                console.warn('Skipping group with invalid name in showLabelGroups:', group);
                continue;
            }
            
            const groupLabels = getGroupLabels(group.group_name);
            const labelNames = groupLabels.map(label => label.name);
            
            if (labelNames.includes(labelName)) {
                groupsUsingLabel.push(group);
            }
        }
        
        // Update modal content
        document.getElementById('modalLabelName').textContent = labelName;
        document.getElementById('labelGroupsCount').textContent = `${groupsUsingLabel.length} group${groupsUsingLabel.length !== 1 ? 's' : ''}`;
        
        const totalPhones = groupsUsingLabel.reduce((sum, group) => sum + (group.phone_count || 0), 0);
        document.getElementById('labelTotalPhones').textContent = `${totalPhones.toLocaleString()} total phones`;
        
        // Display groups
        const container = document.getElementById('labelGroupsList');
        if (groupsUsingLabel.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h4>No Groups Found</h4>
                    <p>No groups are currently using the "${labelName}" label.</p>
                </div>
            `;
        } else {
            let html = '';
            groupsUsingLabel.forEach(group => {
                html += `
                    <div class="label-group-item">
                        <div class="label-group-name">${group.group_name}</div>
                        <div class="label-group-phone-count">
                            <i class="fas fa-phone"></i>
                            ${group.phone_count || 0} phones
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
        
        // Show modal
        const modal = document.getElementById('labelGroupsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('Error loading label groups:', error);
        showError('Error loading groups for this label: ' + error.message);
    }
}

// Close label groups modal
function closeLabelGroupsModal() {
    const modal = document.getElementById('labelGroupsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    try {
        const modal = document.getElementById('errorModal');
        const messageElement = document.getElementById('errorMessage');
        
        if (modal && messageElement) {
            messageElement.textContent = message;
            modal.style.display = 'flex';
        } else {
            console.warn('Error modal not found, falling back to alert');
            alert('Error: ' + message);
        }
        
    } catch (error) {
        console.error('Error showing error message:', error);
        alert('Error: ' + message);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
});
