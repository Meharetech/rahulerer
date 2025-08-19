// Assembly Analytics JavaScript
let assemblyData = null;
let currentAssembly = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Assembly Analytics page loaded');
    
    // Set sidebar active state
    setSidebarActiveState();
    
    // Load assembly data from sessionStorage
    loadAssemblyData();
    
    // Initialize event listeners
    initializeEventListeners();
});

// Set sidebar active state
function setSidebarActiveState() {
    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Set WhatsApp Analysis as active since this is related to it
    const whatsappAnalysisItem = document.querySelector('[data-page="whatsapp-analysis"]');
    if (whatsappAnalysisItem) {
        whatsappAnalysisItem.classList.add('active');
    }
}

// Load assembly data from sessionStorage
function loadAssemblyData() {
    try {
        currentAssembly = sessionStorage.getItem('selectedAssembly');
        const dataString = sessionStorage.getItem('assemblyAnalyticsData');
        
        if (!currentAssembly || !dataString) {
            showError('No assembly data found. Please go back and select an assembly.');
            return;
        }
        
        assemblyData = JSON.parse(dataString);
        displayAssemblyAnalytics();
        
        // Also load filter information
        loadFilterInformation();
        
    } catch (error) {
        console.error('Error loading assembly data:', error);
        showError('Error loading assembly data. Please try again.');
    }
}

// Load and display filter information
function loadFilterInformation() {
    try {
        // Get filter data from sessionStorage
        const startDate = sessionStorage.getItem('filterStartDate') || 'Today';
        const endDate = sessionStorage.getItem('filterEndDate') || '';
        const sentiment = sessionStorage.getItem('filterSentiment') || 'All Sentiments';
        
        // Update filter display
        const selectedAssemblyElement = document.getElementById('selectedAssembly');
        const selectedDateRangeElement = document.getElementById('selectedDateRange');
        const selectedSentimentElement = document.getElementById('selectedSentiment');
        
        if (selectedAssemblyElement) {
            selectedAssemblyElement.textContent = currentAssembly;
        }
        
        if (selectedDateRangeElement) {
            if (endDate) {
                selectedDateRangeElement.textContent = `${startDate} to ${endDate}`;
            } else {
                selectedDateRangeElement.textContent = startDate;
            }
        }
        
        if (selectedSentimentElement) {
            selectedSentimentElement.textContent = sentiment;
        }
        
    } catch (error) {
        console.error('Error loading filter information:', error);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('groupSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterGroups);
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('sortOrder');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortGroups);
    }
}

// Calculate total messages for the current assembly
function calculateAssemblyTotalMessages() {
    if (!assemblyData || !assemblyData.groups) return 0;
    
    const groups = Object.values(assemblyData.groups);
    return groups.reduce((total, group) => total + group.count, 0);
}

// Display assembly analytics
function displayAssemblyAnalytics() {
    if (!assemblyData) return;
    
    // Calculate the correct total messages for this assembly
    const assemblyTotalMessages = calculateAssemblyTotalMessages();
    
    // Update assembly name
    const assemblyNameElement = document.getElementById('assemblyName');
    if (assemblyNameElement) {
        assemblyNameElement.textContent = assemblyData.name;
    }
    
    // Update overview stats with correct total
    updateOverviewStats(assemblyTotalMessages);
    
    // Display sentiment overview at the top
    displaySentimentOverview();
    
    // Display top groups with correct total
    displayTopGroups(assemblyTotalMessages);
    
    // Display distribution chart with correct total
    displayDistributionChart(assemblyTotalMessages);
    
    // Display groups table
    displayGroupsTable('desc'); // Default to highest to lowest
    
    // Sentiment stats section was removed - no need to call displaySentimentStats()
}

// Display sentiment overview cards at the top
function displaySentimentOverview() {
    const container = document.getElementById('sentimentOverviewCards');
    if (!container) return;
    
    if (!assemblyData || !assemblyData.sentiment_counts) {
        container.innerHTML = `
            <div class="sentiment-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>Sentiment data not available</p>
                <small>Sentiment data is collected when analyzing JSON files</small>
            </div>
        `;
        return;
    }
    
    const sentimentData = assemblyData.sentiment_counts;
    const totalMessages = sentimentData.Positive + sentimentData.Negative + sentimentData.Neutral;
    
    if (totalMessages === 0) {
        container.innerHTML = `
            <div class="sentiment-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No sentiment data available</p>
                <small>No messages with sentiment analysis found</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Positive card
    const positivePercentage = ((sentimentData.Positive / totalMessages) * 100).toFixed(1);
    html += `
        <div class="sentiment-card positive">
            <div class="sentiment-icon-container">
                <i class="sentiment-icon fas fa-smile"></i>
            </div>
            <div class="sentiment-count">${sentimentData.Positive}</div>
            <div class="sentiment-label">POSITIVE</div>
            <div class="sentiment-percentage">${positivePercentage}%</div>
        </div>
    `;
    
    // Negative card
    const negativePercentage = ((sentimentData.Negative / totalMessages) * 100).toFixed(1);
    html += `
        <div class="sentiment-card negative">
            <div class="sentiment-icon-container">
                <i class="sentiment-icon fas fa-frown"></i>
            </div>
            <div class="sentiment-count">${sentimentData.Negative}</div>
            <div class="sentiment-label">NEGATIVE</div>
            <div class="sentiment-percentage">${negativePercentage}%</div>
        </div>
    `;
    
    // Neutral card
    const neutralPercentage = ((sentimentData.Neutral / totalMessages) * 100).toFixed(1);
    html += `
        <div class="sentiment-card neutral">
            <div class="sentiment-icon-container">
                <i class="sentiment-icon fas fa-meh"></i>
            </div>
            <div class="sentiment-count">${sentimentData.Neutral}</div>
            <div class="sentiment-label">NEUTRAL</div>
            <div class="sentiment-percentage">${neutralPercentage}%</div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Update overview statistics
function updateOverviewStats(assemblyTotalMessages) {
    const totalGroupsElement = document.getElementById('totalGroups');
    const totalMessagesElement = document.getElementById('totalMessages');
    const dateRangeElement = document.getElementById('dateRange');
    
    if (totalGroupsElement) {
        totalGroupsElement.textContent = assemblyData.totalGroups || Object.keys(assemblyData.groups || {}).length;
    }
    
    if (totalMessagesElement) {
        totalMessagesElement.textContent = assemblyTotalMessages || 0;
    }
    
    if (dateRangeElement) {
        // Get date range from sessionStorage (filter information)
        const startDate = sessionStorage.getItem('filterStartDate') || 'Today';
        const endDate = sessionStorage.getItem('filterEndDate') || '';
        
        if (endDate) {
            dateRangeElement.textContent = `${startDate} to ${endDate}`;
        } else {
            dateRangeElement.textContent = startDate;
        }
    }
}

// Display top performing groups
function displayTopGroups(assemblyTotalMessages) {
    const container = document.getElementById('topGroupsGrid');
    if (!container) return;
    
    const groups = Object.values(assemblyData.groups);
    const topGroups = groups.sort((a, b) => b.count - a.count).slice(0, 6);
    
    let html = '';
    
    topGroups.forEach((group, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : 'other-ranks';
        const percentage = assemblyTotalMessages > 0 ? ((group.count / assemblyTotalMessages) * 100).toFixed(1) : '0.0';
        
        html += `
            <div class="top-group-card ${rankClass}">
                <div class="rank-badge">${rank}</div>
                <div class="group-info">
                    <h4 class="group-name">${group.name}</h4>
                    <div class="group-stats">
                        <span class="message-count">${group.count} messages</span>
                        <span class="percentage">${percentage}%</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Display distribution chart
function displayDistributionChart(assemblyTotalMessages) {
    const container = document.getElementById('distributionChart');
    if (!container) return;
    
    const groups = Object.values(assemblyData.groups);
    const top10Groups = groups.sort((a, b) => b.count - a.count).slice(0, 10);
    const otherGroups = groups.slice(10);
    
    let html = '<div class="distribution-summary">';
    
    // Top 10 groups
    top10Groups.forEach((group, index) => {
        const percentage = assemblyTotalMessages > 0 ? ((group.count / assemblyTotalMessages) * 100).toFixed(1) : '0.0';
        html += `
            <div class="distribution-item">
                <div class="distribution-rank">${index + 1}</div>
                <div class="distribution-group-name">${group.name}</div>
                <div class="distribution-bar-container">
                    <div class="distribution-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="distribution-stats">
                    <div class="distribution-count">${group.count}</div>
                    <div class="distribution-percentage">${percentage}%</div>
                </div>
            </div>
        `;
    });
    
    // Other groups combined
    if (otherGroups.length > 0) {
        const otherCount = otherGroups.reduce((sum, group) => sum + group.count, 0);
        const otherPercentage = assemblyTotalMessages > 0 ? ((otherCount / assemblyTotalMessages) * 100).toFixed(1) : '0.0';
        html += `
            <div class="distribution-item other">
                <div class="distribution-rank">...</div>
                <div class="distribution-group-name">Other ${otherGroups.length} groups</div>
                <div class="distribution-bar-container">
                    <div class="distribution-bar" style="width: ${otherPercentage}%"></div>
                </div>
                <div class="distribution-stats">
                    <div class="distribution-count">${otherCount}</div>
                    <div class="distribution-percentage">${otherPercentage}%</div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Display groups table
function displayGroupsTable(sortOrder = 'desc') {
    const container = document.getElementById('groupsTable');
    if (!container) return;
    
    const groups = Object.values(assemblyData.groups);
    const assemblyTotalMessages = calculateAssemblyTotalMessages();
    
    // Sort groups based on the provided sort order
    let sortedGroups;
    switch (sortOrder) {
        case 'asc':
            sortedGroups = groups.sort((a, b) => a.count - b.count); // Lowest to Highest
            break;
        case 'name':
            sortedGroups = groups.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical
            break;
        default: // desc
            sortedGroups = groups.sort((a, b) => b.count - a.count); // Highest to Lowest
    }
    
    let html = '<table class="groups-table-content">';
    html += `
        <thead>
            <tr>
                <th>Rank</th>
                <th>Group Name</th>
                <th>Messages</th>
                <th>Percentage</th>
                <th>Trend</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    sortedGroups.forEach((group, index) => {
        const rank = index + 1;
        const percentage = assemblyTotalMessages > 0 ? ((group.count / assemblyTotalMessages) * 100).toFixed(1) : '0.0';
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        
        html += `
            <tr class="${rankClass}">
                <td class="rank-cell">${rank}</td>
                <td class="group-name-cell">${group.name}</td>
                <td class="message-count-cell">${group.count}</td>
                <td class="percentage-cell">${percentage}%</td>
                <td class="trend-cell">
                    <div class="trend-bar">
                        <div class="trend-fill" style="width: ${percentage}%"></div>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Display sentiment statistics
function displaySentimentStats() {
    const container = document.getElementById('sentimentStats');
    if (!container) return;
    
    if (!assemblyData || !assemblyData.sentiment_counts) {
        container.innerHTML = `
            <div class="sentiment-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>Sentiment analysis data not available for this assembly</p>
                <small>Sentiment data is collected when analyzing JSON files</small>
            </div>
        `;
        return;
    }
    
    const sentimentData = assemblyData.sentiment_counts;
    const totalMessages = sentimentData.Positive + sentimentData.Negative + sentimentData.Neutral;
    
    if (totalMessages === 0) {
        container.innerHTML = `
            <div class="sentiment-placeholder">
                <i class="fas fa-info-circle"></i>
                <p>No sentiment data available</p>
                <small>No messages with sentiment analysis found</small>
            </div>
        `;
        return;
    }
    
    let html = '<div class="sentiment-breakdown-section">';
    html += '<div class="sentiment-summary">';
    html += '<div class="sentiment-totals">';
    
    // Positive
    const positivePercentage = ((sentimentData.Positive / totalMessages) * 100).toFixed(1);
    html += `
        <div class="sentiment-total positive">
            <div class="total-number">${sentimentData.Positive}</div>
            <div class="total-label">Positive</div>
            <div class="total-percentage">${positivePercentage}%</div>
        </div>
    `;
    
    // Negative
    const negativePercentage = ((sentimentData.Negative / totalMessages) * 100).toFixed(1);
    html += `
        <div class="sentiment-total negative">
            <div class="total-number">${sentimentData.Negative}</div>
            <div class="total-label">Negative</div>
            <div class="total-percentage">${negativePercentage}%</div>
        </div>
    `;
    
    // Neutral
    const neutralPercentage = ((sentimentData.Neutral / totalMessages) * 100).toFixed(1);
    html += `
        <div class="sentiment-total neutral">
            <div class="total-number">${sentimentData.Neutral}</div>
            <div class="total-label">Neutral</div>
            <div class="total-percentage">${neutralPercentage}%</div>
        </div>
    `;
    
    html += '</div>';
    html += '</div>';
    
    // Sentiment bars
    html += '<div class="sentiment-items">';
    
    // Positive bar
    html += `
        <div class="sentiment-item">
            <div class="sentiment-info">
                <div class="sentiment-label">
                    <span class="sentiment-color positive"></span>
                    Positive
                </div>
                <div class="sentiment-count">${sentimentData.Positive} messages</div>
            </div>
            <div class="sentiment-bar">
                <div class="sentiment-fill positive" style="width: ${positivePercentage}%"></div>
            </div>
            <div class="sentiment-percentage">${positivePercentage}%</div>
        </div>
    `;
    
    // Negative bar
    html += `
        <div class="sentiment-item">
            <div class="sentiment-info">
                <div class="sentiment-label">
                    <span class="sentiment-color negative"></span>
                    Negative
                </div>
                <div class="sentiment-count">${sentimentData.Negative} messages</div>
            </div>
            <div class="sentiment-bar">
                <div class="sentiment-fill negative" style="width: ${negativePercentage}%"></div>
            </div>
            <div class="sentiment-percentage">${negativePercentage}%</div>
        </div>
    `;
    
    // Neutral bar
    html += `
        <div class="sentiment-item">
            <div class="sentiment-info">
                <div class="sentiment-label">
                    <span class="sentiment-color neutral"></span>
                    Neutral
                </div>
                <div class="sentiment-count">${sentimentData.Neutral} messages</div>
            </div>
            <div class="sentiment-bar">
                <div class="sentiment-fill neutral" style="width: ${neutralPercentage}%"></div>
            </div>
            <div class="sentiment-percentage">${neutralPercentage}%</div>
        </div>
    `;
    
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
}

// Filter groups based on search
function filterGroups() {
    const searchTerm = document.getElementById('groupSearch')?.value.toLowerCase() || '';
    const tableRows = document.querySelectorAll('.groups-table-content tbody tr');
    
    tableRows.forEach(row => {
        const groupName = row.querySelector('.group-name-cell')?.textContent.toLowerCase() || '';
        if (groupName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Sort groups based on selection
function sortGroups() {
    const sortOrder = document.getElementById('sortOrder')?.value || 'desc';
    console.log('Sorting groups by:', sortOrder);
    
    // Pass the sort order to displayGroupsTable
    displayGroupsTable(sortOrder);
    
    // Update the sort select to show current selection
    const sortSelect = document.getElementById('sortOrder');
    if (sortSelect) {
        sortSelect.value = sortOrder;
    }
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div class="error-container">
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Error</h2>
                    <p>${message}</p>
                    <a href="/user/whatsapp-analysis" class="btn btn-primary">
                        <i class="fas fa-arrow-left"></i> Go Back to Analysis
                    </a>
                </div>
            </div>
        `;
    }
}
