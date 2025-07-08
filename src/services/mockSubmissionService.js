// Mock submission service for demo purposes
export const mockSubmissionService = {
  async submitCode(submissionData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate different outcomes
    const outcomes = [
      {
        success: true,
        status: 'Accepted',
        testResults: {
          passed: 3,
          total: 3,
          executionTime: '42ms',
          memoryUsage: '11.2MB',
          status: 'Accepted',
          results: [
            { 
              input: '[2,7,11,15], target = 9', 
              expectedOutput: '[0,1]', 
              actualOutput: '[0,1]', 
              passed: true,
              executionTime: '12ms'
            },
            { 
              input: '[3,2,4], target = 6', 
              expectedOutput: '[1,2]', 
              actualOutput: '[1,2]', 
              passed: true,
              executionTime: '15ms'
            },
            { 
              input: '[3,3], target = 6', 
              expectedOutput: '[0,1]', 
              actualOutput: '[0,1]', 
              passed: true,
              executionTime: '15ms'
            }
          ]
        }
      },
      {
        success: false,
        status: 'Wrong Answer',
        testResults: {
          passed: 2,
          total: 3,
          executionTime: '38ms',
          memoryUsage: '10.8MB',
          status: 'Wrong Answer',
          results: [
            { 
              input: '[2,7,11,15], target = 9', 
              expectedOutput: '[0,1]', 
              actualOutput: '[0,1]', 
              passed: true,
              executionTime: '12ms'
            },
            { 
              input: '[3,2,4], target = 6', 
              expectedOutput: '[1,2]', 
              actualOutput: '[1,2]', 
              passed: true,
              executionTime: '15ms'
            },
            { 
              input: '[3,3], target = 6', 
              expectedOutput: '[0,1]', 
              actualOutput: '[1,0]', 
              passed: false,
              executionTime: '11ms'
            }
          ]
        }
      },
      {
        success: false,
        status: 'Time Limit Exceeded',
        testResults: {
          passed: 1,
          total: 3,
          executionTime: '>1000ms',
          memoryUsage: '15.2MB',
          status: 'Time Limit Exceeded',
          results: [
            { 
              input: '[2,7,11,15], target = 9', 
              expectedOutput: '[0,1]', 
              actualOutput: '[0,1]', 
              passed: true,
              executionTime: '12ms'
            },
            { 
              input: '[3,2,4], target = 6', 
              expectedOutput: '[1,2]', 
              actualOutput: 'Time Limit Exceeded', 
              passed: false,
              executionTime: '>1000ms'
            },
            { 
              input: '[3,3], target = 6', 
              expectedOutput: '[0,1]', 
              actualOutput: 'Time Limit Exceeded', 
              passed: false,
              executionTime: '>1000ms'
            }
          ]
        }
      }
    ]
    
    // Randomly select an outcome (weighted towards success)
    const random = Math.random()
    if (random < 0.7) {
      return outcomes[0] // 70% success
    } else if (random < 0.9) {
      return outcomes[1] // 20% wrong answer
    } else {
      return outcomes[2] // 10% time limit exceeded
    }
  },

  async runCode(submissionData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      testResults: {
        passed: Math.floor(Math.random() * 3) + 1,
        total: 3,
        executionTime: `${Math.floor(Math.random() * 50) + 10}ms`,
        memoryUsage: `${Math.floor(Math.random() * 20) + 5}MB`,
        results: [
          { 
            input: '[2,7,11,15], target = 9', 
            expectedOutput: '[0,1]', 
            actualOutput: '[0,1]', 
            passed: true,
            executionTime: '12ms'
          },
          { 
            input: '[3,2,4], target = 6', 
            expectedOutput: '[1,2]', 
            actualOutput: '[1,2]', 
            passed: true,
            executionTime: '8ms'
          },
          { 
            input: '[3,3], target = 6', 
            expectedOutput: '[0,1]', 
            actualOutput: Math.random() > 0.5 ? '[0,1]' : '[1,0]', 
            passed: Math.random() > 0.5,
            executionTime: '15ms'
          }
        ]
      }
    }
  }
}
