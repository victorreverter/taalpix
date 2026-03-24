import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { seedDatabase } from '../lib/seed';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [seedStatus, setSeedStatus] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchDueCount = async () => {
        setLoadingStats(true);
        // We count how many words have a next_review_date strictly before or equal to right now
        const { count, error } = await supabase
            .from('user_word_states')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .lte('next_review_date', new Date().toISOString());

        if (error) {
            console.error("Error fetching due count", error);
        } else {
            setDueCount(count || 0);
        }
        setLoadingStats(false);
    };

    fetchDueCount();
  }, [user]);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedStatus('Seeding database with initial words...');
    
    const result = await seedDatabase();
    
    if (result.success) {
        setSeedStatus(result.message);
    } else {
        setSeedStatus('Error: ' + (result.error?.message || 'Unknown error'));
    }
    setIsSeeding(false);
  };

  const handleReset = async () => {
    setIsSeeding(true);
    setSeedStatus('Resetting progress...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const { error } = await supabase
        .from('user_word_states')
        .update({ 
            next_review_date: pastDate.toISOString(),
            repetitions: 1 
        })
        .eq('user_id', user.id);
        
    if (error) {
        setSeedStatus('Error: ' + error.message);
    } else {
        setSeedStatus('Progress reset! You have due words now.');
        setDueCount(5);
    }
    setIsSeeding(false);
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>TaalPix Dashboard</h1>
        <button onClick={handleLogout} style={styles.outlineButton}>Log Out</button>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>User Profile</h2>
        <p><strong>Logged in as:</strong> {user?.email}</p>
        <p style={styles.subText}>ID: {user?.id}</p>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Study Overview</h2>
        {loadingStats ? (
            <p>Calculating due words...</p>
        ) : (
            <div style={styles.flexBox}>
                <div>
                    <h3 style={styles.bigNumber}>{dueCount}</h3>
                    <p style={styles.subText}>Words due for review</p>
                </div>
                
                <button 
                    onClick={() => navigate('/study')}
                    style={styles.primaryButton}
                >
                    Start Study Session
                </button>
            </div>
        )}
      </section>

      <section style={{...styles.card, backgroundColor: '#fef3c7', border: '1px solid #fde68a'}}>
        <h2 style={{...styles.sectionTitle, color: '#92400e'}}>Developer Tools</h2>
        <p style={{marginBottom: '1rem', color: '#92400e'}}>
          Use this to populate the public words table with the initial 5 Dutch words if it is currently empty.
        </p>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button 
            onClick={handleSeed} 
            disabled={isSeeding} 
            style={styles.secondaryButton}
          >
            {isSeeding ? 'Processing...' : 'Seed Database'}
          </button>
          <button 
            onClick={handleReset} 
            disabled={isSeeding} 
            style={{...styles.outlineButton, borderColor: '#d97706', color: '#d97706'}}
          >
            Reset Progress
          </button>
        </div>
        {seedStatus && <p style={{marginTop: '1rem', fontWeight: 'bold', color: '#b45309'}}>{seedStatus}</p>}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '1rem'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#111827'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
    border: '1px solid #e5e7eb'
  },
  sectionTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.25rem',
    color: '#374151'
  },
  subText: {
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  bigNumber: {
    fontSize: '3rem',
    margin: '0 0 0.5rem 0',
    color: '#2563eb'
  },
  flexBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  secondaryButton: {
    backgroundColor: '#d97706',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
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

export default Dashboard;
