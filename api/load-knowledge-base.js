// SMASH Support Bot - Knowledge Base Loader
// Loads the 18 Spanish support templates

const fs = require('fs');
const path = require('path');

function loadKnowledgeBase() {
  try {
    const kbPath = path.join(__dirname, '..', 'SMASH_Spanish_Support_Knowledge_Base.md');
    const knowledgeBase = fs.readFileSync(kbPath, 'utf8');
    return knowledgeBase;
  } catch (error) {
    console.error('Failed to load knowledge base:', error);
    return ''; // Return empty string if file not found
  }
}

module.exports = { loadKnowledgeBase };
