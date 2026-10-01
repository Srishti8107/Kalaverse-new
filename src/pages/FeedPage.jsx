// src/pages/FeedPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Rss, Filter, Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { getPosts } from '../services/firebase';

const DEMO_POSTS = [
  {
    id: 'demo-1',
    authorId: 'expert-demo-1',
    authorName: 'Priya Sharma',
    role: 'Expert',
    content: 'Just finished a new hand-thrown pottery collection inspired by Rajasthani blue pottery tradition 🏺\n\nEach piece takes 3 days to complete — from wedging the clay, to throwing, to the delicate hand-painting. Patience is the first craft to master.',
    mediaUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop',
    timestamp: null,
  },
  {
    id: 'demo-2',
    authorId: 'learner-demo-1',
    authorName: 'Arjun Mehta',
    role: 'Learner',
    content: 'Week 3 of learning embroidery from Priya\'s workshop. The patience required is unreal, but so is the satisfaction of seeing a pattern come together stitch by stitch 🧵✨',
    mediaUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop',
    timestamp: null,
  },
  {
    id: 'demo-3',
    authorId: 'expert-demo-2',
    authorName: 'Ramesh Iyer',
    role: 'Expert',
    content: 'Woodcarving tip of the day: Always work WITH the grain, never against it. The wood will tell you where it wants to go. Thirty years of this craft and I\'m still listening 🌳\n\n#WoodcarvingWisdom #TraditionalCrafts',
    mediaUrl: '',
    timestamp: null,
  },
  {
    id: 'demo-4',
    authorId: 'expert-demo-3',
    authorName: 'Kavitha Nair',
    role: 'Expert',
    content: 'New AR tutorial series dropping next month — "Tanjore Painting Decoded" 🎨\n\nI\'ll be walking through gold leaf application techniques that have been in my family for 4 generations. Stay tuned, Kalaverse!',
    mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop',
    timestamp: null,
  },
];

export default function FeedPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'experts' | 'learners'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const fetched = await getPosts();
      // Merge real posts with demo posts (demo posts appear after real ones)
      const combined = [...fetched, ...DEMO_POSTS.filter(d => !fetched.find(f => f.id === d.id))];
      setPosts(combined);
      setError('');
    } catch (err) {
      console.warn('Could not load from Firebase, showing demo posts:', err);
      setPosts(DEMO_POSTS);
      setError('Firebase not configured. Showing demo posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Filtering
  const filteredPosts = posts.filter(p => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'experts' && p.role === 'Expert') ||
      (filter === 'learners' && p.role === 'Learner');
    const matchesSearch =
      !searchQuery ||
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Page header */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(243,238,229,0.88)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: '68px', zIndex: 50,
      }}>
        <div className="container container-narrow" style={{ paddingTop: '20px', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Rss size={17} color="#A8873A" />
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 400 }}>Community Feed</h2>
            </div>

            {/* Refresh */}
            <button
              onClick={() => loadPosts(true)}
              disabled={refreshing}
              style={{
                background: 'transparent', border: '1px solid var(--color-border)',
                borderRadius: '999px', padding: '8px 10px', cursor: 'pointer',
                color: '#7A6F63', display: 'flex', alignItems: 'center',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>

            {/* Create post */}
            <button
              id="create-post-btn"
              onClick={() => setShowModal(true)}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', fontSize: '0.9rem' }}
            >
              <Plus size={16} />
              Create Post
            </button>
          </div>

          {/* Search + Filter row */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={15} color="#7A6F63" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="feed-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="input-field"
                style={{ paddingLeft: '36px', padding: '9px 14px 9px 38px', fontSize: '0.875rem', borderRadius: '999px' }}
              />
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#FBF8F3', borderRadius: '999px', padding: '4px', border: '1px solid var(--color-border)' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'experts', label: 'Experts' },
                { key: 'learners', label: 'Learners' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '6px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.82rem',
                    transition: 'all 0.2s',
                    background: filter === key ? '#2F3B6B' : 'transparent',
                    color: filter === key ? '#FBF8F3' : '#7A6F63',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="container container-narrow" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '14px', marginBottom: '24px',
            background: 'rgba(168,135,58,0.08)', border: '1px solid rgba(168,135,58,0.25)',
            color: '#8A6D2A', fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          // Skeleton
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: '20px', padding: '24px', border: '1px solid var(--color-border)', background: 'var(--color-bg-glass)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '14px', width: '160px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '12px', width: '80px' }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: '14px', width: '100%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(47,59,107,0.1)', border: '1px solid rgba(47,59,107,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <Rss size={28} color="#2F3B6B" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 400, color: '#2B2622', marginBottom: '8px' }}>No posts found</h3>
            <p style={{ color: '#7A6F63', fontSize: '0.9rem', marginBottom: '20px' }}>
              {searchQuery ? 'Try a different search term.' : 'Be the first to post in the community!'}
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Create the First Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {filteredPosts.map((post, idx) => (
              <div key={post.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                <PostCard post={post} currentUser={user} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CreatePostModal
          user={user}
          onClose={() => setShowModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
