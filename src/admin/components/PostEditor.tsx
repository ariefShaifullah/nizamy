import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiCall } from '../lib/api';
import type { Post } from '../lib/types';
import { CATEGORIES } from '../lib/types';

export default function PostEditor({ post, onBack }: { post: Post | null; onBack: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || 'Fiqh Waris',
    tags: (post?.tags || []).join(', '),
    status: post?.status || 'draft',
    featured_image_url: post?.featured_image_url || '',
    featured_image_alt: post?.featured_image_alt || '',
    photographer_name: post?.photographer_name || '',
    photographer_url: post?.photographer_url || '',
    unsplash_url: post?.unsplash_url || '',
    seo_title: post?.seo_title || '',
    seo_description: post?.seo_description || '',
    focus_keyphrase: post?.focus_keyphrase || '',
    reading_time: post?.reading_time || 5,
    author: post?.author || 'Tim Nizamy',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { setMessage('Judul dan konten wajib diisi'); return; }
    setSaving(true); setMessage('');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo_title: form.seo_title || form.title + ' | NIZAMY',
        seo_description: form.seo_description || form.excerpt,
      };

      if (post) {
        await apiCall(`/posts.php?id=${post.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        setMessage('✅ Artikel berhasil diperbarui');
        setSaving(false);
      } else {
        await apiCall('/posts.php', { method: 'POST', body: JSON.stringify(payload) });
        setMessage('✅ Artikel berhasil dibuat! Kembali ke daftar...');
        setTimeout(() => { onBack(); }, 1200);
      }
    } catch {
      setMessage('❌ Gagal menyimpan');
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', background: 'var(--admin-input-bg)', border: '1px solid var(--admin-border)', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--admin-input-text)', outline: 'none', transition: 'border-color 0.2s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--admin-text-secondary)', marginBottom: '0.5rem' };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-xs transition-colors mb-4 md:mb-6 py-2 cursor-pointer" style={{ color: 'var(--admin-text-secondary)' }}>
        <FaArrowLeft className="w-3 h-3" /> Kembali ke daftar
      </button>

      <h2 className="text-lg md:text-xl font-semibold mb-6 md:mb-8" style={{ color: 'var(--admin-accent)' }}>{post ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          <div>
            <label style={labelStyle}>Judul</label>
            <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Judul artikel..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ringkasan / Excerpt</label>
            <textarea value={form.excerpt} onChange={e => handleChange('excerpt', e.target.value)} placeholder="Ringkasan singkat (max 155 karakter untuk SEO)..." rows={2} style={inputStyle} />
          </div>
          <div className="min-w-0 w-full max-w-full overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <label style={{ ...labelStyle, marginBottom: 0 }}>Konten</label>
              <button onClick={() => setPreview(!preview)} className="text-[10px] uppercase tracking-widest transition-colors cursor-pointer" style={{ color: 'var(--admin-accent)' }}>
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="p-4 md:p-8 rounded-lg min-h-[300px] prose prose-slate dark:prose-invert max-w-none"
                style={{ background: 'var(--admin-editor-bg)', border: '1px solid var(--admin-border)', color: 'var(--admin-editor-text)' }}
                dangerouslySetInnerHTML={{ __html: form.content }} />
            ) : (
              <div className="rounded-lg admin-editor">
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={val => handleChange('content', val)}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['blockquote', 'link'],
                      ['clean'],
                    ],
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="rounded-xl p-5" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => handleChange('status', e.target.value)} style={inputStyle}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <div className="mt-4">
              <label style={labelStyle}>Penulis</label>
              <input type="text" value={form.author} onChange={e => handleChange('author', e.target.value)} style={inputStyle} />
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full mt-5 py-3 text-xs uppercase tracking-[0.15em] font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              style={{ background: 'var(--admin-accent)', color: '#ffffff' }}>
              {saving ? 'Menyimpan...' : (post ? 'Perbarui Artikel' : 'Publikasikan')}
            </button>

            {message && (
              <p className="mt-3 text-xs text-center" style={{ color: message.startsWith('✅') ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                {message}
              </p>
            )}
          </div>

          {/* Category + Tags */}
          <div className="rounded-xl p-5" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            <label style={labelStyle}>Kategori</label>
            <select value={form.category} onChange={e => handleChange('category', e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="mt-4">
              <label style={labelStyle}>Tags (pisah koma)</label>
              <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="waris, faraidh, KHI" style={inputStyle} />
            </div>

            <div className="mt-4">
              <label style={labelStyle}>Waktu Baca (menit)</label>
              <input type="number" value={form.reading_time} onChange={e => handleChange('reading_time', parseInt(e.target.value) || 5)} min={1} max={60} style={inputStyle} />
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl p-5" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            <label style={labelStyle}>Featured Image URL</label>
            <input type="text" value={form.featured_image_url} onChange={e => handleChange('featured_image_url', e.target.value)} placeholder="https://images.unsplash.com/..." style={inputStyle} />

            <div className="mt-4">
              <label style={labelStyle}>Alt Text Gambar</label>
              <input type="text" value={form.featured_image_alt} onChange={e => handleChange('featured_image_alt', e.target.value)} placeholder="Deskripsi gambar..." style={inputStyle} />
            </div>

            {form.featured_image_url && (
              <img src={form.featured_image_url} alt="Preview" className="mt-4 rounded-lg w-full h-auto object-cover max-h-48" />
            )}

            <details className="mt-4">
              <summary className="text-[10px] uppercase tracking-widest cursor-pointer" style={{ color: 'var(--admin-text-secondary)' }}>Kredit Foto</summary>
              <div className="mt-3 space-y-3">
                <input type="text" value={form.photographer_name} onChange={e => handleChange('photographer_name', e.target.value)} placeholder="Nama fotografer" style={inputStyle} />
                <input type="text" value={form.photographer_url} onChange={e => handleChange('photographer_url', e.target.value)} placeholder="URL profil fotografer" style={inputStyle} />
                <input type="text" value={form.unsplash_url} onChange={e => handleChange('unsplash_url', e.target.value)} placeholder="URL Unsplash" style={inputStyle} />
              </div>
            </details>
          </div>

          {/* SEO */}
          <div className="rounded-xl p-5" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            <label style={labelStyle}>SEO</label>
            <div className="space-y-3 mt-1">
              <input type="text" value={form.seo_title} onChange={e => handleChange('seo_title', e.target.value)} placeholder="SEO Title (auto jika kosong)" style={inputStyle} />
              <textarea value={form.seo_description} onChange={e => handleChange('seo_description', e.target.value)} placeholder="SEO Description (auto dari excerpt)" rows={2} style={inputStyle} />
              <input type="text" value={form.focus_keyphrase} onChange={e => handleChange('focus_keyphrase', e.target.value)} placeholder="Focus keyphrase" style={inputStyle} />
            </div>
            <p className="mt-3 text-[10px]" style={{ color: 'var(--admin-text-muted)' }}>
              {form.seo_description.length}/155 karakter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
