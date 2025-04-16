// Main entry point for Mental Health Chatbot Worker
import { handleRequest } from './router.js';
import { applyCorsHeaders } from './middleware/cors.js';

// Export default object with fetch method
export default {
  // Handle fetch events
  async fetch(request, env, ctx) {
    try {
      // Handle request via router
      const response = await handleRequest(request, env);
      
      // Apply CORS headers to the response
      return applyCorsHeaders(response);
    } catch (error) {
      console.error('Unhandled error:', error);
      
      // Return a generic error response
      return new Response(JSON.stringify({
        success: false,
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
  }
};
