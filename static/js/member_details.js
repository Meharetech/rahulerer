// Member Details JavaScript
let memberPhone = '';
let currentAssemblies = [];
let currentStartDate = '';
let currentEndDate = '';
let allMessages = {}; // Store all messages for search functionality
let availableLabels = new Set(); // Store unique labels

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Member Details page loaded');
    
    // Get phone number from URL
    const urlParts = window.location.pathname.split('/');
    memberPhone = urlParts[urlParts.length - 1];
    
    if (!memberPhone) {
        showError('No phone number provided');
        return;
    }
    
    // Get analysis criteria from session storage
    loadAnalysisCriteria();
    
    // Load member details
    loadMemberDetails();
});

// Load analysis criteria from session storage
function loadAnalysisCriteria() {
    try {
        const criteria = sessionStorage.getItem('commonMembersAnalysisCriteria');
        if (criteria) {
            const parsed = JSON.parse(criteria);
            currentAssemblies = parsed.assemblies || [];
            currentStartDate = parsed.startDate || '';
            currentEndDate = parsed.endDate || '';
            
            console.log('Loaded analysis criteria:', {
                assemblies: currentAssemblies,
                startDate: currentStartDate,
                endDate: currentEndDate
            });
        }
    } catch (error) {
        console.error('Error loading analysis criteria:', error);
    }
}

// Load member details from API
async function loadMemberDetails() {
    try {
        if (currentAssemblies.length === 0) {
            showNoDataState('No assemblies selected. Please go back and select assemblies for analysis.');
            return;
        }
        
        if (!currentStartDate) {
            showNoDataState('No start date selected. Please go back and select a start date for analysis.');
            return;
        }
        
        // Show loading state
        showLoadingState();
        
        // Prepare request data
        const requestData = {
            assemblies: currentAssemblies,
            startDate: currentStartDate,
            endDate: currentEndDate
        };
        
        console.log('Sending member details request:', requestData);
        
        // Make API call
        const response = await fetch(`/api/member-details/${memberPhone}`, {
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
            console.log('Member details results:', data.results);
            displayMemberDetails(data.results);
        } else {
            throw new Error(data.message || 'Failed to get member details');
        }
        
    } catch (error) {
        hideLoadingState();
        console.error('Error loading member details:', error);
        showError('Error loading member details: ' + error.message);
    }
}

// Display member details
function displayMemberDetails(results) {
    try {
        // Hide loading state
        hideLoadingState();
        
        const memberInfo = results.member_info;
        const messagesBySentiment = results.messages_by_sentiment;
        
        if (!memberInfo || memberInfo.total_messages === 0) {
            showNoDataState('No messages found for this member in the selected criteria.');
            return;
        }
        
        // Display member header
        displayMemberHeader(memberInfo);
        
        // Display groups involved
        displayGroupsInvolved(memberInfo.groups_involved);
        
        // Show sentiment filter section
        showSentimentFilter();
        
        // Display messages by sentiment
        displayMessagesBySentiment(messagesBySentiment);
        
    } catch (error) {
        console.error('Error displaying member details:', error);
        showError('Error displaying member details');
    }
}

// Display member header information
function displayMemberHeader(memberInfo) {
    try {
        const memberHeader = document.getElementById('memberHeader');
        if (memberHeader) {
            memberHeader.style.display = 'block';
        }
        
        // Update member name
        const memberNameElement = document.getElementById('memberName');
        if (memberNameElement) {
            memberNameElement.textContent = memberInfo.name || 'Unknown';
        }
        
        // Update total messages
        const totalMessagesElement = document.getElementById('totalMessages');
        if (totalMessagesElement) {
            totalMessagesElement.textContent = memberInfo.total_messages || 0;
        }
        
        // Update groups involved
        const groupsInvolvedElement = document.getElementById('groupsInvolved');
        if (groupsInvolvedElement) {
            groupsInvolvedElement.textContent = memberInfo.groups_involved.length || 0;
        }
        
        // Update sentiment counts
        const positiveCountElement = document.getElementById('positiveCount');
        const negativeCountElement = document.getElementById('negativeCount');
        const neutralCountElement = document.getElementById('neutralCount');
        
        if (positiveCountElement) {
            positiveCountElement.textContent = memberInfo.sentiment_counts.Positive || 0;
        }
        
        if (negativeCountElement) {
            negativeCountElement.textContent = memberInfo.sentiment_counts.Negative || 0;
        }
        
        if (neutralCountElement) {
            neutralCountElement.textContent = memberInfo.sentiment_counts.Neutral || 0;
        }
        
    } catch (error) {
        console.error('Error displaying member header:', error);
    }
}

// Display groups involved
function displayGroupsInvolved(groups) {
    try {
        const groupsSection = document.getElementById('groupsSection');
        const groupsGrid = document.getElementById('groupsGrid');
        
        if (!groupsSection || !groupsGrid) return;
        
        if (!groups || groups.length === 0) {
            groupsSection.style.display = 'none';
            return;
        }
        
        groupsSection.style.display = 'block';
        
        let html = '';
        groups.forEach(group => {
            const parts = group.split('/');
            if (parts.length >= 3) {
                const assembly = parts[0];
                const date = parts[1];
                const groupName = parts[2];
                
                html += `
                    <div class="group-card">
                        <div class="group-name">${groupName}</div>
                        <div class="group-details">
                            <span><i class="fas fa-building"></i> Assembly: ${assembly}</span>
                            <span><i class="fas fa-calendar"></i> Date: ${date}</span>
                        </div>
                    </div>
                `;
            }
        });
        
        groupsGrid.innerHTML = html;
        
    } catch (error) {
        console.error('Error displaying groups involved:', error);
    }
}

// Display messages by sentiment
function displayMessagesBySentiment(messagesBySentiment) {
    try {
        const messagesSection = document.getElementById('messagesSection');
        if (!messagesSection) return;
        
        messagesSection.style.display = 'block';
        
        // Store all messages for search functionality
        allMessages = {
            positive: messagesBySentiment.Positive || [],
            negative: messagesBySentiment.Negative || [],
            neutral: messagesBySentiment.Neutral || []
        };
        
        // Collect all unique labels
        availableLabels.clear();
        Object.values(allMessages).forEach(messages => {
            messages.forEach(message => {
                if (message.label) {
                    availableLabels.add(message.label);
                }
            });
        });
        
        // Populate label filter dropdown
        populateLabelFilter();
        
        // Display positive messages
        displaySentimentMessages('positive', messagesBySentiment.Positive || []);
        
        // Display negative messages
        displaySentimentMessages('negative', messagesBySentiment.Negative || []);
        
        // Display neutral messages
        displaySentimentMessages('neutral', messagesBySentiment.Neutral || []);
        
    } catch (error) {
        console.error('Error displaying messages by sentiment:', error);
    }
}

// Display messages for a specific sentiment
function displaySentimentMessages(sentiment, messages) {
    try {
        const messageCountElement = document.getElementById(`${sentiment}MessageCount`);
        const messagesContainer = document.getElementById(`${sentiment}MessagesContainer`);
        
        if (!messageCountElement || !messagesContainer) return;
        
        // Update message count
        messageCountElement.textContent = messages.length;
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p class="no-data">No messages found.</p>';
            return;
        }
        
        // Display messages
        let html = '';
        messages.forEach(message => {
            const timestamp = formatTimestamp(message.timestamp);
            
            html += `
                <div class="message-card">
                    <div class="message-content">${message.content || 'No content'}</div>
                    <div class="message-meta">
                        <div class="meta-item">
                            <i class="fas fa-layer-group"></i>
                            <span class="label">Group:</span>
                            <span class="value">${message.group_name}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-building"></i>
                            <span class="label">Assembly:</span>
                            <span class="value">${message.assembly}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span class="label">Date:</span>
                            <span class="value">${message.date}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span class="label">Time:</span>
                            <span class="value">${timestamp}</span>
                        </div>
                        
                        <div class="meta-item">
                            <i class="fas fa-tags"></i>
                            <span class="label">Label:</span>
                            <span class="value">${message.label}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        messagesContainer.innerHTML = html;
        
    } catch (error) {
        console.error(`Error displaying ${sentiment} messages:`, error);
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
            minute: '2-digit',
            second: '2-digit'
        });
        
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return timestamp || 'Unknown';
    }
}



// Show loading state
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const memberHeader = document.getElementById('memberHeader');
    const groupsSection = document.getElementById('groupsSection');
    const messagesSection = document.getElementById('messagesSection');
    const noDataState = document.getElementById('noDataState');
    const labelStatsSection = document.getElementById('labelStatsSection');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (memberHeader) memberHeader.style.display = 'none';
    if (groupsSection) groupsSection.style.display = 'none';
    if (messagesSection) messagesSection.style.display = 'none';
    if (noDataState) noDataState.style.display = 'none';
    if (labelStatsSection) labelStatsSection.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'none';
}

// Show search and filter section
function showSentimentFilter() {
    const searchFilterSection = document.getElementById('searchFilterSection');
    if (searchFilterSection) {
        searchFilterSection.style.display = 'block';
    }
    
    // Also show label statistics section if it exists
    const labelStatsSection = document.getElementById('labelStatsSection');
    if (labelStatsSection) {
        labelStatsSection.style.display = 'block';
    }
}

// Populate label filter dropdown
function populateLabelFilter() {
    try {
        const labelFilter = document.getElementById('labelFilter');
        if (!labelFilter) return;
        
        // Clear existing options except "All Labels"
        labelFilter.innerHTML = '<option value="all">All Labels</option>';
        
        // Add unique labels
        const sortedLabels = Array.from(availableLabels).sort();
        sortedLabels.forEach(label => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            labelFilter.appendChild(option);
        });
        
        console.log('Label filter populated with:', sortedLabels);
        
        // Also populate label statistics overview
        populateLabelStatistics();
        
    } catch (error) {
        console.error('Error populating label filter:', error);
    }
}

// Populate label statistics overview
function populateLabelStatistics() {
    try {
        // Populate the new top section
        const labelStatsGrid = document.getElementById('labelStatsGrid');
        const labelStatsSection = document.getElementById('labelStatsSection');
        
        if (!labelStatsGrid || !labelStatsSection) return;
        
        // Show the section
        labelStatsSection.style.display = 'block';
        
        // Clear existing content
        labelStatsGrid.innerHTML = '';
        
        // Calculate label counts and total messages
        const labelCounts = {};
        let totalMessages = 0;
        
        Object.values(allMessages).forEach(messages => {
            messages.forEach(message => {
                if (message.label) {
                    labelCounts[message.label] = (labelCounts[message.label] || 0) + 1;
                    totalMessages++;
                }
            });
        });
        
        // Sort labels by count (descending)
        const sortedLabels = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]);
        
        // Create label stat cards
        sortedLabels.forEach(([label, count]) => {
            const percentage = totalMessages > 0 ? Math.round((count / totalMessages) * 100) : 0;
            
            const labelStatCard = document.createElement('div');
            labelStatCard.className = 'label-stat-card';
            labelStatCard.innerHTML = `
                <div class="label-name">${label}</div>
                <div class="label-count">${count}</div>
                <div class="label-percentage">${percentage}%</div>
            `;
            
            // Add click functionality to filter by this label
            labelStatCard.addEventListener('click', () => {
                const labelFilter = document.getElementById('labelFilter');
                if (labelFilter) {
                    labelFilter.value = label;
                    filterByLabel();
                }
            });
            
            labelStatsGrid.appendChild(labelStatCard);
        });
        
        console.log('Label statistics populated:', labelCounts);
        
    } catch (error) {
        console.error('Error populating label statistics:', error);
    }
}

// Search messages across all content
function searchMessages() {
    try {
        const searchTerm = document.getElementById('messageSearch').value.toLowerCase().trim();
        const selectedLabel = document.getElementById('labelFilter').value;
        
        console.log('Searching for:', searchTerm, 'with label:', selectedLabel);
        
        // Apply search and label filter
        applyFilters(searchTerm, selectedLabel);
        
    } catch (error) {
        console.error('Error searching messages:', error);
    }
}

// Filter by label
function filterByLabel() {
    try {
        const searchTerm = document.getElementById('messageSearch').value.toLowerCase().trim();
        const selectedLabel = document.getElementById('labelFilter').value;
        
        console.log('Filtering by label:', selectedLabel, 'with search:', searchTerm);
        
        // Apply search and label filter
        applyFilters(searchTerm, selectedLabel);
        
    } catch (error) {
        console.error('Error filtering by label:', error);
    }
}

// Apply both search and label filters
function applyFilters(searchTerm, selectedLabel) {
    try {
        const sentimentSections = ['positive', 'negative', 'neutral'];
        
        sentimentSections.forEach(sentiment => {
            const messagesContainer = document.getElementById(`${sentiment}MessagesContainer`);
            if (!messagesContainer) return;
            
            const messages = allMessages[sentiment] || [];
            let filteredMessages = messages;
            
            // Apply label filter
            if (selectedLabel !== 'all') {
                filteredMessages = filteredMessages.filter(message => 
                    message.label === selectedLabel
                );
            }
            
            // Apply search filter
            if (searchTerm) {
                filteredMessages = filteredMessages.filter(message => 
                    message.content && message.content.toLowerCase().includes(searchTerm)
                );
            }
            
            // Display filtered messages
            displayFilteredMessages(sentiment, filteredMessages);
            
            // Update message count
            const messageCountElement = document.getElementById(`${sentiment}MessageCount`);
            if (messageCountElement) {
                messageCountElement.textContent = filteredMessages.length;
            }
        });
        
        console.log('Filters applied - Search:', searchTerm, 'Label:', selectedLabel);
        
    } catch (error) {
        console.error('Error applying filters:', error);
    }
}

// Display filtered messages for a specific sentiment
function displayFilteredMessages(sentiment, messages) {
    try {
        const messagesContainer = document.getElementById(`${sentiment}MessagesContainer`);
        if (!messagesContainer) return;
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p class="no-data">No messages match the current filters.</p>';
            return;
        }
        
        // Display messages using existing function
        displaySentimentMessages(sentiment, messages);
        
    } catch (error) {
        console.error(`Error displaying filtered ${sentiment} messages:`, error);
    }
}

// Filter messages by sentiment
function filterMessages(sentiment) {
    try {
        console.log(`Filtering messages to show: ${sentiment}`);
        
        // Update active button
        const allButtons = document.querySelectorAll('.sentiment-filter-btn');
        allButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = document.querySelector(`[data-sentiment="${sentiment}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Get all message sections
        const positiveSection = document.getElementById('positiveMessages');
        const negativeSection = document.getElementById('negativeMessages');
        const neutralSection = document.getElementById('neutralMessages');
        
        // Hide all sections first
        if (positiveSection) positiveSection.style.display = 'none';
        if (negativeSection) negativeSection.style.display = 'none';
        if (neutralSection) neutralSection.style.display = 'none';
        
        // Show only the selected sentiment or all
        if (sentiment === 'all') {
            // Show all sections
            if (positiveSection) positiveSection.style.display = 'block';
            if (negativeSection) negativeSection.style.display = 'block';
            if (neutralSection) neutralSection.style.display = 'block';
        } else if (sentiment === 'positive') {
            if (positiveSection) positiveSection.style.display = 'block';
        } else if (sentiment === 'negative') {
            if (negativeSection) negativeSection.style.display = 'block';
        } else if (sentiment === 'neutral') {
            if (neutralSection) neutralSection.style.display = 'block';
        }
        
        // Re-apply search and label filters after sentiment change
        const searchTerm = document.getElementById('messageSearch')?.value.toLowerCase().trim() || '';
        const selectedLabel = document.getElementById('labelFilter')?.value || 'all';
        if (searchTerm || selectedLabel !== 'all') {
            applyFilters(searchTerm, selectedLabel);
        }
        
        console.log(`Filter applied successfully: ${sentiment}`);
        
        // Debug: Log section visibility
        console.log('Section visibility after filter:', {
            positive: positiveSection ? positiveSection.style.display : 'not found',
            negative: negativeSection ? negativeSection.style.display : 'not found',
            neutral: neutralSection ? neutralSection.style.display : 'not found'
        });
        
    } catch (error) {
        console.error('Error filtering messages:', error);
    }
}

// Show no data state
function showNoDataState(message) {
    const noDataState = document.getElementById('noDataState');
    const noDataContent = document.getElementById('noDataState');
    const loadingState = document.getElementById('loadingState');
    const labelStatsSection = document.getElementById('labelStatsSection');
    
    if (loadingState) loadingState.style.display = 'none';
    if (labelStatsSection) labelStatsSection.style.display = 'none';
    
    if (noDataState) {
        noDataState.style.display = 'flex';
        
        // Update message if provided
        if (message && noDataContent) {
            const messageElement = noDataContent.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }
}

// Show error message
function showError(message) {
    // Simple error display - you can enhance this with a proper toast/alert system
    alert('Error: ' + message);
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
        
        // Reset sentiment filter to "All Messages"
        const allButton = document.querySelector('[data-sentiment="all"]');
        if (allButton) {
            allButton.click();
        }
        
        // Refresh all messages display
        Object.keys(allMessages).forEach(sentiment => {
            const messagesContainer = document.getElementById(`${sentiment}MessagesContainer`);
            if (messagesContainer) {
                displaySentimentMessages(sentiment, allMessages[sentiment] || []);
            }
        });
        
        // Refresh label statistics
        populateLabelStatistics();
        
        console.log('All filters cleared');
        
    } catch (error) {
        console.error('Error clearing filters:', error);
    }
}

// Go back to previous page
function goBack() {
    // Try to go back to common members analysis page
    if (document.referrer && document.referrer.includes('common-members-analysis')) {
        window.history.back();
    } else {
        // Fallback to common members analysis page
        window.location.href = '/user/common-members-analysis';
    }
}
