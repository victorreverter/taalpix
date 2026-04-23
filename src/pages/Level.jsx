import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import PixelCard from '../components/common/PixelCard';
import PixelButton from '../components/common/PixelButton';
import SceneCard from '../components/map/SceneCard';

const Level = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scenes, setScenes] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelData, setLevelData] = useState(null);

  const LEVEL_NAMES = {
    a1: 'A1 - Beginner',
    a2: 'A2 - Elementary',
    b1: 'B1 - Intermediate',
    b2: 'B2 - Upper Intermediate',
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const level = levelId.toUpperCase();
      console.log('Fetching scenes for level:', level);
      
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('level', level)
        .eq('status', 'active')
        .order('scene_order');

      if (scenesError) {
        console.error('Error fetching scenes:', scenesError);
        setLoading(false);
        return;
      }

      console.log('Scenes fetched:', scenesData);

      const { data: progressData } = await supabase
        .from('user_scene_progress')
        .select('*')
        .eq('user_id', user.id);

      const { data: levelProgress } = await supabase
        .from('user_level_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('level', level)
        .single();

      setScenes(scenesData || []);
      setUserProgress(progressData || []);
      setLevelData(levelProgress);
      
      console.log('Level.jsx - scenes:', scenesData?.length || 0);
      console.log('Level.jsx - filtered scenes:', (scenesData || []).filter(s => s.status === 'active').length);
      
      setLoading(false);
    };

    fetchData();
  }, [user, levelId]);

  const handleSceneClick = (scene) => {
    if (scene.status === 'coming_soon') return;
    navigate(`/scene/${scene.slug}`);
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

  const levelName = LEVEL_NAMES[levelId] || levelId.toUpperCase();

  return (
    <div className="min-h-screen bg-tp-bg">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 font-pixel text-xs text-tp-text2 hover:text-tp-primary transition-colors"
        >
          ← Back to Levels
        </button>

        <div className="mb-8">
          <h2 className="font-pixel text-xl md:text-2xl text-tp-text mb-2">
            {levelName}
          </h2>
          <p className="text-tp-text2">
            {levelData?.unlocked
              ? 'Select a scene to start learning'
              : 'Complete previous level to unlock'}
          </p>
        </div>

        {scenes.length === 0 ? (
          <PixelCard className="p-8 text-center">
            <p className="text-tp-text2">No scenes available for this level yet.</p>
          </PixelCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenes.map((scene) => {
              const progress = userProgress.find(p => p.scene_id === scene.id);
              const isComingSoon = scene.status === 'coming_soon';
              
              // Skip coming soon scenes for now
              if (isComingSoon) return null;

              return (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  progress={progress}
                  isComingSoon={isComingSoon}
                  onClick={() => handleSceneClick(scene)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Level;
