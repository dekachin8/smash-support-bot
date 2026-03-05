// SMASH Support Bot - Rating Handler
// Capture student feedback on conversation quality

class RatingHandler {
  constructor() {
    this.ratingSection = document.getElementById('ratingSection');
    this.ratingButtons = document.querySelectorAll('.rating-btn');
    this.ratingComment = document.getElementById('ratingComment');
    this.submitRatingBtn = document.getElementById('submitRatingBtn');
    
    this.selectedRating = null;
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    // Rating button clicks
    this.ratingButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectRating(parseInt(btn.dataset.rating));
      });
    });
    
    // Submit rating
    this.submitRatingBtn?.addEventListener('click', () => {
      this.submitRating();
    });
  }
  
  selectRating(rating) {
    this.selectedRating = rating;
    
    // Update UI
    this.ratingButtons.forEach(btn => {
      const btnRating = parseInt(btn.dataset.rating);
      btn.classList.toggle('selected', btnRating === rating);
    });
  }
  
  async submitRating() {
    if (!this.selectedRating) {
      const language = window.currentLanguage || 'es';
      const msg = language === 'es'
        ? 'Por favor selecciona una calificación'
        : 'Please select a rating';
      alert(msg);
      return;
    }
    
    const comment = this.ratingComment.value.trim();
    const sessionId = window.chatHandler?.sessionId;
    
    try {
      const response = await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          rating: this.selectedRating,
          comment,
          language: window.currentLanguage || 'es'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
      
      // Thank you message
      const language = window.currentLanguage || 'es';
      const thankYou = language === 'es'
        ? '¡Gracias por tu comentario! 🙏'
        : 'Thank you for your feedback! 🙏';
      
      alert(thankYou);
      
      // Hide rating section
      this.ratingSection.style.display = 'none';
      
    } catch (error) {
      console.error('Rating submission error:', error);
      const language = window.currentLanguage || 'es';
      const errorMsg = language === 'es'
        ? 'Error al enviar calificación'
        : 'Error submitting rating';
      alert(errorMsg);
    }
  }
  
  show() {
    this.ratingSection.style.display = 'block';
  }
  
  hide() {
    this.ratingSection.style.display = 'none';
  }
  
  reset() {
    this.selectedRating = null;
    this.ratingComment.value = '';
    this.ratingButtons.forEach(btn => btn.classList.remove('selected'));
  }
}

// Initialize on page load
let ratingHandler;

document.addEventListener('DOMContentLoaded', () => {
  ratingHandler = new RatingHandler();
  window.ratingHandler = ratingHandler;
});
