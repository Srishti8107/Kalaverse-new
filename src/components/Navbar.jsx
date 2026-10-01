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
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Logo */}
          <Link to={user ? '/feed' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '11px',
              background: '#2F3B6B', outline: '1px solid #A8873A', outlineOffset: '2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(43,38,34,0.06)',
            }}>
              <Sparkles size={16} color="#EADFC4" />
            </div>
            <span style={{
              fontFamily: 'var(--font-serif)', fontWeight: 500,
              fontSize: '1.4rem', letterSpacing: '-0.01em',
              color: '#2B2622',
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
                  className="nav-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '999px', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: 500, fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s',
                    background: isActive(to) ? '#2F3B6B' : 'transparent',
                    color: isActive(to) ? '#FBF8F3' : '#7A6F63',
                    border: isActive(to) ? '1px solid #2F3B6B' : '1px solid transparent',
                  }}
                >
                  <Icon size={16} />
                  <span className="nav-collapse">{label}</span>
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
                  background: '#FBF8F3',
                  border: '1px solid #DDD2C0',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#2F3B6B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 500, color: '#FBF8F3', fontFamily: 'var(--font-serif)',
                  }}>
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="nav-collapse" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2B2622', fontFamily: 'var(--font-sans)' }}>
                    {user.name}
                  </span>
                  <span className={`badge nav-collapse ${user.role === 'Expert' ? 'badge-expert' : 'badge-learner'}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Exit Kalaverse"
                  style={{
                    background: 'rgba(166,61,47,0.1)', border: '1px solid rgba(166,61,47,0.25)',
                    borderRadius: '999px', padding: '9px', cursor: 'pointer', color: '#A63D2F',
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
