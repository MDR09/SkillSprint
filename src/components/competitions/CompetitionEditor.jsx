import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  PlayIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CodeBracketIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { submitSolution } from '../../store/slices/competitionSlice'
import toast from 'react-hot-toast'

const CompetitionEditor = ({ 
  competition, 
  challenge, 
  onCodeChange, 
  onLanguageChange,
  currentCode: initialCode = '',
  currentLanguage: initialLanguage = 'javascript'
}) => {
  const dispatch = useDispatch()
  const { submitting } = useSelector((state) => state.competition)
  
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [theme, setTheme] = useState('vs-dark')

  useEffect(() => {
    // Set initial code template based on language
    const templates = {
      javascript: `// Your solution here
function solve() {
    // Write your code here
    
    return result;
}

// Test your solution
console.log(solve());`,
      python: `# Your solution here
def solve():
    # Write your code here
    
    return result

# Test your solution
print(solve())`,
      java: `public class Solution {
    public static void main(String[] args) {
        Solution solution = new Solution();
        // Test your solution
        System.out.println(solution.solve());
    }
    
    public int solve() {
        // Write your code here
        
        return result;
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int solve() {
    // Write your code here
    
    return result;
}

int main() {
    // Test your solution
    cout << solve() << endl;
    return 0;
}`
    }
    
    setCode(templates[language] || templates.javascript)
  }, [language])

  // Notify parent component of code changes
  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code)
    }
  }, [code, onCodeChange])

  // Notify parent component of language changes
  useEffect(() => {
    if (onLanguageChange) {
      onLanguageChange(language)
    }
  }, [language, onLanguageChange])

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' }
  ]

  const themes = [
    { value: 'vs-dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'hc-black', label: 'High Contrast' }
  ]

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    setIsRunning(true)
    setOutput('')
    
    try {
      // Simulate code execution - replace with actual execution service
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock output
      setOutput('Code executed successfully!\nOutput: 42\nTime: 120ms')
      
      // Mock test results
      const mockResults = [
        { input: 'Test 1', expected: '42', actual: '42', passed: true },
        { input: 'Test 2', expected: '24', actual: '24', passed: true },
        { input: 'Test 3', expected: '15', actual: '10', passed: false }
      ]
      setTestResults(mockResults)
      
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first!')
      return
    }

    try {
      await dispatch(submitSolution({
        competitionId: competition._id,
        submissionData: {
          challengeId: challenge._id,
          code,
          language
        }
      })).unwrap()
      
      toast.success('Solution submitted successfully! 🎉')
    } catch (error) {
      toast.error(error.message || 'Failed to submit solution')
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 h-screen">
      {/* Problem Description */}
      <div className="xl:col-span-2 space-y-4 max-h-screen overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{challenge.title}</h3>
          <div className="prose prose-gray max-w-none">
            {/* Show problemStatement if available (full formatted content), otherwise show description */}
            {challenge.problemStatement ? (
              <div className="text-gray-700 text-base leading-relaxed mb-6 whitespace-pre-line">
                {challenge.problemStatement}
              </div>
            ) : (
              <div className="text-gray-700 text-base leading-relaxed mb-6">
                {challenge.description}
              </div>
            )}
            
            {/* Show structured examples if available and no problemStatement (to avoid duplication) */}
            {!challenge.problemStatement && challenge.examples && challenge.examples.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Examples:</h4>
                <div className="space-y-4">
                  {challenge.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold text-gray-900">Input:</span>
                          <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">{example.input}</pre>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Output:</span>
                          <pre className="bg-gray-100 p-2 rounded mt-1 text-sm overflow-x-auto">{example.output}</pre>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="font-semibold text-gray-900">Explanation:</span>
                            <p className="text-gray-700 mt-1">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Show structured constraints if available and no problemStatement (to avoid duplication) */}
            {!challenge.problemStatement && challenge.constraints && challenge.constraints.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Constraints:</h4>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {challenge.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm">{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Show hints if available */}
            {challenge.hints && challenge.hints.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Hints:</h4>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {challenge.hints.map((hint, index) => (
                      <li key={index} className="text-sm">{hint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-medium text-gray-900 mb-4">Test Results</h4>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    result.passed
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.input}</span>
                    {result.passed ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  {!result.passed && (
                    <div className="text-sm mt-1">
                      <p>Expected: {result.expected}</p>
                      <p>Got: {result.actual}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor */}
      {/* Code Editor */}
      <div className="xl:col-span-3 space-y-4 max-h-screen overflow-y-auto">
        {/* Editor Controls */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {themes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunCode}
                disabled={isRunning}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <PlayIcon className="w-4 h-4 mr-2" />
                )}
                Run Code
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                )}
                Submit Solution
              </motion.button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '500px' }}>
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true
            }}
          />
        </div>

        {/* Output */}
        {output && (
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium text-gray-900 mb-2">Output</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-md text-sm overflow-x-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompetitionEditor
