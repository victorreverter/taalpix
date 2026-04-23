import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProgressProvider } from './contexts/ProgressContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Level from './pages/Level';
import Scene from './pages/Scene';
import ReviewQueue from './pages/ReviewQueue';
import AudioTest from './pages/AudioTest';
import AudioDebug from './pages/AudioDebug';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ProgressProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/level/:levelId"
                element={
                  <ProtectedRoute>
                    <Level />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/scene/:sceneSlug"
                element={
                  <ProtectedRoute>
                    <Scene />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/review"
                element={
                  <ProtectedRoute>
                    <ReviewQueue />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/audio-test"
                element={
                  <ProtectedRoute>
                    <AudioTest />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/audio-debug"
                element={
                  <ProtectedRoute>
                    <AudioDebug />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ProgressProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
