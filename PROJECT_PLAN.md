# SMASH Support Bot - Project Plan

**Created:** March 5, 2026  
**Timeline:** Phase 1 in days  
**Status:** In Progress

---

## Quick Reference - Tim's Answers

1. **Timeline:** Days (urgent)
2. **Code Location:** DinkOWL/RecPlay GitHub (`~/shared/recplay/components/chat-support/`)
3. **Deployment:** Single HTML page for 2 schools to test (open to options later)
4. **API Key:** Same as DinkOWL, attached to Claude Haiku
5. **Escalation:** Email to tim@languages4.com + Telegram notification
6. **Storage:** Supabase
7. **Branding:** SMASH Education colors/design/mascot (www.smasheducation.com)
8. **Student Experience:** Single session, download transcripts YES, rating responses YES
9. **Screenshots:** Process with Haiku (vision model)
10. **PII Logging:** Raw files (after masking)
11. **Analytics:** YES - efficacy and usage metrics
12. **Scope:** Build everything, Phase 1 first, structure for Phase 2

---

## Architecture

### Phase 1: Standalone Page
- Single HTML file + CSS + JS
- Can be hosted anywhere (Vercel, S3, simple web server)
- No build process needed
- Easy to share with 2 schools

### Backend
- Vercel serverless functions (or simple Node.js server)
- `/api/chat` - Handles Anthropic Haiku requests
- `/api/escalate` - Sends email + Telegram notification
- `/api/transcript` - Generates downloadable transcript

### Database (Supabase)
Tables:
- `conversations` - Session metadata
- `messages` - Individual messages (with PII masked)
- `escalations` - Escalation records
- `ratings` - Student feedback ratings
- `analytics` - Usage metrics

---

## File Structure

```
smash-support-bot/
├── public/
│   ├── index.html           # Main standalone page
│   ├── css/
│   │   ├── smash-theme.css  # SMASH branding
│   │   └── chat-ui.css      # Chat interface styles
│   └── js/
│       ├── chat-handler.js  # Main chat logic
│       ├── api-client.js    # API communication
│       ├── pii-masking.js   # Security functions
│       ├── template-matcher.js # Knowledge base matching
│       ├── language-detector.js # Spanish/English detection
│       └── transcript-generator.js # Download functionality
├── api/
│   ├── chat.js              # Haiku API endpoint
│   ├── escalate.js          # Email + Telegram
│   └── transcript.js        # Generate PDF/text
├── supabase/
│   └── schema.sql           # Database schema
├── docs/
│   ├── SMASH_Spanish_Support_Knowledge_Base.md
│   └── API_DOCS.md
└── config/
    └── smash-config.js      # Configuration (API keys, colors, etc.)
```

---

## Phase 1 Features (Build Now)

✅ Must Have:
- [ ] Chat interface with SMASH branding
- [ ] Template matching from knowledge base
- [ ] Language auto-detection (Spanish/English)
- [ ] PII masking (credit cards, passwords, SSNs)
- [ ] Screenshot analysis (Haiku vision)
- [ ] Escalation to email + Telegram
- [ ] Download transcript button
- [ ] Rating system (thumbs up/down)
- [ ] Conversation logging to Supabase
- [ ] Basic analytics (conversation count, template usage, escalation rate)
- [ ] Security: HTTPS only, rate limiting, input validation

📝 Documentation:
- [ ] Setup instructions
- [ ] API documentation
- [ ] Testing guide

---

## Phase 2 Features (Structure For, Build Later)

- [ ] Admin dashboard for reviewing conversations
- [ ] Advanced analytics (charts, trends, student satisfaction)
- [ ] Multi-session support (if students return)
- [ ] A/B testing different templates
- [ ] Integration with SMASH platform (if desired)
- [ ] Bulk export of conversations
- [ ] Custom branding per school

---

## Technical Decisions

### Why Standalone HTML?
- Easy to deploy (just upload files)
- No build process = faster iteration
- Works anywhere (schools can host it themselves if needed)
- Can migrate to React/Next.js later if needed

### Why Haiku?
- Cost efficient ($0.25/1M input tokens vs Sonnet $3/1M)
- Fast responses (<1 second)
- Vision support (can analyze screenshots)
- Perfect for template matching (doesn't need deep reasoning)

### Why Supabase?
- Already familiar from DinkOWL
- Real-time capabilities (if needed later)
- Built-in auth (if needed for admin dashboard)
- Easy to query for analytics

---

## Security Checklist

- [ ] PII masking on all inputs before storage
- [ ] Never store credit cards, passwords, SSNs
- [ ] HTTPS only
- [ ] API key secured (environment variable)
- [ ] Rate limiting (10 req/min per IP)
- [ ] Input validation (max message length, sanitize HTML)
- [ ] No executable file uploads
- [ ] Warning message if PII detected

---

## Testing Plan

### Manual Testing:
- [ ] Spanish query → Spanish response
- [ ] English query → English response
- [ ] Template matching accuracy (test all 18 templates)
- [ ] PII masking (test credit cards, passwords, SSNs)
- [ ] Screenshot upload and analysis
- [ ] Escalation triggers correctly
- [ ] Download transcript works
- [ ] Rating system saves to database
- [ ] Mobile responsive
- [ ] Different browsers (Chrome, Safari, Firefox)

### Load Testing:
- [ ] 100 concurrent users (simulate school launch)
- [ ] API rate limiting works
- [ ] Supabase doesn't hit limits

---

## Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema applied
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Standalone page uploaded
- [ ] URL shared with Tim
- [ ] 2 schools notified

---

## Timeline Estimate

**Day 1 (Today):**
- ✅ Project structure
- [ ] SMASH branding research
- [ ] Supabase schema
- [ ] Basic HTML page with chat UI
- [ ] PII masking functions

**Day 2:**
- [ ] Template matching logic
- [ ] Language detection
- [ ] API endpoints (chat, escalate)
- [ ] Haiku integration

**Day 3:**
- [ ] Screenshot analysis
- [ ] Download transcript
- [ ] Rating system
- [ ] Analytics setup

**Day 4:**
- [ ] Testing (all features)
- [ ] Bug fixes
- [ ] Documentation

**Day 5:**
- [ ] Deploy to production
- [ ] Share with 2 schools
- [ ] Monitor initial usage

---

## Current Status

**Started:** March 5, 2026 @ 10:20 AM MST  
**Phase:** Initial setup  
**Next:** Build Supabase schema and HTML page
