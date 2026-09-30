// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Home, Users, LogOut, Menu, X, Rss } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('kalaverse_user');
    if (onLogout) onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user
    ? [
        { to: user.role === 'Expert' ? '/dashboard/expert' : '/dashboard/learner', label: 'Dashboard', icon: Home },
        { to: '/feed', label: 'Social Feed', icon: Rss },
      ]
    : [];

  return (
    <nav className="navbar">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to={user ? '/feed' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168,85,247,0.4)',
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 800,
              fontSize: '1.3rem', letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Kalaverse
            </span>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: 500, fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s',
                    background: isActive(to) ? 'rgba(168,85,247,0.15)' : 'transparent',
                    color: isActive(to) ? '#c084fc' : '#94a3b8',
                    border: isActive(to) ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                {/* User chip */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white', fontFamily: 'Outfit',
                  }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0', fontFamily: 'Outfit' }}>
                    {user.name}
                  </span>
                  <span className={`badge ${user.role === 'Expert' ? 'badge-expert' : 'badge-learner'}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Exit Kalaverse"
                  style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#f87171',
                    display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                  }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link to="/" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                  Enter Kalaverse
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
