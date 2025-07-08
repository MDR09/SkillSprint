import api from './index'
import { mockSubmissionService } from '../mockSubmissionService'

const submissionAPI = {
  // Submit code for evaluation
  async submitCode(submissionData) {
    try {
      return await api.post('/submissions', submissionData)
    } catch (error) {
      console.log('API failed, using mock submission service')
      return await mockSubmissionService.submitCode(submissionData)
    }
  },
  
  // Get submissions for a challenge
  getSubmissions: (challengeId, params) => api.get(`/submissions/challenge/${challengeId}`, { params }),
  
  // Get submission by ID
  getSubmissionById: (id) => api.get(`/submissions/${id}`),
  
  // Get my submissions
  getMySubmissions: (params) => api.get('/submissions/my', { params }),
  
  // Run code (test without submitting)
  async runCode(codeData) {
    try {
      return await api.post('/submissions/run', codeData)
    } catch (error) {
      console.log('API failed, using mock execution service')
      return await mockSubmissionService.runCode(codeData)
    }
  },
  
  // Get submission status
  getSubmissionStatus: (id) => api.get(`/submissions/${id}/status`),
  
  // Get submission results
  getSubmissionResults: (id) => api.get(`/submissions/${id}/results`),
  
  // Download submission code
  downloadSubmission: (id) => api.get(`/submissions/${id}/download`, { responseType: 'blob' }),
}

export default submissionAPI
