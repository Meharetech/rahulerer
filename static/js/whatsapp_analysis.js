// WhatsApp Analysis JavaScript
let assemblies = [];
let selectedAssemblies = new Set();
let analysisResults = null;

// Global variables
let currentAnalysisResults = null;
let currentSentimentData = null;

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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('WhatsApp Analysis page loaded');
    
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
});

// Clear quick filter selection when dates are manually changed
function clearQuickFilterSelection() {
    const customRadio = document.querySelector('input[name="quickFilter"][value="custom"]');
    if (customRadio) {
        customRadio.checked = true;
    }
}

// Verify that all required HTML elements exist
function verifyRequiredElements() {
    const requiredElements = [
        'assembliesGrid',
        'startDate',
        'endDate',
        'sentiment',
        'analysisResults',
        'totalJsonFiles',
        'selectedAssembliesCount',
        'dateRange',
        'assemblyBreakdownList',
        'resultsTableBody',
        'currentSentiment',
        'totalGroups',
        'totalMessages',
        'groupStatsList',
        'statsLoading'
    ];
    
    const missingElements = [];
    
    requiredElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            missingElements.push(elementId);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return false;
    }
    
    console.log('All required elements found');
    return true;
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
    
    updateSelectedCount();
    updateSelectedAssembliesDisplay();
    updateDropdownPlaceholder();
}

// Update selected assemblies count
function updateSelectedCount() {
    const count = selectedAssemblies.size;
    const countElement = document.getElementById('selectedAssembliesCount');
    if (countElement) {
        countElement.textContent = count;
    }
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
    // Use the selectedAssemblies Set that's maintained by toggleAssemblySelection
    return Array.from(selectedAssemblies);
}

// Analyze JSON files - Simple count only
async function analyzeJsonFiles() {
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
        
        // Show loading
        showSimpleLoading();
        
        // Prepare request data
        const requestData = {
            assemblies: assemblies,
            start_date: startDate,
            end_date: endDate,
            sentiment: sentiment
        };
        
        console.log('Sending request:', requestData);
        
        // Make API call
        const response = await fetch('/api/analyze-json-files', {
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
            // Store the results globally
            currentAnalysisResults = data.results;
            currentSentimentData = data.results.sentiment_breakdown;
            
            console.log('Analysis results:', data.results);
            console.log('Sentiment data:', currentSentimentData);
            
            // Display results
            showSimpleResults(data.results.total_json_files);
            
            // Update group message statistics
            if (assemblies.length > 0) {
                analyzeGroupMessageStats(startDate, endDate, sentiment);
            }
        } else {
            throw new Error(data.message || 'Analysis failed');
        }
        
    } catch (error) {
        console.error('Error during analysis:', error);
        showError('Error during analysis: ' + error.message);
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
        
        // Show loading
        showSimpleLoading();
        
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
        console.error('Error during group sender analysis:', error);
        showError('Error during group sender analysis: ' + error.message);
    }
}

// Analyze group message statistics
async function analyzeGroupMessageStats(startDate, endDate, sentiment) {
    try {
        // Show stats loading
        const statsLoadingElement = document.getElementById('statsLoading');
        const groupStatsListElement = document.getElementById('groupStatsList');
        
        if (statsLoadingElement) statsLoadingElement.style.display = 'flex';
        if (groupStatsListElement) groupStatsListElement.innerHTML = '';
        
        // Update current sentiment display
        const sentimentText = sentiment === 'all' ? 'All Sentiments' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
        const currentSentimentElement = document.getElementById('currentSentiment');
        if (currentSentimentElement) currentSentimentElement.textContent = sentimentText;
        
        // Get all JSON files for selected assemblies and dates
        const assemblyStats = {};
        let totalMessages = 0;
        let totalGroups = 0;
        
        for (const assemblyName of selectedAssemblies) {
            const response = await fetch(`/api/get-assembly-messages/${assemblyName}?start_date=${startDate}&end_date=${endDate || ''}&sentiment=${sentiment}`);
            const data = await response.json();
            
            if (data.success) {
                assemblyStats[assemblyName] = {
                    name: assemblyName,
                    groups: data.groups || {},
                    totalMessages: data.total_messages || 0,
                    totalGroups: data.total_groups || 0
                };
                
                // Add to global totals
                totalMessages += assemblyStats[assemblyName].totalMessages;
                totalGroups += assemblyStats[assemblyName].totalGroups;
            }
        }
        
        // Update summary stats
        const totalGroupsElement = document.getElementById('totalGroups');
        const totalMessagesElement = document.getElementById('totalMessages');
        
        if (totalGroupsElement) totalGroupsElement.textContent = totalGroups;
        if (totalMessagesElement) totalMessagesElement.textContent = totalMessages;
        
        // Display assembly-wise group statistics
        displayAssemblyGroupStatistics(assemblyStats);
        
        // Hide loading
        if (statsLoadingElement) statsLoadingElement.style.display = 'none';
        
    } catch (error) {
        console.error('Error analyzing group stats:', error);
        const statsLoadingElement = document.getElementById('statsLoading');
        const groupStatsListElement = document.getElementById('groupStatsList');
        
        if (statsLoadingElement) statsLoadingElement.style.display = 'none';
        if (groupStatsListElement) {
            groupStatsListElement.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error analyzing group messages: ${error.message}</p>
                    <button onclick="clearAnalysis()" class="btn btn-primary btn-sm">
                        <i class="fas fa-times"></i> Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Extract group name from message data
function extractGroupName(message, assemblyName) {
    // Try to get group name from message data
    if (message.group_name) {
        return cleanGroupName(message.group_name);
    }
    
    // Try to get from file path
    if (message.file_path) {
        const pathParts = message.file_path.split('/');
        if (pathParts.length > 2) {
            // Get the JSON filename and extract clean group name
            const fileName = pathParts[pathParts.length - 1]; // e.g., "AAP_Ward-18_NAGI.json"
            if (fileName.endsWith('.json')) {
                const groupName = fileName.replace('.json', '');
                return cleanGroupName(groupName);
            }
        }
    }
    
    // Fallback to assembly name
    return assemblyName;
}

// Clean group name by removing date suffixes and formatting
function cleanGroupName(groupName) {
    if (!groupName) return 'Unknown Group';
    
    // Remove common date patterns
    let cleaned = groupName;
    
    // Remove _YYYY-MM-DD pattern
    cleaned = cleaned.replace(/_\d{4}-\d{2}-\d{2}$/, '');
    
    // Remove _YYYYMMDD pattern
    cleaned = cleaned.replace(/_\d{8}$/, '');
    
    // Remove _DD-MM-YYYY pattern
    cleaned = cleaned.replace(/_\d{2}-\d{2}-\d{4}$/, '');
    
    // Remove _DD-MM-YY pattern
    cleaned = cleaned.replace(/_\d{2}-\d{2}-\d{2}$/, '');
    
    // Remove (1), (2), etc. suffixes
    cleaned = cleaned.replace(/\(\d+\)$/, '');
    
    // Remove trailing underscores
    cleaned = cleaned.replace(/_+$/, '');
    
    // If the name is empty after cleaning, use original
    if (!cleaned || cleaned.trim() === '') {
        return groupName;
    }
    
    return cleaned.trim();
}

// Display group statistics
function displayGroupStatistics(groups) {
    const container = document.getElementById('groupStatsList');
    if (!container) {
        console.error('Group stats list container not found');
        return;
    }
    
    if (groups.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-search"></i>
                <p>No groups found with messages for the selected criteria.</p>
                <p><small>Try selecting different assemblies, dates, or sentiment filters.</small></p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    groups.forEach((group, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'other-ranks';
        
        html += `
            <div class="group-stat-item ${rankClass}">
                <div class="group-info">
                    <div class="group-rank">${rank}</div>
                    <div class="group-details">
                        <div class="group-name">${group.name}</div>
                    </div>
                </div>
                <div class="message-count">
                    <i class="fas fa-comments"></i>
                    <span>${group.count} messages</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Display assembly-wise group statistics
function displayAssemblyGroupStatistics(assemblyStats) {
    const container = document.getElementById('groupStatsList');
    if (!container) {
        console.error('Group stats list container not found');
        return;
    }

    if (Object.keys(assemblyStats).length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-search"></i>
                <p>No groups found with messages for the selected criteria.</p>
                <p><small>Try selecting different assemblies, dates, or sentiment filters.</small></p>
            </div>
        `;
        return;
    }

    let html = '';

    for (const assemblyName in assemblyStats) {
        const assemblyData = assemblyStats[assemblyName];
        const groups = assemblyData.groups;
        
        // Sort groups by message count (highest to lowest)
        const sortedGroups = Object.values(groups).sort((a, b) => b.count - a.count);
        
        html += `
            <div class="group-stat-item">
                <div class="group-info">
                    <div class="group-header">
                        <div class="group-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="group-name">${assemblyData.name}</div>
                    </div>
                    <div class="group-stats">
                        <div class="stat-item">
                            <i class="fas fa-users stat-icon"></i>
                            <span class="stat-text">${assemblyData.totalGroups} groups</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-comments stat-icon"></i>
                            <span class="stat-text">${assemblyData.totalMessages} messages</span>
                        </div>
                    </div>
                </div>
                <div class="group-actions">
                    <div class="message-count" onclick="openAssemblyAnalytics('${assemblyName}', '${encodeURIComponent(JSON.stringify(assemblyData))}')">
                        <i class="fas fa-chart-line"></i>
                        <span>View Analytics</span>
                    </div>
                    <button class="view-analytics-btn" onclick="openAssemblyAnalytics('${assemblyName}', '${encodeURIComponent(JSON.stringify(assemblyData))}')">
                        <span>Detailed Analysis</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Open assembly analytics in new page
function openAssemblyAnalytics(assemblyName, assemblyDataEncoded) {
    try {
        const assemblyData = JSON.parse(decodeURIComponent(assemblyDataEncoded));
        
        // Get sentiment data from the global variable first
        if (currentSentimentData) {
            assemblyData.sentiment_counts = currentSentimentData;
            console.log('Using global sentiment data:', currentSentimentData);
        } else {
            // Fallback: try to get from the current analysis results
            const sentimentBreakdown = document.querySelector('.sentiment-breakdown-section');
            if (sentimentBreakdown) {
                const positiveCount = parseInt(document.querySelector('.sentiment-total.positive .total-number')?.textContent || '0');
                const negativeCount = parseInt(document.querySelector('.sentiment-total.negative .total-number')?.textContent || '0');
                const neutralCount = parseInt(document.querySelector('.sentiment-total.neutral .total-number')?.textContent || '0');
                
                assemblyData.sentiment_counts = {
                    Positive: positiveCount,
                    Negative: negativeCount,
                    Neutral: neutralCount
                };
                console.log('Using sentiment data from breakdown section:', assemblyData.sentiment_counts);
            } else {
                console.log('No sentiment data available');
            }
        }
        
        // Ensure we have the correct assembly-specific data
        if (assemblyData.groups) {
            // Calculate assembly-specific totals
            const assemblyTotalMessages = Object.values(assemblyData.groups).reduce((total, group) => total + group.count, 0);
            const assemblyTotalGroups = Object.keys(assemblyData.groups).length;
            
            // Update the data with assembly-specific totals
            assemblyData.totalMessages = assemblyTotalMessages;
            assemblyData.totalGroups = assemblyTotalGroups;
            
            console.log(`Assembly ${assemblyName} specific totals:`, {
                totalMessages: assemblyTotalMessages,
                totalGroups: assemblyTotalGroups
            });
        }
        
        // Store assembly data in sessionStorage for the new page
        sessionStorage.setItem('selectedAssembly', assemblyName);
        sessionStorage.setItem('assemblyAnalyticsData', JSON.stringify(assemblyData));
        
        // Store filter information
        const startDateElement = document.getElementById('startDate');
        const endDateElement = document.getElementById('endDate');
        const sentimentElement = document.getElementById('sentiment');
        
        if (startDateElement) {
            sessionStorage.setItem('filterStartDate', startDateElement.value);
        }
        if (endDateElement) {
            sessionStorage.setItem('filterEndDate', endDateElement.value);
        }
        if (sentimentElement) {
            const sentimentText = sentimentElement.value === 'all' ? 'All Sentiments' : 
                                sentimentElement.value.charAt(0).toUpperCase() + sentimentElement.value.slice(1);
            sessionStorage.setItem('filterSentiment', sentimentText);
        }
        
        console.log('Opening assembly analytics with data:', assemblyData);
        
        // Open new page with assembly analytics
        const newPageUrl = `/user/assembly-analytics/${assemblyName}`;
        window.open(newPageUrl, '_blank');
        
    } catch (error) {
        console.error('Error opening assembly analytics:', error);
        alert('Error opening assembly analytics. Please try again.');
    }
}

// Display analysis results
function displayAnalysisResults(results, startDate, endDate) {
    try {
        // Show results section
        const resultsContainer = document.getElementById('analysisResults');
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }
        resultsContainer.style.display = 'block';
        
        // Update summary cards with null checks
        const totalJsonFilesElement = document.getElementById('totalJsonFiles');
        const selectedAssembliesCountElement = document.getElementById('selectedAssembliesCount');
        const dateRangeElement = document.getElementById('dateRange');
        
        if (totalJsonFilesElement) {
            totalJsonFilesElement.textContent = results.total_json_files || 0;
        }
        
        if (selectedAssembliesCountElement) {
            selectedAssembliesCountElement.textContent = results.assembly_breakdown?.length || 0;
        }
        
        if (dateRangeElement) {
            if (endDate) {
                dateRangeElement.textContent = `${startDate} to ${endDate}`;
            } else {
                dateRangeElement.textContent = startDate;
            }
        }
        
        // Display assembly breakdown
        displayAssemblyBreakdown(results.assembly_breakdown || []);
        
        // Display sentiment breakdown if available
        // Removed as per edit hint
        
    } catch (error) {
        console.error('Error displaying analysis results:', error);
        showError('Error displaying analysis results');
    }
}

// Display assembly breakdown
function displayAssemblyBreakdown(breakdown) {
    try {
        const container = document.getElementById('assemblyBreakdownList');
        if (!container) {
            console.error('Assembly breakdown container not found');
            return;
        }
        
        if (!breakdown || breakdown.length === 0) {
            container.innerHTML = '<p class="no-data">No assemblies found for selected criteria.</p>';
            return;
        }
        
        let html = '<div class="breakdown-grid">';
        
        breakdown.forEach(item => {
            if (!item) return;
            
            const assemblyName = item.assembly_name || 'Unknown Assembly';
            const fileCount = item.total_files || 0;
            const countClass = fileCount > 0 ? 'breakdown-count' : 'breakdown-count no-files';
            const countText = fileCount > 0 ? `${fileCount} files` : 'No files';
            const dateRange = item.date || 'Unknown date';
            
            html += `
                <div class="breakdown-card">
                    <div class="breakdown-header">
                        <h5><i class="fas fa-building"></i> ${assemblyName}</h5>
                        <span class="${countClass}">${countText}</span>
                    </div>
                    <div class="breakdown-dates">
                        <div class="date-item">
                            <span class="date-label">Date Range:</span>
                            <span class="date-value">${dateRange}</span>
                        </div>
                        <div class="date-item">
                            <span class="date-label">JSON Files:</span>
                            <span class="date-value">${fileCount}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
            } catch (error) {
            console.error('Error displaying assembly breakdown:', error);
        }
    }

// Display group sender analysis results
function displayGroupSenderResults(results) {
    try {
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
        // Store group details for the details page
        const groupDetails = {
            groupName: groupName,
            assembly: assembly,
            date: date
        };
        
        // You can implement a modal or redirect to a detailed page
        console.log('Viewing group details:', groupDetails);
        
        // For now, show an alert with basic info
        alert(`Group: ${groupName}\nAssembly: ${assembly}\nDate: ${date}\n\nDetailed view functionality coming soon!`);
        
    } catch (error) {
        console.error('Error viewing group details:', error);
    }
}

// Display detailed results table
function displayDetailedResults(detailedResults) {
    try {
        const tbody = document.getElementById('resultsTableBody');
        if (!tbody) {
            console.error('Results table body not found');
            return;
        }
        
        if (!detailedResults || detailedResults.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-data">No detailed results available.</td></tr>';
            return;
        }
        
        let html = '';
        
        detailedResults.forEach(result => {
            if (!result) return;
            
            const assemblyName = result.assembly_name || 'Unknown Assembly';
            const date = result.date || 'Unknown Date';
            const jsonCount = result.json_count || 0;
            
            html += `
                <tr>
                    <td>
                        <i class="fas fa-building"></i>
                        <span class="assembly-name">${assemblyName}</span>
                    </td>
                    <td>
                        <i class="fas fa-calendar"></i>
                        <span class="date-value">${date}</span>
                    </td>
                    <td>
                        <span class="file-count">${jsonCount}</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewAssemblyDetails('${assemblyName}', '${date}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error displaying detailed results:', error);
    }
}

// View assembly details (placeholder for future enhancement)
function viewAssemblyDetails(assemblyName, date) {
    alert(`Viewing details for ${assemblyName} on ${date}\n\nThis feature can be enhanced to show:\n- List of JSON files\n- File contents preview\n- Download options\n- Message statistics`);
}

// Clear analysis
function clearAnalysis() {
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
    
    // Reset sentiment to default
    const sentimentElement = document.getElementById('sentiment');
    if (sentimentElement) {
        sentimentElement.value = 'all';
    }
    
    // Hide results
    const resultsContainer = document.getElementById('analysisResults');
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
    
    // Reset counts
    updateSelectedCount();
    
    // Clear group statistics and show initial state
    const currentSentimentElement = document.getElementById('currentSentiment');
    const totalGroupsElement = document.getElementById('totalGroups');
    const totalMessagesElement = document.getElementById('totalMessages');
    const groupStatsListElement = document.getElementById('groupStatsList');
    
    if (currentSentimentElement) currentSentimentElement.textContent = 'All Sentiments';
    if (totalGroupsElement) totalGroupsElement.textContent = '0';
    if (totalMessagesElement) totalMessagesElement.textContent = '0';
    if (groupStatsListElement) {
        groupStatsListElement.innerHTML = `
            <div class="initial-state">
                <i class="fas fa-info-circle"></i>
                <p>Select assemblies and click "Apply Filter" to see group message statistics</p>
            </div>
        `;
    }
    
    // Clear any error messages
    clearMessages();
}

// Show simple loading state
function showSimpleLoading() {
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer) return;
    
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="simple-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Analyzing JSON files...</span>
        </div>
    `;
}

// Show simple results (just the count)
function showSimpleResults(totalCount) {
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer) return;
    
    resultsContainer.style.display = 'block';
    
    // Update total JSON files count
    const totalJsonFilesElement = document.getElementById('totalJsonFiles');
    if (totalJsonFilesElement) {
        totalJsonFilesElement.textContent = totalCount || 0;
    }
    
    // Update selected assemblies count
    const selectedAssembliesCountElement = document.getElementById('selectedAssembliesCount');
    if (selectedAssembliesCountElement) {
        const assemblies = getSelectedAssemblies();
        selectedAssembliesCountElement.textContent = assemblies.length || 0;
    }
    
    // Update date range
    const dateRangeElement = document.getElementById('dateRange');
    if (dateRangeElement) {
        const startDate = document.getElementById('startDate')?.value || 'Today';
        const endDate = document.getElementById('endDate')?.value || '';
        
        if (endDate) {
            dateRangeElement.textContent = `${startDate} to ${endDate}`;
        } else {
            dateRangeElement.textContent = startDate;
        }
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('analysisResults');
    if (!container) {
        console.error('Analysis results container not found');
        // Fallback to alert if container doesn't exist
        alert('Error: ' + message);
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="clearMessages()" class="btn btn-primary btn-sm">
                <i class="fas fa-times"></i> Dismiss
            </button>
        </div>
    `;
}

// Clear messages
function clearMessages() {
    const container = document.getElementById('analysisResults');
    if (container) {
        container.style.display = 'none';
    }
}

// Show no files found message
function showNoFilesMessage(startDate, endDate) {
    const container = document.getElementById('analysisResults');
    container.style.display = 'block';
    
    let dateRangeText = startDate;
    if (endDate) {
        dateRangeText += ` to ${endDate}`;
    } else {
        dateRangeText += ' onwards';
    }
    
    container.innerHTML = `
        <div class="section-header">
            <h3><i class="fas fa-info-circle"></i> Analysis Results</h3>
        </div>
        
        <div class="no-files-message">
            <div class="no-files-icon">
                <i class="fas fa-search"></i>
            </div>
            <h4>No JSON Files Found</h4>
            <p>No JSON message files were found in the selected assemblies for the date range: <strong>${dateRangeText}</strong></p>
            
            <div class="no-files-suggestions">
                <h5>Possible reasons:</h5>
                <ul>
                    <li>The selected assemblies don't have message data for the specified dates</li>
                    <li>The date format in your database folders doesn't match the expected format (YYYY-MM-DD)</li>
                    <li>JSON files are stored in a different directory structure</li>
                    <li>No messages have been uploaded yet for the selected criteria</li>
                </ul>
            </div>
            
            <div class="no-files-actions">
                <button onclick="clearAnalysis()" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Try Different Criteria
                </button>
            </div>
        </div>
    `;
}
