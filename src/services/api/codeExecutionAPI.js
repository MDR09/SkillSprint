// Code Execution API for real backend integration
import api from './index'

export const codeExecutionAPI = {
  // Run code with test cases
  runCode: async (submissionData) => {
    try {
      const response = await api.post('/api/code/run', {
        code: submissionData.code,
        language: submissionData.language,
        challengeId: submissionData.challengeId,
        testCases: submissionData.testCases // Optional: specific test cases
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Code execution failed')
    }
  },

  // Submit code for final evaluation
  submitCode: async (submissionData) => {
    try {
      const response = await api.post('/api/code/submit', {
        code: submissionData.code,
        userCode: submissionData.userCode, // Clean user code for storage
        language: submissionData.language,
        challengeId: submissionData.challengeId,
        userId: submissionData.userId // Will be extracted from auth token
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Code submission failed')
    }
  },

  // Validate code syntax
  validateCode: async (code, language) => {
    try {
      const response = await api.post('/api/code/validate', {
        code,
        language
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Code validation failed')
    }
  },

  // Get submission history
  getSubmissions: async (challengeId, userId) => {
    try {
      const response = await api.get(`/api/code/submissions`, {
        params: { challengeId, userId }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch submissions')
    }
  },

  // Get supported languages for a challenge
  getSupportedLanguages: async (challengeId) => {
    try {
      const response = await api.get(`/api/challenges/${challengeId}/languages`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch supported languages')
    }
  }
}

export default codeExecutionAPI
