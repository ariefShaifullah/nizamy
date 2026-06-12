import { useState, useEffect } from 'react';
import { FaFileAlt, FaPlus, FaSignOutAlt, FaSun, FaMoon, FaExternalLinkAlt } from 'react-icons/fa';
import { apiCall } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import PostList from './PostList';
import PostEditor from './PostEditor';
import type { Post } from '../lib/types';

type View = 'list' | 'editor';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<View>('list');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [stats, setStats] = useState({ totalPosts: 0, publishedPosts: 0, draftPosts: 0 });

  useEffect(() => {
    Promise.all([
      apiCall('/posts.php?status=all&per_page=1'),
      apiCall('/posts.php?status=published&per_page=1'),
      apiCall('/posts.php?status=draft&per_page=1'),
    ]).then(([all, pub, draft]) => {
      setStats({
        totalPosts: all.pagination?.total || 0,
        publishedPosts: pub.pagination?.total || 0,
        draftPosts: draft.pagination?.total || 0,
      });
    }).catch(() => {});
  }, [view]);

  const openPostEditor = async (post?: Post) => {
    if (post) {
      try {
        const fullPost = await apiCall(`/posts.php?id=${post.id}`);
        setEditingPost(fullPost.id ? fullPost : post);
      } catch { setEditingPost(post); }
    } else {
      setEditingPost(null);
    }
    setView('editor');
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--admin-bg)', color: 'var(--admin-text)', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
        style={{ background: 'var(--admin-header-bg)', borderColor: 'var(--admin-border)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold" style={{ color: 'var(--admin-accent)' }}>NIZAMY</span>
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--admin-text-secondary)' }}>Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://nizamy.com/blog" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border)' }}>
              <FaExternalLinkAlt className="w-2.5 h-2.5" /> Lihat Blog
            </a>
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--admin-text-secondary)', background: 'var(--admin-surface)' }}>
              {theme === 'dark' ? <FaSun className="w-3.5 h-3.5" /> : <FaMoon className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onLogout}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--admin-danger)', border: '1px solid var(--admin-border)' }}>
              <FaSignOutAlt className="w-3 h-3" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          {[
            { label: 'Total Artikel', value: stats.totalPosts, color: 'var(--admin-accent)' },
            { label: 'Published', value: stats.publishedPosts, color: 'var(--admin-success)' },
            { label: 'Draft', value: stats.draftPosts, color: 'var(--admin-warning)' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 md:p-5" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--admin-text-secondary)' }}>{s.label}</p>
              <p className="text-2xl md:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaFileAlt style={{ color: 'var(--admin-accent)' }} />
            <h2 className="text-lg font-semibold">Artikel</h2>
          </div>
          {view === 'list' && (
            <button onClick={() => openPostEditor()}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
              style={{ background: 'var(--admin-accent)', color: '#ffffff' }}>
              <FaPlus className="w-3 h-3" /> Tulis Artikel
            </button>
          )}
        </div>

        {/* Content */}
        {view === 'list' ? (
          <PostList onEdit={openPostEditor} />
        ) : (
          <PostEditor post={editingPost} onBack={() => { setView('list'); setEditingPost(null); }} />
        )}
      </div>
    </div>
  );
}
