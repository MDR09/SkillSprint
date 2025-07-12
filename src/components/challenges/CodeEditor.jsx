import React, { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Play, Download, Copy, Check } from 'lucide-react'

const CodeEditor = ({ challengeId, language, onLanguageChange, onCodeChange, challenge }) => {
  const [code, setCode] = useState('')
  const [template, setTemplate] = useState('')
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [copied, setCopied] = useState(false)

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' }
  ]

  // Load template when language changes
  useEffect(() => {
    if (challengeId && language) {
      loadTemplate()
    }
  }, [challengeId, language])

  const loadTemplate = async () => {
    setIsLoadingTemplate(true)
    try {
      const response = await fetch(`/api/challenges/${challengeId}/template/${language}`)
      const data = await response.json()
      
      if (data.success) {
        setTemplate(data.data.template)
        setCode(data.data.template)
        onCodeChange?.(data.data.template)
      } else {
        console.error('Failed to load template:', data.message)
      }
    } catch (error) {
      console.error('Error loading template:', error)
    } finally {
      setIsLoadingTemplate(false)
    }
  }

  const runTests = async () => {
    if (!code.trim()) {
      alert('Please write some code first!')
      return
    }

    setIsRunning(true)
    setTestResults(null)

    try {
      const response = await fetch(`/api/challenges/${challengeId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // For now, just show that the test runner was generated
        // In a full implementation, you'd execute the code and show results
        setTestResults({
          message: 'Test runner generated successfully!',
          visibleTestCases: data.data.visibleTestCases,
          totalTestCases: data.data.totalTestCases,
          testRunner: data.data.testRunner
        })
      } else {
        setTestResults({
          error: data.message
        })
      }
    } catch (error) {
      setTestResults({
        error: 'Failed to run tests: ' + error.message
      })
    } finally {
      setIsRunning(false)
    }
  }

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadTemplate = () => {
    const selectedLang = languages.find(l => l.value === language)
    const filename = `solution${selectedLang?.extension || '.txt'}`
    
    const blob = new Blob([template], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <select
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={loadTemplate}
            disabled={isLoadingTemplate}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoadingTemplate ? 'Loading...' : 'Reset Template'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyTemplate}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Copy template"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
          
          <button
            onClick={downloadTemplate}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Download template"
          >
            <Download size={20} />
          </button>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Play size={16} />
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex">
        {/* Code Editor Area */}
        <div className="w-1/2 h-full">
          <div className="p-4 bg-gray-900 text-gray-400 text-sm border-b border-gray-700">
            Code Editor
          </div>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
            placeholder="Write your code here..."
            spellCheck={false}
          />
        </div>

        {/* Results Panel */}
        <div className="w-1/2 h-full border-l border-gray-700">
          <div className="p-4 bg-gray-900 text-gray-400 text-sm border-b border-gray-700">
            Test Results
          </div>
          
          <div className="h-full p-4 bg-gray-800 overflow-auto">
            {testResults ? (
              <div>
                {testResults.error ? (
                  <div className="text-red-400">
                    <h3 className="font-semibold mb-2">Error:</h3>
                    <p>{testResults.error}</p>
                  </div>
                ) : (
                  <div className="text-green-400">
                    <h3 className="font-semibold mb-2">Test Runner Generated!</h3>
                    <p className="mb-4">{testResults.message}</p>
                    
                    <div className="mb-4">
                      <p className="text-gray-300">
                        Visible Test Cases: {testResults.visibleTestCases} / {testResults.totalTestCases}
                      </p>
                    </div>

                    {testResults.testRunner && (
                      <div>
                        <h4 className="text-gray-300 font-semibold mb-2">Generated Test Runner:</h4>
                        <SyntaxHighlighter
                          language={language}
                          style={vscDarkPlus}
                          className="text-xs"
                          customStyle={{
                            margin: 0,
                            padding: '16px',
                            backgroundColor: '#1a1a1a'
                          }}
                        >
                          {testResults.testRunner}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                <p>Click "Run Tests" to see results here.</p>
                <p className="mt-2 text-sm">
                  This will run your code against the visible test cases and show you the output.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
