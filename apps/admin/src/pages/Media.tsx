import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, del, get } from '../lib/api.js';

interface MediaItem {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  altText: string | null;
  createdAt: string;
}

export function Media() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const { data } = useQuery({ queryKey: ['admin-media'], queryFn: () => get<MediaItem[]>('/admin/media') });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/admin/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data as MediaItem;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-media'] });
      setError('');
      if (fileRef.current) fileRef.current.value = '';
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Upload failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/admin/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-media'] }),
  });

  return (
    <div>
      <h1>Media</h1>
      <p className="muted">Upload images (JPEG, PNG, WebP, SVG). Paste the returned URL into content fields.</p>

      <div className="admin-card">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={(e) => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])}
        />
        {uploadMutation.isPending && <p className="muted">Uploading…</p>}
        {error && <p className="yk-field__error">{error}</p>}
      </div>

      <div className="media-grid">
        {data?.map((m) => (
          <figure key={m.id} className="media-item">
            {m.mimeType.startsWith('image/') ? (
              <img src={m.url} alt={m.altText ?? m.originalName} loading="lazy" />
            ) : (
              <div className="card__media-placeholder" />
            )}
            <figcaption>
              <span title={m.originalName}>{m.originalName}</span>
              <div className="media-item__actions">
                <button className="link-btn" onClick={() => navigator.clipboard?.writeText(m.url)}>
                  Copy URL
                </button>
                <button className="link-btn link-btn--danger" onClick={() => window.confirm('Delete file?') && deleteMutation.mutate(m.id)}>
                  Delete
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
        {data?.length === 0 && <p className="muted">No media uploaded yet.</p>}
      </div>
    </div>
  );
}
