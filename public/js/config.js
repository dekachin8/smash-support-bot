// SMASH Support Bot - Configuration
// Keep this minimal - security-sensitive values should be server-side only

const SMASH_CONFIG = {
  // API endpoint (will be relative in production)
  apiEndpoint: '/api/chat',
  
  // Rate limiting (client-side hint only - server enforces)
  rateLimitHint: {
    maxRequests: 10,
    windowMs: 60000 // 1 minute
  },
  
  // File upload limits (client-side hint - server validates)
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  },
  
  // Message limits (client-side hint - server validates)
  message: {
    maxLength: 2000,
    maxMessages: 50
  },
  
  // Auto-save conversation to localStorage
  persistence: {
    enabled: true,
    prefix: 'smash_conversation_'
  },
  
  // Analytics (if needed later)
  analytics: {
    enabled: false
  },
  
  // Contact info for escalations (display only)
  contact: {
    email: 'tim@languages4.com',
    website: 'https://www.smasheducation.com'
  }
};

// Make globally accessible
window.SMASH_CONFIG = SMASH_CONFIG;
