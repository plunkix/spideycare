// Chat handlers for Mental Health Chatbot

import { createResponse, errorResponse } from '../utils/responses.js';
import { callGeminiAPI } from '../services/gemini.js';

// UUID v4 implementation using the crypto API
function uuidv4() {
  return crypto.randomUUID();
}

// Greeting messages
const GREETING_MESSAGES = [
  "Hi there! I'm here to listen and support you. How are you feeling today?",
  "Welcome to our space for conversation. What's on your mind today?",
  "Hello! I'm your supportive chat companion. How can I help you today?",
  "I'm here for you whenever you need to talk. How are you doing right now?"
];

// Get a random greeting message
export async function handleGreeting(request, env) {
  try {
    const message = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
    
    return createResponse({ message });
  } catch (error) {
    console.error('Greeting error:', error);
    return errorResponse('An error occurred while getting greeting', 500);
  }
}

// Handle a chat message
export async function handleChat(request, env) {
  try {
    // Parse the request body
    const body = await request.json();
    const userMessage = body.message || '';
    const conversationId = body.conversation_id || uuidv4();
    
    // If no message, return an error
    if (!userMessage.trim()) {
      return errorResponse('Message cannot be empty', 400);
    }
    
    // Call the AI service
    const response = await callGeminiAPI(userMessage, env);
    
    // Return the response
    return createResponse({
      message: response,
      conversation_id: conversationId
    });
  } catch (error) {
    console.error('Chat error:', error);
    return errorResponse('An error occurred while processing your message', 500);
  }
}
