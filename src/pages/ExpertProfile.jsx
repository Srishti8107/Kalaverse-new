// src/pages/ExpertProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Star, BookOpen, Video, Lock, Wand2,
  Play, Clock, Users, ChevronRight, Sparkles, ExternalLink, Loader2,
} from 'lucide-react';
import { getUserById } from '../services/firebase';

// ─── Stub tutorial data (AR logic not yet implemented) ───────
const STUB_TUTORIALS = [
  {
    id: 'tut-1',
    title: 'Introduction to Hand-Thrown Pottery',
    description: 'Learn the basics of centering clay on the wheel and pulling your first cylinder.',
    duration: '45 min',
    type: 'free',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop',
    studentsCount: 128,
    rating: 4.8,
  },
  {
    id: 'tut-2',
    title: 'Advanced Glazing Techniques',
    description: 'Explore layered glaze applications, wax resist, and trailing methods for unique effects.',
    duration: '1h 20min',
    type: 'paid',
    price: '₹499',
    thumbnail: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop',
    studentsCount: 64,
    rating: 4.9,
  },
  {
    id: 'tut-3',
    title: 'AR-Guided Wheel Throwing (Coming Soon)',
    description: 'Experience guided throwing with real-time AR overlay for hand positioning and pressure.',
    duration: '~2h',
    type: 'paid',
    price: '₹899',
    thumbnail: '',
    studentsCount: 0,
    rating: null,
    comingSoon: true,
  },
];

function TutorialCard({ tutorial, expertName }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isPaid = tutorial.type === 'paid';
  const isSoon = tutorial.comingSoon;

  return (
    <div className="tutorial-card" style={{ opacity: isSoon ? 0.7 : 1 }}>
      {/* Thumbnail */}
      <div style={{
        height: '160px', position: 'relative', overflow: 'hidden',
        background: tutorial.thumbnail && !imgError
          ? 'rgba(255,255,255,0.04)'
          : 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))',
      }}>
        {tutorial.thumbnail && !imgError ? (
          <>
            {!imgLoaded && <div className="skeleton" style={{ width: '100%', height: '100%' }} />}
            <img
              src={tutorial.thumbnail}
              alt={tutorial.title}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: imgLoaded ? 'block' : 'none' }}
            />
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={40} color="rgba(168,85,247,0.4)" />
          </div>
        )}

        {/* Overlay badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`badge ${isPaid ? 'badge-paid' : 'badge-free'}`}>
            {isPaid ? <Lock size={10} /> : <Sparkles size={10} />}
            {isPaid ? (tutorial.price || 'Paid') : 'Free'}
          </span>
          {isSoon && (
            <span className="badge" style={{ background: 'rgba(100,116,139,0.4)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)', backdropFilter: 'blur(6px)' }}>
              Coming Soon
            </span>
          )}
        </div>

        {/* Play button overlay */}
        {!isSoon && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0)', transition: 'background 0.2s',
          }}
            className="play-overlay"
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(168,85,247,0.85)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168,85,247,0.5)',
              opacity: 0, transition: 'opacity 0.2s',
            }}>
              <Play size={20} color="white" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', color: '#f1f5f9', margin: '0 0 6px', lineHeight: 1.4 }}>
          {tutorial.title}
        </h4>
        <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 12px' }}>
          {tutorial.description}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem' }}>
            <Clock size={12} />
            {tutorial.duration}
          </div>
          {tutorial.studentsCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.78rem' }}>
              <Users size={12} />
              {tutorial.studentsCount} students
            </div>
          )}
          {tutorial.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.78rem' }}>
              <Star size={12} fill="#fbbf24" />
              {tutorial.rating}
            </div>
          )}
        </div>

        {/* AR stub notice */}
        <div style={{
          padding: '8px 12px', borderRadius: '8px', marginBottom: '12px',
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.75rem', color: '#8b5cf6',
        }}>
          <Sparkles size={12} />
          AR tutorial logic — coming in a future phase
        </div>

        <button
          disabled={isSoon}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px', border: 'none', cursor: isSoon ? 'not-allowed' : 'pointer',
            background: isSoon ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
            color: isSoon ? '#475569' : 'white',
            fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'opacity 0.2s',
          }}
        >
          {isSoon ? 'Notify Me' : (isPaid ? `Enroll — ${tutorial.price}` : 'Start Free Tutorial')}
          {!isSoon && <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}

// Demo expert data used if Firestore ID isn't found
const DEMO_EXPERT = {
  id: 'demo-expert',
  name: 'Priya Sharma',
  role: 'Expert',
  expertise: 'Pottery',
  bio: 'Master potter with over 15 years of experience in traditional Indian pottery techniques. I specialize in wheel-thrown stoneware and hand-built terracotta inspired by Rajasthani and Madhubani traditions. Passionate about preserving traditional craft while exploring contemporary forms.',
  photoUrl: '',
  contact: { email: 'priya@kalaverse.in', mobile: '+91 98765 43210' },
};

export default function ExpertProfile({ currentUser }) {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tutorials');

  useEffect(() => {
    const fetchExpert = async () => {
      setLoading(true);
      try {
        const data = await getUserById(expertId);
        setExpert(data || DEMO_EXPERT);
      } catch {
        setExpert(DEMO_EXPERT);
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [expertId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} color="#a855f7" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: '#64748b' }}>Loading expert profile...</p>
        </div>
      </div>
    );
  }

  const initials = expert?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Back nav */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 0' }}>
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
              fontFamily: 'Outfit', fontWeight: 500, fontSize: '0.875rem', transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={16} />
            Back to Feed
          </button>
        </div>
      </div>

      {/* Profile Hero */}
      <div className="profile-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb glow-orb-purple" style={{ width: '500px', height: '500px', top: '-200px', right: '-150px', opacity: 0.3 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '24px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit',
              flexShrink: 0,
              boxShadow: '0 0 40px rgba(168,85,247,0.4)',
            }}>
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{expert?.name}</h1>
                <span className="badge badge-expert">
                  <Wand2 size={11} /> Expert
                </span>
              </div>

              {expert?.expertise && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                    🎨 {expert.expertise}
                  </span>
                </div>
              )}

              {expert?.bio && (
                <p style={{ color: '#94a3b8', lineHeight: 1.65, fontSize: '0.95rem', maxWidth: '600px', margin: '0 0 16px' }}>
                  {expert.bio}
                </p>
              )}

              {/* Contact */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {expert?.contact?.email && (
                  <a
                    href={`mailto:${expert.contact.email}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem',
                      padding: '6px 14px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Mail size={14} />
                    {expert.contact.email}
                    <ExternalLink size={11} />
                  </a>
                )}
                {expert?.contact?.mobile && (
                  <a
                    href={`tel:${expert.contact.mobile}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem',
                      padding: '6px 14px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Phone size={14} />
                    {expert.contact.mobile}
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Tutorials', value: STUB_TUTORIALS.length },
                { label: 'Students', value: STUB_TUTORIALS.reduce((a, t) => a + t.studentsCount, 0) },
                { label: 'Rating', value: '4.9 ★' },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', color: '#f1f5f9' }}>{value}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0' }}>
            {[
              { key: 'tutorials', label: 'Tutorials', icon: BookOpen },
              { key: 'about', label: 'About', icon: Wand2 },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '14px 24px', background: 'none', border: 'none',
                  borderBottom: activeTab === key ? '2px solid #a855f7' : '2px solid transparent',
                  cursor: 'pointer', fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.9rem',
                  color: activeTab === key ? '#c084fc' : '#64748b', transition: 'all 0.2s',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container" style={{ padding: '32px 20px' }}>
        {activeTab === 'tutorials' && (
          <div className="animate-fade-in">
            {/* AR Notice Banner */}
            <div style={{
              padding: '16px 20px', borderRadius: '14px', marginBottom: '28px',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.06))',
              border: '1px solid rgba(168,85,247,0.2)',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(168,85,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={20} color="#a855f7" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: '#c084fc', fontSize: '0.95rem', marginBottom: '2px' }}>
                  AR Tutorial System — Phase 2
                </div>
                <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
                  The AR tutorial execution logic is reserved for a future implementation phase. The cards below show the planned tutorial layout.
                </div>
              </div>
            </div>

            {/* Tutorial grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {STUB_TUTORIALS.map(tutorial => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} expertName={expert?.name} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-fade-in" style={{ maxWidth: '640px' }}>
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', margin: '0 0 16px', color: '#f1f5f9' }}>
                About {expert?.name}
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '0.95rem', margin: '0 0 20px' }}>
                {expert?.bio || 'No biography added yet.'}
              </p>

              {expert?.expertise && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Primary Craft
                  </div>
                  <span className="badge badge-expert" style={{ fontSize: '0.875rem', padding: '6px 16px' }}>
                    🎨 {expert.expertise}
                  </span>
                </div>
              )}

              <div className="divider" />

              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Contact Details
              </div>
              {expert?.contact?.email ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <Mail size={15} color="#a855f7" />
                  <a href={`mailto:${expert.contact.email}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{expert.contact.email}</a>
                </div>
              ) : null}
              {expert?.contact?.mobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <Phone size={15} color="#a855f7" />
                  <a href={`tel:${expert.contact.mobile}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{expert.contact.mobile}</a>
                </div>
              ) : null}
              {!expert?.contact?.email && !expert?.contact?.mobile && (
                <p style={{ color: '#475569', fontSize: '0.875rem', fontStyle: 'italic' }}>No contact details provided.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
