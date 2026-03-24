import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MultipleChoice = ({ word, onComplete, playAudio }) => {
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasGuessedWrong, setHasGuessedWrong] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistractors = async () => {
      setLoading(true);
      // Fetch distractors (words other than current)
      const { data } = await supabase
        .from('words')
        .select('spanish')
        .neq('id', word.id)
        .limit(20);

      const allDistractors = (data || []).map(w => w.spanish);
      const shuffledDistractors = allDistractors.sort(() => 0.5 - Math.random());
      const selectedDistractors = shuffledDistractors.slice(0, 3);
      
      const allOptions = [...selectedDistractors, word.spanish].sort(() => 0.5 - Math.random());
      setOptions(allOptions);
      setLoading(false);
    };

    fetchDistractors();
    playAudio(word.dutch);
  }, [word]);

  const handleOptionClick = (option) => {
    if (selectedAnswer !== null) return; 
    
    if (option === word.spanish) {
      setSelectedAnswer(option);
      if (!hasGuessedWrong) {
        // Correct on first try assigns a quality of 4
        setTimeout(() => onComplete(4, 'multipleChoice'), 800); 
      }
    } else {
      setHasGuessedWrong(true);
      setSelectedAnswer('wrong'); 
    }
  };

  const handleNext = () => {
    onComplete(1, 'multipleChoice');
  };

  if (loading) return <div style={styles.loading}>Generating options...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.dutchWord}>{word.dutch}</h1>
      <button onClick={() => playAudio(word.dutch)} style={styles.audioButton}>
        🔊 Play Audio
      </button>

      <div style={styles.optionsGrid}>
        {options.map((option, idx) => {
          let bgColor = '#f3f4f6';
          let textColor = '#374151';

          if (hasGuessedWrong && option === word.spanish) {
            bgColor = '#dcfce7'; 
            textColor = '#166534';
          } else if (hasGuessedWrong && option !== word.spanish) {
             bgColor = '#f3f4f6';
             textColor = '#9ca3af'; // dim incorrect options
          }

          if (selectedAnswer === option && selectedAnswer === word.spanish) {
              bgColor = '#dcfce7'; 
              textColor = '#166534';
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              style={{...styles.optionButton, backgroundColor: bgColor, color: textColor}}
              disabled={(hasGuessedWrong && option !== word.spanish) || (selectedAnswer !== null && selectedAnswer === word.spanish)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {hasGuessedWrong && (
        <div style={styles.wrongFeedback}>
          <p style={{color: '#dc2626', margin: '0 0 1rem 0'}}>Incorrect. Review the correct answer above.</p>
          <button onClick={handleNext} style={styles.nextButton}>Continue (Grade: 1)</button>
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
  loading: {
    padding: '2rem',
    color: '#6b7280'
  },
  dutchWord: {
    fontSize: '3rem',
    margin: 0,
    color: '#1f2937'
  },
  audioButton: {
    backgroundColor: '#f3f4f6',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    cursor: 'pointer',
    color: '#4b5563',
    fontWeight: '600',
    marginTop: '1rem',
    marginBottom: '2rem'
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    maxWidth: '400px'
  },
  optionButton: {
    padding: '1rem',
    fontSize: '1.1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  wrongFeedback: {
    marginTop: '2rem',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px'
  },
  nextButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%'
  }
};

export default MultipleChoice;
