const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  
  // Input parameters for the test case
  input: {
    type: mongoose.Schema.Types.Mixed, // Can be any structure
    required: true
  },
  
  // Expected output
  expectedOutput: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Whether this test case is visible to users (sample) or hidden
  isHidden: {
    type: Boolean,
    default: false
  },
  
  // Test case description/name
  description: {
    type: String,
    default: ''
  },
  
  // Time limit for this specific test case (ms)
  timeLimit: {
    type: Number,
    default: 2000
  },
  
  // Memory limit for this test case (MB)
  memoryLimit: {
    type: Number,
    default: 256
  },
  
  // Weight/points for this test case
  weight: {
    type: Number,
    default: 1
  },
  
  // Order/sequence of test case
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
TestCaseSchema.index({ challengeId: 1, order: 1 });
TestCaseSchema.index({ challengeId: 1, isHidden: 1 });

module.exports = mongoose.model('TestCase', TestCaseSchema);
