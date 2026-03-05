// SMASH Support Bot - Chat Handler
// Adapted from DinkOWL's useChatSupport.ts
// Converted from React hooks to vanilla JS state management

class ChatHandler {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.messages = [];
    this.isThinking = false;
    this.currentScreenshot = null;
    
    // DOM elements
    this.welcomeSection = document.getElementById('welcomeSection');
    this.messagesArea = document.getElementById('messagesArea');
    this.messagesWrapper = document.getElementById('messagesWrapper');
    this.inputArea = document.getElementById('inputArea');
    this.messageInput = document.getElementById('messageInput');
    this.inputForm = document.getElementById('inputForm');
    this.sendBtn = document.getElementById('sendBtn');
    this.startChatBtn = document.getElementById('startChatBtn');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    
    this.initEventListeners();
  }
  
  generateSessionId() {
    return 'smash_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  initEventListeners() {
    // Start chat button
    this.startChatBtn?.addEventListener('click', () => this.startChat());
    
    // Form submission
    this.inputForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });
    
    // Auto-resize textarea
    this.messageInput?.addEventListener('input', () => {
      this.autoResizeTextarea();
    });
    
    // Enter to send (Shift+Enter for new line)
    this.messageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }
  
  startChat() {
    // Hide welcome, show chat
    this.welcomeSection.style.display = 'none';
    this.messagesArea.style.display = 'flex';
    this.inputArea.style.display = 'block';
    
    // Add initial greeting from Smashy
    const language = window.currentLanguage || 'es';
    const greeting = language === 'es' 
      ? '¡Hola! Soy Smashy 👋 ¿En qué puedo ayudarte hoy?'
      : 'Hello! I\'m Smashy 👋 How can I help you today?';
    
    this.addMessage('assistant', greeting);
    
    // Focus input
    this.messageInput?.focus();
  }
  
  async sendMessage() {
    const text = this.messageInput.value.trim();
    
    if (!text && !this.currentScreenshot) {
      return; // Nothing to send
    }
    
    // Clear input immediately
    this.messageInput.value = '';
    this.autoResizeTextarea();
    
    // Add user message to UI
    if (text) {
      this.addMessage('user', text);
    }
    
    // Add screenshot indicator if present
    if (this.currentScreenshot) {
      this.addMessage('user', '📸 [Screenshot attached]');
    }
    
    // Show thinking state
    this.setThinking(true);
    
    try {
      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          messages: this.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          screenshot: this.currentScreenshot
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Add assistant response
      this.addMessage('assistant', data.message, {
        escalated: data.escalated,
        templateMatched: data.templateMatched,
        language: data.language
      });
      
      // Clear screenshot after sending
      this.currentScreenshot = null;
      window.screenshotHandler?.clearScreenshot();
      
    } catch (error) {
      console.error('Send message error:', error);
      
      const language = window.currentLanguage || 'es';
      const errorMsg = language === 'es'
        ? 'Lo siento, hubo un error. Por favor intenta de nuevo.'
        : 'Sorry, there was an error. Please try again.';
      
      this.addMessage('assistant', errorMsg);
    } finally {
      this.setThinking(false);
      this.messageInput?.focus();
    }
  }
  
  addMessage(role, content, metadata = {}) {
    const message = {
      role,
      content,
      timestamp: new Date(),
      ...metadata
    };
    
    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
    
    // Store in localStorage for persistence
    this.saveConversation();
  }
  
  renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${message.role}`;
    
    // Avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'message-avatar';
    
    if (message.role === 'assistant') {
      const img = document.createElement('img');
      img.src = '/images/smashy-mascot.png';
      img.alt = 'Smashy';
      avatarEl.appendChild(img);
    } else {
      avatarEl.innerHTML = '<div class="user-avatar">👤</div>';
    }
    
    // Content
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    
    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'message-bubble';
    bubbleEl.textContent = message.content;
    
    // Metadata (if escalated)
    if (message.escalated) {
      bubbleEl.classList.add('escalated');
    }
    
    contentEl.appendChild(bubbleEl);
    
    // Timestamp
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = this.formatTime(message.timestamp);
    contentEl.appendChild(timeEl);
    
    // Assemble
    messageEl.appendChild(avatarEl);
    messageEl.appendChild(contentEl);
    
    this.messagesWrapper.appendChild(messageEl);
  }
  
  setThinking(thinking) {
    this.isThinking = thinking;
    
    if (thinking) {
      this.loadingOverlay.style.display = 'flex';
      this.sendBtn.disabled = true;
      this.messageInput.disabled = true;
    } else {
      this.loadingOverlay.style.display = 'none';
      this.sendBtn.disabled = false;
      this.messageInput.disabled = false;
    }
  }
  
  autoResizeTextarea() {
    const textarea = this.messageInput;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }
  
  scrollToBottom() {
    setTimeout(() => {
      this.messagesWrapper.scrollTop = this.messagesWrapper.scrollHeight;
    }, 100);
  }
  
  formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }
  
  saveConversation() {
    try {
      localStorage.setItem('smash_conversation_' + this.sessionId, JSON.stringify({
        sessionId: this.sessionId,
        messages: this.messages,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save conversation:', error);
    }
  }
  
  loadConversation(sessionId) {
    try {
      const data = localStorage.getItem('smash_conversation_' + sessionId);
      if (data) {
        const { messages } = JSON.parse(data);
        this.messages = messages;
        
        // Re-render all messages
        this.messagesWrapper.innerHTML = '';
        messages.forEach(msg => this.renderMessage(msg));
        this.scrollToBottom();
      }
    } catch (error) {
      console.warn('Failed to load conversation:', error);
    }
  }
  
  newConversation() {
    // Clear current conversation
    this.messages = [];
    this.messagesWrapper.innerHTML = '';
    this.sessionId = this.generateSessionId();
    
    // Show welcome screen again
    this.messagesArea.style.display = 'none';
    this.inputArea.style.display = 'none';
    this.welcomeSection.style.display = 'block';
  }
  
  downloadTranscript() {
    const language = window.currentLanguage || 'es';
    const title = language === 'es' 
      ? 'Conversación con Smashy - SMASH Education'
      : 'Conversation with Smashy - SMASH Education';
    
    let transcript = `${title}\n`;
    transcript += `Fecha: ${new Date().toLocaleDateString()}\n`;
    transcript += `Hora: ${new Date().toLocaleTimeString()}\n`;
    transcript += `ID de sesión: ${this.sessionId}\n`;
    transcript += `\n${'='.repeat(60)}\n\n`;
    
    this.messages.forEach(msg => {
      const speaker = msg.role === 'user' ? 'Estudiante' : 'Smashy';
      const time = new Date(msg.timestamp).toLocaleTimeString();
      transcript += `[${time}] ${speaker}:\n${msg.content}\n\n`;
    });
    
    // Create download
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SMASH_Support_${this.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize on page load
let chatHandler;

document.addEventListener('DOMContentLoaded', () => {
  chatHandler = new ChatHandler();
  
  // Wire up new conversation button
  document.getElementById('newConversationBtn')?.addEventListener('click', () => {
    chatHandler.newConversation();
  });
  
  // Wire up download button
  document.getElementById('downloadTranscriptBtn')?.addEventListener('click', () => {
    chatHandler.downloadTranscript();
  });
});
