import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [counters, setCounters] = useState({
    mastered: 0,
    pending: 0,
    review: 0,
  });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCounters({ mastered: 0, pending: 0, review: 0 });
      setStreak(0);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);

      const { data: wordStates } = await supabase
        .from('user_word_states')
        .select('*')
        .eq('user_id', user.id);

      const mastered = wordStates?.filter(ws =>
        ws.repetitions >= 5 && ws.interval_days >= 21
      ).length || 0;

      const review = wordStates?.filter(ws =>
        ws.in_review_queue === true ||
        new Date(ws.next_review_date) <= new Date()
      ).length || 0;

      const { data: unlockedLevels } = await supabase
        .from('user_level_progress')
        .select('level')
        .eq('user_id', user.id)
        .eq('unlocked', true);

      if (unlockedLevels && unlockedLevels.length > 0) {
        const { data: allWordsInLevels } = await supabase
          .from('words')
          .select('id')
          .in('level', unlockedLevels.map(l => l.level));

        const encounteredWordIds = wordStates?.map(ws => ws.word_id) || [];
        const pending = allWordsInLevels?.filter(w =>
          !encounteredWordIds.includes(w.id)
        ).length || 0;

        setCounters({ mastered, pending, review });
      } else {
        const { count: totalA1Words } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'A1');

        setCounters({
          mastered,
          pending: totalA1Words || 21,
          review,
        });
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();

      setStreak(profile?.current_streak || 0);
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('last_activity_date, current_streak, longest_streak')
      .eq('user_id', user.id)
      .single();

    let newStreak = profile?.current_streak || 0;
    let newLongestStreak = profile?.longest_streak || 0;

    if (profile?.last_activity_date) {
      const lastDate = new Date(profile.last_activity_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    if (newStreak > newLongestStreak) {
      newLongestStreak = newStreak;
    }

    await supabase.from('user_profiles').upsert({
      user_id: user.id,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_activity_date: today,
    }, { onConflict: 'user_id' });

    setStreak(newStreak);
  };

  const value = {
    counters,
    streak,
    loading,
    updateStreak,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
