// SMASH Support Bot - Internationalization
// Spanish & English translations

const translations = {
  es: {
    // Welcome screen
    'welcome.title': '¡Hola! Soy Smashy 👋',
    'welcome.subtitle': 'Tu asistente de soporte para SMASH Education',
    'welcome.description': 'Puedo ayudarte con problemas de acceso, contraseñas y pagos.',
    'welcome.startButton': 'Comenzar Chat',
    
    // Input area
    'input.placeholder': 'Escribe tu mensaje...',
    'input.attachScreenshot': 'Adjuntar captura de pantalla',
    'input.send': 'Enviar',
    
    // Actions
    'actions.downloadTranscript': '📄 Descargar conversación',
    'actions.newConversation': '🔄 Nueva conversación',
    
    // Rating
    'rating.title': '¿Te fue útil esta conversación?',
    'rating.commentPlaceholder': 'Comentarios adicionales (opcional)',
    'rating.submit': 'Enviar calificación',
    
    // Footer
    'footer.poweredBy': 'Powered by',
    'footer.tagline': 'Learn faster. Go further. Sound native.',
    'footer.website': 'Sitio web',
    'footer.privacy': 'Privacidad',
    
    // Privacy modal
    'privacy.title': 'Aviso de Privacidad',
    'privacy.message': 'No compartimos tu información personal. Los datos de tarjetas y contraseñas nunca se almacenan. Las conversaciones se guardan de forma segura para mejorar el servicio.',
    'privacy.ok': 'Entendido',
    
    // Loading
    'loading.thinking': 'Smashy está pensando...'
  },
  
  en: {
    // Welcome screen
    'welcome.title': 'Hello! I\'m Smashy 👋',
    'welcome.subtitle': 'Your support assistant for SMASH Education',
    'welcome.description': 'I can help you with login, password, and payment issues.',
    'welcome.startButton': 'Start Chat',
    
    // Input area
    'input.placeholder': 'Type your message...',
    'input.attachScreenshot': 'Attach screenshot',
    'input.send': 'Send',
    
    // Actions
    'actions.downloadTranscript': '📄 Download transcript',
    'actions.newConversation': '🔄 New conversation',
    
    // Rating
    'rating.title': 'Was this conversation helpful?',
    'rating.commentPlaceholder': 'Additional comments (optional)',
    'rating.submit': 'Submit rating',
    
    // Footer
    'footer.poweredBy': 'Powered by',
    'footer.tagline': 'Learn faster. Go further. Sound native.',
    'footer.website': 'Website',
    'footer.privacy': 'Privacy',
    
    // Privacy modal
    'privacy.title': 'Privacy Notice',
    'privacy.message': 'We don\'t share your personal information. Card and password data is never stored. Conversations are saved securely to improve the service.',
    'privacy.ok': 'Got it',
    
    // Loading
    'loading.thinking': 'Smashy is thinking...'
  }
};

class I18n {
  constructor() {
    this.currentLanguage = 'es'; // Default to Spanish
    this.loadLanguagePreference();
  }
  
  loadLanguagePreference() {
    const saved = localStorage.getItem('smash_language');
    if (saved && translations[saved]) {
      this.currentLanguage = saved;
    }
  }
  
  setLanguage(lang) {
    if (!translations[lang]) {
      console.warn('Language not supported:', lang);
      return;
    }
    
    this.currentLanguage = lang;
    localStorage.setItem('smash_language', lang);
    window.currentLanguage = lang;
    
    // Update all translated elements
    this.updateDOM();
    
    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }
  
  t(key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }
    
    return value || key;
  }
  
  updateDOM() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = this.t(key);
    });
    
    // Update aria labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.dataset.i18nAriaLabel;
      el.setAttribute('aria-label', this.t(key));
    });
    
    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      el.title = this.t(key);
    });
  }
}

// Initialize on page load
let i18n;

document.addEventListener('DOMContentLoaded', () => {
  i18n = new I18n();
  window.i18n = i18n;
  window.currentLanguage = i18n.currentLanguage;
  
  // Set initial language
  i18n.setLanguage(i18n.currentLanguage);
  
  // Language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      i18n.setLanguage(btn.dataset.lang);
    });
  });
  
  // Privacy modal
  const privacyLink = document.getElementById('privacyLink');
  const privacyModal = document.getElementById('privacyModal');
  const closePrivacyBtn = document.getElementById('closePrivacyBtn');
  const privacyOkBtn = document.getElementById('privacyOkBtn');
  
  privacyLink?.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.style.display = 'flex';
  });
  
  closePrivacyBtn?.addEventListener('click', () => {
    privacyModal.style.display = 'none';
  });
  
  privacyOkBtn?.addEventListener('click', () => {
    privacyModal.style.display = 'none';
  });
  
  // Click outside modal to close
  privacyModal?.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      privacyModal.style.display = 'none';
    }
  });
});
