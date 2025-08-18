// Group Details JavaScript
let groupName = '';
let groupAssembly = '';
let groupDate = '';
let allMessages = {}; // Store all messages for search functionality
let availableLabels = new Set(); // Store unique labels
let uniqueSenders = []; // Store unique senders data

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Group Details page loaded');
    
    // Get group details from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    groupName = urlParams.get('group') || '';
    groupAssembly = urlParams.get('assembly') || '';
    groupDate = urlParams.get('date') || '';
    
    if (!groupName || !groupAssembly || !groupDate) {
        showError('Missing group information');
        return;
    }
    
    console.log('Group Details:', { groupName, groupAssembly, groupDate });
    
    // Load group details
    loadGroupDetails();
});

// Load group details from API
async function loadGroupDetails() {
    try {
        // Show loading state
        showLoadingState();
        
        // Prepare request data
        const requestData = {
            groupName: groupName,
            assembly: groupAssembly,
            date: groupDate
        };
        
        console.log('Sending group details request:', requestData);
        
        // Make API call
        const response = await fetch('/api/group-details', {
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
            console.log('Group details results:', data.results);
            displayGroupDetails(data.results);
        } else {
            throw new Error(data.message || 'Failed to get group details');
        }
        
    } catch (error) {
        hideLoadingState();
        console.error('Error loading group details:', error);
        showError('Error loading group details: ' + error.message);
    }
}

// Display group details
function displayGroupDetails(results) {
    try {
        // Hide loading state
        hideLoadingState();
        
        const groupInfo = results.group_info;
        const topSender = results.top_sender;
        const uniqueSendersList = results.unique_senders;
        const messagesBySentiment = results.messages_by_sentiment;
        
        if (!groupInfo || groupInfo.total_messages === 0) {
            showNoDataState('No messages found for this group in the selected criteria.');
            return;
        }
        
        // Display group header
        displayGroupHeader(groupInfo);
        
        // Display top sender
        displayTopSender(topSender);
        
        // Display unique senders list
        displayUniqueSenders(uniqueSendersList);
        
        // Show search and filter section
        showSearchFilterSection();
        
        // Display messages by sentiment
        displayMessagesBySentiment(messagesBySentiment);
        
    } catch (error) {
        console.error('Error displaying group details:', error);
        showError('Error displaying group details');
    }
}

// Display group header information
function displayGroupHeader(groupInfo) {
    try {
        const groupHeader = document.getElementById('groupHeader');
        if (groupHeader) {
            groupHeader.style.display = 'block';
        }
        
        // Update group name
        const groupNameElement = document.getElementById('groupName');
        if (groupNameElement) {
            groupNameElement.textContent = groupName;
        }
        
        // Update assembly
        const groupAssemblyElement = document.getElementById('groupAssembly');
        if (groupAssemblyElement) {
            groupAssemblyElement.textContent = groupAssembly;
        }
        
        // Update date
        const groupDateElement = document.getElementById('groupDate');
        if (groupDateElement) {
            groupDateElement.textContent = groupDate;
        }
        
        // Update total messages
        const totalMessagesElement = document.getElementById('totalMessages');
        if (totalMessagesElement) {
            totalMessagesElement.textContent = groupInfo.total_messages || 0;
        }
        
        // Update unique senders
        const uniqueSendersElement = document.getElementById('uniqueSenders');
        if (uniqueSendersElement) {
            uniqueSendersElement.textContent = groupInfo.unique_senders || 0;
        }
        
        // Update sentiment counts
        const positiveCountElement = document.getElementById('positiveCount');
        const negativeCountElement = document.getElementById('negativeCount');
        const neutralCountElement = document.getElementById('neutralCount');
        
        if (positiveCountElement) {
            positiveCountElement.textContent = groupInfo.sentiment_counts.Positive || 0;
        }
        
        if (negativeCountElement) {
            negativeCountElement.textContent = groupInfo.sentiment_counts.Negative || 0;
        }
        
        if (neutralCountElement) {
            neutralCountElement.textContent = groupInfo.sentiment_counts.Neutral || 0;
        }
        
    } catch (error) {
        console.error('Error displaying group header:', error);
    }
}

// Display top sender information
function displayTopSender(topSender) {
    try {
        const topSenderSection = document.getElementById('topSenderSection');
        const topSenderCard = document.getElementById('topSenderCard');
        
        if (!topSenderSection || !topSenderCard) return;
        
        if (!topSender) {
            topSenderSection.style.display = 'none';
            return;
        }
        
        topSenderSection.style.display = 'block';
        
        const html = `
            <div class="top-sender-avatar">
                <i class="fas fa-crown"></i>
            </div>
            <div class="top-sender-name">${topSender.name || 'Unknown'}</div>
            <div class="top-sender-phone">${topSender.phone || 'N/A'}</div>
            <div class="top-sender-stats">
                <span class="stat-item">
                    <i class="fas fa-comments"></i>
                    <span>${topSender.message_count || 0} Messages</span>
                </span>
                <span class="stat-item">
                    <i class="fas fa-percentage"></i>
                    <span>${topSender.percentage || 0}% of Total</span>
                </span>
            </div>
        `;
        
        topSenderCard.innerHTML = html;
        
    } catch (error) {
        console.error('Error displaying top sender:', error);
    }
}

// Display unique senders list
function displayUniqueSenders(uniqueSendersList) {
    try {
        const uniqueSendersSection = document.getElementById('uniqueSendersSection');
        const sendersTableBody = document.getElementById('sendersTableBody');
        
        if (!uniqueSendersSection || !sendersTableBody) return;
        
        if (!uniqueSendersList || uniqueSendersList.length === 0) {
            uniqueSendersSection.style.display = 'none';
            return;
        }
        
        uniqueSendersSection.style.display = 'block';
        uniqueSenders = uniqueSendersList; // Store for later use
        
        // Show scroll hint if there are more than 12 senders
        const scrollHint = document.getElementById('scrollHint');
        if (scrollHint) {
            if (uniqueSendersList.length > 12) {
                scrollHint.style.display = 'flex';
            } else {
                scrollHint.style.display = 'none';
            }
        }
        
        let html = '';
        
        uniqueSendersList.forEach((sender, index) => {
            if (!sender) return;
            
            const rank = index + 1;
            const name = sender.name || 'Unknown';
            const phone = sender.phone || 'N/A';
            const messageCount = sender.message_count || 0;
            
            // Sentiment breakdown
            const sentimentBreakdown = sender.sentiment_breakdown || {};
            const positiveCount = sentimentBreakdown.Positive || 0;
            const negativeCount = sentimentBreakdown.Negative || 0;
            const neutralCount = sentimentBreakdown.Neutral || 0;
            
            // Rank badge class
            let rankClass = 'rank-other';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';
            
            html += `
                <tr>
                    <td>
                        <span class="rank-badge ${rankClass}">${rank}</span>
                    </td>
                    <td>
                        <strong>${name}</strong>
                    </td>
                    <td>
                        <code>${phone}</code>
                    </td>
                    <td>
                        <strong>${messageCount}</strong>
                    </td>
                    <td>
                        <div class="sentiment-breakdown">
                            <span class="sentiment positive">+${positiveCount}</span>
                            <span class="sentiment negative">-${negativeCount}</span>
                            <span class="sentiment neutral">~${neutralCount}</span>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewSenderMessages('${phone}', '${name}')">
                            <i class="fas fa-eye"></i> View Messages
                        </button>
                    </td>
                </tr>
            `;
        });
        
        sendersTableBody.innerHTML = html;
        
    } catch (error) {
        console.error('Error displaying unique senders:', error);
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
                            <i class="fas fa-user"></i>
                            <span class="label">Sender:</span>
                            <span class="value">${message.sender_name || 'Unknown'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span class="label">Time:</span>
                            <span class="value">${timestamp}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-tags"></i>
                            <span class="label">Label:</span>
                            <span class="value">${message.label || 'Unknown'}</span>
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

// Show search and filter section
function showSearchFilterSection() {
    const searchFilterSection = document.getElementById('searchFilterSection');
    if (searchFilterSection) {
        searchFilterSection.style.display = 'block';
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
        
    } catch (error) {
        console.error('Error populating label filter:', error);
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
        
    } catch (error) {
        console.error('Error filtering messages:', error);
    }
}

// View sender messages (placeholder for future functionality)
function viewSenderMessages(phone, name) {
    try {
        console.log('Viewing sender messages:', { phone, name });
        
        // For now, show an alert with basic info
        // In the future, this could open a modal or navigate to a sender details page
        alert(`Viewing messages from: ${name}\nPhone: ${phone}\n\nThis functionality will be implemented in the next update!`);
        
    } catch (error) {
        console.error('Error viewing sender messages:', error);
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
        
        console.log('All filters cleared');
        
    } catch (error) {
        console.error('Error clearing filters:', error);
    }
}

// Show loading state
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const groupHeader = document.getElementById('groupHeader');
    const topSenderSection = document.getElementById('topSenderSection');
    const uniqueSendersSection = document.getElementById('uniqueSendersSection');
    const messagesSection = document.getElementById('messagesSection');
    const noDataState = document.getElementById('noDataState');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (groupHeader) groupHeader.style.display = 'none';
    if (topSenderSection) topSenderSection.style.display = 'none';
    if (uniqueSendersSection) uniqueSendersSection.style.display = 'none';
    if (messagesSection) messagesSection.style.display = 'none';
    if (noDataState) noDataState.style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) loadingState.style.display = 'none';
}

// Show no data state
function showNoDataState(message) {
    const noDataState = document.getElementById('noDataState');
    const loadingState = document.getElementById('loadingState');
    
    if (loadingState) loadingState.style.display = 'none';
    
    if (noDataState) {
        noDataState.style.display = 'flex';
        
        // Update message if provided
        if (message) {
            const messageElement = noDataState.querySelector('p');
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

// Go back to previous page
function goBack() {
    // Try to go back to group sender analysis page
    if (document.referrer && document.referrer.includes('group-sender-analysis')) {
        window.history.back();
    } else {
        // Fallback to group sender analysis page
        window.location.href = '/user/group-sender-analysis';
    }
}
