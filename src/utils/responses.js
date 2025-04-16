// Response utilities

// Default headers for JSON responses
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Create a successful JSON response
export function createResponse(data, status = 200, headers = {}) {
  const responseBody = JSON.stringify({
    success: true,
    ...data
  });
  
  return new Response(responseBody, {
    status,
    headers: {
      ...defaultHeaders,
      ...headers
    }
  });
}

// Create an error JSON response
export function errorResponse(message, status = 400, errors = null, headers = {}) {
  const responseBody = JSON.stringify({
    success: false,
    message,
    ...(errors && { errors })
  });
  
  return new Response(responseBody, {
    status,
    headers: {
      ...defaultHeaders,
      ...headers
    }
  });
}

// Create a CORS preflight response
export function corsPreflightResponse() {
  return new Response(null, {
    status: 204,
    headers: defaultHeaders
  });
}

// Create an HTML response
export function htmlResponse(html, status = 200, headers = {}) {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      ...headers
    }
  });
}
