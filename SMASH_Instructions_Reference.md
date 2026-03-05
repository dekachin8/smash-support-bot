# SMASH Instructions Reference

**Source:** Official SMASH student instructions (PowerPoint)  
**Use:** Knowledge base for support bot to answer student questions

---

## 1. Account Access

**Login URL:** https://login.smasheducation.com/login

**Credentials:**
- **Username:** Student's university email address
- **Password:** `smash` (default password - case sensitive!)

**Browser:** Use Google Chrome (recommended)

---

## 2. Payment Process

**Cost:** $35 USD

**Important Note:**  
- The system may display the amount as **$48 CAD** (Canadian dollars)
- **Don't panic!** The actual charge is **$35 USD**
- This is a currency conversion display issue - student will only be charged $35 USD

**Browser:** Use Google Chrome to access the payment lab

---

## 3. Diagnostic Test Instructions

### Purpose
The diagnostic test serves as a **placement tool** based on **CEFR** (Common European Framework of Reference for Languages).

Missions are assigned based on proficiency revealed after the test.

### CEFR Levels Used
- **Level A** (Beginner)
- **Level B** (Intermediate)
- **Level C** (Advanced)

### If Test Is Interrupted

**Steps to resume:**
1. Log in to your account again
2. Look for an **orange button** that says **"RESUME TEST"**
3. Click the RESUME TEST button to continue where you left off

**If RESUME TEST doesn't respond:**
- You will need to **start the test again from the beginning**

### If Placement Seems Wrong

If you believe your placement is not what you expected after finishing the test:
- You will need to **start the test from the beginning** (no way to adjust placement without retaking)

---

## Support Bot Integration Notes

**Common student issues this addresses:**

1. **Can't login** → Check username (must be university email), password (smash1)
2. **Payment shows $48 CAD** → Reassure: actual charge is $35 USD, just a display issue
3. **Test interrupted** → Tell them to look for orange RESUME TEST button
4. **RESUME TEST not working** → They'll need to restart test from beginning
5. **Unhappy with placement** → Must retake test from beginning to change placement

**Template matches:**
- Login issues → Template #1 (general login help)
- Password issues → Template #2-5 (password reset, forgot password)
- Payment issues → Template #13-14 (payment troubleshooting)
- Diagnostic test issues → **NEW CATEGORY** (not in existing 18 templates)

**Escalation trigger:**
- If student has technical issues with the diagnostic test itself (not covered in templates)
- If RESUME TEST button genuinely doesn't work (may need admin intervention)
- If payment actually fails (not just $48 CAD display confusion)

---

**Status:** Ready for integration into chat.js system prompt
