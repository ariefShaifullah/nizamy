import React, { useState, useCallback, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { apiCall } from '../lib/api';
import type { Post } from '../lib/types';
import { useDebounce } from '../../hooks/useDebounce';

export default function PostList({ onEdit }: { onEdit: (post: Post) => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, 300);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: '15', status: 'all' });
    if (debouncedSearch) params.set('search', debouncedSearch);
    const data = await apiCall(`/posts.php?${params}`);
    setPosts(data.posts || []);
    setTotalPages(data.pagination?.total_pages || 1);
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    await apiCall(`/posts.php?id=${id}`, { method: 'DELETE' });
    loadPosts();
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-emerald-500/20 text-emerald-400',
      draft: 'bg-amber-500/20 text-amber-400',
      archived: 'bg-gray-500/20 text-gray-400',
    };
    return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full ${colors[status] || colors.draft}`}>{status}</span>;
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)',
    color: 'var(--admin-input-text)', paddingLeft: '2.25rem',
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--admin-text-muted)' }} />
        <input type="text" placeholder="Cari artikel..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full md:w-80 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
          style={inputStyle} />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--admin-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--admin-surface)' }} className="text-left">
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Judul</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest font-medium hidden md:table-cell" style={{ color: 'var(--admin-text-secondary)' }}>Kategori</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest font-medium hidden lg:table-cell" style={{ color: 'var(--admin-text-secondary)' }}>Tanggal</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--admin-text-secondary)' }}>Status</th>
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest font-medium text-center w-[120px]" style={{ color: 'var(--admin-text-secondary)' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--admin-border)' }}>
                  <td colSpan={5} className="px-5 py-4"><div className="h-4 rounded animate-pulse" style={{ background: 'var(--admin-surface)' }} /></td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: 'var(--admin-text-muted)' }}>Belum ada artikel</td></tr>
            ) : (
              posts.map(post => (
                <tr key={post.id} className="transition-colors" style={{ borderTop: '1px solid var(--admin-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--admin-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium truncate max-w-[250px]">{post.title}</p>
                    <p className="text-xs mt-0.5 truncate max-w-[250px]" style={{ color: 'var(--admin-text-muted)' }}>{post.author}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>{post.category}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{statusBadge(post.status)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(post)}
                        className="p-2 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--admin-accent)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--admin-accent-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <FaPencilAlt className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--admin-danger)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
            style={{ color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border)' }}>
            <FaChevronLeft className="w-3 h-3" />
          </button>
          <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>Hal {page} dari {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
            style={{ color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border)' }}>
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
