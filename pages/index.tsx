import { useState, FormEvent, ChangeEvent } from 'react';

// Helper to extract common EXIF data from FFprobe's nested output
const extractHighlights = (meta: any) => {
  if (!meta) return null;

  // FFprobe usually stores EXIF metadata in format.tags or streams[0].tags
  const formatTags = meta.format?.tags || {};
  const streamTags = meta.streams?.[0]?.tags || {};

  // Merge them, normalizing keys to lowercase for easier lookup
  const allTags: Record<string, string> = {};
  [streamTags, formatTags].forEach(tagSet => {
    Object.entries(tagSet).forEach(([key, value]) => {
      allTags[key.toLowerCase()] = String(value);
    });
  });

  // Extract specific fields
  const highlights = {
    'Camera Make': allTags['make'],
    'Camera Model': allTags['model'],
    'Date / Time': allTags['datetime'] || allTags['creation_time'] || allTags['date'],
    'Software / App': allTags['software'],
    'GPS Location': allTags['gpslocation'] || allTags['location'] || (allTags['gpslatitude'] ? `${allTags['gpslatitude']}, ${allTags['gpslongitude']}` : undefined)
  };

  // Filter out undefined values
  return Object.fromEntries(Object.entries(highlights).filter(([_, v]) => v !== undefined));
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 4.5 * 1024 * 1024) {
      setError("File is too large. Please upload an image under 4.5MB to conserve server quota.");
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);
    setCleanImage(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Processing failed');

      if (data.metadata) setMetadata(data.metadata);
      if (data.cleanImage) setCleanImage(data.cleanImage);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const highlights = extractHighlights(metadata);
  const hasHighlights = highlights && Object.keys(highlights).length > 0;

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#111' }}>Meta-Hata</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}>Strip hidden trackers and EXIF data from your photos.</p>
      </div>

      {/* Warning Alert */}
      <div style={{ background: '#fff4f4', border: '1px solid #ffcdd2', borderLeft: '4px solid #f44336', padding: '1rem 1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div style={{ fontSize: '0.95rem', color: '#b71c1c' }}>
          <strong>Security Warning:</strong> Do not upload confidential, sensitive, or intimate images here. While this tool strips metadata, it temporarily processes files on a cloud server.
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', border: '1px solid #eaeaea', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ flexGrow: 1, padding: '0.75rem', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer', background: '#fafafa' }}
          />
          <button
            type="submit"
            disabled={!file || loading}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff',
              background: (!file || loading) ? '#a5d6a7' : '#2e7d32',
              border: 'none',
              borderRadius: '8px',
              cursor: (!file || loading) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Processing...' : 'Hata Metadata'}
          </button>
        </div>
        {error && <p style={{ color: '#d32f2f', fontWeight: '500', marginTop: '1rem', marginBottom: 0 }}>{error}</p>}
      </form>

      {/* Results Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Extracted Highlights */}
        {metadata && (
          <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.5rem' }}>Exposed Metadata</h2>

            {hasHighlights ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {Object.entries(highlights).map(([key, val]) => (
                  <div key={key} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.25rem' }}>{key}</div>
                    <div style={{ fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' }}>{val as string}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>No standard camera or GPS metadata was found in this image.</p>
            )}

            {/* Raw Data Accordion */}
            <details style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <summary style={{ padding: '1rem', background: '#f1f5f9', cursor: 'pointer', fontWeight: '500', color: '#334155', borderBottom: '1px solid #e2e8f0' }}>
                View Advanced Raw Data (FFprobe)
              </summary>
              <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Cleaned Image Download */}
        {cleanImage && (
          <div style={{ background: '#f0fdf4', padding: '2rem', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <h2 style={{ marginTop: 0, color: '#166534', fontSize: '1.5rem' }}>Clean Image Ready</h2>
            <p style={{ color: '#15803d', marginBottom: '1.5rem' }}>All metadata has been successfully removed.</p>

            <img
              src={cleanImage}
              alt="Metadata-free preview"
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #dcfce3', marginBottom: '1.5rem', background: '#fff' }}
            />

            <div>
              <a href={cleanImage} download={`clean_${file?.name || 'image.jpg'}`} style={{ textDecoration: 'none' }}>
                <button style={{ background: '#16a34a', color: 'white', border: 'none', padding: '0.75rem 2rem', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)' }}>
                  Download Safe Image
                </button>
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
