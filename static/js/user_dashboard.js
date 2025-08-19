// User Dashboard JavaScript
let dashboardStats = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Show loading state
        showLoading();
        
        const response = await fetch('/api/accurate-dashboard-stats');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            dashboardStats = data.stats;
            displayDashboardStats(data.stats);
        } else {
            showError('Failed to load dashboard stats: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Dashboard stats error:', error);
        showError('Error loading dashboard stats: ' + error.message);
    }
}

// Display dashboard statistics
function displayDashboardStats(stats) {
    // Update main stats cards
    document.getElementById('totalAssemblies').textContent = stats.total_assemblies;
    document.getElementById('totalGroups').textContent = stats.total_groups;
    document.getElementById('totalPhones').textContent = stats.total_phones;
    
    // Display assembly breakdown
    displayAssemblyBreakdown(stats.assemblies);
}

// Display assembly breakdown
function displayAssemblyBreakdown(assemblies) {
    const container = document.getElementById('assemblyBreakdown');
    
    if (assemblies.length === 0) {
        container.innerHTML = '<p class="no-data">No assemblies found.</p>';
        return;
    }
    
    let html = '<div class="assembly-grid">';
    
    assemblies.forEach((assembly, index) => {
        html += `
            <div class="assembly-card" data-assembly-id="${index}">
                <div class="assembly-header clickable" onclick="toggleAssemblyDetails(${index})">
                    <div class="header-left">
                        <h4><i class="fas fa-building"></i> ${assembly.name}</h4>
                        <i class="fas fa-chevron-down toggle-icon" id="toggle-icon-${index}"></i>
                    </div>
                    <div class="assembly-stats">
                        <span class="stat-badge groups">
                            <i class="fas fa-users"></i> ${assembly.groups_count} Groups
                        </span>
                        <span class="stat-badge phones">
                            <i class="fas fa-phone"></i> ${assembly.phones_count} Phones
                        </span>
                    </div>
                </div>
                <div class="assembly-breakdown" id="breakdown-${index}" style="display: none;">
                    <div class="breakdown-content">
                       
                        <div class="groups-list">
                            <h5>All Groups in ${assembly.name}:</h5>
        `;
        
        if (assembly.groups.length > 0) {
            // Show all groups in the breakdown
            assembly.groups.forEach(group => {
                const cleanName = cleanGroupName(group.name);
                html += `
                    <div class="group-item">
                        <span class="group-name">${cleanName}</span>
                        <span class="group-phones">${group.phones_count} phones</span>
                    </div>
                `;
            });
        } else {
            html += '<p class="no-groups">No groups found</p>';
        }
        
        html += `
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Toggle assembly details
function toggleAssemblyDetails(assemblyId) {
    const breakdown = document.getElementById(`breakdown-${assemblyId}`);
    const toggleIcon = document.getElementById(`toggle-icon-${assemblyId}`);
    
    if (breakdown.style.display === 'none') {
        // Show breakdown
        breakdown.style.display = 'block';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
    } else {
        // Hide breakdown
        breakdown.style.display = 'none';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
    }
}

// Show loading state
function showLoading() {
    const container = document.getElementById('assemblyBreakdown');
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> 
            <div>Loading assembly data...</div>
            <div class="loading-subtitle">Scanning Excel files and counting phone numbers</div>
        </div>
    `;
}

// Show error message
function showError(message) {
    const container = document.getElementById('assemblyBreakdown');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="loadDashboardStats()" class="btn btn-primary btn-sm">
                <i class="fas fa-redo"></i> Retry
            </button>
        </div>
    `;
}

// Show success message
function showSuccess(message) {
    // You can implement a toast notification here
    console.log('Success:', message);
}

// Clean group name - remove file extension and timestamp
function cleanGroupName(fileName) {
    // Remove file extension (.xlsx, .xls, .csv)
    let cleanName = fileName.replace(/\.(xlsx|xls|csv)$/i, '');
    
    // Remove timestamp pattern (numbers followed by underscore)
    cleanName = cleanName.replace(/_\d+$/, '');
    
    // Remove "all_" suffix if present
    cleanName = cleanName.replace(/_all$/, '');
    
    // Remove multiple underscores and replace with spaces
    cleanName = cleanName.replace(/_+/g, ' ');
    
    // Capitalize first letter of each word
    cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
    
    return cleanName;
}


