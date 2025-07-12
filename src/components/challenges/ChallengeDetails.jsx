import React, { useState } from 'react'
import { Clock, Users, Trophy, Tag, Eye, EyeOff } from 'lucide-react'

const ChallengeDetails = ({ challenge }) => {
  const [activeTab, setActiveTab] = useState('description')
  const [showHiddenTests, setShowHiddenTests] = useState(false)

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading challenge details...</div>
      </div>
    )
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500 bg-green-100'
      case 'medium': return 'text-yellow-500 bg-yellow-100'
      case 'hard': return 'text-red-500 bg-red-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'examples', label: 'Examples' },
    { id: 'constraints', label: 'Constraints' },
    { id: 'testcases', label: 'Test Cases' },
    { id: 'hints', label: 'Hints' }
  ]

  const visibleTestCases = challenge.testCases?.filter(tc => !tc.isHidden) || []
  const hiddenTestCases = challenge.testCases?.filter(tc => tc.isHidden) || []

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            {challenge.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {challenge.category}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {challenge.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
              >
                <Tag size={12} className="mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          {challenge.timeLimit && (
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{challenge.timeLimit} mins</span>
            </div>
          )}
          {challenge.statistics?.totalParticipants !== undefined && (
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>{challenge.statistics.totalParticipants} participants</span>
            </div>
          )}
          {challenge.scoring?.maxPoints && (
            <div className="flex items-center">
              <Trophy size={16} className="mr-1" />
              <span>{challenge.scoring.maxPoints} points</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'description' && (
          <div className="p-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {challenge.description || challenge.problemStatement}
              </div>
              
              {challenge.functionName && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Function Signature:</h4>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {challenge.functionName}({challenge.parameters?.map(p => `${p.name}: ${p.type}`).join(', ')}) → {challenge.returnType}
                  </code>
                </div>
              )}

              {(challenge.timeComplexity || challenge.spaceComplexity) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Expected Complexity:</h4>
                  {challenge.timeComplexity && (
                    <p><strong>Time:</strong> {challenge.timeComplexity}</p>
                  )}
                  {challenge.spaceComplexity && (
                    <p><strong>Space:</strong> {challenge.spaceComplexity}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Examples</h3>
            {challenge.examples && challenge.examples.length > 0 ? (
              <div className="space-y-6">
                {challenge.examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                    <div className="space-y-2">
                      <div>
                        <strong>Input:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <strong>Output:</strong>
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                          {example.output}
                        </code>
                      </div>
                      {example.explanation && (
                        <div>
                          <strong>Explanation:</strong>
                          <span className="ml-2 text-gray-700">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No examples available.</p>
            )}
          </div>
        )}

        {activeTab === 'constraints' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Constraints</h3>
            {challenge.constraints && challenge.constraints.length > 0 ? (
              <ul className="space-y-2">
                {challenge.constraints.map((constraint, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {constraint}
                    </code>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No constraints specified.</p>
            )}
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Test Cases</h3>
              {hiddenTestCases.length > 0 && (
                <button
                  onClick={() => setShowHiddenTests(!showHiddenTests)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {showHiddenTests ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showHiddenTests ? 'Hide' : 'Show'} Hidden Tests</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Visible Test Cases */}
              {visibleTestCases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Visible Test Cases</h4>
                  {visibleTestCases.map((testCase, index) => (
                    <div key={index} className="border border-green-200 rounded-lg p-4 mb-3">
                      <h5 className="font-semibold mb-2">Test Case {index + 1}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong>Input:</strong>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(testCase.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <strong>Expected Output:</strong>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(testCase.expectedOutput, null, 2)}
                          </pre>
                        </div>
                      </div>
                      {testCase.description && (
                        <div className="mt-2">
                          <strong>Description:</strong>
                          <span className="ml-2 text-gray-700">{testCase.description}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden Test Cases */}
              {showHiddenTests && hiddenTestCases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-orange-600">Hidden Test Cases</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    These test cases are used for final evaluation but not shown during development.
                  </p>
                  {hiddenTestCases.map((testCase, index) => (
                    <div key={index} className="border border-orange-200 rounded-lg p-4 mb-3">
                      <h5 className="font-semibold mb-2">Hidden Test Case {index + 1}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <strong>Input:</strong>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(testCase.input, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <strong>Expected Output:</strong>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(testCase.expectedOutput, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {visibleTestCases.length === 0 && hiddenTestCases.length === 0 && (
                <p className="text-gray-500">No test cases available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hints' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hints</h3>
            {challenge.hints && challenge.hints.length > 0 ? (
              <div className="space-y-3">
                {challenge.hints.map((hint, index) => (
                  <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Hint {index + 1}:</strong> {hint}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hints available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChallengeDetails
