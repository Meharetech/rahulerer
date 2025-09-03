// Advanced Search JavaScript
let assemblies = [];
let selectedAssemblies = new Set();
let searchResults = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Advanced Search page loaded');
    
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
    
    // Add event listener for search term input (Enter key)
    const searchTermInput = document.getElementById('searchTerm');
    if (searchTermInput) {
        searchTermInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// Set default dates
function setDefaultDates() {
    const today = new Date();
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.value = today.toISOString().split('T')[0];
    }
    
    if (endDateInput) {
        endDateInput.value = '';
    }
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

// Load available assemblies
async function loadAssemblies() {
    try {
        const response = await fetch('/api/assemblies-with-groups');
        const data = await response.json();
        
        if (data.success) {
            assemblies = data.assemblies;
            displayAssemblies();
        } else {
            showError('Failed to load assemblies: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading assemblies:', error);
        showError('Error loading assemblies: ' + error.message);
    }
}

// Display assemblies in dropdown
function displayAssemblies() {
    const container = document.getElementById('dropdownOptions');
    if (!container) {
        console.error('Dropdown options container not found');
        return;
    }
    
    if (assemblies.length === 0) {
        container.innerHTML = '<div class="no-results">No assemblies found.</div>';
        return;
    }
    
    let html = '';
    
    assemblies.forEach(assembly => {
        html += `
            <div class="dropdown-option" data-assembly="${assembly.name}">
                <input type="checkbox" 
                       id="assembly_${assembly.name}" 
                       value="${assembly.name}" 
                       onchange="toggleAssemblySelection('${assembly.name}')">
                <label for="assembly_${assembly.name}">
                    <i class="fas fa-building assembly-icon"></i>
                    <span class="assembly-name">${assembly.name}</span>
                </label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Toggle dropdown visibility
function toggleDropdown() {
    const dropdown = document.getElementById('assemblyDropdown');
    const content = document.getElementById('dropdownContent');
    const header = dropdown.querySelector('.dropdown-header');
    
    if (content.classList.contains('show')) {
        content.classList.remove('show');
        header.classList.remove('active');
    } else {
        content.classList.add('show');
        header.classList.add('active');
        // Focus on search input when dropdown opens
        setTimeout(() => {
            const searchInput = document.getElementById('assemblySearch');
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }
}

// Filter assemblies based on search input
function filterAssemblies() {
    const searchTerm = document.getElementById('assemblySearch').value.toLowerCase();
    const options = document.querySelectorAll('.dropdown-option');
    
    options.forEach(option => {
        const assemblyName = option.querySelector('.assembly-name').textContent.toLowerCase();
        if (assemblyName.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// Select all assemblies
function selectAllAssemblies() {
    const checkboxes = document.querySelectorAll('.dropdown-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            toggleAssemblySelection(checkbox.value);
        }
    });
}

// Clear all assemblies
function clearAllAssemblies() {
    const checkboxes = document.querySelectorAll('.dropdown-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
            toggleAssemblySelection(checkbox.value);
        }
    });
}

// Toggle assembly selection
function toggleAssemblySelection(assemblyName) {
    const checkbox = document.getElementById(`assembly_${assemblyName}`);
    if (!checkbox) {
        console.error(`Checkbox for assembly ${assemblyName} not found`);
        return;
    }
    
    if (checkbox.checked) {
        selectedAssemblies.add(assemblyName);
    } else {
        selectedAssemblies.delete(assemblyName);
    }
    
    updateSelectedAssembliesDisplay();
    updateDropdownPlaceholder();
}

// Update dropdown placeholder text
function updateDropdownPlaceholder() {
    const placeholder = document.querySelector('.dropdown-placeholder');
    if (selectedAssemblies.size === 0) {
        placeholder.textContent = 'Select assemblies...';
        placeholder.classList.remove('has-selection');
    } else if (selectedAssemblies.size === 1) {
        placeholder.textContent = Array.from(selectedAssemblies)[0];
        placeholder.classList.add('has-selection');
    } else {
        placeholder.textContent = `${selectedAssemblies.size} assemblies selected`;
        placeholder.classList.add('has-selection');
    }
}

// Update selected assemblies display
function updateSelectedAssembliesDisplay() {
    const container = document.getElementById('selectedAssemblies');
    if (!container) return;
    
    if (selectedAssemblies.size === 0) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <div class="selected-assemblies-header">
            <div class="selected-assemblies-title">
                <i class="fas fa-check-circle"></i>
                Selected Assemblies
            </div>
            <span class="selected-count">${selectedAssemblies.size}</span>
        </div>
        <div class="selected-assemblies-list">
    `;
    
    selectedAssemblies.forEach(assemblyName => {
        html += `
            <div class="selected-assembly-tag">
                <i class="fas fa-building"></i>
                <span>${assemblyName}</span>
                <button type="button" class="remove-assembly" onclick="removeAssembly('${assemblyName}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Remove assembly from selection
function removeAssembly(assemblyName) {
    const checkbox = document.getElementById(`assembly_${assemblyName}`);
    if (checkbox) {
        checkbox.checked = false;
        toggleAssemblySelection(assemblyName);
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('assemblyDropdown');
    const content = document.getElementById('dropdownContent');
    const header = dropdown.querySelector('.dropdown-header');
    
    if (!dropdown.contains(event.target)) {
        content.classList.remove('show');
        header.classList.remove('active');
    }
});

// Get selected assemblies from checkboxes
function getSelectedAssemblies() {
    return Array.from(selectedAssemblies);
}

// Perform search
async function performSearch() {
    try {
        // Get form data
        const assemblies = getSelectedAssemblies();
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;
        const searchTerm = document.getElementById('searchTerm')?.value.trim();
        const searchField = document.getElementById('searchField')?.value || 'message_content';
        const sentiment = document.getElementById('sentiment')?.value || 'all';
        const label = document.getElementById('label')?.value || 'all';
        
        // Validation
        if (assemblies.length === 0) {
            showError('Please select at least one assembly');
            return;
        }
        
        if (!startDate) {
            showError('Please select a start date');
            return;
        }
        
        if (!searchTerm) {
            showError('Please enter a search term');
            return;
        }
        
        // Show loading
        showLoading();
        
        // Prepare request data
        const requestData = {
            assemblies: assemblies,
            startDate: startDate,
            endDate: endDate,
            searchTerm: searchTerm,
            searchField: searchField,
            sentiment: sentiment,
            label: label
        };
        
        console.log('Sending search request:', requestData);
        
        // Make API call
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
            searchResults = data.results;
            console.log('Search results:', data.results);
            displaySearchResults(data.results, searchTerm, searchField);
        } else {
            throw new Error(data.message || 'Search failed');
        }
        
    } catch (error) {
        console.error('Error during search:', error);
        showError('Error during search: ' + error.message);
        hideLoading();
    }
}

// Display search results
function displaySearchResults(results, searchTerm, searchField = 'message_content') {
    hideLoading();
    
    const resultsContainer = document.getElementById('searchResults');
    const noResultsContainer = document.getElementById('noResults');
    
    if (!resultsContainer || !noResultsContainer) {
        console.error('Results containers not found');
        return;
    }
    
    if (!results.search_results || results.search_results.length === 0) {
        resultsContainer.style.display = 'none';
        noResultsContainer.style.display = 'block';
        return;
    }
    
    // Show results container
    resultsContainer.style.display = 'block';
    noResultsContainer.style.display = 'none';
    
    // Update summary cards
    updateSummaryCards(results, searchTerm);
    
    // Display results table
    displayResultsTable(results.search_results, searchTerm, searchField);
}

// Update summary cards
function updateSummaryCards(results, searchTerm) {
    const totalMessagesElement = document.getElementById('totalMessages');
    const totalMembersElement = document.getElementById('totalMembers');
    const totalGroupsElement = document.getElementById('totalGroups');
    const searchTermElement = document.getElementById('searchTermDisplay');
    
    if (totalMessagesElement) {
        totalMessagesElement.textContent = results.total_messages || 0;
    }
    
    if (totalMembersElement) {
        totalMembersElement.textContent = results.total_members || 0;
    }
    
    if (totalGroupsElement) {
        totalGroupsElement.textContent = results.total_groups || 0;
    }
    
    if (searchTermElement) {
        searchTermElement.textContent = searchTerm;
    }
}

// Display results table
function displayResultsTable(searchResults, searchTerm = '', searchField = 'message_content') {
    const tableBody = document.getElementById('searchResultsTableBody');
    if (!tableBody) {
        console.error('Results table body not found');
        return;
    }
    
    let html = '';
    
    searchResults.forEach(result => {
        // Format message content with search term highlighting (only if search field is 'all' or 'message_content')
        const shouldHighlightMessage = searchField === 'all' || searchField === 'message_content';
        const messageContent = formatMessageContent(result.message_content, shouldHighlightMessage ? searchTerm : '');
        
        // Format sender info with highlighting (only if search field is 'all' or 'sender_name')
        const shouldHighlightSender = searchField === 'all' || searchField === 'sender_name';
        const highlightedSenderName = (searchTerm && shouldHighlightSender) ? highlightSearchTerm(result.sender_name || 'Unknown', searchTerm) : (result.sender_name || 'Unknown');
        const senderInfo = `
            <div class="sender-info">
                <div class="sender-name">${highlightedSenderName}</div>
                <div class="sender-phone">${result.sender_phone || 'N/A'}</div>
            </div>
        `;
        
        // Format sentiment badge
        const sentimentClass = `sentiment-${result.sentiment.toLowerCase()}`;
        const sentimentBadge = `
            <span class="sentiment-badge ${sentimentClass}">
                ${result.sentiment || 'Neutral'}
            </span>
        `;
        
        // Format label badge
        const labelClass = `label-${result.label}`;
        const labelBadge = `
            <span class="label-badge ${labelClass}">
                ${formatLabel(result.label)}
            </span>
        `;
        
        // Format date
        const formattedDate = formatDate(result.date);
        
        html += `
            <tr>
                <td>
                    <div class="message-content">${messageContent}</div>
                </td>
                <td>${senderInfo}</td>
                <td>
                    <div class="sender-phone">${(searchTerm && (searchField === 'all' || searchField === 'phone_number')) ? highlightSearchTerm(result.sender_phone || 'N/A', searchTerm) : (result.sender_phone || 'N/A')}</div>
                </td>
                <td>
                    <div class="group-info">${(searchTerm && (searchField === 'all' || searchField === 'group_name')) ? highlightSearchTerm(result.group_name || 'Unknown', searchTerm) : (result.group_name || 'Unknown')}</div>
                </td>
                <td>
                    <div class="assembly-info">${(searchTerm && (searchField === 'all' || searchField === 'assembly_name')) ? highlightSearchTerm(result.assembly || 'Unknown', searchTerm) : (result.assembly || 'Unknown')}</div>
                </td>
                <td>
                    <div class="date-info">${formattedDate}</div>
                </td>
                <td>${sentimentBadge}</td>
                <td>${labelBadge}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Highlight search term in any text
function highlightSearchTerm(text, searchTerm) {
    if (!text || !searchTerm || !searchTerm.trim()) return text;
    
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlightRegex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    return text.replace(highlightRegex, '<mark class="search-highlight">$1</mark>');
}

// Format message content
function formatMessageContent(content, searchTerm = '') {
    if (!content) return 'No content';
    
    // Truncate long messages
    if (content.length > 100) {
        content = content.substring(0, 100) + '...';
    }
    
    // Highlight search term if provided
    if (searchTerm && searchTerm.trim()) {
        content = highlightSearchTerm(content, searchTerm);
    }
    
    // Convert URLs to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
    return content;
}

// Format label
function formatLabel(label) {
    const labelMap = {
        'spam': 'Spam',
        'health_news': 'Health News',
        'casual_chat': 'Casual Chat'
    };
    
    return labelMap[label] || label;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}



// Export results
function exportResults(format = 'csv') {
    if (!searchResults || !searchResults.search_results) {
        showError('No results to export');
        return;
    }
    
    try {
        if (format === 'excel') {
            // Export as Excel
            exportToExcel(searchResults.search_results);
        } else {
            // Export as CSV
            exportToCSV(searchResults.search_results);
        }
    } catch (error) {
        console.error('Error exporting results:', error);
        showError('Error exporting results: ' + error.message);
    }
}

// Export to CSV
function exportToCSV(results) {
    const csvContent = createCSVContent(results);
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `search_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV exported successfully');
    showSuccess('CSV file downloaded successfully!');
}

// Export to Excel
function exportToExcel(results) {
    try {
        // Create Excel content using a simple approach
        const excelContent = createExcelContent(results);
        
        // Create download link
        const blob = new Blob([excelContent], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `search_results_${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Excel exported successfully');
        showSuccess('Excel file downloaded successfully!');
    } catch (error) {
        console.error('Error creating Excel file:', error);
        // Fallback to server-side Excel generation
        exportToExcelServer(results);
    }
}

// Server-side Excel export
function exportToExcelServer(results) {
    try {
        // Send request to server to generate Excel file
        const requestData = {
            results: results,
            format: 'excel'
        };
        
        fetch('/api/export-search-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `search_results_${new Date().toISOString().split('T')[0]}.xlsx`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Excel exported successfully via server');
            showSuccess('Excel file downloaded successfully!');
        })
        .catch(error => {
            console.error('Error exporting Excel via server:', error);
            showError('Error exporting Excel: ' + error.message);
        });
    } catch (error) {
        console.error('Error in server Excel export:', error);
        showError('Error exporting Excel: ' + error.message);
    }
}

// Create Excel content (simple XML format)
function createExcelContent(results) {
    const headers = [
        'Message Content',
        'Sender Name',
        'Phone Number',
        'Group Name',
        'Assembly',
        'Date',
        'Sentiment',
        'Label'
    ];
    
    let xmlContent = '<?xml version="1.0"?>';
    xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">';
    xmlContent += '<Worksheet ss:Name="Search Results">';
    xmlContent += '<Table>';
    
    // Add headers
    xmlContent += '<Row>';
    headers.forEach(header => {
        xmlContent += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`;
    });
    xmlContent += '</Row>';
    
    // Add data rows
    results.forEach(result => {
        xmlContent += '<Row>';
        const rowData = [
            result.message_content || '',
            result.sender_name || '',
            result.sender_phone || '',
            result.group_name || '',
            result.assembly || '',
            result.date || '',
            result.sentiment || '',
            result.label || ''
        ];
        
        rowData.forEach(data => {
            xmlContent += `<Cell><Data ss:Type="String">${escapeXml(data)}</Data></Cell>`;
        });
        xmlContent += '</Row>';
    });
    
    xmlContent += '</Table>';
    xmlContent += '</Worksheet>';
    xmlContent += '</Workbook>';
    
    return xmlContent;
}

// Escape XML special characters
function escapeXml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Create CSV content
function createCSVContent(results) {
    const headers = [
        'Message Content',
        'Sender Name',
        'Phone Number',
        'Group Name',
        'Assembly',
        'Date',
        'Sentiment',
        'Label'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    results.forEach(result => {
        const row = [
            `"${(result.message_content || '').replace(/"/g, '""')}"`,
            `"${(result.sender_name || '').replace(/"/g, '""')}"`,
            `"${(result.sender_phone || '').replace(/"/g, '""')}"`,
            `"${(result.group_name || '').replace(/"/g, '""')}"`,
            `"${(result.assembly || '').replace(/"/g, '""')}"`,
            `"${(result.date || '').replace(/"/g, '""')}"`,
            `"${(result.sentiment || '').replace(/"/g, '""')}"`,
            `"${(result.label || '').replace(/"/g, '""')}"`
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

// Clear search
function clearSearch() {
    // Clear selections
    selectedAssemblies.clear();
    selectedAssemblies.forEach(assemblyName => {
        const checkbox = document.getElementById(`assembly_${assemblyName}`);
        if (checkbox) {
            checkbox.checked = false;
        }
    });
    
    // Reset dates
    setDefaultDates();
    
    // Reset form fields
    const searchTermInput = document.getElementById('searchTerm');
    const searchFieldSelect = document.getElementById('searchField');
    const sentimentSelect = document.getElementById('sentiment');
    const labelSelect = document.getElementById('label');
    
    if (searchTermInput) searchTermInput.value = '';
    if (searchFieldSelect) searchFieldSelect.value = 'all';
    if (sentimentSelect) sentimentSelect.value = 'all';
    if (labelSelect) labelSelect.value = 'all';
    
    // Hide results
    const resultsContainer = document.getElementById('searchResults');
    const noResultsContainer = document.getElementById('noResults');
    
    if (resultsContainer) resultsContainer.style.display = 'none';
    if (noResultsContainer) noResultsContainer.style.display = 'none';
    
    // Reset dropdown
    updateSelectedAssembliesDisplay();
    updateDropdownPlaceholder();
    
    // Clear any error messages
    clearMessages();
}

// Show loading state
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    
    if (loadingState) loadingState.style.display = 'block';
    if (searchResults) searchResults.style.display = 'none';
    if (noResults) noResults.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'none';
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

// Clear messages
function clearMessages() {
    // This function can be used to clear any displayed messages
    console.log('Messages cleared');
}
