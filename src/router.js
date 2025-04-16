// Router for Mental Health Chatbot

import { errorResponse, corsPreflightResponse } from './utils/responses.js';
import { handleGreeting, handleChat } from './handlers/chat.js';
import { handleServeStatic } from './handlers/static.js';

// Define routes and their handlers
const routes = [
  // Chat routes
  {
    path: '/api/greeting',
    methods: {
      GET: handleGreeting
    }
  },
  {
    path: '/api/chat',
    methods: {
      POST: handleChat
    }
  },
  
  // Catch all for static files
  {
    pattern: /^\/(.*)$/,
    methods: {
      GET: (request, env, params) => handleServeStatic(request, env, params[1])
    }
  }
];

// Main router function
export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return corsPreflightResponse();
  }
  
  // Find a matching route
  let matchedRoute = null;
  let matchParams = [];
  
  // First check for exact path matches
  for (const route of routes) {
    if (route.path && route.path === path) {
      matchedRoute = route;
      break;
    }
  }
  
  // Then check for pattern matches if no exact match was found
  if (!matchedRoute) {
    for (const route of routes) {
      if (route.pattern) {
        const match = path.match(route.pattern);
        if (match) {
          matchedRoute = route;
          matchParams = match.slice(1);
          break;
        }
      }
    }
  }
  
  // Return 404 if no route is found
  if (!matchedRoute) {
    return errorResponse('Not found', 404);
  }
  
  // Check if method is allowed for this route
  if (!matchedRoute.methods[method]) {
    return errorResponse('Method not allowed', 405);
  }
  
  try {
    // Call the handler with the matched params
    return await matchedRoute.methods[method](request, env, matchParams);
  } catch (error) {
    console.error('Route handler error:', error);
    return errorResponse('Internal server error', 500);
  }
}
