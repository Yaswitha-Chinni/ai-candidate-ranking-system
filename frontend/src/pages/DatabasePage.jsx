import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Database, UploadCloud, CheckCircle, Clock } from 'lucide-react';

export default function DatabasePage() {
  const [stats, setStats] = useState({ total_candidates: 0, last_updated: null });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/database/stats`);
      setStats(res.data);
    } catch (e) {
      console.error("Failed to fetch db stats", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(10);
    setMessage('Uploading dataset...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress for large files
      const interval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : p));
      }, 500);

      const res = await api.post(`/candidates/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearInterval(interval);
      setProgress(100);
      setMessage(res.data.message);
      fetchStats();
    } catch (error) {
      setProgress(0);
      setMessage(`Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "Never";
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 32px' }}>
      <div className="glass-panel" style={{ padding: '40px', background: 'var(--surface-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--primary-color)', padding: '12px', borderRadius: '12px', color: 'white' }}>
            <Database size={32} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '28px' }}>Candidate Database</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>Manage and index candidate profiles for AI ranking.</p>
          </div>
        </div>

        <div className="metrics-grid" style={{ marginBottom: '40px' }}>
          <div className="metric-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Total Indexed Profiles</div>
            <div className="metric-value" style={{ fontSize: '48px' }}>{stats.total_candidates}</div>
          </div>
          <div className="metric-card glass-panel" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Last Updated</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '18px', marginTop: '16px' }}>
              <Clock size={20} style={{ color: 'var(--secondary-color)' }} />
              {formatTime(stats.last_updated)}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Import New Candidates</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload a JSON or JSONL file containing candidate profiles. The AI will automatically generate embeddings and cache them in ChromaDB.</p>
          
          <div className="upload-box interactive" 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
            border: '2px dashed var(--surface-border)', 
            padding: '40px', 
            borderRadius: '16px',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".json,.jsonl"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <UploadCloud size={48} style={{ color: 'var(--primary-color)', marginBottom: '16px' }} />
            <h4 style={{ margin: '0 0 8px' }}>{file ? file.name : "Drag & Drop JSON file (Max 100MB)"}</h4>
            <div style={{ color: 'var(--text-secondary)' }}>Click to browse files</div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="btn-primary interactive"
            style={{ 
              width: '100%', 
              marginTop: '24px', 
              padding: '16px',
              fontSize: '16px',
              background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))'
            }}
          >
            {isUploading ? 'Indexing Database...' : 'Index Candidate Data'}
          </button>

          {isUploading && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))', transition: 'width 0.5s' }} />
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', color: 'var(--secondary-color)', fontSize: '14px', fontWeight: 600 }}>
                {message}
              </div>
            </div>
          )}

          {!isUploading && message && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
