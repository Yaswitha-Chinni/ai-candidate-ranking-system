import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CandidateProvider, useCandidateContext } from './context/CandidateContext';
import SetupSection from './components/Dashboard/SetupSection';
import AnalyticsSection from './components/Analytics/AnalyticsSection';
import ResultsSection from './components/CandidateList/ResultsSection';
import DatabasePage from './pages/DatabasePage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import Cursor from './components/Cursor';
import Background3D from './components/Background3D';
import './index.css';

function Navbar() {
  const location = useLocation();
  return (
    <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', marginBottom: '32px', background: 'var(--surface-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          Candidate Ranking AI
        </h1>
        <nav style={{ display: 'flex', gap: '8px' }}>
          <Link to="/" className="nav-link interactive" style={{ color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>Dashboard</Link>
          <Link to="/database" className="nav-link interactive" style={{ color: location.pathname === '/database' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              Data Indexing
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
}

function Dashboard() {
  const { candidates } = useCandidateContext();
  const hasResults = candidates && candidates.length > 0;
  
  return (
    <div className="dashboard-container" style={{
      gridTemplateColumns: hasResults ? undefined : '1fr',
      maxWidth: hasResults ? '1400px' : '600px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <SetupSection />
        {hasResults && <AnalyticsSection />}
      </div>
      {hasResults && (
        <div>
          <ResultsSection />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <CandidateProvider>
      <Router>
        <div className="app-layout">
          <Background3D />
          <Cursor />
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/database" element={<DatabasePage />} />
            <Route path="/candidate/:id" element={<CandidateProfilePage />} />
          </Routes>
        </div>
      </Router>
    </CandidateProvider>
  );
}

export default App;
