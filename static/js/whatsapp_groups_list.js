// WhatsApp Groups List JavaScript
let assemblies = [];
let currentGroups = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WhatsApp Groups List page loaded');
    
    // Load assemblies
    loadAssemblies();
});

// Load assemblies from API
async function loadAssemblies() {
    try {
        const response = await fetch('/api/assemblies');
        const data = await response.json();
        
        if (data.success) {
            assemblies = data.assemblies;
            populateAssemblySelect();
        } else {
            console.error('Failed to load assemblies:', data.message);
            showError('Failed to load assemblies: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading assemblies:', error);
        showError('Error loading assemblies: ' + error.message);
    }
}

// Populate assembly select dropdown
function populateAssemblySelect() {
    try {
        const assemblySelect = document.getElementById('assemblySelect');
        if (!assemblySelect) return;
        
        // Clear existing options except the first one
        assemblySelect.innerHTML = '<option value="">Select an Assembly</option>';
        
        // Add assembly options
        assemblies.forEach(assembly => {
            const option = document.createElement('option');
            option.value = assembly.name;
            option.textContent = assembly.name;
            assemblySelect.appendChild(option);
        });
        
        console.log('Assembly select populated with', assemblies.length, 'assemblies');
        
    } catch (error) {
        console.error('Error populating assembly select:', error);
    }
}

// Load groups for selected assembly
async function loadGroupsForAssembly() {
    try {
        const assemblySelect = document.getElementById('assemblySelect');
        const selectedAssembly = assemblySelect.value;
        
        if (!selectedAssembly) {
            hideAllSections();
            return;
        }
        
        console.log('Loading groups for assembly:', selectedAssembly);
        
        // Show loading state
        showLoadingState();
        
        // Make API call to get groups for the assembly
        const response = await fetch('/api/assembly-groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assembly: selectedAssembly
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Assembly groups loaded:', data.groups);
            currentGroups = data.groups;
            displayGroupsData(data.groups, data.summary);
        } else {
            throw new Error(data.message || 'Failed to load assembly groups');
        }
        
    } catch (error) {
        hideLoadingState();
        console.error('Error loading assembly groups:', error);
        showError('Error loading assembly groups: ' + error.message);
    }
}

// Display groups data
function displayGroupsData(groups, summary) {
    try {
        // Hide loading state
        hideLoadingState();
        
        if (!groups || groups.length === 0) {
            showNoDataState();
            return;
        }
        
        // Update summary cards
        updateSummaryCards(summary);
        
        // Display groups table
        displayGroupsTable(groups);
        
        // Show groups sections
        showGroupsSections();
        
        console.log('Groups data displayed successfully');
        
    } catch (error) {
        console.error('Error displaying groups data:', error);
        showError('Error displaying groups data: ' + error.message);
    }
}

// Update summary cards
function updateSummaryCards(summary) {
    try {
        const totalGroupsElement = document.getElementById('totalGroupsCount');
        const totalMembersElement = document.getElementById('totalMembersCount');
        const totalPhonesElement = document.getElementById('totalPhonesCount');
        
        if (totalGroupsElement) {
            totalGroupsElement.textContent = summary.total_groups || 0;
        }
        
        if (totalMembersElement) {
            totalMembersElement.textContent = summary.total_members || 0;
        }
        
        if (totalPhonesElement) {
            totalPhonesElement.textContent = summary.total_phones || 0;
        }
        
        console.log('Summary cards updated:', summary);
        
    } catch (error) {
        console.error('Error updating summary cards:', error);
    }
}

// Display groups table
function displayGroupsTable(groups) {
    try {
        const tableBody = document.getElementById('groupsTableBody');
        if (!tableBody) {
            console.error('Groups table body not found');
            return;
        }
        
        // Sort groups by phone count (highest to lowest)
        const sortedGroups = [...groups].sort((a, b) => (b.phone_count || 0) - (a.phone_count || 0));
        
        let html = '';
        
        sortedGroups.forEach((group, index) => {
            const rank = index + 1;
            const groupName = group.group_name || 'Unknown Group';
            const phoneCount = group.phone_count || 0;
            const memberCount = group.member_count || 0;
            const fileSize = formatFileSize(group.file_size || 0);
            const lastUpdated = formatTimestamp(group.last_updated || group.timestamp);
            
            html += `
                <tr>
                    <td class="rank">#${rank}</td>
                    <td class="group-name">
                        <div class="group-name-text">${groupName}</div>
                    </td>
                    <td class="phone-count">${phoneCount.toLocaleString()}</td>
                    <td class="member-count">${memberCount.toLocaleString()}</td>
                    <td class="file-size">${fileSize}</td>
                    <td class="last-updated">${lastUpdated}</td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm" onclick="viewGroupDetails('${groupName}', '${group.assembly || ''}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        console.log('Groups table populated with', sortedGroups.length, 'groups');
        
    } catch (error) {
        console.error('Error displaying groups table:', error);
        showError('Error displaying groups table: ' + error.message);
    }
}

// Format file size
function formatFileSize(bytes) {
    try {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        
    } catch (error) {
        console.error('Error formatting file size:', error);
        return 'Unknown';
    }
}

// Format timestamp
function formatTimestamp(timestamp) {
    try {
        if (!timestamp) return 'Unknown';
        
        // Try to parse the timestamp
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            return timestamp; // Return as-is if can't parse
        }
        
        // Format as readable date and time
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return timestamp || 'Unknown';
    }
}

// Show groups sections
function showGroupsSections() {
    try {
        const groupsSummary = document.getElementById('groupsSummary');
        const groupsListSection = document.getElementById('groupsListSection');
        
        if (groupsSummary) {
            groupsSummary.style.display = 'grid';
        }
        
        if (groupsListSection) {
            groupsListSection.style.display = 'block';
        }
        
        console.log('Groups sections displayed');
        
    } catch (error) {
        console.error('Error showing groups sections:', error);
    }
}

// Hide all sections
function hideAllSections() {
    try {
        const groupsSummary = document.getElementById('groupsSummary');
        const groupsListSection = document.getElementById('groupsListSection');
        const loadingState = document.getElementById('loadingState');
        const noDataState = document.getElementById('noDataState');
        
        if (groupsSummary) groupsSummary.style.display = 'none';
        if (groupsListSection) groupsListSection.style.display = 'none';
        if (loadingState) loadingState.style.display = 'none';
        if (noDataState) noDataState.style.display = 'none';
        
        console.log('All sections hidden');
        
    } catch (error) {
        console.error('Error hiding sections:', error);
    }
}

// Show loading state
function showLoadingState() {
    try {
        hideAllSections();
        
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'flex';
        }
        
        console.log('Loading state shown');
        
    } catch (error) {
        console.error('Error showing loading state:', error);
    }
}

// Hide loading state
function hideLoadingState() {
    try {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
        
        console.log('Loading state hidden');
        
    } catch (error) {
        console.error('Error hiding loading state:', error);
    }
}

// Show no data state
function showNoDataState() {
    try {
        hideAllSections();
        
        const noDataState = document.getElementById('noDataState');
        if (noDataState) {
            noDataState.style.display = 'flex';
        }
        
        console.log('No data state shown');
        
    } catch (error) {
        console.error('Error showing no data state:', error);
    }
}

// View group details
function viewGroupDetails(groupName, assembly) {
    try {
        console.log('Viewing group details:', { groupName, assembly });
        
        // Navigate to group details page with parameters
        const url = `/user/group-details?group=${encodeURIComponent(groupName)}&assembly=${encodeURIComponent(assembly)}`;
        window.location.href = url;
        
    } catch (error) {
        console.error('Error navigating to group details:', error);
        showError('Error navigating to group details: ' + error.message);
    }
}

// Download groups list
function downloadGroupsList() {
    try {
        console.log('Starting download of groups list...');
        
        if (!currentGroups || currentGroups.length === 0) {
            showError('No groups data available for download');
            return;
        }
        
        // Prepare Excel data
        const excelData = [];
        
        // Add header row
        excelData.push([
            'Rank',
            'Group Name',
            'Phone Numbers',
            'Members',
            'File Size',
            'Last Updated',
            'Assembly'
        ]);
        
        // Add data rows (sorted by phone count)
        const sortedGroups = [...currentGroups].sort((a, b) => (b.phone_count || 0) - (a.phone_count || 0));
        
        sortedGroups.forEach((group, index) => {
            const rank = index + 1;
            const groupName = group.group_name || 'Unknown Group';
            const phoneCount = group.phone_count || 0;
            const memberCount = group.member_count || 0;
            const fileSize = formatFileSize(group.file_size || 0);
            const lastUpdated = formatTimestamp(group.last_updated || group.timestamp);
            const assembly = group.assembly || 'Unknown';
            
            excelData.push([
                rank,
                groupName,
                phoneCount,
                memberCount,
                fileSize,
                lastUpdated,
                assembly
            ]);
        });
        
        // Convert to CSV format (Excel can open CSV files)
        const csvContent = excelData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with current date and assembly info
        const currentDate = new Date().toISOString().split('T')[0];
        const selectedAssembly = document.getElementById('assemblySelect').value || 'all';
        const filename = `groups_list_${selectedAssembly}_${currentDate}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('Groups list downloaded successfully as:', filename);
        showInfo(`✅ Groups list downloaded successfully! File: ${filename}`);
        
    } catch (error) {
        console.error('Error downloading groups list:', error);
        showError('Error downloading groups list: ' + error.message);
    }
}

// Go back to main analysis page
function goBack() {
    window.location.href = '/user/whatsapp-analysis';
}

// Show error message
function showError(message) {
    // Simple error display - you can enhance this with a proper toast/alert system
    alert('Error: ' + message);
}

// Show info message
function showInfo(message) {
    // Simple info display
    alert('Info: ' + message);
}
