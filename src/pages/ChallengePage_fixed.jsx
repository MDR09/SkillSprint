import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  ClockIcon, 
  TrophyIcon, 
  StarIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CodeBracketIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Editor from '@monaco-editor/react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { fetchChallengeById } from '../store/slices/challengeSlice'
import { submitCode } from '../store/slices/submissionSlice'
import toast from 'react-hot-toast'

const ChallengePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { currentChallenge, loading } = useSelector((state) => state.challenge)
  const { loading: submissionLoading } = useSelector((state) => state.submission)
  
  const [code, setCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [activeTab, setActiveTab] = useState('problem')
  const [testResults, setTestResults] = useState(null)

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' }
  ]

  // Filter languages based on what's allowed for this challenge
  const allowedLanguages = currentChallenge?.allowedLanguages 
    ? languages.filter(lang => currentChallenge.allowedLanguages.includes(lang.value))
    : languages

  const defaultCode = {
    javascript: `function solution() {
    // Write your solution here
    return result;
}`,
    python: `def solution():
    # Write your solution here
    return result`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    // Write your solution here
    return 0;
}`
  }

  useEffect(() => {
    if (id) {
      dispatch(fetchChallengeById(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentChallenge?.allowedLanguages && currentChallenge.allowedLanguages.length > 0) {
      // Set default language to first allowed language
      if (!currentChallenge.allowedLanguages.includes(selectedLanguage)) {
        setSelectedLanguage(currentChallenge.allowedLanguages[0])
      }
    }
  }, [currentChallenge, selectedLanguage])

  useEffect(() => {
    setCode(defaultCode[selectedLanguage])
  }, [selectedLanguage])

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting')
      return
    }

    try {
      const submissionData = {
        challengeId: id,
        code,
        language: selectedLanguage
      }
      
      const result = await dispatch(submitCode(submissionData)).unwrap()
      setTestResults(result.testResults)
      
      if (result.status === 'Accepted') {
        toast.success('Solution accepted! 🎉')
      } else {
        toast.error('Some test cases failed. Try again!')
      }
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    }
  }

  const handleRunTests = () => {
    // Mock test runner - in real app, this would run against sample test cases
    const mockResults = [
      { testCase: 1, passed: true, input: '[1, 2, 3]', output: '6', expected: '6' },
      { testCase: 2, passed: false, input: '[4, 5, 6]', output: '14', expected: '15' },
      { testCase: 3, passed: true, input: '[]', output: '0', expected: '0' }
    ]
    setTestResults(mockResults)
    toast.info('Test cases executed')
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge not found</h2>
          <button
            onClick={() => navigate('/challenges')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/challenges')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Challenges</span>
            </button>
            <div className="h-6 border-l border-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-900">{currentChallenge.title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentChallenge.difficulty)}`}>
              {currentChallenge.difficulty}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrophyIcon className="h-4 w-4" />
              <span>{currentChallenge.scoring?.maxPoints || currentChallenge.points || 'N/A'} points</span>
            </div>
            {currentChallenge.timeLimit && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ClockIcon className="h-4 w-4" />
                <span>{currentChallenge.timeLimit} min</span>
              </div>
            )}
            {currentChallenge.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {currentChallenge.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Panel - Problem Description */}
        <div className="bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs - Fixed */}
          <div className="border-b border-gray-200 flex-shrink-0">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('problem')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'problem'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Problem</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CodeBracketIcon className="h-4 w-4" />
                  <span>Submissions</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'problem' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Problem Statement */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Problem Statement</h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {currentChallenge.problemStatement ? (
                        <div 
                          className="whitespace-pre-wrap leading-relaxed"
                          style={{ whiteSpace: 'pre-wrap' }}
                        >
                          {currentChallenge.problemStatement}
                        </div>
                      ) : currentChallenge.description ? (
                        <p>{currentChallenge.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No problem statement available.</p>
                      )}
                    </div>
                  </div>

                  {/* Sample Input/Output */}
                  {(currentChallenge.sampleInput || currentChallenge.sampleOutput) && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Sample Test Case</h2>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {currentChallenge.sampleInput && (
                          <div>
                            <span className="font-medium text-gray-900">Input:</span>
                            <pre className="mt-1 bg-gray-200 rounded p-2 text-sm font-mono overflow-x-auto">
{currentChallenge.sampleInput}
                            </pre>
                          </div>
                        )}
                        {currentChallenge.sampleOutput && (
                          <div>
                            <span className="font-medium text-gray-900">Output:</span>
                            <pre className="mt-1 bg-gray-200 rounded p-2 text-sm font-mono overflow-x-auto">
{currentChallenge.sampleOutput}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  {currentChallenge.examples && currentChallenge.examples.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Examples</h2>
                      <div className="space-y-4">
                        {currentChallenge.examples.map((example, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Example {index + 1}:</h3>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Input:</span>
                                <code className="ml-2 bg-gray-200 px-1 rounded">{example.input}</code>
                              </div>
                              <div>
                                <span className="font-medium">Output:</span>
                                <code className="ml-2 bg-gray-200 px-1 rounded">{example.output}</code>
                              </div>
                              {example.explanation && (
                                <div>
                                  <span className="font-medium">Explanation:</span>
                                  <span className="ml-2">{example.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {currentChallenge.constraints && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
{currentChallenge.constraints}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Hints */}
                  {currentChallenge.hints && currentChallenge.hints.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Hints</h2>
                      <div className="space-y-3">
                        {currentChallenge.hints.map((hint, index) => (
                          <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-400 text-white text-xs font-bold rounded-full">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-blue-800">{hint}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenge Metadata */}
                  {(currentChallenge.timeLimit || currentChallenge.memoryLimit || currentChallenge.allowedLanguages) && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Challenge Details</h2>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        {currentChallenge.timeLimit && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Time Limit:</span>
                            <span className="text-gray-600">{currentChallenge.timeLimit} minutes</span>
                          </div>
                        )}
                        {currentChallenge.memoryLimit && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Memory Limit:</span>
                            <span className="text-gray-600">{currentChallenge.memoryLimit} MB</span>
                          </div>
                        )}
                        {currentChallenge.allowedLanguages && currentChallenge.allowedLanguages.length > 0 && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Allowed Languages:</span>
                            <span className="text-gray-600">{currentChallenge.allowedLanguages.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {currentChallenge.tags && currentChallenge.tags.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Tags</h2>
                      <div className="flex flex-wrap gap-2">
                        {currentChallenge.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submissions</h2>
                  <p className="text-gray-600">Submission history will be displayed here.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="bg-white flex flex-col">
          {/* Editor Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Language:</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {allowedLanguages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleRunTests}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Run</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submissionLoading}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>{submissionLoading ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1">
            <Editor
              height="60%"
              language={selectedLanguage}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md text-sm ${
                      result.passed 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {result.passed ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">Test Case {result.testCase}</span>
                      <span className={result.passed ? 'text-green-600' : 'text-red-600'}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="ml-6 space-y-1 text-xs">
                      <div><span className="font-medium">Input:</span> {result.input}</div>
                      <div><span className="font-medium">Output:</span> {result.output}</div>
                      <div><span className="font-medium">Expected:</span> {result.expected}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChallengePage
