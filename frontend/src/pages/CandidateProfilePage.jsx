import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCandidateContext } from '../context/CandidateContext';
import { ArrowLeft, User, Briefcase, GraduationCap, Code, MapPin, DollarSign, FolderGit2, Award } from 'lucide-react';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const { candidates } = useCandidateContext();
  
  const candidate = candidates.find(c => c.candidate_id === id);

  if (!candidate) {
    return (
      <div className="dashboard-container">
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px' }}>
          <h2>Candidate not found</h2>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const score = Math.round(candidate.score_breakdown.total_score * 100);

  return (
    <div className="dashboard-container animate-fade-in">
      <div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Results
        </Link>
        
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h1 style={{ margin: '0 0 8px' }}>{candidate.name}</h1>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> {candidate.raw_profile.years_of_experience || candidate.years_of_experience || 0} yrs exp</span>
                  {candidate.raw_profile.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {candidate.raw_profile.location}</span>}
                  {candidate.raw_profile.expected_salary && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> {candidate.raw_profile.expected_salary}</span>}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{score}%</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Overall Match</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} color="var(--primary-color)" /> Career History</h3>
              {candidate.raw_profile.experience && candidate.raw_profile.experience.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {candidate.raw_profile.experience.map((exp, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--primary-color)', paddingLeft: '16px' }}>
                      <div style={{ fontWeight: 600 }}>{exp.role || exp.title}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{exp.company} • {exp.duration || exp.years}</div>
                      {exp.description && <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '8px' }}>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No career history provided.</p>
              )}
            </div>

            <div className="glass-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FolderGit2 size={20} color="var(--primary-color)" /> Projects</h3>
              {candidate.raw_profile.projects && candidate.raw_profile.projects.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {candidate.raw_profile.projects.map((proj, i) => (
                    <div key={i} style={{ background: 'rgba(37, 99, 235, 0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                      <div style={{ fontWeight: 600 }}>{proj.name || proj.title}</div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No projects listed.</p>
              )}
            </div>

            <div className="glass-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={20} color="var(--primary-color)" /> Education</h3>
              {candidate.raw_profile.education && candidate.raw_profile.education.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {candidate.raw_profile.education.map((edu, i) => (
                    <div key={i}>
                      <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{edu.institution || edu.university} • {edu.year || edu.duration}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{candidate.raw_profile.education_degrees?.join(', ') || 'No education listed.'}</p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} color="var(--primary-color)" /> Gemini Analysis</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{candidate.gemini_explanation}</p>
            </div>
            
            <div className="glass-panel">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Code size={20} color="var(--primary-color)" /> Skills Breakdown</h3>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--success)' }}>Matched Requirements</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {candidate.matched_skills.map(s => <span key={s} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', color: 'var(--success)' }}>{s}</span>)}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--error)' }}>Missing Requirements</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {candidate.missing_skills.map(s => <span key={s} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', color: 'var(--error)' }}>{s}</span>)}
                </div>
              </div>
            </div>

            {candidate.raw_profile.certifications && candidate.raw_profile.certifications.length > 0 && (
              <div className="glass-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={20} color="var(--primary-color)" /> Certifications</h3>
                <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                  {candidate.raw_profile.certifications.map((cert, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{cert.name || cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
