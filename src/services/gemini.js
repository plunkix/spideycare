// Gemini API service for Mental Health Chatbot

// System prompt that defines the mental health supportive persona
const SYSTEM_PROMPT = `
You are a supportive, empathetic mental health chatbot. Your goal is to provide a safe space for users to express themselves and receive emotional support. You are not a therapist or medical professional, and you should make this clear when appropriate.

## Communication Style:
- Be warm, empathetic and non-judgmental at all times
- Use a conversational, natural tone 
- Practice active listening by reflecting back what you hear and asking clarifying questions
- Be patient and give users space to express themselves
- Match your emotional tone to the user's needs (supportive, gentle, encouraging)

## Guidelines:
- Focus on emotional support rather than giving medical advice
- When users express serious mental health concerns, gently suggest they speak to a qualified professional
- Avoid dismissive or minimizing language ("just cheer up", "it could be worse")
- Suggest simple mindfulness, grounding, or relaxation techniques when appropriate
- Maintain appropriate boundaries - you're a supportive companion, not a doctor or therapist
- If someone appears to be in immediate danger, provide crisis resources

## Crisis Handling:
If a user expresses thoughts of suicide or severe distress:
1. Take it seriously and respond with care
2. Suggest immediate contact with crisis services
3. Provide the relevant crisis hotline information:
   - National Suicide Prevention Lifeline: 988 or 1-800-273-8255
   - Crisis Text Line: Text HOME to 741741

Remember that your primary role is to listen, provide support, and direct to appropriate professional resources when needed.
`;

// Call Gemini API
export async function callGeminiAPI(userMessage, env) {
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  const API_KEY = env.GEMINI_API_KEY; // Should be set as a Cloudflare Workers secret
  
  // If API is disabled for testing, return a mock response
  if (env.AI_ENABLED !== "true" || !API_KEY) {
    return getRandomMockResponse(userMessage);
  }
  
  try {
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userMessage }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          { text: SYSTEM_PROMPT }
        ]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
        topP: 0.95,
        topK: 40
      }
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      console.error('Gemini API error status:', response.status);
      const errorData = await response.json();
      console.error('Gemini API error details:', errorData);
      throw new Error(`Gemini API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the text from the response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected Gemini API response structure');
    }
  } catch (error) {
    console.error('Gemini API call error:', error);
    
    // Return a fallback response if the API call fails
    return "I'm having trouble connecting right now. Please try again in a moment, or if this continues, let someone know about the technical issue.";
  }
}

// Mock responses for testing without API
function getRandomMockResponse(userMessage) {
  // Add null check to prevent errors
  if (!userMessage) {
    userMessage = "";
  }
  
  const mockResponses = [
    "I understand how challenging that can feel. Would you like to tell me more about what's been happening?",
    
    "Thank you for sharing that with me. It takes courage to express these feelings. How long have you been experiencing this?",
    
    "I hear you're going through a difficult time. Remember that it's okay to take things one step at a time. What's one small thing that might help you feel a bit better today?",
    
    "That sounds really tough. You're not alone in feeling this way, though I know it can seem isolating. What kinds of things have helped you cope in the past?",
    
    "I appreciate you opening up about this. Many people experience similar feelings. Would talking to a trusted friend or family member about this be an option for you?",
    
    "It makes sense that you'd feel that way given what you've described. I'm wondering if you've tried any relaxation techniques that might help in the moment?",
    
    "I'm here to listen whenever you need. Sometimes just expressing these thoughts can help provide some relief. Is there anything specific you'd like to explore more about what you're feeling?",
    
    "That's a lot to carry on your own. Remember that seeking help is a sign of strength, not weakness. Have you considered speaking with a mental health professional about these concerns?",
  ];
  
  // For more realistic responses, we'll acknowledge their message before giving a mock response
  const acknowledgments = [
    `About "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}" - `,
    `I see what you mean about ${userMessage.split(' ').slice(0, 3).join(' ')}... `,
    `Regarding what you shared - `,
    `Thank you for telling me that. `,
    `I appreciate you sharing that. `,
    ``  // Empty acknowledgment (sometimes just respond directly)
  ];
  
  const randomAcknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  return randomAcknowledgment + randomResponse;
}
