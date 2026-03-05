// SMASH Support Bot - Screenshot Handler
// Haiku vision support for analyzing error screenshots

class ScreenshotHandler {
  constructor() {
    this.screenshotInput = document.getElementById('screenshotInput');
    this.screenshotPreview = document.getElementById('screenshotPreview');
    this.screenshotImage = document.getElementById('screenshotImage');
    this.removeScreenshotBtn = document.getElementById('removeScreenshotBtn');
    
    this.currentScreenshot = null;
    this.maxSize = 5 * 1024 * 1024; // 5MB max
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    // File input change
    this.screenshotInput?.addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files[0]);
    });
    
    // Remove screenshot button
    this.removeScreenshotBtn?.addEventListener('click', () => {
      this.clearScreenshot();
    });
    
    // Paste support (Ctrl+V / Cmd+V)
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            this.handleFileSelect(file);
          }
        }
      }
    });
    
    // Drag and drop
    const inputArea = document.getElementById('inputArea');
    inputArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      inputArea.classList.add('drag-over');
    });
    
    inputArea?.addEventListener('dragleave', () => {
      inputArea.classList.remove('drag-over');
    });
    
    inputArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      inputArea.classList.remove('drag-over');
      
      const file = e.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFileSelect(file);
      }
    });
  }
  
  async handleFileSelect(file) {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      const language = window.currentLanguage || 'es';
      const errorMsg = language === 'es'
        ? 'Por favor selecciona un archivo de imagen'
        : 'Please select an image file';
      alert(errorMsg);
      return;
    }
    
    // Validate file size
    if (file.size > this.maxSize) {
      const language = window.currentLanguage || 'es';
      const errorMsg = language === 'es'
        ? 'La imagen es demasiado grande. Máximo 5MB.'
        : 'Image is too large. Maximum 5MB.';
      alert(errorMsg);
      return;
    }
    
    try {
      // Convert to base64
      const base64 = await this.fileToBase64(file);
      
      // Store screenshot data
      this.currentScreenshot = {
        data: base64.split(',')[1], // Remove data:image/png;base64, prefix
        mimeType: file.type,
        name: file.name,
        size: file.size
      };
      
      // Update chat handler reference
      if (window.chatHandler) {
        window.chatHandler.currentScreenshot = this.currentScreenshot;
      }
      
      // Show preview
      this.showPreview(base64);
      
    } catch (error) {
      console.error('Screenshot processing error:', error);
      const language = window.currentLanguage || 'es';
      const errorMsg = language === 'es'
        ? 'Error al procesar la imagen'
        : 'Error processing image';
      alert(errorMsg);
    }
  }
  
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  showPreview(base64) {
    this.screenshotImage.src = base64;
    this.screenshotPreview.style.display = 'flex';
  }
  
  clearScreenshot() {
    this.currentScreenshot = null;
    this.screenshotPreview.style.display = 'none';
    this.screenshotImage.src = '';
    this.screenshotInput.value = '';
    
    // Clear from chat handler
    if (window.chatHandler) {
      window.chatHandler.currentScreenshot = null;
    }
  }
}

// Initialize on page load
let screenshotHandler;

document.addEventListener('DOMContentLoaded', () => {
  screenshotHandler = new ScreenshotHandler();
  
  // Make globally accessible
  window.screenshotHandler = screenshotHandler;
});
