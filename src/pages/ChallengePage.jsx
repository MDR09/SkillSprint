import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { 
  ClockIcon, 
  TrophyIcon, 
  StarIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  FireIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import Editor from '@monaco-editor/react'
import LoadingSpinner from '../components/common/LoadingSpinner'
import CompetitionTimer from '../components/competitions/CompetitionTimer'
import WinnerModal from '../components/competitions/WinnerModal'
import { fetchChallengeById } from '../store/slices/challengeSlice'
import { submitCode } from '../store/slices/submissionSlice'
import { fetchCompetitionById, autoSubmitSolution, endCompetition } from '../store/slices/competitionSlice'
import { mockSubmissionService } from '../services/mockSubmissionService'
import { codeValidationService } from '../services/codeValidationService'
import userAPI from '../services/api/userAPI'
import toast from 'react-hot-toast'
import CodeEditor from '../components/challenges/CodeEditor'

// Constants for languages and templates
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python3' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' }
]

// Global cache to prevent duplicate template API calls
const templateCache = new Set()
let apiWarningShown = false

const DEFAULT_TEMPLATES = {
  javascript: `/**
 * Write your solution here
 */
function solution() {
    
}`,
  python: `class Solution:
    def solution(self):
        pass`,
  java: `class Solution {
    public void solution() {
        
    }
}`,
  cpp: `class Solution {
public:
    void solution() {
        
    }
};`
}

const ChallengePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const competitionId = searchParams.get('competitionId')
  
  const { currentChallenge, loading, error: challengeError } = useSelector((state) => state.challenge)
  const { loading: submissionLoading, error: submissionError } = useSelector((state) => state.submission)
  const { currentCompetition } = useSelector((state) => state.competition)
  const { user } = useSelector((state) => state.auth);
  
  const [code, setCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [activeTab, setActiveTab] = useState('problem')
  const [testResults, setTestResults] = useState(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [winner, setWinner] = useState(null)
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  
  const socketRef = useRef(null)
  const autoSubmitTriggeredRef = useRef(false)
  
  // Check if this is a competition context
  const isCompetitionMode = !!competitionId
  const competition = currentCompetition

  // Filter languages based on what's allowed for this challenge
  const allowedLanguages = currentChallenge?.allowedLanguages 
    ? LANGUAGES.filter(lang => currentChallenge.allowedLanguages.includes(lang.value))
    : LANGUAGES

  // Get code template based on challenge requirements
  const getCodeTemplate = useCallback((language, challenge) => {
    if (!challenge) return DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.javascript
    
    const functionName = challenge.functionName || 'solution'
    const parameters = challenge.parameters || []
    
    if (parameters.length === 0) {
      return DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.javascript
    }
    
    const templates = {
      javascript: `/**
 * ${parameters.map(p => `@param {${p.type}} ${p.name}`).join('\n * ')}
 * @return {${challenge.returnType || 'number'}}
 */
var ${functionName} = function(${parameters.map(p => p.name).join(', ')}) {
    
};`,
      python: `class Solution:
    def ${functionName}(self, ${parameters.map(p => `${p.name}: ${p.pythonType || p.type}`).join(', ')}) -> ${challenge.pythonReturnType || 'int'}:
        pass`,
      java: `class Solution {
    public ${challenge.javaReturnType || 'int'} ${functionName}(${parameters.map(p => `${p.javaType || p.type} ${p.name}`).join(', ')}) {
        
    }
}`,
      cpp: `class Solution {
public:
    ${challenge.cppReturnType || 'int'} ${functionName}(${parameters.map(p => `${p.cppType || p.type} ${p.name}`).join(', ')}) {
        
    }
};`
    }
    
    return templates[language] || DEFAULT_TEMPLATES[language] || DEFAULT_TEMPLATES.javascript
  }, [])

  useEffect(() => {
    if (id) {
      dispatch(fetchChallengeById(id))
        .unwrap()
        .catch(err => {
          // Check if we're dealing with rate limiting
          const isRateLimited = err?.message?.includes('Too many requests') || 
                               err?.status === 429
          
          if (isRateLimited) {
            // Show a more informative message for rate limiting
            toast('🔄 Using demo data - API temporarily rate limited', {
              icon: '💡',
              duration: 3000,
              style: {
                background: '#e3f2fd',
                color: '#1565c0'
              }
            })
          } else {
            toast.error('Failed to load challenge')
          }
          console.error('Challenge load error:', err)
        })
    }
  }, [dispatch, id])

  // Set initial language
  useEffect(() => {
    if (currentChallenge?.allowedLanguages?.length) {
      const defaultLang = currentChallenge.allowedLanguages.includes(selectedLanguage) 
        ? selectedLanguage 
        : currentChallenge.allowedLanguages[0]
      setSelectedLanguage(defaultLang)
    }
  }, [currentChallenge, selectedLanguage])

  // Load template when language changes
  useEffect(() => {
    if (id && selectedLanguage && currentChallenge) {
      loadTemplate()
    }
  }, [id, selectedLanguage, currentChallenge])

  const loadTemplate = async () => {
    const templateKey = `${id}-${selectedLanguage}`
    
    // Prevent duplicate API calls for the same template
    if (templateCache.has(templateKey)) {
      setCode(getCodeTemplate(selectedLanguage, currentChallenge))
      return
    }
    templateCache.add(templateKey)
    
    try {
      const response = await fetch(`/api/challenges/${id}/template/${selectedLanguage}`)
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Only log once per session
        if (!apiWarningShown) {
          console.info('💡 Template API not available, using default templates')
          apiWarningShown = true
        }
        setCode(getCodeTemplate(selectedLanguage, currentChallenge))
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCode(data.data.template)
      } else {
        console.error('Failed to load template:', data.message)
        setCode(getCodeTemplate(selectedLanguage, currentChallenge))
      }
    } catch (error) {
      // Only log once per session
      if (!apiWarningShown) {
        console.info('💡 Template API not available, using default templates')
        apiWarningShown = true
      }
      setCode(getCodeTemplate(selectedLanguage, currentChallenge))
    }
  }

  // Handle editor mount
  const handleEditorDidMount = () => {
    setIsEditorReady(true)
  }

  // Handle errors
  useEffect(() => {
    if (challengeError) {
      toast.error(challengeError)
    }
    if (submissionError) {
      toast.error(submissionError)
    }
  }, [challengeError, submissionError])

  // Fetch competition data if in competition mode
  useEffect(() => {
    if (isCompetitionMode && competitionId) {
      dispatch(fetchCompetitionById(competitionId))
    }
  }, [dispatch, competitionId, isCompetitionMode])

  // Socket connection for competition mode
  useEffect(() => {
    if (!isCompetitionMode || !competitionId) return

    socketRef.current = io('http://localhost:5000')
    socketRef.current.emit('joinCompetition', competitionId)

    // Listen for competition end
    socketRef.current.on('competitionEnded', (data) => {
      setWinner(data.winner)
      setShowWinnerModal(true)
      autoSubmitTriggeredRef.current = true // Prevent further submissions
      toast.success('🏁 Competition has ended!')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [isCompetitionMode, competitionId])

  // Auto-submit when timer ends
  const handleTimeUp = async () => {
    if (autoSubmitTriggeredRef.current) return
    autoSubmitTriggeredRef.current = true

    try {
      if (isCompetitionMode && competitionId) {
        // Auto-submit current code for competition
        await dispatch(autoSubmitSolution({
          competitionId,
          submissionData: {
            challengeId: id,
            code: code.trim() || '// No code submitted',
            language: selectedLanguage,
            isAutoSubmitted: true
          }
        })).unwrap()
        
        toast.success('⏰ Time up! Your code has been auto-submitted.', {
          duration: 5000,
          icon: '⏰'
        })
      }
    } catch (error) {
      console.error('Auto-submit error:', error)
      toast.error('Failed to auto-submit solution')
    }
  }

  // Handle manual auto-submit (for testing)
  const handleAutoSubmit = async () => {
    if (autoSubmitTriggeredRef.current) return
    handleTimeUp()
  }

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before submitting')
      return
    }

    if (!codeValidationService.hasActualImplementation(code, selectedLanguage)) {
      toast.error('Please implement your solution before submitting')
      return
    }

    try {
      if (isCompetitionMode && competitionId) {
        // Submit to competition
        const result = await dispatch(autoSubmitSolution({
          competitionId,
          submissionData: {
            challengeId: id,
            code,
            language: selectedLanguage,
            isAutoSubmitted: false
          }
        })).unwrap()
        
        if (result.success) {
          toast.success('Solution submitted successfully! 🎉')
          if (result.winner) {
            setWinner(result.winner)
            setShowWinnerModal(true)
          }
        } else {
          toast.error(result.message || 'Submission failed')
        }
      } else {
        // Regular challenge submission
        const submissionData = {
          challengeId: id,
          code,
          language: selectedLanguage
        }
        
        const result = await dispatch(submitCode(submissionData)).unwrap()
        
        if (result.success) {
          setTestResults(result.testResults)
          if (result.allPassed) {
            toast.success('Solution accepted! 🎉')
          } else {
            toast.error(`${result.passedCount}/${result.totalCount} test cases passed. Try again!`)
          }
        } else {
          toast.error(result.message || 'Submission failed')
        }
      }
    } catch (error) {
      toast.error('Submission failed. Please try again.')
      console.error('Submission error:', error)
    }
  }

  const handleRunTests = async () => {
    if (!code.trim()) {
      toast.error('Please write some code before running tests')
      return
    }

    const hasActualCode = codeValidationService.hasActualImplementation(code, selectedLanguage)
    
    if (!hasActualCode) {
      const testCases = currentChallenge?.sampleTestCases || currentChallenge?.examples || [
        { input: 'Sample input', output: 'Sample output' }
      ]
      
      const mockResults = testCases.map((testCase, index) => ({
        testCase: index + 1,
        passed: false,
        input: testCase.input || testCase.functionCall || `Test case ${index + 1}`,
        output: 'undefined',
        expected: testCase.output || 'Expected output'
      }))
      
      setTestResults(mockResults)
      toast.error('No implementation found. Please write your solution.')
      return
    }
    
    try {
      // This would be replaced with actual API call in production
      const mockResults = mockSubmissionService.runTests(
        code, 
        selectedLanguage, 
        currentChallenge
      )
      
      setTestResults(mockResults)
      
      const passedCount = mockResults.filter(r => r.passed).length
      if (passedCount === mockResults.length) {
        toast.success('All test cases passed! 🎉')
      } else {
        toast.info(`${passedCount}/${mockResults.length} test cases passed`)
      }
    } catch (error) {
      toast.error('Failed to run test cases')
      console.error('Test run error:', error)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Pass current user ID as exclude param
      const response = await userAPI.searchUsers(query, user?._id);
      setSearchResults(response.data.data || []);
    } catch (error) {
      // ...existing error handling...
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!currentChallenge || challengeError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {challengeError ? 'Error loading challenge' : 'Challenge not found'}
          </h2>
          <button
            onClick={() => navigate('/challenges')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            aria-label="Back to challenges"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-10 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/challenges')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Go back to challenges"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Challenges</span>
            </button>
            <div className="h-6 border-l border-gray-300 hidden md:block"></div>
            <h1 className="text-xl font-semibold text-gray-900 line-clamp-1">
              {currentChallenge.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Competition Timer */}
            {isCompetitionMode && competition && competition.status === 'active' && (
              <div className="flex items-center space-x-2">
                <FireIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Competition Mode</span>
                <CompetitionTimer
                  startTime={competition.actualStartTime || competition.startTime}
                  timeLimit={competition.timeLimit}
                  onTimeUp={handleTimeUp}
                  competitionEnded={competition.status === 'completed'}
                  isBanner={true}
                />
              </div>
            )}
            
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

      {/* Main Content - Split Screen Layout */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-full md:w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200 flex-shrink-0">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('problem')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'problem'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } transition-colors`}
                aria-current={activeTab === 'problem' ? 'page' : undefined}
              >
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Description</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                } transition-colors`}
                aria-current={activeTab === 'submissions' ? 'page' : undefined}
              >
                <div className="flex items-center space-x-2">
                  <CodeBracketIcon className="h-4 w-4" />
                  <span>Submissions</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'problem' ? (
              <ProblemDescription challenge={currentChallenge} />
            ) : (
              <SubmissionsTab />
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-full md:w-1/2 bg-white flex flex-col">
          <CodeEditorPanel
            code={code}
            setCode={setCode}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            allowedLanguages={allowedLanguages}
            handleRunTests={handleRunTests}
            handleSubmit={handleSubmit}
            submissionLoading={submissionLoading}
            testResults={testResults}
            onEditorMount={handleEditorDidMount}
            isEditorReady={isEditorReady}
            challenge={currentChallenge}
            onResetTemplate={loadTemplate}
          />
        </div>
      </div>
      
      {/* Winner Modal */}
      <WinnerModal
        isOpen={showWinnerModal && !!winner}
        onClose={() => setShowWinnerModal(false)}
        winner={winner}
        currentUser={user}
        competition={competition}
      />
    </div>
  )
}

// Extracted Problem Description Component
const ProblemDescription = ({ challenge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    {/* Problem Statement */}
    <div>
      <div className="prose prose-sm max-w-none text-gray-700">
        {challenge.problemStatement ? (
          <div className="whitespace-pre-wrap leading-relaxed">
            {challenge.problemStatement}
          </div>
        ) : challenge.description ? (
          <p>{challenge.description}</p>
        ) : (
          <p className="text-gray-500 italic">No problem statement available.</p>
        )}
      </div>
    </div>

    {/* Examples */}
    {(challenge.examples?.length > 0 || challenge.sampleTestCases?.length > 0) && (
      <ExamplesSection challenge={challenge} />
    )}

    {/* Constraints */}
    {challenge.constraints && (
      <ConstraintsSection constraints={challenge.constraints} />
    )}

    {/* Hints */}
    {challenge.hints?.length > 0 && (
      <HintsSection hints={challenge.hints} />
    )}
  </motion.div>
)

// Extracted Examples Component
const ExamplesSection = ({ challenge }) => {
  const examples = challenge.examples || challenge.sampleTestCases
  
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples</h3>
      <div className="space-y-4">
        {examples.map((example, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Example {index + 1}:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Input:</span>
                <pre className="mt-1 bg-gray-200 rounded p-2 text-sm font-mono overflow-x-auto">
                  {example.input}
                </pre>
              </div>
              <div>
                <span className="font-medium">Output:</span>
                <pre className="mt-1 bg-gray-200 rounded p-2 text-sm font-mono overflow-x-auto">
                  {example.output}
                </pre>
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
  )
}

// Extracted Constraints Component
const ConstraintsSection = ({ constraints }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Constraints</h3>
    <div className="bg-gray-50 rounded-lg p-4">
      {Array.isArray(constraints) ? (
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {constraints.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      ) : (
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
          {constraints}
        </pre>
      )}
    </div>
  </div>
)

// Extracted Hints Component
const HintsSection = ({ hints }) => (
  <div>
    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hints</h3>
    <div className="space-y-3">
      {hints.map((hint, index) => (
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
)

// Extracted Submissions Tab Component
const SubmissionsTab = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submissions</h2>
    <p className="text-gray-600">Submission history will be displayed here.</p>
  </motion.div>
)

// Extracted Code Editor Panel Component
const CodeEditorPanel = ({
  code,
  setCode,
  selectedLanguage,
  setSelectedLanguage,
  allowedLanguages,
  handleRunTests,
  handleSubmit,
  submissionLoading,
  testResults,
  onEditorMount,
  isEditorReady,
  challenge,
  onResetTemplate
}) => (
  <>
    {/* Editor Header */}
    <div className="border-b border-gray-200 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isEditorReady}
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
            onClick={onResetTemplate}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleRunTests}
            disabled={!isEditorReady}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm transition-colors disabled:opacity-50"
            aria-label="Run code"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Run</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={submissionLoading || !isEditorReady}
            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
            aria-label="Submit code"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>{submissionLoading ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </div>
    </div>

    {/* Code Editor */}
    <div className="flex-1 min-h-[300px]">
      <Editor
        height="100%"
        language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          folding: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on'
        }}
        onMount={onEditorMount}
        loading={<LoadingSpinner />}
      />
    </div>

    {/* Console/Test Results */}
    <div className="border-t border-gray-200">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Console</h3>
      </div>
      <div className="p-4 max-h-48 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm">
        {testResults ? (
          <TestResultsDisplay results={testResults} />
        ) : (
          <div className="text-gray-500">
            <p>Run your code to see output here...</p>
          </div>
        )}
      </div>
    </div>
  </>
)

// Extracted Test Results Component
const TestResultsDisplay = ({ results }) => (
  <div className="space-y-2">
    {results.map((result, index) => (
      <div key={index} className={result.passed ? 'text-green-400' : 'text-red-400'}>
        <div className="flex items-center space-x-2">
          <span>Test Case {result.testCase || index + 1}:</span>
          {result.passed ? (
            <CheckCircleIcon className="h-4 w-4 inline" />
          ) : (
            <XCircleIcon className="h-4 w-4 inline" />
          )}
          <span>{result.passed ? 'Passed' : 'Failed'}</span>
        </div>
        <div className="ml-4 text-xs text-gray-300">
          <div>Input: {result.input || result.expectedOutput}</div>
          <div>Output: {result.output || result.actualOutput}</div>
          <div>Expected: {result.expected || result.expectedOutput}</div>
          {result.executionTime && (
            <div>Time: {result.executionTime}</div>
          )}
        </div>
      </div>
    ))}
  </div>
)

export default ChallengePage