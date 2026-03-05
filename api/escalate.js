// SMASH Support Bot - Escalation API
// Sends email to tim@languages4.com + Telegram notification

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

async function sendEmail(subject, body, sessionId) {
  // TODO: Implement with Resend or SendGrid
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  //
  // await resend.emails.send({
  //   from: 'SMASH Support <support@smasheducation.com>',
  //   to: 'tim@languages4.com',
  //   subject,
  //   html: body
  // });

  console.log('EMAIL ESCALATION:', { subject, sessionId });
}

async function sendTelegramNotification(message, sessionId) {
  // TODO: Implement Telegram notification
  // const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  // const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  //
  // await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     chat_id: TELEGRAM_CHAT_ID,
  //     text: message,
  //     parse_mode: 'HTML'
  //   })
  // });

  console.log('TELEGRAM ESCALATION:', { message, sessionId });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Internal auth check
  const internalSecret = req.headers['x-internal-request'];
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { sessionId, messages, reason, appContext } = req.body;

    if (!sessionId || !messages) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build escalation context
    const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0];
    const conversationLength = messages.length;

    // Email subject
    const subject = `🚨 SMASH Support Escalation - ${reason || 'Student needs help'}`;

    // Email body
    const emailBody = `
      <h2>SMASH Support Bot Escalation</h2>
      <p><strong>Session ID:</strong> ${sessionId}</p>
      <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
      <p><strong>Messages in conversation:</strong> ${conversationLength}</p>
      <p><strong>Last student message:</strong></p>
      <blockquote>${lastUserMessage?.content || 'N/A'}</blockquote>
      
      <h3>Full Conversation:</h3>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${messages.map(m => `
          <div style="margin-bottom: 10px;">
            <strong>${m.role === 'user' ? '👤 Student' : '🤖 Smashy'}:</strong>
            <p style="margin: 5px 0;">${m.content}</p>
          </div>
        `).join('')}
      </div>
      
      <p><em>Please follow up with this student directly at tim@languages4.com</em></p>
    `;

    // Telegram message (shorter version)
    const telegramMessage = `
🚨 <b>SMASH Support Escalation</b>

<b>Reason:</b> ${reason || 'Student needs help'}
<b>Session:</b> ${sessionId}
<b>Messages:</b> ${conversationLength}

<b>Last message:</b>
${lastUserMessage?.content?.substring(0, 200) || 'N/A'}

→ Check email for full conversation
    `.trim();

    // Send notifications
    await Promise.all([
      sendEmail(subject, emailBody, sessionId),
      sendTelegramNotification(telegramMessage, sessionId)
    ]);

    // TODO: Log to Supabase
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(
    //   process.env.SUPABASE_URL,
    //   process.env.SUPABASE_ANON_KEY
    // );
    //
    // await supabase.from('escalations').insert({
    //   session_id: sessionId,
    //   reason,
    //   message_count: conversationLength,
    //   last_message: lastUserMessage?.content,
    //   created_at: new Date().toISOString()
    // });

    return res.status(200).json({ 
      success: true,
      escalated: true
    });

  } catch (error) {
    console.error('Escalation API error:', error);
    return res.status(500).json({ error: 'Failed to escalate' });
  }
}
