// SMASH Support Bot - Main App
// Wires all components together

class SmashApp {
  constructor() {
    this.initialized = false;
  }
  
  init() {
    if (this.initialized) return;
    
    console.log('🚀 SMASH Support Bot initialized');
    console.log('Language:', window.currentLanguage || 'es');
    console.log('Session ID:', window.chatHandler?.sessionId);
    
    // Set up global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.handleGlobalError(e.error);
    });
    
    // Set up unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled rejection:', e.reason);
      this.handleGlobalError(e.reason);
    });
    
    // Check for session restoration
    this.checkSessionRestoration();
    
    this.initialized = true;
  }
  
  checkSessionRestoration() {
    // Check if there's a recent session to restore
    const prefix = window.SMASH_CONFIG?.persistence?.prefix || 'smash_conversation_';
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    
    if (keys.length > 0) {
      // Find most recent session
      let mostRecent = null;
      let mostRecentTime = 0;
      
      keys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const time = new Date(data.lastUpdated).getTime();
          if (time > mostRecentTime) {
            mostRecentTime = time;
            mostRecent = data.sessionId;
          }
        } catch (error) {
          // Ignore invalid sessions
        }
      });
      
      // If session is less than 24 hours old, offer to restore
      const hoursSinceUpdate = (Date.now() - mostRecentTime) / (1000 * 60 * 60);
      if (mostRecent && hoursSinceUpdate < 24) {
        this.offerSessionRestoration(mostRecent);
      }
    }
  }
  
  offerSessionRestoration(sessionId) {
    const language = window.currentLanguage || 'es';
    const message = language === 'es'
      ? '¿Quieres continuar tu conversación anterior?'
      : 'Would you like to continue your previous conversation?';
    
    if (confirm(message)) {
      window.chatHandler?.loadConversation(sessionId);
      window.chatHandler?.startChat();
    }
  }
  
  handleGlobalError(error) {
    const language = window.currentLanguage || 'es';
    const errorMsg = language === 'es'
      ? 'Ocurrió un error inesperado. Por favor recarga la página.'
      : 'An unexpected error occurred. Please reload the page.';
    
    // Only show alert for critical errors (not during development)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.error('Critical error:', error);
      // Could log to analytics here
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SmashApp();
  app.init();
  window.smashApp = app;
});

// Service worker registration (for future PWA support)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    // Uncomment when service worker is ready
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered:', reg.scope))
    //   .catch(err => console.error('Service Worker registration failed:', err));
  });
}
