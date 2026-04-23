import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import Header from '../components/common/Header';
import PixelCard from '../components/common/PixelCard';
import PixelButton from '../components/common/PixelButton';
import LevelCard from '../components/map/LevelCard';

const LEVELS = [
  { id: 'A1', name: 'A1 - Beginner', scenes: 3, description: 'Essential basics' },
  { id: 'A2', name: 'A2 - Elementary', scenes: 3, description: 'Everyday situations' },
  { id: 'B1', name: 'B1 - Intermediate', scenes: 2, description: 'Independent user' },
  { id: 'B2', name: 'B2 - Upper Intermediate', scenes: 2, description: 'Advanced communication' },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateStreak } = useProgress();
  const [userLevels, setUserLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserLevels = async () => {
      const { data, error } = await supabase
        .from('user_level_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('level');

      if (data) {
        setUserLevels(data);
      } else {
        await initializeUserLevels();
      }
      setLoading(false);
    };

    const initializeUserLevels = async () => {
      const initialLevels = LEVELS.map((level, index) => ({
        user_id: user.id,
        level: level.id,
        unlocked: index === 0,
        scenes_completed: 0,
        total_scenes: level.scenes,
        unlocked_at: index === 0 ? new Date().toISOString() : null,
      }));

      await supabase.from('user_level_progress').upsert(initialLevels, {
        onConflict: 'user_id,level',
      });

      setUserLevels(initialLevels);
    };

    fetchUserLevels();
  }, [user]);

  const handleLevelClick = (levelId) => {
    const levelProgress = userLevels.find(l => l.level === levelId);
    if (levelProgress?.unlocked) {
      navigate(`/level/${levelId.toLowerCase()}`);
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

  return (
    <div className="min-h-screen bg-tp-bg">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="font-pixel text-xl md:text-2xl text-tp-text mb-2">
            Your Learning Path
          </h2>
          <p className="text-tp-text2">
            Complete scenes to unlock the next level
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {LEVELS.map((level) => {
            const progress = userLevels.find(l => l.level === level.id);
            const isUnlocked = progress?.unlocked || false;
            const scenesCompleted = progress?.scenes_completed || 0;

            return (
              <LevelCard
                key={level.id}
                level={level}
                isUnlocked={isUnlocked}
                scenesCompleted={scenesCompleted}
                onClick={() => handleLevelClick(level.id)}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Home;
