import React, { useState, useEffect, useRef } from 'react';

const Shadowing = ({ word, onComplete, playAudio, isSpeakingEnabled }) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
      setIsAnswerRevealed(false);
      setTranscript('');
      setIsRecording(false);
      playAudio(word.dutch);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
          setIsSupported(true);
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.lang = 'nl-NL';
          recognitionRef.current.interimResults = true;
          
          recognitionRef.current.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
          };
          
          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
          };
          
          recognitionRef.current.onend = () => {
            setIsRecording(false);
          };
      } else {
          setIsSupported(false);
      }
  }, [word]);

  const startRecording = () => {
    if (recognitionRef.current && isSpeakingEnabled) {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recognition already started or error:", err);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.dutchWord}>{word.dutch}</h1>
      <button onClick={() => playAudio(word.dutch)} style={styles.audioButton}>
        🔊 Play Audio
      </button>

      {!isAnswerRevealed ? (
         <div style={{width: '100%', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
            
            {isSpeakingEnabled && isSupported && (
                <div style={styles.speechContainer}>
                    <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        style={{
                            ...styles.micButton, 
                            backgroundColor: isRecording ? '#ef4444' : '#f3f4f6',
                            color: isRecording ? 'white' : '#4b5563',
                            border: isRecording ? '2px solid #ef4444' : '2px solid #e5e7eb'
                        }}
                    >
                        {isRecording ? '🎤 Listening...' : '🎤 Hold Space or Click to Speak'}
                    </button>
                    {transcript && (
                        <p style={styles.transcriptText}>"{transcript}"</p>
                    )}
                </div>
            )}
            
            <button onClick={() => setIsAnswerRevealed(true)} style={{...styles.button, width: '100%'}}>
              Reveal Answer
            </button>
        </div>
      ) : (
        <div style={styles.back}>
          <hr style={styles.divider} />
          
          <h2 style={styles.translation}>{word.spanish}</h2>
          
          {(word.example_sentence_dutch || word.example_sentence_spanish) && (
              <div style={styles.examples}>
                <p style={styles.exampleText}><em>"{word.example_sentence_dutch}"</em></p>
                <p style={styles.exampleTranslation}>{word.example_sentence_spanish}</p>
              </div>
          )}

          <div style={styles.ratingSection}>
            <p style={{marginBottom: '0.75rem', fontSize: '0.9rem', color: '#666', textAlign: 'center'}}>
              How well did you recall this?
            </p>
            <div style={styles.buttonGrid}>
              {[0, 1, 2, 3, 4, 5].map(rating => (
                <button 
                  key={rating} 
                  onClick={() => onComplete(rating, 'shadowing')}
                  style={styles.ratingButton}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginTop: '0.5rem'}}>
              <span>0 = Blackout</span>
              <span>5 = Perfect</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%'
  },
  dutchWord: {
    fontSize: '3rem',
    margin: 0,
    color: '#1f2937',
    textAlign: 'center'
  },
  speechContainer: {
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     width: '100%',
     gap: '1rem',
     backgroundColor: '#fafafa',
     padding: '1.5rem',
     borderRadius: '8px',
     border: '1px solid #e5e7eb'
  },
  micButton: {
      padding: '1rem 2rem',
      borderRadius: '30px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.1s ease',
      userSelect: 'none'
  },
  transcriptText: {
      margin: 0,
      fontSize: '1.2rem',
      color: '#2563eb',
      fontStyle: 'italic',
      textAlign: 'center'
  },
  back: {
    marginTop: '1.5rem',
    width: '100%',
    animation: 'fadeIn 0.3s ease-in'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '1.5rem 0'
  },
  translation: {
    fontSize: '2rem',
    color: '#4b5563',
    margin: '0 0 1rem 0',
    textAlign: 'center'
  },
  examples: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  exampleText: {
    margin: '0 0 0.5rem 0',
    color: '#111827'
  },
  exampleTranslation: {
    margin: 0,
    color: '#6b7280',
    fontSize: '0.9rem'
  },
  ratingSection: {
    marginTop: 'auto',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '0.5rem'
  },
  ratingButton: {
    padding: '1rem 0',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 0.2s'
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  audioButton: {
    backgroundColor: '#f3f4f6',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    cursor: 'pointer',
    color: '#4b5563',
    fontWeight: '600',
    marginTop: '1rem'
  }
};

export default Shadowing;
