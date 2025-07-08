import api from './index.js';

// Upload APIs
export const uploadAPI = {
  // Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/uploads/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload challenge files
  uploadChallengeFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('challengeFiles', file);
    });
    return api.post('/uploads/challenge-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload submission files
  uploadSubmissionFiles: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('submissionFiles', file);
    });
    return api.post('/uploads/submission-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Get file
  getFile: (folder, filename) => 
    api.get(`/uploads/${folder}/${filename}`, { responseType: 'blob' }),
  
  // Delete file
  deleteFile: (folder, filename) => 
    api.delete(`/uploads/${folder}/${filename}`),
  
  // Get user's uploaded files
  getMyFiles: (folder) => api.get(`/uploads/my-files/${folder}`)
};
