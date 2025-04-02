document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const moodSelect = document.getElementById('mood-select');
    const moodSongBtn = document.getElementById('mood-song-btn');
    const recommendationOutput = document.getElementById('recommendation-output');
    const langTabs = document.querySelectorAll('.lang-tab');

    // Language filter
    let currentLanguage = 'all';
    
    // Set up language tabs
    langTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            langTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentLanguage = this.dataset.lang;
            filterRecommendations();
        });
    });

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
    moodSongBtn.addEventListener('click', getMoodSong);

    // Store recommendations
    let recommendations = [];

    // Functions
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addUserMessage(message);
        userInput.value = '';

        getSongRecommendation(
            `Suggest one song based on this conversation. Follow EXACT format:
            "SONG|||Title: [song name] by [artist]
            YOUTUBE|||[youtube search query]
            LANGUAGE|||[language]"
            
            Conversation: ${getConversationHistory()}`
        );
    }

    function getMoodSong() {
        const mood = moodSelect.value;
        if (!mood) {
            alert('Please select a mood first');
            return;
        }

        addUserMessage(`I'm feeling ${mood} - suggest a song.`);
        getSongRecommendation(
            `Suggest one song for someone feeling ${mood}. Follow EXACT format:
            "SONG|||Title: [song name] by [artist]
            YOUTUBE|||[youtube search query]
            LANGUAGE|||[language]"`
        );
    }

    async function getSongRecommendation(prompt) {
        try {
            // Show loading message
            const loadingMsg = addAIMessage("🎵 Searching for the perfect song...");
            
            // Get response from Gemini
            const response = await callGeminiAPI(prompt);
            
            // Remove loading message
            chatMessages.removeChild(loadingMsg);
            
            // Process the response
            processSongRecommendation(response);
        } catch (error) {
            console.error('Error:', error);
            addAIMessage("🎶 My music suggestion engine is having trouble. Could you try again or tell me more?");
        }
    }

    function processSongRecommendation(response) {
        console.log("API Response:", response);
        
        // Parse the response
        const pattern = /SONG\|\|\|Title: (.+?)\nYOUTUBE\|\|\|(.+)\nLANGUAGE\|\|\|(.+)/s;
        const match = response.match(pattern);

        if (match && match[1] && match[2] && match[3]) {
            const songInfo = match[1].trim();
            const youtubeQuery = match[2].trim();
            const language = match[3].trim().toLowerCase();
            
            // Create recommendation object
            const recommendation = {
                songInfo,
                youtubeQuery,
                language,
                element: createRecommendationElement(songInfo, youtubeQuery, language)
            };
            
            // Add to recommendations array
            recommendations.push(recommendation);
            
            // Display recommendation
            addAIMessage(`I recommend: ${songInfo} (${language})`);
            
            // Update recommendations display
            filterRecommendations();
        } else {
            // Fallback if parsing fails
            console.warn("Failed to parse:", response);
            addAIMessage("I found a song but had trouble processing it. Here's what I found:");
            recommendationOutput.innerHTML = `
                <div class="raw-response">
                    <p>${response.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }
    }

    function createRecommendationElement(songInfo, youtubeQuery, language) {
        const element = document.createElement('div');
        element.className = `song-recommendation ${language}`;
        element.innerHTML = `
            <h4>${songInfo}</h4>
            <p><strong>Language:</strong> ${language}</p>
            <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}" 
               target="_blank" class="youtube-link">
               <i class="fab fa-youtube"></i> Search on YouTube
            </a>
        `;
        return element;
    }

    function filterRecommendations() {
        // Clear current recommendations
        recommendationOutput.innerHTML = '';
        
        // Filter recommendations by language
        const filtered = currentLanguage === 'all' 
            ? recommendations 
            : recommendations.filter(r => r.language === currentLanguage);
        
        // Display filtered recommendations
        if (filtered.length === 0) {
            recommendationOutput.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>No ${currentLanguage === 'all' ? '' : currentLanguage + ' '}recommendations yet.</p>
                </div>
            `;
        } else {
            filtered.forEach(rec => {
                recommendationOutput.appendChild(rec.element);
            });
        }
    }

    // Helper functions
    function addUserMessage(text) {
        addMessage(text, 'user-message');
    }

    function addAIMessage(text) {
        return addMessage(text, 'ai-message');
    }

    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageDiv;
    }

    function getConversationHistory() {
        return Array.from(chatMessages.querySelectorAll('.message'))
            .map(msg => `${msg.classList.contains('user-message') ? 'User' : 'AI'}: ${msg.textContent}`)
            .join('\n');
    }
});

// Create twinkling stars
document.addEventListener('DOMContentLoaded', function() {
    const starsContainer = document.getElementById('stars');
    const starCount = 200;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random properties
        const size = Math.random() * 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 2 + Math.random() * 5;
        
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            --duration: ${duration}s;
            opacity: ${Math.random()};
        `;
        
        starsContainer.appendChild(star);
    }
});