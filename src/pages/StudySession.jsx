import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateSM2 } from '../lib/sm2';

import MultipleChoice from '../components/MultipleChoice';
import Writing from '../components/Writing';
import Shadowing from '../components/Shadowing';
import Listening from '../components/Listening';

/**
 * Helper to play audio using the Web Speech API
 */
const playAudio = (text, lang = 'nl-NL') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); // Clears any queued double-audio
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
};

const StudySession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [exerciseType, setExerciseType] = useState('shadowing');
  const [error, setError] = useState(null);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);

  // Check speech recognition support on initial mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeakingEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchQueue = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Due Words
        const { data: dueStates, error: dueError } = await supabase
          .from('user_word_states')
          .select('*, words(*)')
          .eq('user_id', user.id)
          .lte('next_review_date', new Date().toISOString());

        if (dueError) throw dueError;

        let formattedQueue = [];
        if (dueStates && dueStates.length > 0) {
          formattedQueue = dueStates.map(state => ({
            word: state.words,
            state: {
              interval: state.interval,
              ease_factor: state.ease_factor,
              repetitions: state.repetitions
            }
          }));
        }
        
        // 2. Fetch new words to ensure a robust session of at least 30 words
        if (formattedQueue.length < 30) {
          const { data: allStates, error: stateError } = await supabase
            .from('user_word_states')
            .select('word_id')
            .eq('user_id', user.id);
            
          if (stateError) throw stateError;
          
          const stateIds = allStates ? allStates.map(s => s.word_id) : [];
          
          const { data: allWords, error: newError } = await supabase.from('words').select('*');
          if (newError) throw newError;

          const unseenWords = (allWords || []).filter(w => !stateIds.includes(w.id));
          
          // Pad the queue to reach 30
          const needed = 30 - formattedQueue.length;
          const newWords = unseenWords.slice(0, needed);

          const newQueue = newWords.map(word => ({
            word: word,
            state: {
              interval: 0,
              ease_factor: 2.5,
              repetitions: 0
            }
          }));
          
          formattedQueue = [...formattedQueue, ...newQueue];
        }
        
        setQueue(formattedQueue);
      } catch (err) {
        console.error("Error fetching queue:", err);
        setError("Failed to load study queue. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [user]);

  // Determine Exercise Type when word changes
  useEffect(() => {
      if (queue.length > 0 && currentWordIndex < queue.length) {
          const currentItem = queue[currentWordIndex];
          const reps = currentItem.state.repetitions;
          
          const newWordTypes = ['multipleChoice', 'shadowing'];
          const reviewWordTypes = ['multipleChoice', 'writing', 'shadowing', 'listening'];
          
          let chosenType = 'shadowing';
          if (reps === 0) {
              chosenType = newWordTypes[Math.floor(Math.random() * newWordTypes.length)];
          } else {
              chosenType = reviewWordTypes[Math.floor(Math.random() * reviewWordTypes.length)];
          }
          
          setExerciseType(chosenType);
      }
   }, [currentWordIndex, queue]);

  // This function is now passed to the children components
  const handleRating = async (quality, actualExerciseType) => {
    const currentItem = queue[currentWordIndex];
    if (!currentItem) return;

    const { newInterval, newRepetitions, newEaseFactor } = calculateSM2(
      quality, 
      currentItem.state.repetitions, 
      currentItem.state.interval, 
      currentItem.state.ease_factor
    );

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    try {
      await supabase
        .from('user_word_states')
        .upsert({
          user_id: user.id,
          word_id: currentItem.word.id,
          interval: newInterval,
          ease_factor: newEaseFactor,
          repetitions: newRepetitions,
          next_review_date: nextReview.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          is_unlocked: true
        }, { onConflict: 'user_id,word_id' });

      // Log the specific exercise passed from the child element
      await supabase
        .from('exercise_logs')
        .insert({
          user_id: user.id,
          word_id: currentItem.word.id,
          exercise_type: actualExerciseType, 
          was_correct: quality >= 3
        });
        
    } catch (err) {
      console.error("Failed to update database for word:", currentItem.word.dutch, err);
    }

    // Advance queue
    setCurrentWordIndex(prev => prev + 1);
  };

  if (loading) return <div style={styles.centerContainer}>Loading study session...</div>;
  if (error) return <div style={styles.centerContainer}>{error}</div>;

  // End Screen
  if (currentWordIndex >= queue.length || queue.length === 0) {
    return (
      <div style={styles.centerContainer}>
        <h2>Session Complete!</h2>
        <p>You have reviewed all due words for now.</p>
        <button onClick={() => navigate('/')} style={styles.button}>Return to Dashboard</button>
      </div>
    );
  }

  const currentItem = queue[currentWordIndex];
  const word = currentItem.word;

  const isBrowserSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.outlineButton}>← Dashboard</button>
        
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          {isBrowserSupported && (
            <label style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', backgroundColor: '#f3f4f6', padding: '0.4rem 0.8rem', borderRadius: '20px'}}>
              <input 
                type="checkbox" 
                checked={isSpeakingEnabled}
                onChange={(e) => setIsSpeakingEnabled(e.target.checked)}
                style={{cursor: 'pointer'}}
              />
              🎤 Mic Enabled
            </label>
          )}

          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
            <span style={{color: '#6b7280'}}>Card {currentWordIndex + 1} of {queue.length}</span>
            <span style={{color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase'}}>{exerciseType}</span>
          </div>
        </div>
      </header>

      <div style={styles.card}>
          {exerciseType === 'multipleChoice' && (
              <MultipleChoice word={word} onComplete={handleRating} playAudio={playAudio} />
          )}
          
          {exerciseType === 'writing' && (
              <Writing word={word} onComplete={handleRating} />
          )}

          {exerciseType === 'listening' && (
              <Listening word={word} onComplete={handleRating} playAudio={playAudio} />
          )}

          {exerciseType === 'shadowing' && (
              <Shadowing 
                word={word} 
                onComplete={handleRating} 
                playAudio={playAudio} 
                isSpeakingEnabled={isSpeakingEnabled}
              />
          )}
      </div>
    </div>
  );
};

const styles = {
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f3f4f6',
    gap: '1rem'
  },
  pageContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column'
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
  outlineButton: {
    backgroundColor: 'transparent',
    color: '#4b5563',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    cursor: 'pointer'
  }
};

export default StudySession;
