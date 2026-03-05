# SMASH Support Bot - Architecture

**Created:** March 5, 2026  
**Approach:** Adapt DinkOWL's Dinky chat infrastructure (not build from scratch)

---

## Foundation: DinkOWL's Dinky Chat System

**Source:** `~/shared/recplay/components/chat-support/`

This bot is built by **adapting** DinkOWL's proven chat system, not rebuilding from scratch.

### What We're Reusing

**1. API Endpoint Pattern** (`app/api/chat/route.ts`)
- ✅ Rate limiting (10 req/min per IP)
- ✅ Session management
- ✅ Input validation (max length, message count)
- ✅ Error handling
- ✅ Anthropic API integration pattern

**2. Chat UI Patterns**
- ✅ Message flow (user → assistant → user)
- ✅ Loading states ("thinking...")
- ✅ Avatar animation concept
- ✅ Input area with auto-resize
- ✅ Error messages and toasts

**3. Core Logic**
- ✅ Session ID generation
- ✅ Message history management
- ✅ Send/receive flow

### What We're Adapting

**1. Knowledge Base**
- DinkOWL: General FAQs about pickleball app
- SMASH: 18 Spanish templates for SMASH Education support

**2. Model**
- DinkOWL: Claude Sonnet (general support)
- SMASH: Claude Haiku (template matching, cost-efficient, vision support)

**3. Features**
- Add: PII masking (credit cards, passwords, SSNs)
- Add: Language auto-detection (Spanish/English)
- Add: Screenshot analysis (Haiku vision)
- Add: Template matching (1-18)
- Add: Escalation to tim@languages4.com + Telegram

**4. Branding**
- DinkOWL: Plum (#2d1f3d) + Yellow (#dcff00), Dinky mascot
- SMASH: Orange (#FF9F47) + Blue (#4A90E2), Smashy mascot

**5. Storage**
- DinkOWL: Optional (not required for chat)
- SMASH: Supabase (required for analytics, escalations, PII tracking)

### What We're Converting

**React → Vanilla JS** (for standalone page):
- `ChatWidget.tsx` → `js/chat-handler.js`
- `useChatSupport.ts` → Plain JS state management
- `ChatMessages.tsx` → DOM manipulation functions
- `ChatInput.tsx` → Form handling with vanilla JS

Same patterns, no framework dependency.

---

## File Structure (Adapted)

```
smash-support-bot/
├── public/
│   ├── index.html                    # Standalone page (from DinkOWL pattern)
│   ├── css/
│   │   ├── smash-theme.css          # Branding (adapted from DinkOWL)
│   │   └── chat-ui.css              # Chat UI (adapted from DinkOWL)
│   └── js/
│       ├── chat-handler.js          # Core logic (adapted from useChatSupport.ts)
│       ├── api-client.js            # API calls (adapted from DinkOWL)
│       ├── pii-masking.js           # NEW: Security layer
│       ├── language-detector.js     # NEW: Spanish/English detection
│       └── template-matcher.js      # NEW: Knowledge base matching
│
├── api/
│   ├── chat.js                      # Adapted from DinkOWL's route.ts
│   ├── escalate.js                  # NEW: Email + Telegram
│   └── transcript.js                # NEW: Download feature
│
├── supabase/
│   └── schema.sql                   # Database for analytics
│
└── docs/
    ├── SMASH_Spanish_Support_Knowledge_Base.md  # 18 templates
    └── ARCHITECTURE.md              # This file
```

---

## Key Differences from DinkOWL

| Feature | DinkOWL (Dinky) | SMASH (Smashy) |
|---------|----------------|----------------|
| **Framework** | React/Next.js | Vanilla HTML/JS |
| **Model** | Claude Sonnet | Claude Haiku |
| **Language** | English only | Spanish + English |
| **Knowledge Base** | FAQ system | Template matching (18) |
| **PII Handling** | Not required | Required + masking |
| **Screenshots** | Not supported | Haiku vision analysis |
| **Storage** | Optional | Required (Supabase) |
| **Escalation** | Not required | Email + Telegram |
| **Deployment** | Part of Next.js app | Standalone page |

---

## Implementation Steps (Revised)

### Phase 1: Copy & Adapt Backend (2 hours)
1. ✅ Copy `/api/chat/route.ts` structure
2. Adapt for Haiku (not Sonnet)
3. Add knowledge base (18 templates)
4. Add PII masking layer
5. Add language detection
6. Add template matching logic
7. Add escalation triggers

### Phase 2: Convert Frontend to Vanilla JS (2 hours)
1. Keep DinkOWL's HTML structure
2. Convert React components to plain JS
3. Adapt state management (no hooks)
4. Keep same UI patterns
5. Add SMASH branding (colors, mascot)

### Phase 3: Add New Features (2 hours)
1. Screenshot upload + Haiku vision
2. Download transcript
3. Rating system
4. Analytics tracking

### Phase 4: Testing & Deploy (1 hour)
1. Test template matching accuracy
2. Test PII masking
3. Test language detection
4. Deploy to hosting

**Total: 7 hours** (vs 18-20 hours building from scratch)

---

## Lessons Learned

**Date:** March 5, 2026

**Mistake:** Started building SMASH bot from scratch, wasting time recreating patterns that already exist in DinkOWL.

**Lesson:** DinkOWL's chat infrastructure was designed to be reusable. Always start with proven, battle-tested code. Adapt, don't rebuild.

**Future:** For ANY support bot or chat interface, start with `~/shared/recplay/components/chat-support/` and adapt it.

---

## Why This Approach Works

1. **Proven patterns** - DinkOWL's chat is production-ready
2. **Security built-in** - Rate limiting, validation already tested
3. **Better UX** - UI patterns already optimized
4. **Faster development** - 60-70% time savings
5. **Maintainability** - Similar structure to DinkOWL (easier to maintain)
6. **Tim's intent** - System was built to be reusable across projects

---

**Status:** Architecture revised, ready to implement with DinkOWL adaptation approach
