import React, { createContext, useState, useContext } from 'react';

const CandidateContext = createContext();

export const useCandidateContext = () => useContext(CandidateContext);

export const CandidateProvider = ({ children }) => {
  const [jobId, setJobId] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [weights, setWeights] = useState({
    semantic_similarity: 40,
    skill_match: 20,
    experience_match: 15,
    education_match: 10,
    projects_match: 10,
    behavioral_match: 5
  });

  const [filters, setFilters] = useState({
    minExperience: 0,
    mustHaveEducation: false,
    openToWork: false
  });

  return (
    <CandidateContext.Provider value={{
      jobId, setJobId,
      batchId, setBatchId,
      candidates, setCandidates,
      loading, setLoading,
      error, setError,
      weights, setWeights,
      filters, setFilters
    }}>
      {children}
    </CandidateContext.Provider>
  );
};
