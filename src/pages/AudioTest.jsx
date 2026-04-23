import React, { useState, useEffect } from 'react';
import { playAudio, getAudioStatus, initAudio } from '../lib/audio';
import Header from '../components/common/Header';
import PixelCard from '../components/common/PixelCard';
import PixelButton from '../components/common/PixelButton';

const AudioTest = () => {
  const [status, setStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const statusData = getAudioStatus();
    setStatus(statusData);
  }, []);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test by playing a word
      const result = await playAudio('Hallo');
      setTestResult({
        success: result,
        message: result ? '✅ Audio is working!' : '❌ Audio test failed',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Error: ${error.message}`,
      });
    }
    
    setIsTesting(false);
  };

  const handlePlayDutch = async (text) => {
    const played = await playAudio(text);
    setTestResult({
      success: played,
      message: played ? `✅ Played: "${text}"` : `❌ Failed to play: "${text}"`,
    });
  };

  if (!status) {
    return (
      <div className="min-h-screen bg-tp-bg">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="font-pixel text-tp-text">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tp-bg">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <PixelCard className="p-8 mb-6">
          <h1 className="font-pixel text-2xl text-tp-text mb-6">
            🔊 Audio System Test
          </h1>

          <div className="space-y-6">
            {/* Status */}
            <div className="p-4 bg-tp-surface2 border-2 border-solid border-tp-border">
              <h2 className="font-pixel text-sm text-tp-text mb-4">
                System Status
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-tp-text3">Audio Mode:</span>
                  <span className={`ml-2 font-pixel ${status.mode === 'MP3 Files' ? 'text-tp-success' : 'text-tp-warning'}`}>
                    {status.mode === 'MP3 Files' ? '✅ MP3 Files' : '⚠️ Web Speech'}
                  </span>
                </div>
                <div>
                  <span className="text-tp-text3">Cached Files:</span>
                  <span className="ml-2 font-pixel text-tp-text">{status.cachedFiles}</span>
                </div>
                <div>
                  <span className="text-tp-text3">Speech Fallback:</span>
                  <span className={`ml-2 font-pixel ${status.speechAvailable ? 'text-tp-success' : 'text-tp-error'}`}>
                    {status.speechAvailable ? '✅ Available' : '❌ Not Available'}
                  </span>
                </div>
                {status.dutchVoice && (
                  <div>
                    <span className="text-tp-text3">Fallback Voice:</span>
                    <span className="ml-2 font-pixel text-tp-text">{status.dutchVoice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Button */}
            <div className="text-center">
              <PixelButton
                variant="primary"
                size="large"
                onClick={handleTest}
                disabled={isTesting}
              >
                {isTesting ? 'Testing...' : '🧪 Run Full Audio Test'}
              </PixelButton>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`p-4 border-2 border-solid text-center ${
                testResult.success
                  ? 'bg-tp-success-light border-tp-success'
                  : 'bg-tp-error-light border-tp-error'
              }`}>
                <p className="font-pixel text-sm">{testResult.message}</p>
              </div>
            )}

            {/* Manual Test */}
            <div className="p-4 bg-tp-surface2 border-2 border-solid border-tp-border">
              <h2 className="font-pixel text-sm text-tp-text mb-4">
                Manual Test - Click to Play
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <PixelButton
                  variant="outline"
                  size="small"
                  onClick={() => handlePlayDutch('Hallo')}
                >
                  Hallo
                </PixelButton>
                <PixelButton
                  variant="outline"
                  size="small"
                  onClick={() => handlePlayDutch('Goedemorgen')}
                >
                  Goedemorgen
                </PixelButton>
                <PixelButton
                  variant="outline"
                  size="small"
                  onClick={() => handlePlayDutch('Dank je wel')}
                >
                  Dank je wel
                </PixelButton>
                <PixelButton
                  variant="outline"
                  size="small"
                  onClick={() => handlePlayDutch('Ik leer Nederlands')}
                >
                  Ik leer Nederlands
                </PixelButton>
                <PixelButton
                  variant="outline"
                  size="small"
                  onClick={() => handlePlayDutch('Tot ziens')}
                >
                  Tot ziens
                </PixelButton>
                <PixelButton
                  variant="outline"
                  size="small"
                  onClick={() => handlePlayDutch('Alsjeblieft')}
                >
                  Alsjeblieft
                </PixelButton>
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="p-4 bg-tp-warning-light border-2 border-solid border-tp-warning">
              <h2 className="font-pixel text-sm text-tp-text mb-2">
                ℹ️ Audio System Info
              </h2>
              <ul className="text-tp-text2 text-sm space-y-1 list-disc list-inside">
                <li>✅ Using MP3 files for reliable playback</li>
                <li>✅ Works on all browsers (Chrome, Edge, Safari, Firefox)</li>
                <li>✅ Works on mobile devices (iOS, Android)</li>
                <li>✅ No internet needed after first load (cached)</li>
                <li>⚠️ Falls back to Web Speech API if MP3 not found</li>
              </ul>
            </div>
          </div>
        </PixelCard>
      </main>
    </div>
  );
};

export default AudioTest;
