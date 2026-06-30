import React from 'react';
import { useCandidateContext } from '../../context/CandidateContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsSection() {
  const { candidates } = useCandidateContext();

  const data = candidates.map(c => ({
    name: c.name.split(' ')[0], // First name only for cleaner chart
    score: Math.round(c.score_breakdown.total_score * 100)
  }));

  // Calculate Average Experience
  const avgExp = candidates.length > 0 
    ? (candidates.reduce((acc, c) => acc + (c.raw_profile?.years_of_experience || 0), 0) / candidates.length).toFixed(1)
    : 0;

  // Calculate Top Skills
  const skillCounts = {};
  candidates.forEach(c => {
    (c.raw_profile?.skills || []).forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });
  
  const topSkillsData = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="glass-panel interactive" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', margin: 0 }}>
        <BarChart3 size={24} color="var(--primary-color)" /> Analytics Dashboard
      </h2>
      
      <div className="metrics-grid">
        <div className="metric-card glass-panel interactive" style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Candidates Found</div>
          <div className="metric-value" style={{ fontSize: '28px' }}>{candidates.length}</div>
        </div>
        <div className="metric-card glass-panel interactive" style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Average AI Score</div>
          <div className="metric-value" style={{ fontSize: '28px' }}>
            {candidates.length > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) : 0}%
          </div>
        </div>
        <div className="metric-card glass-panel interactive" style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Avg Experience</div>
          <div className="metric-value" style={{ fontSize: '28px' }}>{avgExp} yrs</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>Score Distribution</h3>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" domain={[0, 100]} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} 
                  contentStyle={{ background: 'white', border: '1px solid var(--surface-border)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                />
                <Bar dataKey="score" fill="url(#colorScore)" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>Top Skills in Pool</h3>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSkills" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} 
                  contentStyle={{ background: 'white', border: '1px solid var(--surface-border)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                />
                <Bar dataKey="count" fill="url(#colorSkills)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
