import React, { useState, useEffect, useRef } from 'react';

const Writing = ({ word, onComplete }) => {
  const [input, setInput] = useState('');
  const [hasGuessedWrong, setHasGuessedWrong] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Reset state and focus on new word
    setInput('');
    setHasGuessedWrong(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [word]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (input.trim().toLowerCase() === word.dutch.toLowerCase()) {
      if (!hasGuessedWrong) {
         onComplete(4, 'writing'); // Correct on first try
      } else {
         onComplete(1, 'writing'); // Corrected after failing
      }
    } else {
      setHasGuessedWrong(true);
      setInput(''); 
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.spanishWord}>{word.spanish}</h2>
      <p style={styles.instruction}>Type the Dutch translation:</p>

      {hasGuessedWrong && (
        <div style={styles.wrongFeedback}>
          <p style={{margin: 0, color: '#dc2626', fontWeight: 'bold'}}>Incorrect! The correct word is:</p>
          <h3 style={{color: '#dc2626', margin: '0.5rem 0', fontSize: '2rem'}}>{word.dutch}</h3>
          <p style={{fontSize: '0.85rem', color: '#666', margin: 0}}>Please type it correctly below to proceed. (Grade: 1)</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{...styles.input, borderColor: hasGuessedWrong ? '#ef4444' : '#d1d5db'}}
          placeholder="Type here..."
          autoComplete="off"
        />
        <button type="submit" style={styles.submitButton}>Submit</button>
      </form>
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
  spanishWord: {
    fontSize: '2.5rem',
    margin: '0 0 1rem 0',
    color: '#1f2937',
    textAlign: 'center'
  },
  instruction: {
    color: '#4b5563',
    marginBottom: '2rem'
  },
  wrongFeedback: {
    backgroundColor: '#fee2e2',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '1.5rem',
    width: '100%',
    maxWidth: '400px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '400px',
    gap: '1rem'
  },
  input: {
    padding: '1rem',
    fontSize: '1.25rem',
    borderRadius: '8px',
    border: '2px solid',
    textAlign: 'center',
    outline: 'none'
  },
  submitButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default Writing;
