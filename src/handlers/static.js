// Static file handler for serving the chat interface

import { htmlResponse, errorResponse }

// Basic JavaScript for the chat interface
function getAppJs() {
  return `/**
 * Mental Health Chatbot - Frontend Script
 */

document.addEventListener('DOMContentLoaded', function() {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  
  // Current conversation state
  let currentConversationId = null;
  
  // Set up event listeners
  sendButton.addEventListener('click', handleSendMessage);
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  });
  
  // Focus input field
  userInput.focus();
  
  /**
   * Handle sending a message
   */
  async function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          conversation_id: currentConversationId
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      // Update conversation ID if new
      if (!currentConversationId && data.conversation_id) {
        currentConversationId = data.conversation_id;
      }
      
      // Hide typing indicator
      hideTypingIndicator();
      
      // Add response to chat
      addMessage(data.message, false);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Hide typing indicator
      hideTypingIndicator();
      
      // Add error message
      addMessage('Sorry, I had trouble processing your message. Please try again.', false);
    }
  }
  
  /**
   * Add a message to the chat
   * @param {string} message - Message text
   * @param {boolean} isUser - Whether the message is from the user
   */
  function addMessage(message, isUser = false) {
    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row');
    
    if (isUser) {
      messageRow.classList.add('user-message-row');
      messageRow.innerHTML = \`
        <div class="message user-message">\${message}</div>
        <div class="avatar user-avatar">
          <svg class="user-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
          </svg>
        </div>
      \`;
    } else {
      messageRow.classList.add('bot-message-row');
      messageRow.innerHTML = \`
        <div class="avatar bot-avatar">
          <svg class="bot-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M17,11H14V9H10V11H7V13H10V15H14V13H17V11Z" />
          </svg>
        </div>
        <div class="message bot-message">\${message}</div>
      \`;
    }
    
    chatMessages.appendChild(messageRow);
    scrollToBottom();
  }
  
  /**
   * Show typing indicator
   */
  function showTypingIndicator() {
    // Check if typing indicator already exists
    if (document.getElementById('typing-indicator')) return;
    
    const typingRow = document.createElement('div');
    typingRow.classList.add('message-row', 'bot-message-row');
    typingRow.id = 'typing-indicator';
    typingRow.innerHTML = \`
      <div class="avatar bot-avatar">
        <svg class="bot-icon" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M17,11H14V9H10V11H7V13H10V15H14V13H17V11Z" />
        </svg>
      </div>
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    \`;
    
    chatMessages.appendChild(typingRow);
    scrollToBottom();
  }
  
  /**
   * Hide typing indicator
   */
  function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  /**
   * Scroll chat to bottom
   */
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});`;
} from '../utils/responses.js';

// Content type map for common file extensions
const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Serve static files
export async function handleServeStatic(request, env, path) {
  // Default to index.html for root path
  if (!path || path === '' || path === '/') {
    path = 'index.html';
  }
  
  // Get file extension
  const lastDotIndex = path.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? path.substring(lastDotIndex) : '';
  const contentType = contentTypes[extension] || 'text/plain';
  
  try {
    // For this simple implementation, we'll serve a basic HTML page
    // In a real-world scenario, you would serve files from Cloudflare R2, KV, or other storage
    if (path === 'index.html') {
      return htmlResponse(getIndexHtml());
    } else if (path === 'styles.css') {
      return new Response(getStylesCss(), {
        headers: { 'Content-Type': 'text/css' }
      });
    } else if (path === 'app.js') {
      return new Response(getAppJs(), {
        headers: { 'Content-Type': 'text/javascript' }
      });
    }
    
    // Return 404 for all other files
    return errorResponse('File not found', 404);
  } catch (error) {
    console.error('Static file error:', error);
    return errorResponse('Error serving static file', 500);
  }
}

// Basic HTML for the chat interface
function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mental Health Chatbot</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <div class="logo-container">
      <h1>Mental Health Chatbot</h1>
    </div>
  </header>

  <div class="app-container">
    <div class="chat-container">
      <div class="chat-messages" id="chat-messages">
        <div class="message-row bot-message-row">
          <div class="avatar bot-avatar">
            <svg class="bot-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M17,11H14V9H10V11H7V13H10V15H14V13H17V11Z" />
            </svg>
          </div>
          <div class="message bot-message">
            Hi there! I'm here to listen and support you. How are you feeling today?
          </div>
        </div>
      </div>
      
      <div class="chat-input-container">
        <div class="chat-input">
          <input type="text" id="user-input" placeholder="Type your message..." />
          <button id="send-button" class="send-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <div class="footer-content">
      <p class="disclaimer">This is a supportive chat companion, not a replacement for professional mental health services.</p>
      <p class="copyright">&copy; ${new Date().getFullYear()} Mental Health Chatbot. All rights reserved.</p>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>`;
}

// Basic CSS for the chat interface
function getStylesCss() {
  return `/* Global styles */
:root {
  --primary: #5c6bc0;
  --primary-dark: #3949ab;
  --secondary: #8e24aa;
  --dark-bg: #f5f5f5;
  --card-bg: #ffffff;
  --text-dark: #333333;
  --text-light: #ffffff;
  --text-secondary: #666666;
  --border-radius: 16px;
  --box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Montserrat', sans-serif;
  color: var(--text-dark);
  background-color: var(--dark-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: var(--transition);
}

a:hover {
  color: var(--primary-dark);
}

button {
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
}

/* Header styles */
header {
  background-color: var(--primary);
  padding: 1rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: var(--box-shadow);
  position: relative;
  z-index: 10;
}

.logo-container {
  display: flex;
  align-items: center;
}

header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-light);
}

/* Chat styles */
.app-container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  height: 70vh;
}

.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.user-message-row {
  justify-content: flex-end;
}

.bot-message-row {
  justify-content: flex-start;
}

.message {
  max-width: 70%;
  padding: 1rem 1.2rem;
  border-radius: 16px;
  line-height: 1.5;
  position: relative;
  font-size: 0.95rem;
}

.user-message {
  background-color: var(--primary);
  color: var(--text-light);
  border-bottom-right-radius: 4px;
  margin-right: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.bot-message {
  background-color: #f0f0f0;
  color: var(--text-dark);
  border-bottom-left-radius: 4px;
  margin-left: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.chat-input-container {
  padding: 1.2rem;
  background-color: #f8f8f8;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-input {
  display: flex;
  align-items: center;
  background-color: var(--card-bg);
  border-radius: 50px;
  padding: 0.5rem;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.chat-input input {
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  background: transparent;
  color: var(--text-dark);
}

.chat-input input::placeholder {
  color: var(--text-secondary);
}

.send-button {
  background-color: var(--primary);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-button:hover {
  background-color: var(--primary-dark);
  transform: scale(1.05);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.bot-avatar {
  background-color: var(--secondary);
}

.user-avatar {
  background-color: var(--primary-dark);
}

.bot-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.user-icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.typing-indicator {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  padding-left: 12px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 1px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: inline-block;
  opacity: 0.6;
}

@keyframes blink {
  0% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.4; transform: scale(0.8); }
}

.typing-indicator span:nth-child(1) { animation: blink 1s infinite 0.33s; }
.typing-indicator span:nth-child(2) { animation: blink 1s infinite 0.66s; }
.typing-indicator span:nth-child(3) { animation: blink 1s infinite 0.99s; }

/* Footer styles */
footer {
  background-color: var(--card-bg);
  padding: 1.5rem;
  margin-top: 2rem;
  text-align: center;
  box-shadow: var(--box-shadow);
  border-radius: var(--border-radius);
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 2rem;
}

.disclaimer {
  color: var(--secondary);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.copyright {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Responsive design */
@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .message {
    max-width: 80%;
  }
  
  footer {
    margin-left: 1rem;
    margin-right: 1rem;
    padding: 1rem;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
