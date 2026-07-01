import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const candidateService = {
  uploadJob: async (formData) => {
    const response = await api.post('/jobs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  uploadCandidates: async (formData) => {
    const response = await api.post('/candidates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  rankCandidates: async (jobId, batchId, weights) => {
    const response = await api.post('/candidates/rank', {
      job_id: jobId,
      batch_id: batchId,
      weights: weights
    });
    return response.data;
  }
};
