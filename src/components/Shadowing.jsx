import React, { useState, useEffect } from 'react';

const Shadowing = ({ word, onComplete, playAudio }) => {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  useEffect(() => {
      setIsAnswerRevealed(false);
      playAudio(word.dutch);
  }, [word]);

  return (
    <div style={styles.container}>
      <h1 style={styles.dutchWord}>{word.dutch}</h1>
      <button onClick={() => playAudio(word.dutch)} style={styles.audioButton}>
        🔊 Play Audio
      </button>

      {!isAnswerRevealed ? (
        <button onClick={() => setIsAnswerRevealed(true)} style={{...styles.button, width: '100%', marginTop: '2rem'}}>
          Reveal Answer
        </button>
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
    color: '#1f2937'
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
