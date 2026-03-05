# Instructions for Peekay: SMASH Support Bot (DinkOWL Adaptation)

## Project Overview

Adapt the existing DinkOWL helper bot structure to create a standalone SMASH Education support bot for handling first-level student support in English and Spanish.

---

## Project Goals

Create a chat-based support interface that:
- Helps students with login issues, username/password problems, and payment issues
- Operates in both English and Spanish (auto-detect language)
- Uses our comprehensive knowledge base for consistent responses
- Escalates complex issues to Tim
- Maintains strict security around personal information
- Stays strictly on-topic for SMASH Education support

---

## Technical Requirements

### Core Infrastructure
- **Base Structure:** DinkOWL helper bot architecture
- **Deployment:** Standalone web page (for now)
- **Model:** Claude Haiku (via Anthropic API)
- **API Key:** Use Haiku-specific API key for cost efficiency

### Interface Requirements
- **Style:** Chat interface similar to DinkOWL
- **Inputs:** 
  - Text messages (student queries)
  - Optional screenshot uploads
- **Languages:** Auto-detect and respond in English or Spanish
- **Response Format:** Use templates from knowledge base with appropriate customization

---

## Key Adaptations from DinkOWL

### 1. Knowledge Base Integration

**Location:** `SMASH_Spanish_Support_Knowledge_Base.md` (attached)

**How to Use:**
- Load entire knowledge base into system prompt
- Use template matching logic to identify correct response
- Haiku should identify:
  - Which template number matches the query
  - What customization fields need to be filled (student name, level, section, etc.)
  - Whether to escalate

**System Prompt Structure:**
```
You are a SMASH Education support assistant. Your job is to help students with login, 
password, and payment issues using the knowledge base provided.

[INSERT ENTIRE KNOWLEDGE_BASE.md HERE]

When responding:
1. Identify the student's issue from their message
2. Match it to the appropriate template from the knowledge base
3. Customize the template with student-specific details when available
4. Respond in the same language as the student's query (English or Spanish)
5. Stay strictly on topic - only SMASH Education login, password, and payment issues
6. Never request or store personal information like credit card numbers or passwords

If the issue is not covered in your knowledge base, politely inform the student that 
you're escalating to technical support and they'll hear from Tim shortly.
```

### 2. Security & PII Handling

**CRITICAL SECURITY REQUIREMENTS:**

**Detect and Mask PII:**
- Credit card numbers (any sequence of 13-19 digits)
- Passwords shared in messages
- Social Security Numbers
- Full names with ID numbers

**Implementation:**
```javascript
// Before storing or displaying any student message, run PII masking
function maskPII(text) {
  // Credit cards: Replace 13-19 digit sequences
  text = text.replace(/\b\d{13,19}\b/g, '***CARD***');
  
  // Potential passwords shared: "my password is X" or "password: X"
  text = text.replace(/(password|contraseña|clave)\s*[:=]?\s*\S+/gi, '$1: ***');
  
  // SSN patterns
  text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***SSN***');
  
  return text;
}
```

**Never Accept Direct PII:**
If student tries to share credit card info, respond:
```
**Importante - Por tu seguridad:** Por favor, **NUNCA** nos envíes los datos de tu 
tarjeta por este chat. El pago siempre debe hacerse directamente en la plataforma 
segura de SMASH.
```

### 3. Strict On-Topic Enforcement

**In-Scope Topics:**
✅ Login problems (can't access account)
✅ Username/password issues
✅ Payment problems (can't pay, payment not processing)
✅ Account creation/activation
✅ "Account not linked" messages
✅ Grace period expired issues
✅ Access after payment
✅ Diagnostic test issues

**Out-of-Scope Topics:**
❌ Course content questions
❌ Grading disputes
❌ Technical issues with specific lessons/modules (escalate these)
❌ General English learning questions
❌ Anything non-SMASH related

**Enforcement Logic:**
```javascript
// Haiku should return a structured response indicating scope
{
  "in_scope": true/false,
  "template_number": 13,
  "requires_escalation": false,
  "response": "..."
}
```

### 4. Language Detection & Response

**Auto-Detect Student Language:**
- If student writes in Spanish → Respond in Spanish
- If student writes in English → Respond in English
- Mixed language → Default to Spanish (primary student base is Puerto Rico)

**Haiku Instruction:**
```
Always respond in the same language as the student's query. The knowledge base 
contains Spanish templates - use these for Spanish queries. For English queries, 
you may translate the templates or respond naturally while maintaining the same 
helpful tone.
```

### 5. Escalation Logic

**Auto-Escalate When:**
- Issue not covered in knowledge base
- Student mentions trying everything multiple times
- Technical issues with module scoring/completion
- Cooperative/credit union card issues after initial troubleshooting
- Student explicitly requests human support
- Out-of-scope questions

**Escalation Response Template:**
```
¡Gracias por escribirnos! He escalado tu caso a nuestro equipo de soporte técnico. 
Tim se pondrá en contacto contigo muy pronto para ayudarte personalmente.

Thank you for writing to us! I've escalated your case to our technical support team. 
Tim will contact you very soon to help you personally.
```

**Escalation Notification to Tim:**
Send email/notification to: tim@languages4.com with:
- Student's query
- Conversation history
- Reason for escalation

### 6. Learning Mechanism

**Conversation Logging:**
- Store all conversations with timestamps
- Include: student query, bot response, template used, escalation status
- **NEVER store raw PII** - only masked versions
- Log structure:
```json
{
  "timestamp": "2026-03-05T14:30:00Z",
  "student_query_masked": "Tengo problemas con el pago, mi tarjeta es ***CARD***",
  "bot_response": "...",
  "template_used": 13,
  "language": "Spanish",
  "escalated": false,
  "in_scope": true
}
```

**Review Process:**
- Tim can review conversation logs periodically
- Identify patterns that need new templates
- Update knowledge base based on recurring issues
- No auto-updating - all knowledge base changes go through Tim

---

## File Structure

```
smash-support-bot/
├── index.html                          # Standalone page
├── css/
│   └── chat-interface.css              # Adapt from DinkOWL
├── js/
│   ├── chat-handler.js                 # Main chat logic
│   ├── api-client.js                   # Anthropic API integration
│   ├── pii-masking.js                  # Security functions
│   ├── template-matcher.js             # Knowledge base integration
│   └── escalation-handler.js           # Escalation logic
├── knowledge-base/
│   └── SMASH_Spanish_Support_Knowledge_Base.md
└── config/
    └── api-config.js                   # API key management
```

---

## DinkOWL Adaptations Checklist

### From DinkOWL, Keep:
- [ ] Chat interface UI/UX
- [ ] Message threading/conversation flow
- [ ] File/screenshot upload capability
- [ ] API client structure
- [ ] Error handling patterns

### From DinkOWL, Modify:
- [ ] System prompt → Use SMASH knowledge base
- [ ] Model → Switch to Haiku
- [ ] Response templates → Use knowledge base templates
- [ ] Scope enforcement → SMASH support only

### New Features to Add:
- [ ] PII masking functions
- [ ] Language auto-detection
- [ ] Template matching logic
- [ ] Escalation triggers and notifications
- [ ] Conversation logging (with PII masking)
- [ ] Spanish/English dual language support

---

## API Configuration

### Haiku API Setup

```javascript
// Use Haiku for cost efficiency and speed
const API_CONFIG = {
  model: "claude-haiku-4-20250514",
  max_tokens: 1024,  // Responses are templated, don't need many tokens
  temperature: 0.3,   // Low temperature for consistent template matching
};

// System prompt structure
const SYSTEM_PROMPT = `
[Load entire SMASH_Spanish_Support_Knowledge_Base.md here]

You are a SMASH Education support assistant...
[Rest of system prompt as specified above]
`;
```

### Response Structure

Haiku should return structured JSON for easier processing:

```json
{
  "template_id": "13",
  "template_name": "Comprehensive Payment Troubleshooting",
  "in_scope": true,
  "language_detected": "Spanish",
  "requires_escalation": false,
  "customization_needed": {
    "student_name": "Maria",
    "days_trying": "3"
  },
  "response_text": "¡Buenos días! Gracias por escribirnos. Lamento que hayas estado..."
}
```

---

## Security Checklist

### Must Implement:
- [ ] PII masking on all student inputs before storage
- [ ] No credit card numbers stored or displayed
- [ ] No passwords stored or displayed  
- [ ] HTTPS only for standalone page
- [ ] API key stored securely (environment variable, not in code)
- [ ] Rate limiting to prevent abuse
- [ ] Input validation on all text fields
- [ ] Sanitize screenshot uploads (no executable files)

### Warning Messages:
- [ ] Display security notice: "Never share credit card or password information in chat"
- [ ] Show masked version to student if PII detected
- [ ] Confirm PII has been removed from logs

---

## Testing Requirements

### Test Cases to Verify:

**Language Detection:**
- [ ] Spanish query → Spanish response
- [ ] English query → English response
- [ ] Mixed language → Spanish response

**Template Matching:**
- [ ] "no me salen las tareas" → Template 1
- [ ] "no puedo pagar" → Template 13
- [ ] "tarjeta de cooperativa" → Template 14
- [ ] "ya pagué pero no tengo acceso" → Template 12

**PII Masking:**
- [ ] Credit card number → ***CARD***
- [ ] "my password is xyz123" → "my password is ***"
- [ ] SSN → ***SSN***

**Escalation:**
- [ ] Out-of-scope question → Escalation message + notification
- [ ] Module scoring issue → Escalation
- [ ] "I've tried everything" (after 3+ messages) → Escalation

**Security:**
- [ ] Student types credit card → Warning + masked
- [ ] Student tries to share password → Warning + masked
- [ ] Verify no PII in conversation logs

---

## Deployment Steps

1. **Clone DinkOWL structure** to new repository
2. **Replace knowledge base** with SMASH support knowledge base
3. **Update system prompt** with SMASH-specific instructions
4. **Implement PII masking** functions
5. **Add language detection** logic
6. **Configure Haiku API** endpoint
7. **Set up escalation notifications** to tim@languages4.com
8. **Test all security features**
9. **Test all template matching**
10. **Deploy to standalone page**
11. **Share URL with Tim for testing**

---

## Success Criteria

Bot should successfully:
- ✅ Respond to Spanish and English queries
- ✅ Match 90%+ of common issues to correct templates
- ✅ Mask all PII before storage/display
- ✅ Escalate appropriately (not too much, not too little)
- ✅ Stay on-topic (reject non-SMASH queries)
- ✅ Provide helpful, consistent responses
- ✅ Log conversations for Tim's review
- ✅ Feel natural and friendly (not robotic)

---

## Questions for Tim

Before starting, confirm:
- [ ] Is DinkOWL's UI/UX appropriate for SMASH students?
- [ ] Should screenshots be stored or just processed and discarded?
- [ ] What's the preferred escalation notification method (email, Slack, other)?
- [ ] Should there be a daily summary report of conversations?
- [ ] Any specific branding/styling requirements for SMASH?

---

## Contact

If you have questions while implementing this, reach out to Tim at tim@languages4.com.

---

**Attached Files:**
1. `SMASH_Spanish_Support_Knowledge_Base.md` - Complete knowledge base with all 18 templates
2. This instruction document

**Timeline Estimate:** 
- Basic adaptation: 2-3 days
- Full testing: 1-2 days  
- Total: ~1 week for production-ready standalone bot

Good luck, Peekay! 🦉
