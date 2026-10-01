// src/pages/ExpertProfile.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Star, BookOpen, Video, Lock, Wand2,
  Play, Clock, Users, ChevronRight, Sparkles, ExternalLink, Loader2,
} from 'lucide-react';
import { getUserById } from '../services/firebase';
import { TUTORIALS, getPracticePath } from '../tutorials';

function TutorialCard({ tutorial, onOpen }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isPaid = tutorial.type === 'paid';
  const isSoon = tutorial.comingSoon;
  const practicePath = getPracticePath(tutorial);
  const open = practicePath ? () => onOpen(practicePath) : undefined;

  return (
    <div
      className="tutorial-card"
      onClick={open}
      style={{ opacity: isSoon ? 0.7 : 1, cursor: practicePath ? 'pointer' : 'default' }}
    >
      {/* Thumbnail */}
      <div style={{
        height: '220px', position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid #DDD2C0',
        background: tutorial.thumbnail && !imgError
          ? '#E9E1D3'
          : 'repeating-linear-gradient(45deg, #E9E1D3 0 12px, #E4DBCC 12px 24px)',
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
            <Video size={36} color="rgba(47,59,107,0.35)" strokeWidth={1.5} />
          </div>
        )}

        {/* Overlay badges */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`badge ${isPaid ? 'badge-paid' : 'badge-free'}`}>
            {isPaid ? <Lock size={10} /> : <Sparkles size={10} />}
            {isPaid ? (tutorial.price || 'Paid') : 'Free'}
          </span>
          {isSoon && (
            <span className="badge" style={{ background: 'rgba(251,248,243,0.92)', color: '#7A6F63', border: '1px solid rgba(122,111,99,0.3)' }}>
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
              background: 'rgba(47,59,107,0.85)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(43,38,34,0.06)',
              opacity: 0, transition: 'opacity 0.2s',
            }}>
              <Play size={20} color="white" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px 22px 22px' }}>
        <h4 style={{ fontSize: '1.25rem', color: '#2B2622', margin: '0 0 8px', lineHeight: 1.25 }}>
          {tutorial.title}
        </h4>
        <p style={{ color: '#4A423B', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 14px' }}>
          {tutorial.description}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #E9E1D3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7A6F63', fontSize: '0.78rem' }}>
            <Clock size={12} />
            {tutorial.duration}
          </div>
          {tutorial.studentsCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7A6F63', fontSize: '0.78rem' }}>
              <Users size={12} />
              {tutorial.studentsCount} students
            </div>
          )}
          {tutorial.rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#A8873A', fontSize: '0.78rem' }}>
              <Star size={12} fill="#A8873A" />
              {tutorial.rating}
            </div>
          )}
        </div>

        {/* AR practice notice */}
        <div style={{
          padding: '8px 12px', borderRadius: '12px', marginBottom: '14px',
          background: practicePath ? 'rgba(93,122,88,0.08)' : 'rgba(47,59,107,0.06)',
          border: practicePath ? '1px solid rgba(93,122,88,0.25)' : '1px solid rgba(47,59,107,0.15)',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '0.75rem', color: practicePath ? '#5D7A58' : '#2F3B6B',
        }}>
          <Sparkles size={12} />
          {practicePath ? 'Live AR practice with AI coach' : 'AR practice — coming in a future phase'}
        </div>

        <button
          type="button"
          disabled={isSoon}
          onClick={(e) => {
            e.stopPropagation();
            open?.();
          }}
          style={{
            width: '100%', padding: '11px', borderRadius: '999px', cursor: isSoon ? 'not-allowed' : 'pointer',
            border: isSoon ? '1px solid #DDD2C0' : '1px solid #2F3B6B',
            background: isSoon ? 'transparent' : '#2F3B6B',
            color: isSoon ? '#A39887' : '#FBF8F3',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'opacity 0.2s',
          }}
        >
          {isSoon ? 'Notify Me' : practicePath ? 'Start AR Practice' : (isPaid ? `Enroll — ${tutorial.price}` : 'Start Free Tutorial')}
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
          <Loader2 size={36} color="#2F3B6B" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p style={{ color: '#7A6F63' }}>Loading expert profile...</p>
        </div>
      </div>
    );
  }

  const initials = expert?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Back nav */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '14px 0' }}>
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', color: '#7A6F63', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '0.875rem', transition: 'color 0.2s',
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
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '112px', height: '112px', borderRadius: '50%',
              background: '#2F3B6B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.4rem', fontWeight: 400, color: '#FBF8F3', fontFamily: 'var(--font-serif)',
              flexShrink: 0,
              outline: '1px solid #A8873A', outlineOffset: '6px',
            }}>
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 'min(280px, 100%)' }}>
              <p className="eyebrow" style={{ margin: '0 0 10px' }}>Featured artisan</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '2.6rem', margin: 0, fontWeight: 400 }}>{expert?.name}</h1>
                <span className="badge badge-expert">
                  <Wand2 size={11} /> Expert
                </span>
              </div>

              {expert?.expertise && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge" style={{ background: 'rgba(168,135,58,0.1)', color: '#8A6D2A', border: '1px solid rgba(168,135,58,0.35)' }}>
                    🎨 {expert.expertise}
                  </span>
                </div>
              )}

              {expert?.bio && (
                <p style={{ color: '#4A423B', fontFamily: 'var(--font-serif)', lineHeight: 1.7, fontSize: '1.1rem', maxWidth: '620px', margin: '0 0 20px' }}>
                  {expert.bio}
                </p>
              )}

              {/* Contact */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {expert?.contact?.email && (
                  <a
                    href={`mailto:${expert.contact.email}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: '#4A423B', textDecoration: 'none', fontSize: '0.85rem',
                      padding: '7px 16px', borderRadius: '999px',
                      background: '#F3EEE5', border: '1px solid var(--color-border)',
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
                      color: '#4A423B', textDecoration: 'none', fontSize: '0.85rem',
                      padding: '7px 16px', borderRadius: '999px',
                      background: '#F3EEE5', border: '1px solid var(--color-border)',
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
            <div style={{ display: 'flex', flexWrap: 'wrap', border: '1px solid var(--color-border)', borderRadius: '18px', background: '#F3EEE5', overflow: 'hidden' }}>
              {[
                { label: 'Tutorials', value: TUTORIALS.length },
                { label: 'Students', value: TUTORIALS.reduce((a, t) => a + t.studentsCount, 0) },
                { label: 'Rating', value: '4.9 ★' },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', padding: '16px 22px', borderLeft: label === 'Tutorials' ? 'none' : '1px solid var(--color-border)' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.7rem', color: '#2B2622', lineHeight: 1.1 }}>{value}</div>
                  <div className="eyebrow" style={{ marginTop: '6px', color: '#7A6F63', fontSize: '0.66rem' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(243,238,229,0.88)', backdropFilter: 'blur(10px)' }}>
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
                  padding: '16px 24px', background: 'none', border: 'none',
                  borderBottom: activeTab === key ? '2px solid #A8873A' : '2px solid transparent',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem',
                  color: activeTab === key ? '#2B2622' : '#7A6F63', transition: 'all 0.2s',
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
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '64px' }}>
        {activeTab === 'tutorials' && (
          <div className="animate-fade-in">
            {/* AR Notice Banner */}
            <div style={{
              padding: '18px 22px', borderRadius: '18px', marginBottom: '36px',
              background: 'var(--color-sand-50)',
              border: '1px solid var(--color-border)', borderLeft: '3px solid #A8873A',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(47,59,107,0.08)', border: '1px solid rgba(47,59,107,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={18} color="#2F3B6B" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, color: '#2B2622', fontSize: '1.1rem', marginBottom: '2px' }}>
                  AR Practice with AI Coach
                </div>
                <div style={{ color: '#7A6F63', fontSize: '0.85rem', lineHeight: 1.55 }}>
                  Tutorials marked “Live AR practice” open your camera, track your hands step by step, and give real-time coaching. More crafts are coming soon.
                </div>
              </div>
            </div>

            {/* Tutorial grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '28px' }}>
              {TUTORIALS.map(tutorial => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} onOpen={navigate} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-fade-in" style={{ maxWidth: '680px' }}>
            <div className="glass-card" style={{ padding: '36px' }}>
              <h3 style={{ fontSize: '1.7rem', fontWeight: 400, margin: '0 0 18px', color: '#2B2622' }}>
                About {expert?.name}
              </h3>
              <p style={{ color: '#4A423B', fontFamily: 'var(--font-serif)', lineHeight: 1.75, fontSize: '1.08rem', margin: '0 0 24px' }}>
                {expert?.bio || 'No biography added yet.'}
              </p>

              {expert?.expertise && (
                <div style={{ marginBottom: '20px' }}>
                  <div className="eyebrow" style={{ marginBottom: '10px' }}>
                    Primary Craft
                  </div>
                  <span className="badge badge-expert" style={{ fontSize: '0.875rem', padding: '6px 16px' }}>
                    🎨 {expert.expertise}
                  </span>
                </div>
              )}

              <div className="divider" />

              <div className="eyebrow" style={{ marginBottom: '14px' }}>
                Contact Details
              </div>
              {expert?.contact?.email ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#4A423B', fontSize: '0.9rem' }}>
                  <Mail size={15} color="#2F3B6B" />
                  <a href={`mailto:${expert.contact.email}`} style={{ color: '#4A423B', textDecoration: 'none' }}>{expert.contact.email}</a>
                </div>
              ) : null}
              {expert?.contact?.mobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4A423B', fontSize: '0.9rem' }}>
                  <Phone size={15} color="#2F3B6B" />
                  <a href={`tel:${expert.contact.mobile}`} style={{ color: '#4A423B', textDecoration: 'none' }}>{expert.contact.mobile}</a>
                </div>
              ) : null}
              {!expert?.contact?.email && !expert?.contact?.mobile && (
                <p style={{ color: '#A39887', fontSize: '0.875rem', fontStyle: 'italic' }}>No contact details provided.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
