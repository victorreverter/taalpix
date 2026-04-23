import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import PixelCard from '../components/common/PixelCard';
import PixelButton from '../components/common/PixelButton';
import { playAudio } from '../lib/audio';

const ReviewQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviewWords, setReviewWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchReviewQueue = async () => {
      const { data, error } = await supabase
        .from('user_word_states')
        .select(`
          *,
          word:words (
            id,
            dutch,
            spanish,
            category,
            pixel_art_placeholder
          )
        `)
        .eq('user_id', user.id)
        .eq('in_review_queue', true);

      if (error) {
        console.error('Error fetching review queue:', error);
      } else {
        setReviewWords(data || []);
      }
      setLoading(false);
    };

    fetchReviewQueue();
  }, [user]);

  const handleKnowIt = async () => {
    const currentWord = reviewWords[currentIndex];
    
    // Update word state - increase consecutive correct
    const newConsecutive = (currentWord.consecutive_correct || 0) + 1;
    
    // Remove from review queue if 3 consecutive correct
    const shouldRemoveFromQueue = newConsecutive >= 3;

    await supabase
      .from('user_word_states')
      .update({
        consecutive_correct: newConsecutive,
        in_review_queue: !shouldRemoveFromQueue,
      })
      .eq('user_id', user.id)
      .eq('word_id', currentWord.word_id);

    // Move to next word
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      // Completed all reviews
      setStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      alert('Review complete! Great job! 🎉');
      navigate('/');
    }
  };

  const handleDontKnowIt = async () => {
    const currentWord = reviewWords[currentIndex];
    
    // Reset consecutive correct and keep in queue
    await supabase
      .from('user_word_states')
      .update({
        consecutive_correct: 0,
        mistake_count: (currentWord.mistake_count || 0) + 1,
      })
      .eq('user_id', user.id)
      .eq('word_id', currentWord.word_id);

    // Move to next word
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
      alert('Keep practicing! These words will appear again in your next session. 💪');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tp-bg">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="font-pixel text-tp-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="min-h-screen bg-tp-bg">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/')}
            className="mb-6 font-pixel text-xs text-tp-text2 hover:text-tp-primary transition-colors"
          >
            ← Back to Home
          </button>

          <PixelCard className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="font-pixel text-xl text-tp-text mb-4">
              All Caught Up!
            </h2>
            <p className="text-tp-text2 mb-6">
              You have no words in review. Great job keeping up with your studies!
            </p>
            <PixelButton
              variant="primary"
              size="large"
              onClick={() => navigate('/')}
            >
              Start Learning
            </PixelButton>
          </PixelCard>
        </main>
      </div>
    );
  }

  const currentWord = reviewWords[currentIndex];
  const progress = ((currentIndex + 1) / reviewWords.length) * 100;

  return (
    <div className="min-h-screen bg-tp-bg">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 font-pixel text-xs text-tp-text2 hover:text-tp-primary transition-colors"
        >
          ← Back to Home
        </button>

        <PixelCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-pixel text-lg text-tp-text">
              Review Queue
            </h2>
            <span className="font-pixel text-xs text-tp-text3">
              {currentIndex + 1} / {reviewWords.length}
            </span>
          </div>

          <div className="h-2 bg-tp-surface2 border-2 border-solid border-tp-border">
            <div
              className="h-full bg-tp-warning transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </PixelCard>

        <PixelCard className="p-8">
          <div className="text-center mb-8">
            <p className="text-tp-text3 text-sm mb-4">
              Translate this word:
            </p>
            <h3 className="font-pixel text-2xl text-tp-primary mb-4">
              {currentWord.word?.spanish}
            </h3>
            
            <button
              onClick={() => {
                setTimeout(() => {
                  playAudio(currentWord.word?.dutch);
                }, 100);
              }}
              className="p-3 bg-tp-surface2 border-2 border-solid border-tp-border hover:bg-tp-neutral-light transition-colors"
            >
              🔊 Hear Pronunciation
            </button>
          </div>

          {!showAnswer ? (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type the Dutch translation..."
                className="w-full px-4 py-3 border-2 border-solid border-tp-border bg-tp-surface text-tp-text font-body focus:outline-none focus:border-tp-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowAnswer(true);
                  }
                }}
              />
              
              <PixelButton
                variant="primary"
                size="large"
                onClick={() => setShowAnswer(true)}
                className="w-full"
              >
                Show Answer
              </PixelButton>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`p-4 border-2 border-solid text-center ${
                userAnswer.toLowerCase().trim() === currentWord.word?.dutch.toLowerCase()
                  ? 'bg-tp-success-light border-tp-success'
                  : 'bg-tp-error-light border-tp-error'
              }`}>
                <p className="font-pixel text-sm mb-2">
                  {userAnswer.toLowerCase().trim() === currentWord.word?.dutch.toLowerCase()
                    ? '✓ Correct!'
                    : '✗ Not quite'}
                </p>
                <p className="font-body text-2xl text-tp-text">
                  {currentWord.word?.dutch}
                </p>
                <p className="text-tp-text3 text-sm mt-2">
                  {currentWord.word?.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PixelButton
                  variant="error"
                  size="large"
                  onClick={handleDontKnowIt}
                >
                  ❌ Still Learning
                </PixelButton>
                <PixelButton
                  variant="success"
                  size="large"
                  onClick={handleKnowIt}
                >
                  ✓ Got It!
                </PixelButton>
              </div>
            </div>
          )}
        </PixelCard>
      </main>
    </div>
  );
};

export default ReviewQueue;
