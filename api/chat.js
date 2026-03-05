// SMASH Support Bot - Chat API
// Adapted from DinkOWL's proven chat infrastructure
// Changes: Haiku (not Sonnet), Spanish templates, PII masking, language detection

// Vercel serverless function
export const config = {
  runtime: 'nodejs',
  maxDuration: 30, // 30 seconds max
};

// Rate limiting: simple in-memory store (for basic protection)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(identifier) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// PII masking - CRITICAL SECURITY
function maskPII(text) {
  if (!text) return text;
  
  let masked = text;
  let piiTypes = [];
  
  // Credit cards (13-19 digits, with or without spaces/dashes)
  const cardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{3,4}\b/g;
  if (cardPattern.test(masked)) {
    masked = masked.replace(cardPattern, '***CARD***');
    piiTypes.push('credit_card');
  }
  
  // Passwords shared in messages
  const passwordPattern = /(password|contraseña|clave|pwd|pass)\s*[:=]?\s*\S+/gi;
  if (passwordPattern.test(masked)) {
    masked = masked.replace(passwordPattern, '$1: ***');
    piiTypes.push('password');
  }
  
  // SSN (XXX-XX-XXXX)
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
  if (ssnPattern.test(masked)) {
    masked = masked.replace(ssnPattern, '***SSN***');
    piiTypes.push('ssn');
  }
  
  return { maskedText: masked, piiTypes, hasPII: piiTypes.length > 0 };
}

// Language detection (Spanish vs English)
function detectLanguage(messages) {
  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
  if (!lastUserMessage) return 'es'; // Default to Spanish
  
  const text = lastUserMessage.content.toLowerCase();
  
  // Spanish indicators
  const spanishWords = ['hola', 'gracias', 'ayuda', 'problema', 'como', 'cuando', 'donde', 'por favor', 'necesito'];
  const spanishCount = spanishWords.filter(w => text.includes(w)).length;
  
  // English indicators
  const englishWords = ['hello', 'thanks', 'help', 'problem', 'how', 'when', 'where', 'please', 'need'];
  const englishCount = englishWords.filter(w => text.includes(w)).length;
  
  return spanishCount > englishCount ? 'es' : 'en';
}

// Template matching - matches student query to one of 18 templates
function matchTemplate(userMessage, language) {
  const msg = userMessage.toLowerCase();
  
  // Template trigger phrases (simplified - full list in knowledge base)
  const templates = {
    1: ['no me sale ninguna tarea', 'no me aparecen', 'no veo tareas'],
    2: ['no me aparece la pre-prueba', 'busco el examen', 'dónde está la diagnóstica'],
    3: ['admin tiene que darme permiso', 'no puedo comprar', 'necesito pagar'],
    6: ['pongo mi correo y no pasa nada', 'formulario no funciona'],
    13: ['llevo días intentando pagar', 'he intentado todo', 'no me deja pagar'],
    // ... more templates (full implementation would include all 18)
  };
  
  for (const [templateNum, phrases] of Object.entries(templates)) {
    if (phrases.some(phrase => msg.includes(phrase))) {
      return parseInt(templateNum);
    }
  }
  
  return null; // No template matched
}

// Escalation detection
function detectEscalation(messages, assistantMessage) {
  const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

  // User requests human
  if (/(hablar con|contactar|persona real|humano|tim)/i.test(lastUserMessage)) {
    return { trigger: true, reason: 'user_requested_human' };
  }

  // Repeated similar messages (stuck in loop)
  if (messages.length >= 4) {
    const lastTwo = messages.slice(-2).map(m => m.content);
    if (lastTwo[0] === lastTwo[1]) {
      return { trigger: true, reason: 'repeated_message' };
    }
  }

  // Conversation too long (>10 messages = not resolving)
  if (messages.length > 10) {
    return { trigger: true, reason: 'long_conversation' };
  }

  return { trigger: false, reason: null };
}

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ 
      error: 'Chat support is not configured. Please contact tim@languages4.com' 
    });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Demasiadas solicitudes. Por favor espera un momento. / Too many requests. Please wait a moment.'
      });
    }

    const { messages, sessionId, screenshot } = req.body;

    // Validate request
    if (!messages || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    if (messages.length > 50) {
      return res.status(400).json({ 
        error: 'Conversación demasiado larga. Por favor inicia una nueva. / Conversation too long. Please start a new chat.' 
      });
    }

    // Validate each message + mask PII
    const maskedMessages = [];
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ error: 'Invalid message format' });
      }
      if (msg.content.length > 2000) {
        return res.status(400).json({ 
          error: 'Mensaje demasiado largo. / Message too long.' 
        });
      }

      // Mask PII before processing
      const { maskedText, piiTypes, hasPII } = maskPII(msg.content);
      
      // Warning if PII detected
      if (hasPII && msg.role === 'user') {
        console.warn('PII detected in message:', piiTypes);
      }

      maskedMessages.push({
        role: msg.role,
        content: maskedText
      });
    }

    // Detect language
    const language = detectLanguage(maskedMessages);

    // Try template matching
    const lastUserMsg = maskedMessages.filter(m => m.role === 'user').slice(-1)[0];
    const templateMatched = lastUserMsg ? matchTemplate(lastUserMsg.content, language) : null;

    // Load full knowledge base
    const { loadKnowledgeBase } = require('./load-knowledge-base');
    const knowledgeBase = loadKnowledgeBase();
    
    // Build system prompt with SMASH knowledge base
    const systemPrompt = `You are Smashy, a helpful support assistant for SMASH Education. You help students with login, password, payment, and diagnostic test issues.

IMPORTANT RULES:
1. Respond in ${language === 'es' ? 'SPANISH' : 'ENGLISH'} (the student's language)
2. Use "tú" form (informal but professional) in Spanish
3. Be warm, encouraging, and patient
4. Stay strictly on topic: ONLY help with login, passwords, payments, and diagnostic test access
5. For course content or grading questions, politely redirect to tim@languages4.com
6. NEVER ask for or accept credit card numbers or passwords
7. If you see "***CARD***" or "***PASSWORD***" in the message, warn the student NOT to share that information
8. Use the knowledge base templates below to provide consistent, proven responses

CRITICAL INFORMATION:

**LOGIN:**
- URL: https://login.smasheducation.com/login
- Username: Student's university email address
- Default password: smash (case sensitive - many students forget this!)
- Browser: Recommend Google Chrome

**PAYMENT:**
- Cost: $35 USD
- IMPORTANT: System may show "$48 CAD" but only charges $35 USD (reassure students this is normal!)
- This is just a currency display - actual charge is $35 USD
- Use Google Chrome for payment

**DIAGNOSTIC TEST:**
- Purpose: Placement tool (CEFR levels A, B, C)
- If interrupted: Look for ORANGE "RESUME TEST" button after logging back in
- If RESUME TEST doesn't work: Must restart test from beginning
- If unhappy with placement: Must retake entire test (no adjustments without retaking)

---

**KNOWLEDGE BASE - 18 SPANISH SUPPORT TEMPLATES:**

${knowledgeBase}

---

**RESPONSE INSTRUCTIONS:**
- Match the student's issue to the appropriate template from the knowledge base above
- Adapt the template to the student's specific situation
- Respond in the same language as the student (Spanish or English)
- Keep responses warm and encouraging
- ${templateMatched ? `Template ${templateMatched} was pre-matched - use it as a starting point` : 'Identify the best template match from the knowledge base'}
- If no template matches, provide general help and consider escalation`;

    // Lazy-load Anthropic SDK
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Prepare content array (text + optional screenshot)
    let content = maskedMessages.map(m => ({
      type: 'text',
      text: m.content
    }));

    // Add screenshot if provided (Haiku supports vision)
    if (screenshot && lastUserMsg?.role === 'user') {
      content[content.length - 1] = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: screenshot.mimeType || 'image/png',
          data: screenshot.data
        }
      };
    }

    // Call Claude Haiku API
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-20250514', // Haiku for speed + cost
      max_tokens: 1024,
      system: systemPrompt,
      messages: maskedMessages
    });

    // Extract response
    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : (language === 'es' 
          ? 'Hubo un error procesando tu solicitud.' 
          : 'There was an error processing your request.');

    // Check for escalation
    const shouldEscalate = detectEscalation(maskedMessages, assistantMessage);

    if (shouldEscalate.trigger) {
      // Log to Supabase + trigger escalation
      // (Implementation would call escalation endpoint)
      
      const escalationNote = language === 'es'
        ? "\n\n*He escalado tu caso a nuestro equipo de soporte. Tim se pondrá en contacto contigo pronto.*"
        : "\n\n*I've escalated your case to our support team. Tim will contact you shortly.*";

      return res.status(200).json({
        message: assistantMessage + escalationNote,
        escalated: true,
        templateMatched,
        language
      });
    }

    return res.status(200).json({
      message: assistantMessage,
      escalated: false,
      templateMatched,
      language
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message' 
    });
  }
}
