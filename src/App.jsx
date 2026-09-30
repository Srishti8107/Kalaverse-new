// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserEntry from './pages/UserEntry';
import Dashboard from './pages/Dashboard';
import FeedPage from './pages/FeedPage';
import ExpertProfile from './pages/ExpertProfile';

// ─── Protected Route Helper ───────────────────────────────────
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

// ─── Role Guard ───────────────────────────────────────────────
function RoleRoute({ user, requiredRole, children }) {
  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'Expert' ? '/dashboard/expert' : '/dashboard/learner'} replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kalaverse_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('kalaverse_user');
    } finally {
      setHydrated(true);
    }
  }, []);

  const handleUserSet = (userObj) => {
    setUser(userObj);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Don't render until localStorage is checked (avoid flash)
  if (!hydrated) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0f',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #a855f7, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'orb-pulse 1.5s ease-in-out infinite alternate',
        }}>
          <span style={{ color: 'white', fontSize: '1.5rem' }}>✦</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navbar shown on all pages except the entry page */}
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Entry page — redirect to dashboard if already logged in */}
            <Route
              path="/"
              element={
                user
                  ? <Navigate to={user.role === 'Expert' ? '/dashboard/expert' : '/dashboard/learner'} replace />
                  : <UserEntry onUserSet={handleUserSet} />
              }
            />

            {/* Expert Dashboard */}
            <Route
              path="/dashboard/expert"
              element={
                <RoleRoute user={user} requiredRole="Expert">
                  <Dashboard user={user} />
                </RoleRoute>
              }
            />

            {/* Learner Dashboard */}
            <Route
              path="/dashboard/learner"
              element={
                <RoleRoute user={user} requiredRole="Learner">
                  <Dashboard user={user} />
                </RoleRoute>
              }
            />

            {/* Social Feed — accessible to both roles */}
            <Route
              path="/feed"
              element={
                <ProtectedRoute user={user}>
                  <FeedPage user={user} />
                </ProtectedRoute>
              }
            />

            {/* Expert Profile — accessible to any logged-in user */}
            <Route
              path="/expert/:expertId"
              element={
                <ProtectedRoute user={user}>
                  <ExpertProfile currentUser={user} />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? '/feed' : '/'} replace />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
