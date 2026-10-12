import { useState, FormEvent, ChangeEvent } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null);
  const [cleanImage, setCleanImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    // QUOTA PROTECTION: Prevent uploads larger than 4.5MB
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

  return (
    <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Meta-Hata</h1>

      <div style={{ background: '#ffebee', borderLeft: '4px solid #f44336', padding: '1rem', marginBottom: '2rem' }}>
        <strong>⚠️ Security Warning:</strong> Do not upload confidential, sensitive, or intimate images here. While this tool strips metadata, it temporarily processes files on a cloud server.
      </div>

      <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ padding: '0.5rem' }}
        />
        <button
          type="submit"
          disabled={!file || loading}
          style={{ padding: '0.5rem 1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Processing...' : 'Hata Metadata'}
        </button>
      </form>

      {error && <p style={{ color: '#f44336', fontWeight: 'bold' }}>{error}</p>}

      {metadata && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Exposed Metadata (Interactive View)</h2>
          <p>Click on the categories below to reveal the data hidden inside your image:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(metadata).map(([key, value]) => (
              <details key={key} style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>{key}</summary>
                <pre style={{ margin: '0.5rem 0 0', paddingLeft: '1rem', color: '#333', overflowX: 'auto' }}>
                  {typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}

      {cleanImage && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid #4CAF50', borderRadius: '8px' }}>
          <h2 style={{ color: '#4CAF50', marginTop: 0 }}>Clean Image Ready</h2>
          <img
            src={cleanImage}
            alt="Metadata-free"
            style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', marginBottom: '1rem' }}
          />
          <a href={cleanImage} download={`meta-hata_${file?.name || 'image.jpg'}`}>
            <button style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
              Download Safe Image
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
