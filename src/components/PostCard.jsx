// src/components/PostCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ExternalLink, Clock } from 'lucide-react';

function timeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_GRADIENTS = [
  '#2F3B6B',
  '#B0573D',
  '#A8873A',
  '#5D7A58',
  '#6E5A4A',
];

function getGradient(name) {
  if (!name) return AVATAR_GRADIENTS[0];
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export default function PostCard({ post, currentUser }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 40) + 1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isExpert = post.role === 'Expert';
  const isOwnPost = currentUser?.id === post.authorId;

  const handleAuthorClick = () => {
    if (isExpert && post.authorId) {
      navigate(`/expert/${post.authorId}`);
    }
  };

  const handleLike = () => {
    setLiked(prev => {
      setLikeCount(c => prev ? c - 1 : c + 1);
      return !prev;
    });
  };

  return (
    <article className="post-card animate-fade-in-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {/* Avatar */}
        <div
          onClick={isExpert ? handleAuthorClick : undefined}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: getGradient(post.authorName),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 400, color: '#FBF8F3', fontFamily: 'var(--font-serif)',
            cursor: isExpert ? 'pointer' : 'default',
            flexShrink: 0,
            boxShadow: isExpert ? '0 1px 2px rgba(43,38,34,0.06)' : 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          title={isExpert ? `View ${post.authorName}'s profile` : undefined}
        >
          {getInitials(post.authorName)}
        </div>

        {/* Author info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={isExpert ? handleAuthorClick : undefined}
              style={{
                background: 'none', border: 'none', padding: 0, cursor: isExpert ? 'pointer' : 'default',
                fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '1.08rem', color: '#2B2622',
                textDecoration: 'none', transition: 'color 0.2s',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
              title={isExpert ? `View ${post.authorName}'s profile` : undefined}
            >
              {post.authorName}
              {isExpert && <ExternalLink size={12} color="#2F3B6B" />}
            </button>
            <span className={`badge ${isExpert ? 'badge-expert' : 'badge-learner'}`}>
              {post.role}
            </span>
            {isOwnPost && (
              <span className="badge" style={{ background: 'rgba(122,111,99,0.15)', color: '#7A6F63', border: '1px solid rgba(122,111,99,0.3)' }}>
                You
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#7A6F63', fontSize: '0.8rem' }}>
            <Clock size={11} />
            <span>{timeAgo(post.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p style={{
        color: '#4A423B', lineHeight: 1.7, fontSize: '0.98rem',
        margin: '0 0 16px 0', whiteSpace: 'pre-wrap',
      }}>
        {post.content}
      </p>

      {/* Media */}
      {post.mediaUrl && !imageError && (
        <div style={{
          borderRadius: '16px', overflow: 'hidden', marginBottom: '16px',
          border: '1px solid rgba(43,38,34,0.03)',
          background: imageLoaded ? 'transparent' : 'rgba(43,38,34,0.03)',
          minHeight: imageLoaded ? 0 : '200px',
          position: 'relative',
        }}>
          {!imageLoaded && (
            <div className="skeleton" style={{ width: '100%', height: '200px' }} />
          )}
          <img
            src={post.mediaUrl}
            alt="Post media"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: '100%', maxHeight: '400px', objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none',
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="divider" style={{ margin: '12px 0' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', rowGap: '8px' }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
            background: liked ? 'rgba(176,87,61,0.12)' : 'transparent',
            color: liked ? '#B0573D' : '#7A6F63',
            fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)',
            transition: 'all 0.2s',
          }}
        >
          <Heart size={15} fill={liked ? '#B0573D' : 'none'} />
          {likeCount}
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
          background: 'transparent', color: '#7A6F63',
          fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)',
          transition: 'all 0.2s',
        }}>
          <MessageCircle size={15} />
          Comment
        </button>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
          background: 'transparent', color: '#7A6F63',
          fontSize: '0.85rem', fontWeight: 500, fontFamily: 'var(--font-sans)',
          transition: 'all 0.2s',
        }}>
          <Share2 size={15} />
          Share
        </button>

        {isExpert && (
          <button
            onClick={handleAuthorClick}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 16px', borderRadius: '999px', border: '1px solid rgba(47,59,107,0.3)', cursor: 'pointer',
              background: 'rgba(47,59,107,0.08)', color: '#2F3B6B',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s',
            }}
          >
            View Profile
            <ExternalLink size={12} />
          </button>
        )}
      </div>
    </article>
  );
}
