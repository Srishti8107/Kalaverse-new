// src/components/CreatePostModal.jsx
import { useState } from 'react';
import { X, Image, Send, Loader2, AlertCircle } from 'lucide-react';
import { createPost } from '../services/firebase';

export default function CreatePostModal({ user, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const id = await createPost({
        authorId: user.id,
        authorName: user.name,
        role: user.role,
        content: content.trim(),
        mediaUrl: mediaUrl.trim(),
      });
      onPostCreated?.({ id, authorId: user.id, authorName: user.name, role: user.role, content: content.trim(), mediaUrl: mediaUrl.trim(), timestamp: null });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to publish post. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = content.length;
  const maxChars = 500;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="glass-card animate-fade-in-up"
        style={{ width: '100%', maxWidth: '580px', padding: '32px', borderRadius: '24px', boxShadow: '0 30px 80px -30px rgba(43,38,34,0.45)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 400, margin: 0, color: '#2B2622' }}>
              Create Post
            </h2>
            <p style={{ color: '#7A6F63', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Share your craft with the Kalaverse community
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(43,38,34,0.03)', border: '1px solid #DDD2C0',
              borderRadius: '999px', padding: '8px', cursor: 'pointer', color: '#7A6F63',
              display: 'flex', alignItems: 'center', transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Author info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#2F3B6B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 400, color: '#FBF8F3', fontFamily: 'var(--font-serif)', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontFamily: 'var(--font-serif)', color: '#2B2622', fontSize: '1.05rem' }}>
              {user?.name}
            </div>
            <span className={`badge ${user?.role === 'Expert' ? 'badge-expert' : 'badge-learner'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Content area */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
              placeholder={user?.role === 'Expert'
                ? "Share your craft wisdom, techniques, or a new creation..."
                : "What are you learning today? Ask a question or share progress..."}
              rows={5}
              className="input-field"
              style={{ resize: 'vertical', minHeight: '120px', lineHeight: 1.65 }}
            />
            <div style={{
              position: 'absolute', bottom: '10px', right: '12px',
              fontSize: '0.75rem', color: charCount > maxChars * 0.9 ? '#A8873A' : '#7A6F63',
            }}>
              {charCount}/{maxChars}
            </div>
          </div>

          {/* Media URL toggle */}
          <button
            type="button"
            onClick={() => setShowMediaInput(!showMediaInput)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '999px',
              border: showMediaInput ? '1px solid rgba(47,59,107,0.4)' : '1px solid #DDD2C0',
              background: showMediaInput ? 'rgba(47,59,107,0.1)' : 'transparent',
              color: showMediaInput ? '#2F3B6B' : '#7A6F63',
              fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)', cursor: 'pointer',
              transition: 'all 0.2s', marginBottom: '12px',
            }}
          >
            <Image size={15} />
            {showMediaInput ? 'Remove Image' : 'Add Image URL'}
          </button>

          {showMediaInput && (
            <div style={{ marginBottom: '16px' }} className="animate-fade-in">
              <input
                id="post-media-url"
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input-field"
                style={{ marginBottom: '8px' }}
              />
              {mediaUrl && (
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #DDD2C0' }}>
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(166,61,47,0.1)', border: '1px solid rgba(166,61,47,0.25)',
              color: '#A63D2F', fontSize: '0.85rem',
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="divider" />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              id="publish-post-btn"
              type="submit"
              className="btn-primary"
              disabled={loading || !content.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: (!content.trim() && !loading) ? 0.5 : 1 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
