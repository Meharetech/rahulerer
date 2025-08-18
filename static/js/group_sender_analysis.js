// Group Sender Analysis JavaScript
let assemblies = [];
let selectedAssemblies = new Set();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Group Sender Analysis page loaded');
    
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
    
    // Show search section by default
    setTimeout(() => {
        showSearchSection();
    }, 500);
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

// Display assemblies in the grid
function displayAssemblies() {
    const container = document.getElementById('assembliesGrid');
    if (!container) return;
    
    if (assemblies.length === 0) {
        container.innerHTML = '<p class="no-data">No assemblies found.</p>';
        return;
    }
    
    let html = '';
    assemblies.forEach(assembly => {
        const isSelected = selectedAssemblies.has(assembly.name);
        html += `
            <label class="assembly-checkbox ${isSelected ? 'selected' : ''}">
                <input type="checkbox" 
                       value="${assembly.name}" 
                       ${isSelected ? 'checked' : ''} 
                       onchange="toggleAssembly('${assembly.name}')">
                <span class="assembly-name">${assembly.name}</span>
            </label>
        `;
    });
    
    container.innerHTML = html;
}

// Toggle assembly selection
function toggleAssembly(assemblyName) {
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

// Analyze group senders with detailed breakdown
async function analyzeGroupSenders() {
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
        
        console.log('Sending group sender analysis request:', requestData);
        
        // Make API call
        const response = await fetch('/api/group-sender-analysis', {
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
            console.log('Group sender analysis results:', data.results);
            displayGroupSenderResults(data.results);
        } else {
            throw new Error(data.message || 'Group sender analysis failed');
        }
        
    } catch (error) {
        hideLoadingState();
        console.error('Error during group sender analysis:', error);
        showError('Error during group sender analysis: ' + error.message);
    }
}

// Display group sender analysis results
function displayGroupSenderResults(results) {
    try {
        // Hide loading state
        hideLoadingState();
        
        // Show results section
        const resultsContainer = document.getElementById('groupSenderResults');
        if (!resultsContainer) {
            console.error('Group sender results container not found');
            return;
        }
        resultsContainer.style.display = 'block';
        
        // Update summary cards
        const totalGroupsElement = document.getElementById('totalGroupsCount');
        const totalSendersElement = document.getElementById('totalSendersCount');
        const totalMessagesElement = document.getElementById('totalMessagesCount');
        
        if (totalGroupsElement) {
            totalGroupsElement.textContent = results.total_groups || 0;
        }
        
        if (totalSendersElement) {
            totalSendersElement.textContent = results.total_unique_senders || 0;
        }
        
        if (totalMessagesElement) {
            totalMessagesElement.textContent = results.total_messages || 0;
        }
        
        // Display group analysis table
        displayGroupAnalysisTable(results.group_analysis || []);
        
        // Automatically collapse the filter form after showing results
        setTimeout(() => {
            toggleFilterForm();
        }, 500); // Small delay to ensure results are visible first
        
        // Show search section after analysis is complete
        setTimeout(() => {
            showSearchSection();
        }, 1000); // Delay to ensure results are fully displayed
        
    } catch (error) {
        console.error('Error displaying group sender results:', error);
        showError('Error displaying group sender results');
    }
}

// Display group analysis table
function displayGroupAnalysisTable(groupAnalysis) {
    try {
        const tableBody = document.getElementById('groupAnalysisTableBody');
        if (!tableBody) {
            console.error('Group analysis table body not found');
            return;
        }
        
        if (!groupAnalysis || groupAnalysis.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="no-data">No groups found for selected criteria.</td></tr>';
            return;
        }
        
        let html = '';
        
        groupAnalysis.forEach(group => {
            if (!group) return;
            
            const groupName = group.group_name || 'Unknown Group';
            const assembly = group.assembly || 'Unknown Assembly';
            const date = group.date || 'Unknown Date';
            const totalMessages = group.total_messages || 0;
            const uniqueSenders = group.unique_senders || 0;
            
            // Top sender info
            const topSender = group.top_sender || {};
            const topSenderName = topSender.name || 'Unknown';
            const topSenderPhone = topSender.phone || 'N/A';
            const topSenderCount = topSender.message_count || 0;
            
            // Sentiment breakdown
            const sentimentBreakdown = group.sentiment_breakdown || {};
            const positiveCount = sentimentBreakdown.Positive || 0;
            const negativeCount = sentimentBreakdown.Negative || 0;
            const neutralCount = sentimentBreakdown.Neutral || 0;
            
            html += `
                <tr>
                    <td>
                        <strong>${groupName}</strong>
                    </td>
                    <td>${assembly}</td>
                    <td>${date}</td>
                    <td>${totalMessages}</td>
                    <td>${uniqueSenders}</td>
                    <td>
                        <div class="top-sender-info">
                            <div class="sender-name">${topSenderName}</div>
                            <div class="sender-phone">${topSenderPhone}</div>
                            <div class="sender-count">${topSenderCount} messages</div>
                        </div>
                    </td>
                    <td>
                        <div class="sentiment-breakdown">
                            <span class="sentiment positive">+${positiveCount}</span>
                            <span class="sentiment negative">-${negativeCount}</span>
                            <span class="sentiment neutral">~${neutralCount}</span>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewGroupDetails('${groupName}', '${assembly}', '${date}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
        
    } catch (error) {
        console.error('Error displaying group analysis table:', error);
    }
}

// View detailed group information
function viewGroupDetails(groupName, assembly, date) {
    try {
        console.log('Viewing group details:', { groupName, assembly, date });
        
        // Navigate to group details page with parameters
        const url = `/user/group-details?group=${encodeURIComponent(groupName)}&assembly=${encodeURIComponent(assembly)}&date=${encodeURIComponent(date)}`;
        window.location.href = url;
        
    } catch (error) {
        console.error('Error viewing group details:', error);
        showError('Error navigating to group details');
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
    const resultsContainer = document.getElementById('groupSenderResults');
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    const commonMembersResults = document.getElementById('commonMembersResults');
    if (commonMembersResults) commonMembersResults.style.display = 'none';
    
    // Set default dates
    setDefaultDates();
}

// Show loading state
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('groupSenderResults');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (resultsContainer) resultsContainer.style.display = 'none';
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
// SEARCH FUNCTIONALITY FOR GROUP SENDER ANALYSIS
// ============================================================================

// Show search section after analysis is complete
function showSearchSection() {
    try {
        const searchSection = document.getElementById('searchFilterSection');
        if (searchSection) {
            searchSection.style.display = 'block';
            console.log('Search section displayed');
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
        
        // For now, add some common labels - you can enhance this based on your data
        const commonLabels = ['all', 'education_news', 'politics', 'social', 'business', 'entertainment'];
        
        labelFilter.innerHTML = '<option value="all">All Labels</option>';
        commonLabels.forEach(label => {
            if (label !== 'all') {
                const option = document.createElement('option');
                option.value = label;
                option.textContent = label.charAt(0).toUpperCase() + label.slice(1).replace('_', ' ');
                labelFilter.appendChild(option);
            }
        });
        
        console.log('Label filter populated');
        
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
        
        // Use the API endpoint for searching messages
        performMessageSearch(searchTerm, selectedLabel, selectedSentiment, searchField);
        
    } catch (error) {
        console.error('Error submitting search:', error);
        showError('Error submitting search: ' + error.message);
    }
}

// Filter by label
function filterByLabel() {
    try {
        const searchTerm = document.getElementById('messageSearch').value.trim();
        const selectedLabel = document.getElementById('labelFilter').value;
        const selectedSentiment = document.getElementById('sentimentFilter').value;
        
        console.log('Filtering by label:', selectedLabel, 'with search:', searchTerm, 'sentiment:', selectedSentiment);
        
        if (searchTerm) {
            // Use the API endpoint for searching messages
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
        const selectedSentiment = document.getElementById('sentimentFilter').value;
        
        console.log('Filtering by sentiment:', selectedSentiment, 'with search:', searchTerm, 'label:', selectedLabel);
        
        if (searchTerm) {
            // Use the API endpoint for searching messages
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
        if (results.search_results && results.search_results.length > 0) {
            showDownloadButton();
        } else {
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
        console.log('Displaying search results table:', { searchResults, searchTerm });
        
        // Create a new results container for search results
        let searchResultsContainer = document.getElementById('searchResultsContainer');
        console.log('Existing search results container:', searchResultsContainer);
        
        // If container doesn't exist, create it
        if (!searchResultsContainer) {
            const searchFilterSection = document.querySelector('.search-filter-section');
            console.log('Search filter section found:', searchFilterSection);
            
            if (searchFilterSection) {
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
                
                // Insert after the search filter section
                searchFilterSection.parentNode.insertBefore(container, searchFilterSection.nextSibling);
                searchResultsContainer = container;
                console.log('Search results container created and inserted');
            } else {
                console.error('Search filter section not found');
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
                            <i class="fas fa-download"></i> Download Results (Excel)
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
                console.log('Search results summary visibility:', searchResultsSummary.style.display);
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
        link.style.display = 'none';
        
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

// Download all group messages
async function downloadAllGroupMessages() {
    try {
        console.log('Starting download of all group messages...');
        
        // Show loading state
        showError('⏳ Preparing download of all group messages... Please wait.');
        
        // For now, show a message that this feature is coming soon
        showError('📋 Download All Group Messages feature is coming soon! This will download all messages from all groups and assemblies.');
        
    } catch (error) {
        console.error('Error downloading all group messages:', error);
        showError('Error downloading all group messages: ' + error.message);
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
        
        console.log('All search filters cleared');
        
    } catch (error) {
        console.error('Error clearing filters:', error);
    }
}

// Apply search filters (placeholder function)
function applySearchFilters(searchTerm, selectedLabel, selectedSentiment) {
    try {
        console.log('Applying search filters:', { searchTerm, selectedLabel, selectedSentiment });
        // This function can be enhanced to filter existing results if needed
    } catch (error) {
        console.error('Error applying search filters:', error);
    }
}


