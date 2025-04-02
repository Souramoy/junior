const GEMINI_API_KEY = ''; // Your API key
const GEMINI_API_URL = 'generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGeminiAPI(prompt, languagePreference = '') {
    // Mock response for testing (remove in production)
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY') {
        console.warn("Using mock response - add real API key for production");
        return getMockResponse(languagePreference);
    }

    try {
        // Enhanced prompt with language support
        const enhancedPrompt = `Suggest one perfect song based on this context. Follow EXACT format:
"SONG|||Title: [song name] by [artist]
YOUTUBE|||[artist name] [song name] official video
LANGUAGE|||[language]"

Rules:
1. ${languagePreference ? `Prefer ${languagePreference} language songs. ` : ''}
2. Include songs from English, Hindi, and Bengali languages
3. Always include "official video" in YOUTUBE query
4. Use well-known songs that definitely exist on YouTube
5. For regional songs, include the language name
6. Format exactly as shown above

Context: ${prompt}`;
        
        const response = await fetch(`https://${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: enhancedPrompt }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topP: 0.95,
                    topK: 50,
                    maxOutputTokens: 500
                },
                safetySettings: [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_ONLY_HIGH"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_ONLY_HIGH"
                    }
                ]
            })
        });

        // First check if we got any response at all
        if (!response) {
            throw new Error('No response received from API');
        }

        // Check for network errors
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.text(); // Try to get error text first
                errorData = JSON.parse(errorData); // Then try to parse as JSON
            } catch (e) {
                console.error("Raw error response:", errorData);
                throw new Error(`API request failed with status ${response.status}`);
            }
            console.error("API Error Details:", errorData);
            throw new Error(`API error: ${response.status} - ${errorData.error?.message || errorData}`);
        }

        // Parse the successful response
        let data;
        try {
            const responseText = await response.text();
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response:", e);
            throw new Error("Invalid JSON response from API");
        }
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error("Malformed API response:", data);
            throw new Error("Invalid response structure from API");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
// Enhanced mock responses with multi-language support
function getMockResponse(languagePreference = '') {
    const mockResponses = {
        english: [
            `SONG|||Title: Bohemian Rhapsody by Queen
YOUTUBE|||queen bohemian rhapsody official video
LANGUAGE|||english`,

            `SONG|||Title: Shape of You by Ed Sheeran
YOUTUBE|||ed sheeran shape of you official video
LANGUAGE|||english`
        ],
        hindi: [
            `SONG|||Title: Tum Hi Ho by Arijit Singh
YOUTUBE|||arijit singh tum hi ho official video
LANGUAGE|||hindi`,

            `SONG|||Title: Chaiyya Chaiyya by Sukhwinder Singh
YOUTUBE|||sukhwinder singh chaiyya chaiyya official video
LANGUAGE|||hindi`
        ],
        bengali: [
            `SONG|||Title: Bhalobashi Bhalobashi by Anupam Roy
YOUTUBE|||anupam roy bhalobashi bhalobashi official video
LANGUAGE|||bengali`,

            `SONG|||Title: Dure Dure by Krosswindz
YOUTUBE|||krosswindz dure dure official video
LANGUAGE|||bengali`
        ],
        mixed: [
            `SONG|||Title: Perfect by Ed Sheeran
YOUTUBE|||ed sheeran perfect official video
LANGUAGE|||english`,

            `SONG|||Title: Ghar More Pardesiya by Arijit Singh
YOUTUBE|||arijit singh ghar more pardesiya official video
LANGUAGE|||hindi`,

            `SONG|||Title: Phagun Haway Haway by James
YOUTUBE|||james phagun haway haway official video
LANGUAGE|||bengali`
        ]
    };

    // Select response based on language preference
    let selectedResponses = mockResponses.mixed;
    if (languagePreference.toLowerCase().includes('hindi')) {
        selectedResponses = mockResponses.hindi;
    } else if (languagePreference.toLowerCase().includes('bengali')) {
        selectedResponses = mockResponses.bengali;
    } else if (languagePreference.toLowerCase().includes('english')) {
        selectedResponses = mockResponses.english;
    }

    return selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
}
