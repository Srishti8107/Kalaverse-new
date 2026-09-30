// src/pages/Dashboard.jsx
// Shared dashboard component for both Expert and Learner roles
import { useNavigate } from 'react-router-dom';
import { Rss, User, Wand2, GraduationCap, ArrowRight, Sparkles, BookOpen, Users, Star } from 'lucide-react';

const STAT_COLORS = {
  purple: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', text: '#c084fc', icon: '#a855f7' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)',  text: '#22d3ee', icon: '#06b6d4' },
  amber:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24', icon: '#f59e0b' },
  green:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#4ade80', icon: '#22c55e' },
};

function StatCard({ label, value, icon: Icon, color }) {
  const c = STAT_COLORS[color] || STAT_COLORS.purple;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '14px', padding: '20px',
      display: 'flex', alignItems: 'center', gap: '16px',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: `${c.icon}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={c.icon} />
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit', color: '#f1f5f9' }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ label, description, icon: Icon, onClick, color = '#a855f7' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '20px', cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '16px',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = `${color}50`;
        e.currentTarget.style.background = `${color}08`;
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>{label}</div>
        <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>{description}</div>
      </div>
      <ArrowRight size={16} color="#475569" />
    </button>
  );
}

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const isExpert = user?.role === 'Expert';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.07) 50%, rgba(6,182,212,0.05) 100%)',
        borderBottom: '1px solid var(--color-border)', padding: '40px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="glow-orb glow-orb-purple" style={{ width: '400px', height: '400px', top: '-200px', right: '-100px', opacity: 0.4 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '18px',
              background: isExpert ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isExpert ? '0 0 30px rgba(168,85,247,0.4)' : '0 0 30px rgba(6,182,212,0.4)',
              fontSize: '1.4rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit',
            }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
                  Welcome back, <span className="gradient-text">{user?.name}</span>!
                </h1>
                <span className={`badge ${isExpert ? 'badge-expert' : 'badge-learner'}`}>
                  {isExpert ? <Wand2 size={11} /> : <GraduationCap size={11} />}
                  {user?.role}
                </span>
              </div>
              <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: '0.9rem' }}>
                {isExpert
                  ? `Sharing ${user?.expertise || 'your craft'} with the Kalaverse`
                  : 'Continue your craft learning journey'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {isExpert ? (
            <>
              <StatCard label="Tutorials" value="0" icon={BookOpen} color="purple" />
              <StatCard label="Followers" value="0" icon={Users} color="cyan" />
              <StatCard label="Posts" value="0" icon={Rss} color="amber" />
              <StatCard label="Rating" value="—" icon={Star} color="green" />
            </>
          ) : (
            <>
              <StatCard label="Experts Followed" value="0" icon={Users} color="cyan" />
              <StatCard label="Tutorials Viewed" value="0" icon={BookOpen} color="purple" />
              <StatCard label="Posts Created" value="0" icon={Rss} color="amber" />
              <StatCard label="Skills Explored" value="0" icon={Star} color="green" />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* Left: Actions */}
          <div>
            <h3 style={{ fontSize: '1rem', fontFamily: 'Outfit', color: '#94a3b8', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <QuickAction
                label="Go to Social Feed"
                description="Browse posts from the community"
                icon={Rss}
                onClick={() => navigate('/feed')}
                color="#a855f7"
              />
              {isExpert && (
                <QuickAction
                  label="View My Profile"
                  description="See how learners see your profile"
                  icon={User}
                  onClick={() => navigate(`/expert/${user.id}`)}
                  color="#ec4899"
                />
              )}
              <QuickAction
                label={isExpert ? 'Manage Tutorials' : 'Browse Tutorials'}
                description={isExpert ? 'View your AR tutorial stubs' : 'Discover expert tutorials'}
                icon={BookOpen}
                onClick={() => navigate('/feed')}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Right: Profile summary */}
          <div>
            <h3 style={{ fontSize: '0.8rem', fontFamily: 'Outfit', color: '#94a3b8', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Your Profile
            </h3>
            <div className="glass-card" style={{ padding: '20px' }}>
              {user?.bio ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 16px' }}>{user.bio}</p>
              ) : (
                <p style={{ color: '#475569', fontSize: '0.9rem', fontStyle: 'italic', margin: '0 0 16px' }}>
                  No bio added yet.
                </p>
              )}

              {isExpert && user?.expertise && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CRAFT</span>
                  <span className="badge badge-expert">{user.expertise}</span>
                </div>
              )}

              {(user?.contact?.email || user?.contact?.mobile) && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {user.contact.email && <span>✉ {user.contact.email}</span>}
                  {user.contact.mobile && <span>📞 {user.contact.mobile}</span>}
                </div>
              )}

              {isExpert && (
                <button
                  onClick={() => navigate(`/expert/${user.id}`)}
                  className="btn-secondary"
                  style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Sparkles size={15} />
                  View Public Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
