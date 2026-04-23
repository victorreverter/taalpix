import React, { useState, useEffect } from 'react';
import { playAudio, getAudioStatus, initAudio } from '../lib/audio';
import Header from '../components/common/Header';
import PixelCard from '../components/common/PixelCard';
import PixelButton from '../components/common/PixelButton';

const AudioDebug = () => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (type, message) => {
      setLogs(prev => [...prev.slice(-20), { type, message, time: new Date().toLocaleTimeString() }]);
    };

    console.log = (...args) => {
      addLog('log', args.join(' '));
      originalLog(...args);
    };

    console.warn = (...args) => {
      addLog('warn', args.join(' '));
      originalWarn(...args);
    };

    console.error = (...args) => {
      addLog('error', args.join(' '));
      originalError(...args);
    };

    // Get initial status
    setStatus(getAudioStatus());

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const handlePlay = async (text) => {
    setIsPlaying(true);
    addLog('action', `Playing: ${text}`);
    try {
      const result = await playAudio(text);
      addLog('result', `Play result: ${result ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      addLog('error', `Play error: ${error.message}`);
    }
    setIsPlaying(false);
  };

  const addLog = (type, message) => {
    setLogs(prev => [...prev.slice(-20), { type, message, time: new Date().toLocaleTimeString() }]);
  };

  const handleRefreshStatus = () => {
    setStatus(getAudioStatus());
    addLog('action', 'Status refreshed');
  };

  return (
    <div className="min-h-screen bg-tp-bg">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <PixelCard className="p-6 mb-6">
          <h1 className="font-pixel text-2xl text-tp-text mb-6">
            🔊 Audio Debug Page
          </h1>

          {/* Status */}
          <div className="mb-6 p-4 bg-tp-surface2 border-2 border-solid border-tp-border">
            <h2 className="font-pixel text-sm text-tp-text mb-4">Current Status</h2>
            {status && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-tp-text3">Mode:</span>
                  <span className="ml-2 font-pixel">{status.mode}</span>
                </div>
                <div>
                  <span className="text-tp-text3">Initialized:</span>
                  <span className="ml-2 font-pixel">{status.isInitialized ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div>
                  <span className="text-tp-text3">Cached Files:</span>
                  <span className="ml-2 font-pixel">{status.cachedFiles}</span>
                </div>
                <div>
                  <span className="text-tp-text3">Speech Available:</span>
                  <span className="ml-2 font-pixel">{status.speechAvailable ? '✅ Yes' : '❌ No'}</span>
                </div>
              </div>
            )}
            <PixelButton
              variant="outline"
              size="small"
              onClick={handleRefreshStatus}
              className="mt-4"
            >
              Refresh Status
            </PixelButton>
          </div>

          {/* Test Buttons */}
          <div className="mb-6">
            <h2 className="font-pixel text-sm text-tp-text mb-4">Test Audio Playback</h2>
            <div className="grid grid-cols-3 gap-3">
              <PixelButton
                variant="primary"
                size="small"
                onClick={() => handlePlay('hallo')}
                disabled={isPlaying}
              >
                {isPlaying ? 'Playing...' : 'Play "hallo"'}
              </PixelButton>
              <PixelButton
                variant="primary"
                size="small"
                onClick={() => handlePlay('ik')}
                disabled={isPlaying}
              >
                {isPlaying ? 'Playing...' : 'Play "ik"'}
              </PixelButton>
              <PixelButton
                variant="primary"
                size="small"
                onClick={() => handlePlay('dank je wel')}
                disabled={isPlaying}
              >
                {isPlaying ? 'Playing...' : 'Play "dank je wel"'}
              </PixelButton>
            </div>
          </div>

          {/* Direct Audio Test */}
          <div className="mb-6 p-4 bg-tp-surface2 border-2 border-solid border-tp-border">
            <h2 className="font-pixel text-sm text-tp-text mb-4">Direct HTML5 Audio Test</h2>
            <audio controls src="/audio/hallo.mp3" className="w-full mb-2">
              Your browser does not support audio
            </audio>
            <p className="text-xs text-tp-text3">
              Try using the player above - if you hear audio, HTML5 audio works in your browser
            </p>
          </div>

          {/* Logs */}
          <div>
            <h2 className="font-pixel text-sm text-tp-text mb-4">Console Logs</h2>
            <div className="p-4 bg-tp-surface border-2 border-solid border-tp-border h-96 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-tp-text3">No logs yet. Click a button above to test audio.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`mb-1 ${
                    log.type === 'error' ? 'text-tp-error' :
                    log.type === 'warn' ? 'text-tp-warning' :
                    log.type === 'action' ? 'text-tp-primary' :
                    log.type === 'result' ? 'text-tp-success' :
                    'text-tp-text'
                  }`}>
                    <span className="text-tp-text3">[{log.time}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </PixelCard>
      </main>
    </div>
  );
};

export default AudioDebug;
