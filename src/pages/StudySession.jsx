import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { calculateSM2 } from '../lib/sm2';

import MultipleChoice from '../components/MultipleChoice';
import Writing from '../components/Writing';
import Shadowing from '../components/Shadowing';
import Listening from '../components/Listening';

const playAudio = (text, lang = 'nl-NL') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
};

// Pick exercise type based on repetitions — done ONCE when queue is built
const pickExerciseType = (repetitions) => {
  const newWordTypes = ['multipleChoice', 'shadowing'];
  const reviewWordTypes = ['multipleChoice', 'writing', 'shadowing', 'listening'];
  const pool = repetitions === 0 ? newWordTypes : reviewWordTypes;
  return pool[Math.floor(Math.random() * pool.length)];
};

const StudySession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(
    !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

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

        let items = [];
        if (dueStates && dueStates.length > 0) {
          items = dueStates.map(state => ({
            word: state.words,
            state: {
              interval: state.interval,
              ease_factor: state.ease_factor,
              repetitions: state.repetitions
            },
            // Exercise type is baked in right here — no extra state or effect needed
            exerciseType: pickExerciseType(state.repetitions)
          }));
        }

        // 2. Pad with new words up to 30
        if (items.length < 30) {
          const { data: allStates } = await supabase.from('user_word_states').select('word_id').eq('user_id', user.id);
          const { data: allWords, error: newError } = await supabase.from('words').select('*');
          if (newError) throw newError;

          const stateIds = (allStates || []).map(s => s.word_id);
          const unseenWords = (allWords || []).filter(w => !stateIds.includes(w.id));
          const newWords = unseenWords.slice(0, 30 - items.length);

          const newItems = newWords.map(word => ({
            word,
            state: { interval: 0, ease_factor: 2.5, repetitions: 0 },
            // New words also get their type pre-assigned
            exerciseType: pickExerciseType(0)
          }));

          items = [...items, ...newItems];
        }

        setQueue(items);
      } catch (err) {
        console.error('Error fetching queue:', err);
        setError('Failed to load study queue. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [user]);

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
      await supabase.from('user_word_states').upsert({
        user_id: user.id,
        word_id: currentItem.word.id,
        interval: newInterval,
        ease_factor: newEaseFactor,
        repetitions: newRepetitions,
        next_review_date: nextReview.toISOString(),
        last_reviewed_at: new Date().toISOString(),
        is_unlocked: true
      }, { onConflict: 'user_id,word_id' });

      await supabase.from('exercise_logs').insert({
        user_id: user.id,
        word_id: currentItem.word.id,
        exercise_type: actualExerciseType,
        was_correct: quality >= 3
      });
    } catch (err) {
      console.error('Failed to update DB for word:', currentItem.word.dutch, err);
    }

    setCurrentWordIndex(prev => prev + 1);
  };

  if (loading) return <div style={styles.center}>Loading study session...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  if (currentWordIndex >= queue.length || queue.length === 0) {
    return (
      <div style={styles.center}>
        <h2>Session Complete! 🎉</h2>
        <p>You have reviewed all due words for now.</p>
        <button onClick={() => navigate('/')} style={styles.button}>Return to Dashboard</button>
      </div>
    );
  }

  const currentItem = queue[currentWordIndex];
  const word = currentItem.word;
  // Read the pre-assigned type — no state changes, no extra renders
  const exerciseType = currentItem.exerciseType;
  const isBrowserSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.outlineBtn}>← Dashboard</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isBrowserSupported && (
            <label style={styles.micLabel}>
              <input
                type="checkbox"
                checked={isSpeakingEnabled}
                onChange={e => setIsSpeakingEnabled(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              🎤 Mic Enabled
            </label>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ color: '#6b7280' }}>Card {currentWordIndex + 1} of {queue.length}</span>
            <span style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>{exerciseType}</span>
          </div>
        </div>
      </header>

      <div style={styles.card}>
        {/* key=currentWordIndex ensures a full remount (and single audio trigger) on every new card */}
        {exerciseType === 'multipleChoice' && (
          <MultipleChoice key={currentWordIndex} word={word} onComplete={handleRating} playAudio={playAudio} />
        )}
        {exerciseType === 'writing' && (
          <Writing key={currentWordIndex} word={word} onComplete={handleRating} />
        )}
        {exerciseType === 'listening' && (
          <Listening key={currentWordIndex} word={word} onComplete={handleRating} playAudio={playAudio} />
        )}
        {exerciseType === 'shadowing' && (
          <Shadowing
            key={currentWordIndex}
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
  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f3f4f6', gap: '1rem'
  },
  page: {
    maxWidth: '600px', margin: '0 auto', padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '2rem'
  },
  card: {
    backgroundColor: '#fff', borderRadius: '12px', padding: '2rem',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    minHeight: '400px', display: 'flex', flexDirection: 'column'
  },
  button: {
    backgroundColor: '#2563eb', color: 'white', padding: '1rem 1.5rem',
    borderRadius: '6px', border: 'none', fontSize: '1.1rem',
    fontWeight: 'bold', cursor: 'pointer'
  },
  outlineBtn: {
    backgroundColor: 'transparent', color: '#4b5563', padding: '0.5rem 1rem',
    borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer'
  },
  micLabel: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer',
    backgroundColor: '#f3f4f6', padding: '0.4rem 0.8rem', borderRadius: '20px'
  }
};

export default StudySession;
