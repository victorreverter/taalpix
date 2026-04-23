/**
 * Generate MP3 audio files for all Dutch words
 * Uses Google Translate TTS (free, no API key needed)
 * 
 * Run with: node scripts/generate-audio.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dutch words from the database
const dutchWords = [
  // Het Kantoor
  'ik',
  'jij',
  'wij',
  'werk',
  'bureau',
  'collega',
  'computer',
  
  // De Jumbo
  'boodschappen',
  'winkel',
  'winkelwagen',
  'kassa',
  'betalen',
  'euro',
  'duur',
  
  // Het Park
  'wandelen',
  'hond',
  'bankje',
  'zon',
  'picknick',
  'mooi',
  'rustig',
  
  // Common phrases
  'hallo',
  'goedemorgen',
  'dank je wel',
  'alsjeblieft',
  'tot ziens',
];

const outputDir = path.join(__dirname, '../public/audio');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created audio directory:', outputDir);
}

/**
 * Download audio from Google Translate TTS
 */
function downloadAudio(text, outputPath) {
  return new Promise((resolve, reject) => {
    // Google Translate TTS URL
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=nl&client=tw-ob`;
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Generated: ${text} → ${path.basename(outputPath)}`);
          resolve();
        });
      } else {
        file.close();
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {}); // Delete incomplete file
      reject(error);
    });
  });
}

/**
 * Generate filename from text
 */
function getFilename(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_') + '.mp3';
}

/**
 * Main function
 */
async function generateAll() {
  console.log('🎵 Starting audio generation for', dutchWords.length, 'words...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const word of dutchWords) {
    const filename = getFilename(word);
    const outputPath = path.join(outputDir, filename);
    
    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping: ${word} (already exists)`);
      successCount++;
      continue;
    }
    
    try {
      await downloadAudio(word, outputPath);
      successCount++;
      
      // Be nice to the service - add delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Failed: ${word} - ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Audio generation complete!`);
  console.log(`   Success: ${successCount}/${dutchWords.length}`);
  console.log(`   Failed: ${failCount}/${dutchWords.length}`);
  console.log(`   Output: ${outputDir}`);
  console.log('='.repeat(50));
}

// Run
generateAll().catch(console.error);
