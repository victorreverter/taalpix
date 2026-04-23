/**
 * MP3-based Audio System for TaalPix
 * Uses pre-generated MP3 files with Web Speech API fallback
 */

const AUDIO_BASE_URL = '/audio/';
const AUDIO_EXTENSION = '.mp3';

class MP3AudioPlayer {
  constructor() {
    this.audioCache = new Map();
    this.fallbackToSpeech = false;
    this.synth = window.speechSynthesis;
    this.dutchVoice = null;
    this.isInitialized = false;
  }

  /**
   * Initialize audio system
   */
  async init() {
    if (this.isInitialized) {
      console.log('🎵 Already initialized, fallback:', this.fallbackToSpeech);
      return !this.fallbackToSpeech;
    }

    console.log('🎵 Initializing audio system...');

    // Try to load Dutch voice for fallback
    if (this.synth) {
      const voices = this.synth.getVoices();
      this.dutchVoice = voices.find(v => 
        v.lang === 'nl-NL' || 
        v.lang === 'nl' || 
        v.name.includes('Dutch')
      ) || voices[0];
      console.log('🎯 Fallback voice:', this.dutchVoice?.name);
    }

    // Test if MP3 files exist with retry
    let mp3Works = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🔄 Testing MP3 (attempt ${attempt + 1}/3)...`);
        await this.testAudioFile('hallo');
        mp3Works = true;
        break;
      } catch (error) {
        console.warn(`⚠️ Test failed, attempt ${attempt + 1}`);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    this.fallbackToSpeech = !mp3Works;
    this.isInitialized = true;
    
    if (mp3Works) {
      console.log('✅ MP3 audio system initialized - using MP3 files');
    } else {
      console.warn('⚠️ MP3 files not found, using Web Speech API fallback');
    }
    
    return mp3Works;
  }

  /**
   * Test if an audio file exists
   */
  async testAudioFile(filename = 'hallo') {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const src = `${AUDIO_BASE_URL}${filename}${AUDIO_EXTENSION}`;
      
      console.log('🔍 Testing:', src);
      
      audio.oncanplaythrough = () => {
        console.log('✅ MP3 file can play:', filename);
        resolve(true);
      };
      
      audio.onerror = (error) => {
        console.warn('❌ MP3 file error:', filename, error);
        reject(false);
      };
      
      audio.src = src;
      audio.load();
    });
  }

  /**
   * Get audio file path for a word
   */
  getAudioPath(text) {
    const filename = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    const path = `${AUDIO_BASE_URL}${filename}${AUDIO_EXTENSION}`;
    console.log('🎵 Audio path:', text, '→', path);
    return path;
  }

  /**
   * Play audio for text
   */
  async play(text, lang = 'nl-NL') {
    console.log('🔊 Play requested:', text);
    
    if (!text) {
      console.warn('❌ No text provided for audio');
      return false;
    }

    // Ensure initialized
    if (!this.isInitialized) {
      console.log('⏳ Not initialized, initializing...');
      await this.init();
    }

    // If MP3 files are available
    if (!this.fallbackToSpeech) {
      console.log('🎵 Using MP3 playback');
      const result = await this.playMP3(text);
      if (result) return true;
      // If MP3 fails, fall through to speech
      console.log('⚠️ MP3 failed, falling back to speech');
    }

    // Fallback to Web Speech API
    console.log('🗣️ Using Web Speech fallback');
    return this.playSpeech(text, lang);
  }

  /**
   * Play MP3 file
   */
  async playMP3(text) {
    const audioPath = this.getAudioPath(text);

    // Check cache
    if (this.audioCache.has(audioPath)) {
      const audio = this.audioCache.get(audioPath);
      audio.currentTime = 0;
      try {
        console.log('🔊 Playing cached MP3:', text);
        await audio.play();
        return true;
      } catch (error) {
        console.warn('⚠️ Cached audio play failed:', error);
        this.audioCache.delete(audioPath);
      }
    }

    // Load and play
    console.log('🎵 Loading new MP3:', audioPath);
    return new Promise((resolve) => {
      const audio = new Audio();
      
      audio.oncanplaythrough = async () => {
        console.log('✅ MP3 loaded, playing:', text);
        this.audioCache.set(audioPath, audio);
        try {
          await audio.play();
          console.log('🔊 MP3 playing successfully');
          resolve(true);
        } catch (error) {
          console.error('❌ MP3 play() failed:', error);
          resolve(false);
        }
      };

      audio.onerror = (error) => {
        console.error('❌ MP3 load error:', error);
        resolve(false);
      };

      audio.src = audioPath;
      audio.preload = 'auto';
      audio.load();
    });
  }

  /**
   * Play using Web Speech API (fallback)
   */
  async playSpeech(text, lang = 'nl-NL') {
    if (!this.synth) {
      console.warn('❌ Speech synthesis not available');
      return false;
    }

    // Cancel ongoing speech
    try {
      this.synth.cancel();
    } catch (e) {
      // Ignore
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.75;
    utterance.pitch = 0.95;
    utterance.volume = 1.0;

    if (this.dutchVoice) {
      utterance.voice = this.dutchVoice;
    }

    utterance.onstart = () => {
      console.log('🔊 Speech started:', text);
    };

    utterance.onend = () => {
      console.log('✅ Speech ended:', text);
    };

    utterance.onerror = (event) => {
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.error('❌ Speech error:', event.error, event);
      }
    };

    try {
      console.log('🗣️ Speaking:', text);
      this.synth.speak(utterance);
      return true;
    } catch (error) {
      console.error('❌ Speech failed:', error);
      return false;
    }
  }

  /**
   * Get status for debugging
   */
  getStatus() {
    return {
      mode: this.fallbackToSpeech ? 'Web Speech API' : 'MP3 Files',
      cachedFiles: this.audioCache.size,
      speechAvailable: !!this.synth,
      dutchVoice: this.dutchVoice?.name || null,
      isInitialized: this.isInitialized,
    };
  }
}

// Create singleton
const mp3AudioPlayer = new MP3AudioPlayer();

// Auto-initialize
if (typeof window !== 'undefined') {
  console.log('🎵 Audio module loaded, auto-initializing...');
  setTimeout(() => {
    mp3AudioPlayer.init();
  }, 100);
}

// Export functions
export const playAudio = (text, lang = 'nl-NL') => {
  console.log('🎵 playAudio called:', text);
  return mp3AudioPlayer.play(text, lang);
};

export const initAudio = () => {
  return mp3AudioPlayer.init();
};

export const preloadAudio = (words) => {
  mp3AudioPlayer.preload(words);
};

export const getAudioStatus = () => {
  return mp3AudioPlayer.getStatus();
};

// Export for debugging
window.taalpixAudio = mp3AudioPlayer;
