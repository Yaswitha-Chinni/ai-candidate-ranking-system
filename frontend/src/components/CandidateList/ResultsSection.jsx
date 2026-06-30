import React, { useState } from 'react';
import { useCandidateContext } from '../../context/CandidateContext';
import { Users, ChevronDown, ChevronUp, Download, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateCard = ({ candidate, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const score = Math.round(candidate.score_breakdown.total_score * 100);
  
  const getRecommendation = (s) => {
    if (s >= 90) return { text: "Excellent Fit", color: "var(--success)" };
    if (s >= 80) return { text: "Strong Match", color: "var(--primary-color)" };
    if (s >= 70) return { text: "Good Match", color: "var(--secondary-color)" };
    return { text: "Fair Fit", color: "var(--warning)" };
  };
  
  const rec = getRecommendation(score);
  
  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇 1";
    if (rank === 2) return "🥈 2";
    if (rank === 3) return "🥉 3";
    return `#${rank}`;
  };

  return (
    <div className="glass-panel interactive" style={{ marginBottom: '16px', padding: '20px', background: 'var(--surface-color)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--text-secondary)', width: '40px', textAlign: 'center' }}>
            {getRankBadge(rank)}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
              {candidate.name.charAt(0)}
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>
              <Link to={`/candidate/${candidate.candidate_id}`} className="interactive" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                {candidate.name}
              </Link>
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Candidate ID: {candidate.candidate_id.substring(0,8)}...</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ background: `${rec.color}15`, color: rec.color, padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>
            {rec.text}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              {score}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Match</div>
          </div>
          <button className="interactive" onClick={() => setExpanded(!expanded)} style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid var(--surface-border)', borderRadius: '50%', padding: '8px', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="animate-fade-in" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>Matched Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {candidate.matched_skills.map(s => (
                  <span key={s} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> {s}
                  </span>
                ))}
                {candidate.matched_skills.length === 0 && <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>None</span>}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>Missing Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {candidate.missing_skills.map(s => (
                  <span key={s} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={14} /> {s}
                  </span>
                ))}
                {candidate.missing_skills.length === 0 && <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>None</span>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--primary-color)' }}>Gemini AI Analysis</h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{candidate.gemini_explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResultsSection() {
  const { candidates, jobId } = useCandidateContext();

  if (candidates.length === 0) return null;

  const handleExportCSV = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/export/csv?job_id=${jobId}&batch_id=global`, '_blank');
  };

  const handleExportPDF = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/export/pdf?job_id=${jobId}&batch_id=global`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px' }}><Users size={24} color="var(--primary-color)" /> Ranked Candidates</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="interactive" onClick={handleExportCSV} style={{ background: 'white', border: '1px solid var(--surface-border)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.05)' }}>
            <Download size={16} /> Export CSV
          </button>
          <button className="interactive" onClick={handleExportPDF} style={{ background: 'white', border: '1px solid var(--surface-border)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', cursor: 'none', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.05)' }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>
      
      <div>
        {candidates.map((c, idx) => (
          <CandidateCard key={c.candidate_id} candidate={c} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}
