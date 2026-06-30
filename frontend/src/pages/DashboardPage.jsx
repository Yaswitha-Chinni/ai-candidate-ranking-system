import React from 'react';
import { useCandidateContext } from '../context/CandidateContext';
import SetupSection from '../components/Dashboard/SetupSection';
import AnalyticsSection from '../components/Analytics/AnalyticsSection';
import ResultsSection from '../components/CandidateList/ResultsSection';

export default function DashboardPage() {
  const { candidates } = useCandidateContext();

  return (
    <div className="dashboard-container animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SetupSection />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {candidates.length > 0 && <AnalyticsSection />}
        <ResultsSection />
      </div>
    </div>
  );
}
