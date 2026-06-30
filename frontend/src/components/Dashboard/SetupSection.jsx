import React, { useState, useRef } from 'react';
import { useCandidateContext } from '../../context/CandidateContext';
import { FileText, Play } from 'lucide-react';
import { candidateService } from '../../services/api';

export default function SetupSection() {
  const { setJobId, setBatchId, setCandidates, weights, loading, setLoading, setError } = useCandidateContext();
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'paste'
  const [progress, setProgress] = useState('');
  
  const jdInputRef = useRef(null);

  const handleProcess = async () => {
    if (!jdFile && !jdText.trim()) {
      alert('Please upload a Job Description file or paste the text to start.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // 1. Upload JD
      setProgress('Parsing Job Description Requirements...');
      const jdFormData = new FormData();
      if (jdFile) {
        jdFormData.append('file', jdFile);
      }
      if (jdText.trim()) {
        jdFormData.append('text', jdText);
      }
      const jdRes = await candidateService.uploadJob(jdFormData);
      setJobId(jdRes.job_id);
      
      // 2. We no longer upload candidates here, we use the global index
      setBatchId("global");

      // 3. Rank Candidates against Database
      setProgress('Querying Database & Ranking Candidates...');
      const rankRes = await candidateService.rankCandidates(jdRes.job_id, "global", weights);
      
      setProgress('Finalizing Matches with Gemini...');
      setCandidates(rankRes.top_candidates);
      
      setProgress('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'An error occurred during processing.');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel interactive" style={{ height: '100%' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Create New Pipeline</h2>
      
      <div className="form-group" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ color: 'var(--text-primary)', fontWeight: 600 }}>1. Provide Job Description (JD)</label>
          <div style={{ display: 'flex', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '8px', padding: '4px' }}>
            <button 
              className={`interactive ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
              style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: activeTab === 'upload' ? 'white' : 'transparent', color: activeTab === 'upload' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '14px', cursor: 'none', boxShadow: activeTab === 'upload' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              Upload File
            </button>
            <button 
              className={`interactive ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
              style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: activeTab === 'paste' ? 'white' : 'transparent', color: activeTab === 'paste' ? 'var(--primary-color)' : 'var(--text-secondary)', fontSize: '14px', cursor: 'none', boxShadow: activeTab === 'paste' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
              Paste Text
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <>
            <div className="interactive"
            onClick={() => jdInputRef.current?.click()}
            style={{ 
              border: '2px dashed var(--primary-color)', 
              padding: '32px 20px', 
              borderRadius: '16px', 
              textAlign: 'center', 
              cursor: 'none', 
              background: 'rgba(37, 99, 235, 0.05)',
              transition: 'all 0.2s ease'
            }}>
            <FileText size={40} color={jdFile ? 'var(--primary-color)' : 'var(--text-secondary)'} style={{ marginBottom: '16px' }} />
            <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Drag & Drop PDF or DOCX file (Max 5MB)
            </p>
            <button className="interactive" style={{ 
              background: 'white', 
              border: '1px solid var(--primary-color)', 
              color: 'var(--primary-color)', 
              padding: '8px 24px', 
              borderRadius: '20px',
              fontSize: '14px',
              cursor: 'none'
            }}>
              Browse Files
            </button>
            <input type="file" ref={jdInputRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" onChange={e => setJdFile(e.target.files[0])} />
          </div>
          
          {jdFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '14px' }}>
              <FileText size={16} color="#ef4444" />
              <span>{jdFile.name}</span>
            </div>
          )}
          </>
        ) : (
          <textarea 
            className="interactive"
            placeholder="Paste the job description text here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            style={{
              width: '100%',
              height: '200px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--surface-border)',
              background: 'rgba(37, 99, 235, 0.02)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
        )}
      </div>

      <button 
        className="btn-primary" 
        style={{ 
          width: '100%', 
          padding: '16px', 
          borderRadius: '12px',
          background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
          fontSize: '16px',
          fontWeight: 600,
          marginTop: 'auto'
        }} 
        onClick={handleProcess} 
        disabled={loading}
      >
        {loading ? <div className="spinner" style={{ margin: '0 auto' }} /> : 'Initialize AI Analysis'}
      </button>
      
      {loading && <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--secondary-color)', fontWeight: 500 }}>{progress}</p>}
    </div>
  );
}
