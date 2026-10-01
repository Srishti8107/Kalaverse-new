// src/pages/Dashboard.jsx
// Shared dashboard component for both Expert and Learner roles
import { useNavigate } from 'react-router-dom';
import { Rss, User, Wand2, GraduationCap, ArrowRight, Sparkles, BookOpen, Users, Star, Hand, Clock } from 'lucide-react';
import { TUTORIALS, getPracticePath } from '../tutorials';

const AR_TUTORIALS = TUTORIALS.filter((t) => getPracticePath(t));

const STAT_COLORS = {
  purple: { bg: 'rgba(47,59,107,0.12)', border: 'rgba(47,59,107,0.25)', text: '#2F3B6B', icon: '#2F3B6B' },
  cyan:   { bg: 'rgba(176,87,61,0.12)',  border: 'rgba(176,87,61,0.25)',  text: '#B0573D', icon: '#B0573D' },
  amber:  { bg: 'rgba(168,135,58,0.12)', border: 'rgba(168,135,58,0.25)', text: '#A8873A', icon: '#A8873A' },
  green:  { bg: 'rgba(93,122,88,0.12)',  border: 'rgba(93,122,88,0.25)',  text: '#5D7A58', icon: '#5D7A58' },
};

function StatCard({ label, value, icon: Icon, color }) {
  const c = STAT_COLORS[color] || STAT_COLORS.purple;
  return (
    <div style={{
      background: '#FBF8F3', border: '1px solid #DDD2C0', borderTop: `3px solid ${c.icon}`,
      borderRadius: '18px', padding: '22px',
      display: 'flex', alignItems: 'center', gap: '16px',
      boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={19} color={c.icon} />
      </div>
      <div>
        <div style={{ fontSize: '1.9rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#2B2622', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: '#7A6F63', marginTop: '4px', letterSpacing: '0.04em' }}>{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ label, description, icon: Icon, onClick, color = '#2F3B6B' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#FBF8F3', border: '1px solid #DDD2C0',
        borderRadius: '18px', padding: '18px 20px', cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '16px',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = `${color}50`;
        e.currentTarget.style.background = '#FFFDF9';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = '#DDD2C0';
        e.currentTarget.style.background = '#FBF8F3';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        background: `${color}14`, border: `1px solid ${color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: '#2B2622', fontSize: '0.95rem' }}>{label}</div>
        <div style={{ color: '#7A6F63', fontSize: '0.82rem', marginTop: '2px' }}>{description}</div>
      </div>
      <ArrowRight size={16} color="#A39887" />
    </button>
  );
}

function PracticeCard({ tutorial, onStart }) {
  return (
    <div className="tutorial-card" onClick={onStart} style={{ cursor: 'pointer' }}>
      <div style={{ height: '220px', overflow: 'hidden', background: '#E9E1D3', borderBottom: '1px solid #DDD2C0' }}>
        {tutorial.thumbnail && (
          <img
            src={tutorial.thumbnail}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          />
        )}
      </div>
      <div style={{ padding: '20px 22px 22px' }}>
        <span className="badge badge-free" style={{ marginBottom: '8px' }}>
          <Sparkles size={10} /> Live AR practice
        </span>
        <h4 style={{ fontSize: '1.3rem', color: '#2B2622', margin: '12px 0 8px', lineHeight: 1.25 }}>
          {tutorial.title}
        </h4>
        <p style={{ color: '#4A423B', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 14px' }}>
          {tutorial.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7A6F63', fontSize: '0.78rem', marginBottom: '16px' }}>
          <Clock size={12} />
          {tutorial.duration}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStart();
          }}
          style={{
            width: '100%', padding: '11px', borderRadius: '999px', border: 'none', cursor: 'pointer',
            background: '#2F3B6B', color: '#FBF8F3',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          Start AR Practice
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const isExpert = user?.role === 'Expert';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Hero banner */}
      <div style={{
        background: 'var(--color-sand-50)',
        borderBottom: '1px solid var(--color-border)', padding: '56px 0 48px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="glow-orb glow-orb-purple" style={{ width: '400px', height: '400px', top: '-200px', right: '-100px', opacity: 0.4 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{
              width: '76px', height: '76px', borderRadius: '50%', flexShrink: 0,
              outline: '1px solid #A8873A', outlineOffset: '4px',
              background: isExpert ? '#2F3B6B' : '#B0573D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.9rem', fontWeight: 400, color: '#FBF8F3', fontFamily: 'var(--font-serif)',
            }}>
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="eyebrow" style={{ margin: '0 0 8px' }}>{isExpert ? 'Artisan studio' : 'Learner studio'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.4rem', margin: 0, fontWeight: 400 }}>
                  Welcome back, <span className="gradient-text">{user?.name}</span>!
                </h1>
                <span className={`badge ${isExpert ? 'badge-expert' : 'badge-learner'}`}>
                  {isExpert ? <Wand2 size={11} /> : <GraduationCap size={11} />}
                  {user?.role}
                </span>
              </div>
              <p style={{ color: '#7A6F63', margin: '10px 0 0', fontSize: '0.95rem' }}>
                {isExpert
                  ? `Sharing ${user?.expertise || 'your craft'} with the Kalaverse`
                  : 'Continue your craft learning journey'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '48px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '40px' }}>
          {/* Left: Actions */}
          <div>
            <h3 className="eyebrow" style={{ margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #DDD2C0' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <QuickAction
                label="Go to Social Feed"
                description="Browse posts from the community"
                icon={Rss}
                onClick={() => navigate('/feed')}
                color="#2F3B6B"
              />
              {!isExpert && AR_TUTORIALS[0] && (
                <QuickAction
                  label="Start AR Practice"
                  description={`Practise ${AR_TUTORIALS[0].title} with your camera and an AI coach`}
                  icon={Hand}
                  onClick={() => navigate(getPracticePath(AR_TUTORIALS[0]))}
                  color="#5D7A58"
                />
              )}
              {isExpert && (
                <QuickAction
                  label="View My Profile"
                  description="See how learners see your profile"
                  icon={User}
                  onClick={() => navigate(`/expert/${user.id}`)}
                  color="#B0573D"
                />
              )}
              <QuickAction
                label={isExpert ? 'Manage Tutorials' : 'Browse Tutorials'}
                description={isExpert ? 'View your AR tutorial stubs' : 'Discover expert tutorials'}
                icon={BookOpen}
                onClick={() => navigate('/feed')}
                color="#A8873A"
              />
            </div>
          </div>

          {/* Right: Profile summary */}
          <div>
            <h3 className="eyebrow" style={{ margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #DDD2C0' }}>
              Your Profile
            </h3>
            <div className="glass-card" style={{ padding: '24px' }}>
              {user?.bio ? (
                <p style={{ color: '#4A423B', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', lineHeight: 1.65, margin: '0 0 16px' }}>{user.bio}</p>
              ) : (
                <p style={{ color: '#A39887', fontSize: '0.9rem', fontStyle: 'italic', margin: '0 0 16px' }}>
                  No bio added yet.
                </p>
              )}

              {isExpert && user?.expertise && (
                <div style={{ marginBottom: '12px' }}>
                  <span className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>CRAFT</span>
                  <span className="badge badge-expert">{user.expertise}</span>
                </div>
              )}

              {(user?.contact?.email || user?.contact?.mobile) && (
                <div style={{ fontSize: '0.82rem', color: '#7A6F63', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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

        {/* AR Practice */}
        {AR_TUTORIALS.length > 0 && (
          <section style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid #DDD2C0' }} aria-labelledby="ar-practice-heading">
            <h3 id="ar-practice-heading" style={{ fontSize: '2rem', fontWeight: 400, margin: '0 0 8px' }}>
              AR Practice
            </h3>
            <p style={{ color: '#7A6F63', fontSize: '0.95rem', margin: '0 0 28px', maxWidth: '560px' }}>
              Practise with your camera: hand tracking checks each step and an AI coach guides you.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '28px' }}>
              {AR_TUTORIALS.map((tutorial) => (
                <PracticeCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  onStart={() => navigate(getPracticePath(tutorial))}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
