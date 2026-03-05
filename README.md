# SMASH Support Bot 🤖

AI-powered student support chatbot for SMASH Education, providing first-level assistance in Spanish and English for login, password, and payment issues.

**Live Demo:** [Coming Soon]  
**Documentation:** [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)

---

## 🎯 Overview

SMASH Support Bot helps SMASH Education students resolve common technical issues through an intelligent chat interface powered by Claude Haiku. The bot uses 18 proven Spanish support templates and automatically detects student language (Spanish/English) to provide contextual, helpful responses.

**Adapted from:** [DinkOWL](https://github.com/dekachin8/recplay) chat infrastructure

---

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Chat** - Claude Haiku with 18 Spanish support templates
- 🌐 **Bilingual Support** - Auto-detects Spanish/English, responds in student's language
- 🔒 **PII Masking** - Automatically masks credit cards, passwords, SSNs
- 📸 **Screenshot Analysis** - Haiku vision for error screenshot analysis
- ⭐ **Student Ratings** - 5-star feedback system with comments
- 📄 **Transcript Download** - Students can download conversation history

### Security
- ✅ Credit card masking (13-19 digits → `***CARD***`)
- ✅ Password detection and masking
- ✅ SSN masking (XXX-XX-XXXX → `***SSN***`)
- ✅ Security warnings (never share card details)
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Input validation and sanitization

### Support Topics
- ✅ Login issues (username, password)
- ✅ Payment problems (card processing, grace period)
- ✅ Diagnostic test access
- ✅ Account activation
- ✅ "Account not linked" messages
- ❌ Course content (escalates to human support)
- ❌ Grading issues (escalates to human support)

---

## 🛠️ Tech Stack

**Frontend:**
- Vanilla JavaScript (no framework dependencies)
- CSS3 with SMASH Education branding
- Responsive design (mobile-first)

**Backend:**
- Vercel Serverless Functions (Node.js)
- Claude Haiku API (Anthropic)
- Supabase (PostgreSQL) - optional for logging

**Infrastructure:**
- Vercel (hosting + serverless)
- GitHub (version control)
- Supabase (database) - optional

---

## 📦 Project Structure

```
smash-support-bot/
├── public/
│   ├── index.html              # Main chat interface
│   ├── css/
│   │   ├── smash-theme.css     # SMASH branding (orange/blue)
│   │   └── chat-ui.css         # Chat interface styles
│   ├── js/
│   │   ├── chat-handler.js     # Core chat logic
│   │   ├── screenshot-handler.js # Image upload
│   │   ├── i18n.js             # Spanish/English translations
│   │   ├── rating-handler.js   # Feedback system
│   │   └── app.js              # Main app initialization
│   └── images/
│       └── smashy-mascot.png   # Bot mascot
├── api/
│   ├── chat.js                 # Haiku API endpoint
│   ├── rating.js               # Rating storage
│   ├── escalate.js             # Email/Telegram escalation
│   └── load-knowledge-base.js  # Template loader
├── supabase/
│   └── schema.sql              # Database schema
├── docs/
│   ├── ARCHITECTURE.md         # Design decisions
│   ├── DEPLOYMENT_READY.md     # Deployment guide
│   └── BRANDING.md             # SMASH branding guidelines
└── SMASH_Spanish_Support_Knowledge_Base.md  # 18 support templates
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for local testing)
- Vercel account
- Anthropic API key (Claude Haiku)

### 1. Clone Repository

```bash
git clone https://github.com/dekachin8/smash-support-bot.git
cd smash-support-bot
```

### 2. Environment Variables

Create `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
INTERNAL_API_SECRET=your-random-secret

# Optional (for full functionality)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
RESEND_API_KEY=re_...        # For email escalations
TELEGRAM_BOT_TOKEN=...       # For Telegram notifications
TELEGRAM_CHAT_ID=...         # Your Telegram chat ID
```

### 3. Deploy to Vercel

```bash
vercel
```

Add environment variables in Vercel dashboard, then redeploy.

### 4. Test

Visit your Vercel URL and test the chat interface!

---

## 📚 Documentation

- **[DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)** - Complete deployment guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and design decisions
- **[PROGRESS.md](PROGRESS.md)** - Development timeline and decisions
- **[SMASH_Spanish_Support_Knowledge_Base.md](SMASH_Spanish_Support_Knowledge_Base.md)** - All 18 support templates

---

## 🔧 Configuration

### Knowledge Base Templates

The bot uses 18 proven Spanish support templates covering:

1. No tasks showing (after sorting)
2. Looking for diagnostic test
3. Payment setup
4. Approval required on school computers
5. Diagnostic test interrupted
6. Payment form not working
7. Already sorted but no missions
8. Technical escalation
9. Urgent payment issues
10. Troubleshooting escalation
11. Grace period expired
12. Payment completed but locked
13. **Comprehensive payment troubleshooting** (most common)
14. Credit union card issues
15. Work saved during trial
16. Success confirmation
17. Security warning (card details)
18. Receipt page instead of payment form

Templates are loaded from `SMASH_Spanish_Support_Knowledge_Base.md`.

### Branding

SMASH Education colors:
- **Primary:** Orange (`#FF9F47`)
- **Secondary:** Blue (`#4A90E2`)
- **Accent:** Yellow (`#FFD700`)

Mascot: **Smashy** (orange character with headphones)

---

## 🧪 Testing

### Manual Testing Checklist

**Language Detection:**
- [ ] Spanish query → Spanish response
- [ ] English query → English response

**Template Matching:**
- [ ] "no me salen las tareas" → Template 1
- [ ] "no puedo pagar" → Template 13
- [ ] "tarjeta de cooperativa" → Template 14

**Security:**
- [ ] Credit card number → `***CARD***`
- [ ] Password shared → `***`
- [ ] Security warning displays

**Features:**
- [ ] Screenshot upload works
- [ ] Transcript download works
- [ ] Rating system works
- [ ] Mobile responsive

---

## 📊 Analytics (Optional - Requires Supabase)

When Supabase is configured, the bot tracks:
- Conversation metrics (count, length, escalation rate)
- Template usage (which templates are used most)
- Student ratings (satisfaction scores)
- Response times
- Language distribution (Spanish vs English)

Run analytics queries from Supabase SQL editor using the provided views:
- `conversation_summary`
- `template_effectiveness`
- `daily_metrics`

---

## 🔐 Security Features

### PII Masking
- **Credit Cards:** 13-19 digit sequences → `***CARD***`
- **Passwords:** "password: abc123" → "password: ***"
- **SSNs:** XXX-XX-XXXX → `***SSN***`

### Data Retention
- **Raw PII:** Auto-deleted after 7 days (Supabase trigger)
- **Masked content:** Retained for analytics
- **Student messages:** Masked before storage

### Security Headers
- HTTPS only (enforced by Vercel)
- Rate limiting (10 req/min per IP)
- Input validation on all fields
- No credit card storage (payment handled by SMASH platform)

---

## 🚨 Escalation

Bot automatically escalates to human support when:
- Issue not covered in knowledge base
- Student mentions trying everything multiple times
- Out-of-scope questions (course content, grading)
- Student explicitly requests human support
- Technical issues requiring backend access

**Escalation Methods:**
- Email to `tim@languages4.com`
- Telegram notification (if configured)
- Supabase escalations table (if configured)

---

## 🤝 Contributing

This is a private repository for SMASH Education. For questions or issues:

**Contact:** tim@languages4.com  
**Organization:** JKS International / Languages 4

---

## 📄 License

Proprietary - © 2026 JKS International

---

## 🙏 Acknowledgments

- **DinkOWL** - Base chat infrastructure adapted from DinkOWL project
- **SMASH Education** - Support templates and branding
- **Anthropic** - Claude Haiku API
- **Vercel** - Hosting and serverless functions
- **Supabase** - Database and analytics

---

## 📈 Project Stats

**Development Time:** 1.5 hours (adapted from DinkOWL)  
**Lines of Code:** ~1,500  
**Files:** 28  
**Languages:** Spanish + English  
**Templates:** 18 proven support responses  
**Time Saved:** 16+ hours (vs building from scratch)

---

## 🔗 Related Projects

- **[DinkOWL](https://github.com/dekachin8/recplay)** - Pickleball session manager (source of chat infrastructure)
- **[SMASH Education](https://www.smasheducation.com)** - Learn faster. Go further. Sound native.
- **[Languages 4](https://www.languages4.com)** - Indigenous language revitalization

---

**Built with ❤️ by Peekay for SMASH Education students**
