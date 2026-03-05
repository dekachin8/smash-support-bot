// SMASH Support Bot - Rating API
// Captures student feedback on conversation quality

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, rating, comment, language } = req.body;

    // Validate
    if (!sessionId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1-5' });
    }

    // TODO: Save to Supabase
    // const { createClient } = await import('@supabase/supabase-js');
    // const supabase = createClient(
    //   process.env.SUPABASE_URL,
    //   process.env.SUPABASE_ANON_KEY
    // );
    //
    // const { error } = await supabase
    //   .from('ratings')
    //   .insert({
    //     session_id: sessionId,
    //     rating,
    //     comment: comment || null,
    //     language,
    //     created_at: new Date().toISOString()
    //   });
    //
    // if (error) {
    //   console.error('Supabase error:', error);
    //   throw error;
    // }

    console.log('Rating received:', {
      sessionId,
      rating,
      comment: comment ? `${comment.substring(0, 50)}...` : null,
      language
    });

    return res.status(200).json({
      success: true,
      message: language === 'es' ? 'Gracias por tu calificación' : 'Thank you for your rating'
    });

  } catch (error) {
    console.error('Rating API error:', error);
    return res.status(500).json({ error: 'Failed to save rating' });
  }
}
