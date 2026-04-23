import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { calculateSM2 } from '../lib/sm2';
import Header from '../components/common/Header';
import PixelCard from '../components/common/PixelCard';
import PixelButton from '../components/common/PixelButton';
import GrammarNotes from '../components/common/GrammarNotes';
import VisualRecognition from '../components/exercises/VisualRecognition';
import Matching from '../components/exercises/Matching';
import Listening from '../components/exercises/Listening';
import BuildSentence from '../components/exercises/BuildSentence';
import Translate from '../components/exercises/Translate';
import MiniDialogue from '../components/exercises/MiniDialogue';

const EXERCISE_TYPES = [
  'visual',
  'matching',
  'listening',
  'build',
  'translate',
  'dialogue',
];

const Scene = () => {
  const { sceneSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateStreak } = useProgress();

  const [scene, setScene] = useState(null);
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [dialogue, setDialogue] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [retryQueue, setRetryQueue] = useState([]);
  const [showGrammar, setShowGrammar] = useState(false);
  const [sessionMistakes, setSessionMistakes] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchSceneData = async () => {
      const { data: sceneData } = await supabase
        .from('scenes')
        .select('*')
        .eq('slug', sceneSlug)
        .single();

      if (!sceneData) {
        navigate('/');
        return;
      }

      setScene(sceneData);

      const { data: wordsData } = await supabase
        .from('scene_words')
        .select('word_id, word_order')
        .eq('scene_id', sceneData.id)
        .order('word_order');

      const wordIds = wordsData?.map(w => w.word_id) || [];
      
      if (wordIds.length > 0) {
        const { data: wordsList } = await supabase
          .from('words')
          .select('*')
          .in('id', wordIds);
        setWords(wordsList || []);
      }

      const { data: sentencesData } = await supabase
        .from('sentences')
        .select('*')
        .eq('scene_id', sceneData.id);
      setSentences(sentencesData || []);

      const { data: dialogueData } = await supabase
        .from('dialogues')
        .select('*')
        .eq('scene_id', sceneData.id)
        .order('dialogue_order');
      setDialogue(dialogueData || []);

      const { data: session } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          scene_id: sceneData.id,
          session_type: 'learning',
        })
        .select()
        .single();

      setSessionData(session);

      await supabase.from('user_scene_progress').upsert({
        user_id: user.id,
        scene_id: sceneData.id,
        status: 'active',
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id,scene_id' });

      setLoading(false);
    };

    fetchSceneData();
  }, [user, sceneSlug, navigate]);

  const handleExerciseComplete = async (quality, exerciseType, wordData = null) => {
    const currentWord = wordData || words[0];

    const { data: existingState } = await supabase
      .from('user_word_states')
      .select('*')
      .eq('user_id', user.id)
      .eq('word_id', currentWord.id)
      .single();

    const repetitions = existingState?.repetitions || 0;
    const interval = existingState?.interval_days || 0;
    const easeFactor = existingState?.ease_factor || 2.5;

    const { newInterval, newRepetitions, newEaseFactor } = calculateSM2(
      quality,
      repetitions,
      interval,
      easeFactor,
      exerciseType
    );

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const isMastered = newRepetitions >= 5 && newInterval >= 21;
    const isMistake = quality < 3;

    // Track mistakes for this session
    if (isMistake) {
      setSessionMistakes(prev => [...prev, { word: currentWord, exerciseType }]);
    }

    await supabase.from('user_word_states').upsert({
      user_id: user.id,
      word_id: currentWord.id,
      repetitions: newRepetitions,
      interval_days: newInterval,
      ease_factor: newEaseFactor,
      next_review_date: nextReviewDate.toISOString(),
      last_practiced: new Date().toISOString(),
      status: isMastered ? 'mastered' : 'learning',
      consecutive_correct: quality >= 3 ? (existingState?.consecutive_correct || 0) + 1 : 0,
      mistake_count: isMistake ? (existingState?.mistake_count || 0) + 1 : existingState?.mistake_count || 0,
      in_review_queue: isMistake ? true : (existingState?.consecutive_correct || 0) + 1 >= 3 ? false : existingState?.in_review_queue || false,
    }, { onConflict: 'user_id,word_id' });

    if (currentExerciseIndex < EXERCISE_TYPES.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      await completeScene();
    }
  };

  const completeScene = async () => {
    await supabase
      .from('user_scene_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('scene_id', scene.id);

    await supabase
      .from('study_sessions')
      .update({
        completed_at: new Date().toISOString(),
        words_practiced: words.length,
      })
      .eq('id', sessionData.id);

    const { data: levelProgress } = await supabase
      .from('user_level_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('level', scene.level)
      .single();

    const newScenesCompleted = (levelProgress?.scenes_completed || 0) + 1;

    await supabase
      .from('user_level_progress')
      .update({
        scenes_completed: newScenesCompleted,
      })
      .eq('user_id', user.id)
      .eq('level', scene.level);

    const scenesInLevel = scene.level === 'A1' ? 3 : scene.level === 'A2' ? 3 : 2;
    const unlockNext = newScenesCompleted >= Math.ceil(scenesInLevel * 0.67);

    if (unlockNext) {
      const nextLevel = scene.level === 'A1' ? 'A2' : scene.level === 'A2' ? 'B1' : scene.level === 'B1' ? 'B2' : null;
      
      if (nextLevel) {
        await supabase
          .from('user_level_progress')
          .update({
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('level', nextLevel);
      }
    }

    await updateStreak();

    navigate(`/level/${scene.level.toLowerCase()}`);
  };

  if (loading || !scene) {
    return (
      <div className="min-h-screen bg-tp-bg">
        <Header />
        <div className="flex items-center justify-center pt-20">
          <div className="font-pixel text-tp-text">Loading...</div>
        </div>
      </div>
    );
  }

  const currentExercise = EXERCISE_TYPES[currentExerciseIndex];

  const renderExercise = () => {
    switch (currentExercise) {
      case 'visual':
        return <VisualRecognition word={words[0]} onComplete={handleExerciseComplete} />;
      case 'matching':
        return <Matching words={words} onComplete={handleExerciseComplete} />;
      case 'listening':
        return <Listening words={words} onComplete={handleExerciseComplete} />;
      case 'build':
        return <BuildSentence sentences={sentences} onComplete={handleExerciseComplete} />;
      case 'translate':
        return <Translate words={words} onComplete={handleExerciseComplete} />;
      case 'dialogue':
        return <MiniDialogue dialogue={dialogue} onComplete={handleExerciseComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-tp-bg">
      <Header />
      
      <main className="max-w-2xl mx-auto">
        <div className="p-4">
          <button
            onClick={() => navigate(`/level/${scene.level.toLowerCase()}`)}
            className="mb-4 font-pixel text-xs text-tp-text2 hover:text-tp-primary transition-colors"
          >
            ← Back to {scene.name}
          </button>

          <PixelCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-pixel text-lg text-tp-text">
                {scene.name}
              </h2>
              <span className="font-pixel text-xs text-tp-text3">
                {currentExerciseIndex + 1} / {EXERCISE_TYPES.length}
              </span>
            </div>

            <div className="h-2 bg-tp-surface2 border-2 border-solid border-tp-border">
              <div
                className="h-full bg-tp-primary transition-all"
                style={{ width: `${((currentExerciseIndex + 1) / EXERCISE_TYPES.length) * 100}%` }}
              />
            </div>
          </PixelCard>

          {/* Grammar Notes Button */}
          <div className="mb-6">
            <PixelButton
              variant="outline"
              size="small"
              onClick={() => setShowGrammar(!showGrammar)}
              className="w-full"
            >
              {showGrammar ? '📚 Hide Grammar Notes' : '📚 Show Grammar Notes'}
            </PixelButton>
          </div>

          {/* Grammar Notes */}
          {showGrammar && (
            <PixelCard className="p-6 mb-6">
              <GrammarNotes scene={scene} />
            </PixelCard>
          )}

          <PixelCard className="p-4">
            {renderExercise()}
          </PixelCard>
        </div>
      </main>
    </div>
  );
};

export default Scene;
