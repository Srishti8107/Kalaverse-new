// src/pages/UserEntry.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, ChevronDown, Loader2, AlertCircle, Wand2, GraduationCap } from 'lucide-react';
import { createUser } from '../services/firebase';

const CRAFTS = [
  'Pottery', 'Weaving', 'Woodcarving', 'Metalwork', 'Embroidery',
  'Jewelry Making', 'Leather Craft', 'Textile Art', 'Basket Weaving', 'Other',
];

export default function UserEntry({ onUserSet }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = basic info, 2 = role selection
  const [form, setForm] = useState({
    name: '',
    role: '',
    bio: '',
    expertise: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.role) { setError('Please select your role.'); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role) {
      setError('Name and role are required.');
      return;
    }
    setLoading(true);
    setError('');

    // Safety timeout: if Firestore never resolves (e.g. hanging on rules check),
    // reject after 10 s so the button always unlocks.
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Check your internet connection or Firestore Security Rules.')), 10000)
    );

    try {
      const userId = await Promise.race([
        createUser({
          name: form.name.trim(),
          role: form.role,
          bio: form.bio.trim(),
          expertise: form.expertise,
          contact: { mobile: form.mobile.trim(), email: form.email.trim() },
        }),
        timeoutPromise,
      ]);

      const userObj = {
        id: userId,
        name: form.name.trim(),
        role: form.role,
        bio: form.bio.trim(),
        expertise: form.expertise,
        contact: { mobile: form.mobile.trim(), email: form.email.trim() },
      };

      localStorage.setItem('kalaverse_user', JSON.stringify(userObj));
      onUserSet(userObj);
      navigate(form.role === 'Expert' ? '/dashboard/expert' : '/dashboard/learner');
    } catch (err) {
      console.error('[UserEntry] Firestore write failed:', err);

      // Surface the real error code so Firestore permission issues are visible.
      const code = err?.code ?? '';
      if (code === 'permission-denied') {
        setError('Firestore write blocked (permission-denied). Open the Firebase Console → Firestore → Rules and set: allow read, write: if true;  (for testing only).');
      } else if (err.message?.includes('timed out')) {
        setError(err.message);
      } else {
        setError(`Firebase error: ${err.message || 'Unknown error. Check the browser console for details.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-sand-100)', backgroundImage: 'linear-gradient(rgba(43,38,34,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(43,38,34,0.035) 1px, transparent 1px)', backgroundSize: '28px 28px', position: 'relative', overflow: 'hidden', padding: '20px',
    }}>
      {/* Orbs */}
      <div className="glow-orb glow-orb-purple" style={{ width: '500px', height: '500px', top: '-150px', left: '-150px' }} />
      <div className="glow-orb glow-orb-pink" style={{ width: '400px', height: '400px', bottom: '-100px', right: '-100px', animationDelay: '2s' }} />
      <div className="glow-orb glow-orb-amber" style={{ width: '300px', height: '300px', top: '50%', left: '60%', animationDelay: '4s' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: '#2F3B6B', outline: '1px solid #A8873A', outlineOffset: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 1px 2px rgba(43,38,34,0.06)',
          }}>
            <Sparkles size={32} color="#EADFC4" />
          </div>
          <p className="eyebrow" style={{ margin: '0 0 10px' }}>A living archive of handmade craft</p>
          <h1 style={{ fontSize: '2.75rem', margin: '0 0 10px', letterSpacing: '-0.02em', fontWeight: 400 }}>
            Welcome to <span className="gradient-text">Kalaverse</span>
          </h1>
          <p style={{ color: '#7A6F63', fontSize: '1rem', margin: 0 }}>
            Where traditional crafts meet the digital world
          </p>
        </div>

        {/* Card */}
        <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '36px', borderRadius: '24px' }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: '3px',
                background: step >= s ? '#A8873A' : '#DDD2C0',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>

          {step === 1 ? (
            // ── Step 1: Basic Info ──
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px', color: '#2B2622' }}>
                Tell us about yourself
              </h2>
              <p style={{ color: '#7A6F63', fontSize: '0.875rem', margin: '0 0 24px' }}>
                Step 1 of 2 — Your identity in the Kalaverse
              </p>

              {/* Name */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7A6F63', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#7A6F63" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="user-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Role */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7A6F63', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                  I am a... *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { value: 'Expert', label: 'Expert', sub: 'Share your craft', icon: Wand2, color: '#2F3B6B' },
                    { value: 'Learner', label: 'Learner', sub: 'Explore & learn', icon: GraduationCap, color: '#B0573D' },
                  ].map(({ value, label, sub, icon: Icon, color }) => (
                    <button
                      key={value}
                      id={`role-${value.toLowerCase()}`}
                      type="button"
                      onClick={() => handleChange('role', value)}
                      style={{
                        padding: '22px 16px', borderRadius: '18px', border: 'none', cursor: 'pointer',
                        textAlign: 'center', transition: 'all 0.25s',
                        background: form.role === value
                          ? `${color}12`
                          : 'rgba(43,38,34,0.03)',
                        borderWidth: '2px', borderStyle: 'solid',
                        borderColor: form.role === value ? color : '#DDD2C0',
                        boxShadow: form.role === value ? '0 1px 2px rgba(43,38,34,0.06)' : 'none',
                      }}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', margin: '0 auto 12px',
                        background: `${color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={22} color={color} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.15rem', color: '#2B2622', marginBottom: '4px' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#7A6F63' }}>{sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                  background: 'rgba(166,61,47,0.1)', border: '1px solid rgba(166,61,47,0.25)',
                  color: '#A63D2F', fontSize: '0.85rem',
                }}>
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button
                id="next-step-btn"
                type="button"
                onClick={handleNext}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                Continue →
              </button>
            </div>
          ) : (
            // ── Step 2: Profile Details ──
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px', color: '#2B2622' }}>
                Complete your profile
              </h2>
              <p style={{ color: '#7A6F63', fontSize: '0.875rem', margin: '0 0 24px' }}>
                Step 2 of 2 — {form.role === 'Expert' ? 'Share your expertise' : 'Tell us your interests'}
              </p>

              {form.role === 'Expert' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7A6F63', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                    Craft / Expertise
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="expertise-select"
                      value={form.expertise}
                      onChange={(e) => handleChange('expertise', e.target.value)}
                      className="input-field"
                      style={{ appearance: 'none', paddingRight: '40px' }}
                    >
                      <option value="">Select your craft...</option>
                      {CRAFTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} color="#7A6F63" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7A6F63', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                  Short Bio
                </label>
                <textarea
                  id="user-bio"
                  value={form.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder={form.role === 'Expert' ? 'Describe your craft journey and skills...' : 'What are you hoping to learn?'}
                  rows={3}
                  className="input-field"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7A6F63', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                    Email
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@email.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7A6F63', marginBottom: '8px', fontFamily: 'var(--font-sans)' }}>
                    Mobile
                  </label>
                  <input
                    id="user-mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                  background: 'rgba(166,61,47,0.1)', border: '1px solid rgba(166,61,47,0.25)',
                  color: '#A63D2F', fontSize: '0.85rem',
                }}>
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="btn-ghost"
                  style={{ flex: '0 0 auto' }}
                >
                  ← Back
                </button>
                <button
                  id="enter-kalaverse-btn"
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1rem' }}
                >
                  {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
                  {loading ? 'Entering...' : 'Enter Kalaverse'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer note */}
        <p className="animate-fade-in stagger-4" style={{ textAlign: 'center', color: '#A39887', fontSize: '0.8rem', marginTop: '20px' }}>
          No account needed. Just your name and passion for crafts.
        </p>
      </div>
    </div>
  );
}
