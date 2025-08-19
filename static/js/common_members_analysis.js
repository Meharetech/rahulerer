// Common Members Analysis JavaScript
let assemblies = [];
let selectedAssemblies = new Set();
let allMessages = {}; // Store all messages for search functionality
let availableLabels = new Set(); // Store unique labels
let currentAnalysisResults = null; // Store current analysis results

// Pagination variables
let currentPage = 1;
let itemsPerPage = 12;
let totalItems = 0;
let allCommonMembers = []; // Store all common members for pagination

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Common Members Analysis page loaded');
    
    // Load assemblies
    loadAssemblies();
    
    // Set default dates (today and empty end date)
    setDefaultDates();
    
    // Add event listeners for date inputs to clear quick filter selection
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.addEventListener('change', clearQuickFilterSelection);
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', clearQuickFilterSelection);
    }
    
    // Add event listener to close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('assemblyDropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            const dropdownContent = document.getElementById('dropdownContent');
            const dropdownHeader = dropdown.querySelector('.dropdown-header');
            dropdownContent.classList.remove('show');
            dropdownHeader.classList.remove('active');
        }
    });
});

// Load assemblies from API
async function loadAssemblies() {
    try {
        const response = await fetch('/api/assemblies');
        const data = await response.json();
        
        if (data.success) {
            assemblies = data.assemblies;
            displayAssemblies();
        } else {
            console.error('Failed to load assemblies:', data.message);
        }
    } catch (error) {
        console.error('Error loading assemblies:', error);
    }
}

// Display assemblies in the dropdown
function displayAssemblies() {
    const container = document.getElementById('dropdownOptions');
    if (!container) return;
    
    if (assemblies.length === 0) {
        container.innerHTML = '<p class="no-data">No assemblies found.</p>';
        return;
    }
    
    let html = '';
    assemblies.forEach(assembly => {
        const isSelected = selectedAssemblies.has(assembly.name);
        html += `
            <div class="dropdown-option ${isSelected ? 'selected' : ''}" onclick="toggleAssemblySelection('${assembly.name}')">
                <input type="checkbox" 
                       value="${assembly.name}" 
                       ${isSelected ? 'checked' : ''} 
                       onclick="event.stopPropagation()">
                <span class="assembly-name">${assembly.name}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Update dropdown placeholder and selected assemblies display
    updateDropdownPlaceholder();
    updateSelectedAssembliesDisplay();
}

// Toggle assembly selection (legacy function for compatibility)
function toggleAssembly(assemblyName) {
    toggleAssemblySelection(assemblyName);
}

// Toggle assembly selection
function toggleAssemblySelection(assemblyName) {
    if (selectedAssemblies.has(assemblyName)) {
        selectedAssemblies.delete(assemblyName);
    } else {
        selectedAssemblies.add(assemblyName);
    }
    
    // Update UI
    displayAssemblies();
}

// Get selected assemblies
function getSelectedAssemblies() {
    return Array.from(selectedAssemblies);
}

// Custom Dropdown Functions
function toggleDropdown() {
    const dropdown = document.getElementById('assemblyDropdown');
    const dropdownContent = document.getElementById('dropdownContent');
    const dropdownHeader = dropdown.querySelector('.dropdown-header');
    
    if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
        dropdownHeader.classList.remove('active');
    } else {
        dropdownContent.classList.add('show');
        dropdownHeader.classList.add('active');
    }
}

function filterAssemblies() {
    const searchInput = document.getElementById('assemblySearch');
    const searchTerm = searchInput.value.toLowerCase();
    const dropdownOptions = document.getElementById('dropdownOptions');
    const options = dropdownOptions.querySelectorAll('.dropdown-option');
    
    options.forEach(option => {
        const assemblyName = option.querySelector('.assembly-name').textContent.toLowerCase();
        if (assemblyName.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

function selectAllAssemblies() {
    assemblies.forEach(assembly => {
        selectedAssemblies.add(assembly.name);
    });
    displayAssemblies();
}

function clearAllAssemblies() {
    selectedAssemblies.clear();
    displayAssemblies();
}

function updateDropdownPlaceholder() {
    const placeholder = document.querySelector('.dropdown-placeholder');
    if (selectedAssemblies.size === 0) {
        placeholder.textContent = 'Select assemblies...';
    } else if (selectedAssemblies.size === 1) {
        placeholder.textContent = Array.from(selectedAssemblies)[0];
    } else {
        placeholder.textContent = `${selectedAssemblies.size} assemblies selected`;
    }
}

function updateSelectedAssembliesDisplay() {
    const container = document.getElementById('selectedAssemblies');
    if (!container) return;
    
    if (selectedAssemblies.size === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    selectedAssemblies.forEach(assemblyName => {
        html += `
            <span class="selected-assembly-tag">
                ${assemblyName}
                <button type="button" class="remove-btn" onclick="removeAssembly('${assemblyName}')">
                    <i class="fas fa-times"></i>
                </button>
            </span>
        `;
    });
    
    container.innerHTML = html;
}

function removeAssembly(assemblyName) {
    selectedAssemblies.delete(assemblyName);
    displayAssemblies();
}

// Set quick date range based on selection
function setQuickDateRange(filterType) {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput || !endDateInput) return;
    
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch (filterType) {
        case '1week':
            startDate.setDate(today.getDate() - 7);
            break;
        case '1month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case '3months':
            startDate.setMonth(today.getMonth() - 3);
            break;
        case '6months':
            startDate.setMonth(today.getMonth() - 6);
            break;
        case '1year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        case 'custom':
            // For custom, clear the dates and let user input manually
            startDateInput.value = '';
            endDateInput.value = '';
            return;
        default:
            return;
    }
    
    // Format dates for input fields (YYYY-MM-DD)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    startDateInput.value = formatDate(startDate);
    endDateInput.value = formatDate(today);
    
    console.log(`Quick filter applied: ${filterType} - Start: ${startDateInput.value}, End: ${endDateInput.value}`);
}

// Clear quick filter selection when dates are manually changed
function clearQuickFilterSelection() {
    const customRadio = document.querySelector('input[name="quickFilter"][value="custom"]');
    if (customRadio) {
        customRadio.checked = true;
    }
}

// Set default dates
function setDefaultDates() {
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        startDateInput.value = `${year}-${month}-${day}`;
    }
}

// Analyze common members across groups
async function analyzeCommonMembers() {
    try {
        // Get form data
        const assemblies = getSelectedAssemblies();
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        const sentiment = document.getElementById('sentiment')?.value || 'all';
        
        if (assemblies.length === 0) {
            showError('Please select at least one assembly');
            return;
        }
        
        if (!startDate) {
            showError('Please select a start date');
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        // Prepare request data
        const requestData = {
            assemblies: assemblies,
            startDate: startDate,
            endDate: endDate,
            sentiment: sentiment
        };
        
        console.log('Sending common members analysis request:', requestData);
        
        // Make API call
        const response = await fetch('/api/common-members-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Common members analysis results:', data.results);
            displayCommonMembersResults(data.results);
        } else {
            throw new Error(data.message || 'Common members analysis failed');
        }
        
    } catch (error) {
        hideLoadingState();
        console.error('Error during common members analysis:', error);
        showError('Error during common members analysis: ' + error.message);
    }
}

// Display common members analysis results
function displayCommonMembersResults(results) {
    try {
        // Hide loading state
        hideLoadingState();
        
        // Show results section
        const resultsContainer = document.getElementById('commonMembersResults');
        if (!resultsContainer) {
            console.error('Common members results container not found');
            return;
        }
        resultsContainer.style.display = 'block';
        
        // Update summary cards
        const totalCommonMembersElement = document.getElementById('totalCommonMembersCount');
        const maxGroupsPerMemberElement = document.getElementById('maxGroupsPerMember');
        const totalCrossingsElement = document.getElementById('totalCrossings');
        
        if (totalCommonMembersElement) {
            totalCommonMembersElement.textContent = results.total_common_members || 0;
        }
        
        if (maxGroupsPerMemberElement) {
            maxGroupsPerMemberElement.textContent = results.max_groups_per_member || 0;
        }
        
        if (totalCrossingsElement) {
            totalCrossingsElement.textContent = results.total_crossings || 0;
        }
        
        // Store current results for search functionality
        currentAnalysisResults = results;
        
        // Display common members table
        displayCommonMembersTable(results.common_members || []);
        
        // Show search section
        showSearchSection();
        
        // Automatically collapse the filter form after showing results
        setTimeout(() => {
            toggleFilterForm();
        }, 500); // Small delay to ensure results are visible first
        
    } catch (error) {
        console.error('Error displaying common members results:', error);
        showError('Error displaying common members results');
    }
}

// Display common members table
function displayCommonMembersTable(commonMembers) {
    try {
        // Store all members for pagination
        allCommonMembers = commonMembers || [];
        totalItems = allCommonMembers.length;
        
        // Initialize pagination
        initializePagination();
        
    } catch (error) {
        console.error('Error displaying common members table:', error);
    }
}

// Initialize pagination
function initializePagination() {
    currentPage = 1;
    displayCurrentPage();
    updateTableInfo();
    updatePaginationControls();
    
    // Show pagination container if we have more than one page
    if (totalItems > itemsPerPage) {
        showPaginationContainer();
    } else {
        hidePaginationContainer();
    }
}

// Display current page
function displayCurrentPage() {
    const tableBody = document.getElementById('commonMembersTableBody');
    if (!tableBody) {
        console.error('Common members table body not found');
        return;
    }
    
    if (!allCommonMembers || allCommonMembers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No common members found for selected criteria.</td></tr>';
        return;
    }
    
    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentPageMembers = allCommonMembers.slice(startIndex, endIndex);
    
    let html = '';
    
    currentPageMembers.forEach((member, index) => {
        if (!member) return;
        
        const actualRank = startIndex + index + 1; // Global rank
        const name = member.name || 'Unknown';
        const phone = member.phone || 'N/A';
        const groupsCount = member.groups_count || 0;
        const groupNames = member.group_names || [];
        const totalMessages = member.total_messages || 0;
        
        // Sentiment breakdown
        const sentimentBreakdown = member.sentiment_breakdown || {};
        const positiveCount = sentimentBreakdown.Positive || 0;
        const negativeCount = sentimentBreakdown.Negative || 0;
        const neutralCount = sentimentBreakdown.Neutral || 0;
        
        // Format group names for display
        const formattedGroupNames = groupNames.map(group => {
            const parts = group.split('/');
            if (parts.length >= 3) {
                return `${parts[0]} - ${parts[2]}`; // assembly - group_name
            }
            return group;
        }).join(', ');
        
        html += `
            <tr>
                <td>
                    <div class="rank-badge rank-${actualRank <= 3 ? actualRank : 'other'}">${actualRank}</div>
                </td>
                <td>
                    <strong>${name}</strong>
                </td>
                <td>
                    <span class="phone-number">${phone}</span>
                </td>
                <td>
                    <span class="groups-count">${groupsCount}</span>
                </td>
                <td>
                    <div class="group-names" title="${formattedGroupNames}">
                        ${formattedGroupNames.length > 50 ? formattedGroupNames.substring(0, 50) + '...' : formattedGroupNames}
                    </div>
                </td>
                <td>${totalMessages}</td>
                <td>
                    <div class="sentiment-breakdown">
                        <span class="sentiment positive">+${positiveCount}</span>
                        <span class="sentiment negative">-${negativeCount}</span>
                        <span class="sentiment neutral">~${neutralCount}</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewMemberDetails('${phone}', '${name}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update table info
function updateTableInfo() {
    const tableInfo = document.getElementById('tableInfo');
    if (tableInfo) {
        const startIndex = (currentPage - 1) * itemsPerPage + 1;
        const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
        tableInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalItems} members`;
    }
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationInfo = document.getElementById('paginationInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    if (pageNumbers) {
        pageNumbers.innerHTML = generatePageNumbers(currentPage, totalPages);
    }
}

// Generate page numbers with ellipsis
function generatePageNumbers(currentPage, totalPages) {
    let html = '';
    
    if (totalPages <= 7) {
        // Show all page numbers if 7 or fewer pages
        for (let i = 1; i <= totalPages; i++) {
            html += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
        }
    } else {
        // Show page numbers with ellipsis for more than 7 pages
        if (currentPage <= 4) {
            // Show first 5 pages + ellipsis + last page
            for (let i = 1; i <= 5; i++) {
                html += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
            }
            html += '<span class="page-ellipsis">...</span>';
            html += `<span class="page-number" onclick="goToPage(${totalPages})">${totalPages}</span>`;
        } else if (currentPage >= totalPages - 3) {
            // Show first page + ellipsis + last 5 pages
            html += `<span class="page-number" onclick="goToPage(1)">1</span>`;
            html += '<span class="page-ellipsis">...</span>';
            for (let i = totalPages - 4; i <= totalPages; i++) {
                html += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
            }
        } else {
            // Show first page + ellipsis + current page and neighbors + ellipsis + last page
            html += `<span class="page-number" onclick="goToPage(1)">1</span>`;
            html += '<span class="page-ellipsis">...</span>';
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                html += `<span class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
            }
            html += '<span class="page-ellipsis">...</span>';
            html += `<span class="page-number" onclick="goToPage(${totalPages})">${totalPages}</span>`;
        }
    }
    
    return html;
}

// Navigation functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayCurrentPage();
        updateTableInfo();
        updatePaginationControls();
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayCurrentPage();
        updateTableInfo();
        updatePaginationControls();
    }
}

function goToPage(page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayCurrentPage();
        updateTableInfo();
        updatePaginationControls();
    }
}

// Change items per page
function changeItemsPerPage() {
    const select = document.getElementById('itemsPerPage');
    if (select) {
        itemsPerPage = parseInt(select.value);
        currentPage = 1; // Reset to first page
        displayCurrentPage();
        updateTableInfo();
        updatePaginationControls();
        
        // Show/hide pagination container
        if (totalItems > itemsPerPage) {
            showPaginationContainer();
        } else {
            hidePaginationContainer();
        }
    }
}

// Show pagination container
function showPaginationContainer() {
    const container = document.getElementById('paginationContainer');
    if (container) {
        container.style.display = 'flex';
    }
}

// Hide pagination container
function hidePaginationContainer() {
    const container = document.getElementById('paginationContainer');
    if (container) {
        container.style.display = 'none';
    }
}

// Export common members table
function exportCommonMembers() {
    try {
        console.log('Starting export of common members...');
        
        // Prepare Excel data
        const excelData = [];
        
        // Add header row
        excelData.push([
            'Rank',
            'Member Name',
            'Phone Number',
            'Groups Count',
            'Group Names',
            'Total Messages',
            'Positive Messages',
            'Negative Messages',
            'Neutral Messages'
        ]);
        
        // Add data rows for all members (not just current page)
        allCommonMembers.forEach((member, index) => {
            const rank = index + 1;
            const name = member.name || 'Unknown';
            const phone = member.phone || 'N/A';
            const groupsCount = member.groups_count || 0;
            const groupNames = (member.group_names || []).join('; ');
            const totalMessages = member.total_messages || 0;
            
            // Extract sentiment breakdown
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;
            
            if (member.sentiment_breakdown) {
                positiveCount = member.sentiment_breakdown.Positive || 0;
                negativeCount = member.sentiment_breakdown.Negative || 0;
                neutralCount = member.sentiment_breakdown.Neutral || 0;
            }
            
            excelData.push([
                rank,
                name,
                phone,
                groupsCount,
                groupNames,
                totalMessages,
                positiveCount,
                negativeCount,
                neutralCount
            ]);
        });
        
        // Convert to CSV format
        const csvContent = excelData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `common_members_${currentDate}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('Common members exported successfully as:', filename);
        showError(`✅ Common members exported successfully! File: ${filename}`);
        
    } catch (error) {
        console.error('Error exporting common members:', error);
        showError('Error exporting common members: ' + error.message);
    }
}

// View detailed member information
function viewMemberDetails(phone, name) {
    try {
        console.log('Viewing member details:', { phone, name });
        
        // Store analysis criteria in session storage
        const analysisCriteria = {
            assemblies: getSelectedAssemblies(),
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || ''
        };
        
        sessionStorage.setItem('commonMembersAnalysisCriteria', JSON.stringify(analysisCriteria));
        
        // Navigate to member details page
        window.location.href = `/user/member-details/${phone}`;
        
    } catch (error) {
        console.error('Error viewing member details:', error);
        showError('Error navigating to member details');
    }
}

// Clear analysis form
function clearAnalysis() {
    // Clear selected assemblies
    selectedAssemblies.clear();
    displayAssemblies();
    
    // Clear dates
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    
    // Reset sentiment to all
    const sentimentSelect = document.getElementById('sentiment');
    if (sentimentSelect) sentimentSelect.value = 'all';
    
    // Reset quick filter to custom
    const customRadio = document.querySelector('input[name="quickFilter"][value="custom"]');
    if (customRadio) customRadio.checked = true;
    
    // Hide results
    const resultsContainer = document.getElementById('commonMembersResults');
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    // Hide search section
    const searchSection = document.getElementById('searchFilterSection');
    if (searchSection) searchSection.style.display = 'none';
    
    // Hide search results container
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    if (searchResultsContainer) searchResultsContainer.style.display = 'none';
    
    // Reset search variables
    allMessages = {};
    availableLabels.clear();
    currentAnalysisResults = null;
    
    // Set default dates
    setDefaultDates();
}

// Show loading state
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('commonMembersResults');
    const searchSection = document.getElementById('searchFilterSection');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (searchSection) searchSection.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'none';
}

// Show error message
function showError(message) {
    // Simple error display - you can enhance this with a proper toast/alert system
    alert('Error: ' + message);
}

// Toggle filter form visibility
function toggleFilterForm() {
    try {
        const filterFormContent = document.getElementById('filterFormContent');
        const showFiltersSection = document.getElementById('showFiltersSection');
        const toggleFilterBtn = document.getElementById('toggleFilterBtn');
        
        if (!filterFormContent || !showFiltersSection || !toggleFilterBtn) return;
        
        // Hide the filter form content
        filterFormContent.style.display = 'none';
        filterFormContent.classList.add('collapsed');
        
        // Show the "Show Filters" button
        showFiltersSection.style.display = 'block';
        
        // Update the toggle button (hide it)
        toggleFilterBtn.style.display = 'none';
        
        console.log('Filter form collapsed');
        
    } catch (error) {
        console.error('Error toggling filter form:', error);
    }
}

// Show filter form again
function showFilterForm() {
    try {
        const filterFormContent = document.getElementById('filterFormContent');
        const showFiltersSection = document.getElementById('showFiltersSection');
        const toggleFilterBtn = document.getElementById('toggleFilterBtn');
        
        if (!filterFormContent || !showFiltersSection || !toggleFilterBtn) return;
        
        // Show the filter form content
        filterFormContent.style.display = 'block';
        filterFormContent.classList.remove('collapsed');
        
        // Hide the "Show Filters" button
        showFiltersSection.style.display = 'none';
        
        // Show the toggle button again
        toggleFilterBtn.style.display = 'inline-flex';
        
        console.log('Filter form expanded');
        
    } catch (error) {
        console.error('Error showing filter form:', error);
    }
}

// Go back to main analysis page
function goBack() {
    window.location.href = '/user/whatsapp-analysis';
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

// Show search section
function showSearchSection() {
    try {
        const searchSection = document.getElementById('searchFilterSection');
        if (searchSection) {
            searchSection.style.display = 'block';
        }
        
        // Populate label filter with available labels
        populateLabelFilter();
        
    } catch (error) {
        console.error('Error showing search section:', error);
    }
}

// Populate label filter dropdown
function populateLabelFilter() {
    try {
        const labelFilter = document.getElementById('labelFilter');
        if (!labelFilter) return;
        
        // Clear existing options except "All Labels"
        labelFilter.innerHTML = '<option value="all">All Labels</option>';
        
        // Collect all unique labels from current results
        availableLabels.clear();
        if (currentAnalysisResults && currentAnalysisResults.common_members) {
            currentAnalysisResults.common_members.forEach(member => {
                if (member.labels) {
                    member.labels.forEach(label => {
                        if (label) availableLabels.add(label);
                    });
                }
            });
        }
        
        // Add unique labels to dropdown
        const sortedLabels = Array.from(availableLabels).sort();
        sortedLabels.forEach(label => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            labelFilter.appendChild(option);
        });
        
        console.log('Label filter populated with:', sortedLabels);
        
    } catch (error) {
        console.error('Error populating label filter:', error);
    }
}

// Handle search input keypress (Enter key)
function handleSearchKeypress(event) {
    if (event.key === 'Enter') {
        submitSearch();
    }
}

// Show error message
function showError(message) {
    try {
        // Create or update error message
        let errorDiv = document.getElementById('errorMessage');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorMessage';
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: #fee;
                color: #c33;
                padding: 12px 16px;
                border: 1px solid #fcc;
                border-radius: 8px;
                margin: 16px 0;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            // Insert after search section header
            const searchSection = document.getElementById('searchFilterSection');
            if (searchSection) {
                const sectionHeader = searchSection.querySelector('.section-header');
                if (sectionHeader) {
                    sectionHeader.parentNode.insertBefore(errorDiv, sectionHeader.nextSibling);
                }
            }
        }
        
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error showing error message:', error);
        alert(message); // Fallback to alert
    }
}

// Hide search results container
function hideSearchResultsContainer() {
    try {
        const searchResultsContainer = document.getElementById('searchResultsContainer');
        if (searchResultsContainer) {
            searchResultsContainer.style.display = 'none';
        }
        
        const searchResultsSummary = document.getElementById('searchResultsSummary');
        if (searchResultsSummary) {
            searchResultsSummary.style.display = 'none';
        }
    } catch (error) {
        console.error('Error hiding search results container:', error);
    }
}

// Update search placeholder based on selected field
function updateSearchPlaceholder() {
    try {
        const searchField = document.getElementById('searchField').value;
        const messageSearch = document.getElementById('messageSearch');
        
        let placeholder = '';
        switch (searchField) {
            case 'messageContent':
                placeholder = 'Search in message content... (Press Enter or Click Search)';
                break;
            case 'senderName':
                placeholder = 'Search by sender name... (Press Enter or Click Search)';
                break;
            case 'senderPhone':
                placeholder = 'Search by phone number... (Press Enter or Click Search)';
                break;
            case 'groupName':
                placeholder = 'Search by group name... (Press Enter or Click Search)';
                hideSearchResultsContainer();
                break;
            case 'assembly':
                placeholder = 'Search by assembly name... (Press Enter or Click Search)';
                break;
            case 'all':
                placeholder = 'Search in all fields... (Press Enter or Click Search)';
                break;
            default:
                placeholder = 'Search in message content... (Press Enter or Click Search)';
        }
        
        messageSearch.placeholder = placeholder;
        console.log('Search placeholder updated for field:', searchField);
        
    } catch (error) {
        console.error('Error updating search placeholder:', error);
    }
}

// Submit search when button is clicked or Enter is pressed
function submitSearch() {
    try {
        const searchTerm = document.getElementById('messageSearch').value.trim();
        const searchField = document.getElementById('searchField').value;
        
        if (!searchTerm) {
            showError('Please enter a search term');
            return;
        }
        
        const selectedLabel = document.getElementById('labelFilter').value;
        const selectedSentiment = document.getElementById('sentimentFilter').value;
        
        console.log('Submitting search for:', searchTerm, 'in field:', searchField, 'with label:', selectedLabel, 'sentiment:', selectedSentiment);
        
        // Test: Show what we're searching for
        showError(`Searching for "${searchTerm}" in ${searchField} field...`);
        
        // Use the new API endpoint for searching messages
        performMessageSearch(searchTerm, selectedLabel, selectedSentiment, searchField);
        
    } catch (error) {
        console.error('Error submitting search:', error);
        showError('Error submitting search: ' + error.message);
    }
}

// Search messages across all content (kept for backward compatibility)
function searchMessages() {
    submitSearch();
}

// Filter by label
function filterByLabel() {
    try {
        const searchTerm = document.getElementById('messageSearch').value.trim();
        const selectedLabel = document.getElementById('labelFilter').value;
        const selectedSentiment = document.getElementById('sentimentFilter').value;
        
        console.log('Filtering by label:', selectedLabel, 'with search:', searchTerm, 'sentiment:', selectedSentiment);
        
        if (searchTerm) {
            // Use the new API endpoint for searching messages
            const searchField = document.getElementById('searchField').value;
            performMessageSearch(searchTerm, selectedLabel, selectedSentiment, searchField);
        } else {
            // If no search term, just filter the existing results
            applySearchFilters('', selectedLabel, selectedSentiment);
        }
        
    } catch (error) {
        console.error('Error filtering by label:', error);
    }
}

// Filter by sentiment
function filterBySentiment() {
    try {
        const searchTerm = document.getElementById('messageSearch').value.trim();
        const selectedLabel = document.getElementById('labelFilter').value;
        selectedSentiment = document.getElementById('sentimentFilter').value;
        
        console.log('Filtering by sentiment:', selectedSentiment, 'with search:', searchTerm, 'label:', selectedLabel);
        
        if (searchTerm) {
            // Use the new API endpoint for searching messages
            const searchField = document.getElementById('searchField').value;
            performMessageSearch(searchTerm, selectedLabel, selectedSentiment, searchField);
        } else {
            // If no search term, just filter the existing results
            applySearchFilters('', selectedLabel, selectedSentiment);
        }
        
    } catch (error) {
        console.error('Error filtering by sentiment:', error);
    }
}

// Perform message search using the API endpoint
async function performMessageSearch(searchTerm, selectedLabel, selectedSentiment, searchField) {
    try {
        // Show loading state for search
        showSearchLoadingState();
        
        // Prepare request data
        const requestData = {
            searchTerm: searchTerm,
            searchField: searchField,
            assemblies: getSelectedAssemblies(),
            startDate: document.getElementById('startDate')?.value || '',
            endDate: document.getElementById('endDate')?.value || '',
            label: selectedLabel,
            sentiment: selectedSentiment
        };
        
        console.log('Sending message search request:', requestData);
        
        // Make API call to search messages
        const response = await fetch('/api/search-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Message search results:', data.results);
            console.log('Results structure:', {
                total_messages: data.results.total_messages,
                total_members: data.results.total_members,
                total_groups: data.results.total_groups,
                search_results_count: data.results.search_results ? data.results.search_results.length : 'undefined'
            });
            
            // Test: Show results in console
            if (data.results.search_results && data.results.search_results.length > 0) {
                console.log('First search result:', data.results.search_results[0]);
            } else {
                console.log('No search results found');
            }
            
            displayMessageSearchResults(data.results);
        } else {
            throw new Error(data.message || 'Message search failed');
        }
        
    } catch (error) {
        hideSearchLoadingState();
        console.error('Error during message search:', error);
        showError('Error during message search: ' + error.message);
    }
}

// Display message search results
function displayMessageSearchResults(results) {
    try {
        console.log('Displaying search results:', results);
        
        // Hide search loading state
        hideSearchLoadingState();
        
        // Update search results summary
        updateSearchResultsSummary(
            results.total_messages,
            results.total_members,
            results.total_groups
        );
        
        // Display search results in a new table
        displaySearchResultsTable(results.search_results, results.search_term);
        
        // Show download button if we have results
        console.log('Checking if we should show download button:', {
            hasSearchResults: !!results.search_results,
            searchResultsLength: results.search_results ? results.search_results.length : 0,
            searchResults: results.search_results
        });
        
        if (results.search_results && results.search_results.length > 0) {
            console.log('Showing download button - we have search results');
            showDownloadButton();
            
            // Double-check that the button is visible
            setTimeout(() => {
                const downloadBtn = document.getElementById('downloadSearchResultsBtn');
                if (downloadBtn) {
                    console.log('Download button final state:', {
                        display: downloadBtn.style.display,
                        visibility: downloadBtn.style.visibility,
                        opacity: downloadBtn.style.opacity
                    });
                }
            }, 100);
        } else {
            console.log('Hiding download button - no search results');
            hideDownloadButton();
        }
        
        console.log('Message search results displayed successfully');
        
    } catch (error) {
        console.error('Error displaying message search results:', error);
        showError('Error displaying search results: ' + error.message);
    }
}

// Display search results table
function displaySearchResultsTable(searchResults, searchTerm) {
    try {
        // Create a new results container for search results
        let searchResultsContainer = document.getElementById('searchResultsContainer');
        console.log('Existing search results container:', searchResultsContainer);
        
        // If container doesn't exist, create it
        if (!searchResultsContainer) {
            const commonMembersSection = document.querySelector('.common-members-section');
            console.log('Common members section found:', commonMembersSection);
            
            if (commonMembersSection) {
                console.log('Creating new search results container');
                // Create search results container
                const container = document.createElement('div');
                container.id = 'searchResultsContainer';
                container.className = 'search-results-container';
                container.innerHTML = `
                    <h4><i class="fas fa-search"></i> Search Results for "${searchTerm}"</h4>
                    <div class="search-results-table-container">
                        <table class="search-results-table">
                            <thead>
                                <tr>
                                    <th>Message Content</th>
                                    <th>Sender</th>
                                    <th>Group</th>
                                    <th>Assembly</th>
                                    <th>Date</th>
                                    <th>Sentiment</th>
                                    <th>Label</th>
                                </tr>
                            </thead>
                            <tbody id="searchResultsTableBody">
                                <!-- Search results will be populated here -->
                            </tbody>
                        </table>
                    </div>
                `;
                
                // Insert before the common members section
                commonMembersSection.parentNode.insertBefore(container, commonMembersSection);
                searchResultsContainer = container;
                console.log('Search results container created and inserted');
            } else {
                console.error('Common members section not found');
            }
        }
        
        // Populate the search results table
        const tableBody = document.getElementById('searchResultsTableBody');
        console.log('Table body found:', tableBody);
        
        if (!tableBody) {
            console.error('Search results table body not found');
            return;
        }
        
        console.log('Search results count:', searchResults.length);
        
        if (searchResults.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No messages found matching your search criteria.</td></tr>';
            console.log('No search results found, showing no data message');
            return;
        }
        
        let html = '';
        searchResults.forEach(result => {
            const timestamp = formatTimestamp(result.timestamp);
            
            html += `
                <tr>
                    <td class="message-content">
                        <div class="message-text">${result.message_content || 'No content'}</div>
                    </td>
                    <td>
                        <div class="sender-info">
                            <div class="sender-name">${result.sender_name || 'Unknown'}</div>
                            <div class="sender-phone">${result.sender_phone || 'N/A'}</div>
                        </div>
                    </td>
                    <td>${result.group_name || 'Unknown'}</td>
                    <td>${result.assembly || 'Unknown'}</td>
                    <td>${timestamp}</td>
                    <td>
                        <span class="sentiment-badge ${result.sentiment.toLowerCase()}">
                            ${result.sentiment}
                        </span>
                    </td>
                    <td>
                        <span class="label-badge">${result.label || 'Unknown'}</span>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        console.log('Search results table populated successfully with', searchResults.length, 'results');
        
    } catch (error) {
        console.error('Error displaying search results table:', error);
        showError('Error displaying search results table: ' + error.message);
    }
}

// Show search loading state
function showSearchLoadingState() {
    const searchResultsSummary = document.getElementById('searchResultsSummary');
    if (searchResultsSummary) {
        searchResultsSummary.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Searching messages...</span>
            </div>
        `;
        searchResultsSummary.style.display = 'block';
    }
}

// Hide search loading state
function hideSearchLoadingState() {
    try {
        const searchResultsSummary = document.getElementById('searchResultsSummary');
        if (searchResultsSummary) {
            // Don't clear the innerHTML - let updateSearchResultsSummary handle the content
            // Just hide the loading spinner if it exists
            const loadingSpinner = searchResultsSummary.querySelector('.search-loading');
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
            console.log('Search loading state hidden');
        }
    } catch (error) {
        console.error('Error hiding search loading state:', error);
    }
}

// Format timestamp for display
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

// Apply all search and filter criteria (for existing results only)
function applySearchFilters(searchTerm, selectedLabel, selectedSentiment) {
    try {
        if (!currentAnalysisResults || !currentAnalysisResults.common_members) {
            console.log('No analysis results available for search');
            return;
        }
        
        let filteredMembers = [...currentAnalysisResults.common_members];
        let totalMessages = 0;
        let totalMembers = 0;
        let totalGroups = new Set();
        
        // Apply filters
        filteredMembers = filteredMembers.filter(member => {
            let memberMatches = true;
            
            // Apply label filter
            if (selectedLabel !== 'all') {
                memberMatches = memberMatches && member.labels && member.labels.includes(selectedLabel);
            }
            
            // Apply sentiment filter
            if (selectedSentiment !== 'all') {
                memberMatches = memberMatches && member.sentiment_breakdown && 
                               member.sentiment_breakdown[selectedSentiment] > 0;
            }
            
            // Apply search term filter
            if (searchTerm) {
                // Check if member name or phone contains search term
                const nameMatch = member.name && member.name.toLowerCase().includes(searchTerm);
                const phoneMatch = member.phone && member.phone.includes(searchTerm);
                
                // Check if any message content contains search term (if available)
                let messageMatch = false;
                if (member.messages) {
                    messageMatch = member.messages.some(msg => 
                        msg.content && msg.content.toLowerCase().includes(searchTerm)
                    );
                }
                
                memberMatches = memberMatches && (nameMatch || phoneMatch || messageMatch);
            }
            
            return memberMatches;
        });
        
        // Calculate summary statistics
        filteredMembers.forEach(member => {
            if (member.groups) {
                member.groups.forEach(group => totalGroups.add(group));
            }
            if (member.total_messages) {
                totalMessages += member.total_messages;
            }
        });
        totalMembers = filteredMembers.length;
        
        // Update search results summary
        updateSearchResultsSummary(totalMessages, totalMembers, totalGroups.size);
        
        // Update the common members table with filtered results
        displayCommonMembersTable(filteredMembers);
        
        console.log('Search filters applied - Results:', {
            searchTerm,
            selectedLabel,
            selectedSentiment,
            totalMessages,
            totalMembers,
            totalGroups: totalGroups.size
        });
        
    } catch (error) {
        console.error('Error applying search filters:', error);
    }
}

// Update search results summary
function updateSearchResultsSummary(totalMessages, totalMembers, totalGroups) {
    try {
        console.log('Updating search results summary:', { totalMessages, totalMembers, totalGroups });
        
        const searchResultsSummary = document.getElementById('searchResultsSummary');
        const searchResultsCount = document.getElementById('searchResultsCount');
        const searchResultsMembers = document.getElementById('searchResultsMembers');
        const searchResultsGroups = document.getElementById('searchResultsGroups');
        
        console.log('Summary elements found:', {
            summary: searchResultsSummary,
            count: searchResultsCount,
            members: searchResultsMembers,
            groups: searchResultsGroups
        });
        
        if (searchResultsSummary) {
            // Make sure the summary has the proper content structure
            if (!searchResultsSummary.querySelector('.summary-stats')) {
                searchResultsSummary.innerHTML = `

                    
                    <!-- Download Button -->
                    <div class="download-section">
                        <button id="downloadSearchResultsBtn" class="btn btn-success" onclick="downloadSearchResults()" style="display: none;">
                            <i class="fas fa-download"></i> Download Results (.csv)
                        </button>
                    </div>
                `;
            }
            
            searchResultsSummary.style.display = 'block';
            console.log('Search results summary displayed');
        }
        
        if (searchResultsCount) {
            searchResultsCount.textContent = totalMessages;
            console.log('Updated message count to:', totalMessages);
        }
        
        if (searchResultsMembers) {
            searchResultsMembers.textContent = totalMembers;
            console.log('Updated member count to:', totalMembers);
        }
        
        if (searchResultsGroups) {
            searchResultsGroups.textContent = totalGroups;
            console.log('Updated group count to:', totalGroups);
        }
        
    } catch (error) {
        console.error('Error updating search results summary:', error);
    }
}

// Clear all filters and search
function clearAllFilters() {
    try {
        // Clear search input
        const searchInput = document.getElementById('messageSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Reset label filter to "All Labels"
        const labelFilter = document.getElementById('labelFilter');
        if (labelFilter) {
            labelFilter.value = 'all';
        }
        
        // Reset sentiment filter to "All Sentiments"
        const sentimentFilter = document.getElementById('sentimentFilter');
        if (sentimentFilter) {
            sentimentFilter.value = 'all';
        }
        
        // Hide search results summary
        const searchResultsSummary = document.getElementById('searchResultsSummary');
        if (searchResultsSummary) {
            searchResultsSummary.style.display = 'none';
        }
        
        // Hide search results container
        const searchResultsContainer = document.getElementById('searchResultsContainer');
        if (searchResultsContainer) {
            searchResultsContainer.style.display = 'none';
        }
        
        // Hide download button
        hideDownloadButton();
        
        // Reset to original results
        if (currentAnalysisResults) {
            displayCommonMembersTable(currentAnalysisResults.common_members || []);
        }
        
        console.log('All search filters cleared');
        
    } catch (error) {
        console.error('Error clearing filters:', error);
    }
}

// Show download button
function showDownloadButton() {
    try {
        console.log('showDownloadButton called - looking for download button element');
        const downloadBtn = document.getElementById('downloadSearchResultsBtn');
        console.log('Download button element found:', downloadBtn);
        
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-block';
            downloadBtn.style.visibility = 'visible';
            downloadBtn.style.opacity = '1';
            console.log('Download button shown successfully with all properties set');
            
            // Also check if the parent container is visible
            const searchResultsSummary = document.getElementById('searchResultsSummary');
            if (searchResultsSummary) {
                console.log('Search results summary display style:', searchResultsSummary.style.display);
                console.log('Search results summary visibility:', searchResultsSummary.style.visibility);
                console.log('Search results summary opacity:', searchResultsSummary.style.opacity);
            }
        } else {
            console.error('Download button element NOT found!');
        }
    } catch (error) {
        console.error('Error showing download button:', error);
    }
}

// Hide download button
function hideDownloadButton() {
    try {
        const downloadBtn = document.getElementById('downloadSearchResultsBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'none';
            console.log('Download button hidden');
        }
    } catch (error) {
        console.error('Error hiding download button:', error);
    }
}

// Download search results as Excel file
function downloadSearchResults() {
    try {
        console.log('Starting download of search results...');
        
        // Get current search results from the table
        const tableBody = document.getElementById('searchResultsTableBody');
        if (!tableBody) {
            showError('No search results available for download');
            return;
        }
        
        const rows = tableBody.querySelectorAll('tr');
        if (rows.length === 0) {
            showError('No search results available for download');
            return;
        }
        
        console.log('Found', rows.length, 'rows to download');
        
        // Prepare Excel data
        const excelData = [];
        
        // Add header row
        excelData.push([
            'Message Content',
            'Sender Name',
            'Sender Phone',
            'Group Name',
            'Assembly',
            'Date',
            'Sentiment',
            'Label'
        ]);
        
        // Add data rows
        rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                const messageContent = cells[0].textContent.trim();
                const senderInfo = cells[1].textContent.trim();
                const groupName = cells[2].textContent.trim();
                const assembly = cells[3].textContent.trim();
                const date = cells[4].textContent.trim();
                const sentiment = cells[5].textContent.trim();
                const label = cells[6].textContent.trim();
                
                // Extract sender name and phone from sender info
                const senderLines = senderInfo.split('\n');
                const senderName = senderLines[0] || 'Unknown';
                const senderPhone = senderLines[1] || 'N/A';
                
                excelData.push([
                    messageContent,
                    senderName,
                    senderPhone,
                    groupName,
                    assembly,
                    date,
                    sentiment,
                    label
                ]);
                
                console.log(`Row ${index + 1}:`, { senderName, senderPhone, groupName, assembly, date, sentiment, label });
            }
        });
        
        // Convert to CSV format (Excel can open CSV files)
        const csvContent = excelData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with current date and search info
        const currentDate = new Date().toISOString().split('T')[0];
        const searchTerm = document.getElementById('messageSearch').value.trim().substring(0, 20);
        const filename = `search_results_${searchTerm}_${currentDate}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('Search results downloaded successfully as:', filename);
        showError(`✅ Search results downloaded successfully! File: ${filename}`);
        
    } catch (error) {
        console.error('Error downloading search results:', error);
        showError('Error downloading search results: ' + error.message);
    }
}

// Test download function (temporary)
function testDownload() {
    try {
        console.log('Testing download functionality...');
        
        // Create test data
        const testData = [
            ['Message Content', 'Sender Name', 'Sender Phone', 'Group Name', 'Assembly', 'Date', 'Sentiment', 'Label'],
            ['Test message 1', 'Test User 1', '1234567890', 'Test Group 1', 'Test Assembly', '2024-12-19', 'Positive', 'test'],
            ['Test message 2', 'Test User 2', '0987654321', 'Test Group 2', 'Test Assembly', '2024-12-19', 'Negative', 'test']
        ];
        
        // Convert to CSV
        const csvContent = testData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const filename = `test_download_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('Test download successful:', filename);
        showError(`✅ Test download successful! File: ${filename}`);
        
    } catch (error) {
        console.error('Error in test download:', error);
        showError('Error in test download: ' + error.message);
    }
}

// Download all messages from common members
async function downloadAllMessages() {
    try {
        console.log('Starting download of all messages...');
        
        // Show loading state
        showError('⏳ Preparing download of all messages... Please wait.');
        
        // Check if we have analysis results
        if (!currentAnalysisResults || !currentAnalysisResults.common_members) {
            showError('Please run the Common Members Analysis first to download all messages');
            return;
        }
        
        // Prepare data for download
        const allMessagesData = [];
        
        // Add header row
        allMessagesData.push([
            'Member Name',
            'Phone Number',
            'Groups Count',
            'Group Names',
            'Total Messages',
            'Positive Messages',
            'Negative Messages',
            'Neutral Messages',
            'Sentiment Breakdown'
        ]);
        
        // Add data rows for each common member
        currentAnalysisResults.common_members.forEach((member, index) => {
            const name = member.name || 'Unknown';
            const phone = member.phone || 'N/A';
            const groupsCount = member.groups_count || 0;
            const groupNames = (member.group_names || []).join('; ');
            const totalMessages = member.total_messages || 0;
            
            // Extract sentiment breakdown
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;
            
            if (member.sentiment_breakdown) {
                positiveCount = member.sentiment_breakdown.positive || 0;
                negativeCount = member.sentiment_breakdown.negative || 0;
                neutralCount = member.sentiment_breakdown.neutral || 0;
            }
            
            const sentimentBreakdown = `+${positiveCount} -${negativeCount} ~${neutralCount}`;
            
            allMessagesData.push([
                name,
                phone,
                groupsCount,
                groupNames,
                totalMessages,
                positiveCount,
                negativeCount,
                neutralCount,
                sentimentBreakdown
            ]);
            
            console.log(`Member ${index + 1}:`, { name, phone, groupsCount, totalMessages });
        });
        
        // Convert to CSV format
        const csvContent = allMessagesData.map(row => 
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `all_common_members_messages_${currentDate}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        console.log('All messages downloaded successfully as:', filename);
        showError(`✅ All messages downloaded successfully! File: ${filename}`);
        
    } catch (error) {
        console.error('Error downloading all messages:', error);
        showError('Error downloading all messages: ' + error.message);
    }
}
