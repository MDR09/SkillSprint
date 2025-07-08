// Code validation and error detection service
export const codeValidationService = {
  // Enhanced JavaScript validation for LeetCode-style functions
  validateJavaScript(code) {
    const errors = []
    const warnings = []
    
    // Skip validation for default templates (empty function bodies are expected)
    if (this.isDefaultTemplate(code)) {
      return { errors, warnings }
    }
    
    try {
      // For function-only code, wrap it for syntax checking
      let testCode = code
      if (code.trim().startsWith('var ') || code.trim().startsWith('function ')) {
        testCode = `(function() { ${code} })()`
      }
      new Function(testCode)
    } catch (error) {
      errors.push({
        line: this.extractLineNumber(error.message, code),
        column: 1,
        message: error.message.replace('Unexpected end of input', 'Incomplete function implementation'),
        severity: 'error',
        type: 'SyntaxError'
      })
    }
    
    const lines = code.split('\n')
    lines.forEach((line, index) => {
      const lineNum = index + 1
      const trimmedLine = line.trim()
      
      // Check for missing return statement in functions (only if function has some implementation)
      if (trimmedLine.includes('function') && code.trim().length > 50 && !code.includes('return')) {
        warnings.push({
          line: lineNum,
          column: 1,
          message: 'Function may be missing return statement',
          severity: 'warning',
          type: 'Logic'
        })
      }
      
      // Common JavaScript errors
      if (line.includes('undefined.') || line.includes('null.')) {
        warnings.push({
          line: lineNum,
          column: line.indexOf('.') + 1,
          message: 'Potential null/undefined access',
          severity: 'warning',
          type: 'RuntimeWarning'
        })
      }
    })
    
    return { errors, warnings }
  },

  // Python validation
  validatePython(code) {
    const errors = []
    const warnings = []
    
    // Skip validation for default templates
    if (this.isDefaultTemplate(code)) {
      return { errors, warnings }
    }
    
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const lineNum = index + 1
      
      // Missing colon after if/for/while/def/class
      if ((line.includes('if ') || line.includes('for ') || line.includes('while ') || 
           line.includes('def ') || line.includes('class ')) && 
          !line.trim().endsWith(':') && !line.includes('#')) {
        errors.push({
          line: lineNum,
          column: line.length,
          message: 'SyntaxError: invalid syntax - missing colon',
          severity: 'error',
          type: 'SyntaxError'
        })
      }
    })
    
    return { errors, warnings }
  },

  // Java validation
  validateJava(code) {
    const errors = []
    const warnings = []
    
    // Skip validation for default templates
    if (this.isDefaultTemplate(code)) {
      return { errors, warnings }
    }
    
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const lineNum = index + 1
      const trimmedLine = line.trim()
      
      // Missing semicolons
      if (trimmedLine && !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') &&
          !trimmedLine.startsWith('//') && !trimmedLine.startsWith('*') &&
          !trimmedLine.startsWith('public') && !trimmedLine.startsWith('private') &&
          !trimmedLine.startsWith('class') && !trimmedLine.startsWith('if') &&
          !trimmedLine.startsWith('for') && !trimmedLine.startsWith('while') &&
          trimmedLine !== '' && !trimmedLine.startsWith('@')) {
        
        if (trimmedLine.includes('return ') || trimmedLine.includes('=') ||
            /\w+\s*\(.*\)/.test(trimmedLine)) {
          errors.push({
            line: lineNum,
            column: line.length,
            message: 'Syntax error: missing semicolon',
            severity: 'error',
            type: 'CompileError'
          })
        }
      }
    })
    
    return { errors, warnings }
  },

  // C++ validation
  validateCpp(code) {
    const errors = []
    const warnings = []
    
    // Skip validation for default templates
    if (this.isDefaultTemplate(code)) {
      return { errors, warnings }
    }
    
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const lineNum = index + 1
      const trimmedLine = line.trim()
      
      // Skip comment lines
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || 
          trimmedLine.startsWith('*')) {
        return
      }
      
      // Missing semicolons for statements
      if (trimmedLine && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.includes('if (') &&
          !trimmedLine.includes('for (') &&
          !trimmedLine.includes('while (') &&
          !trimmedLine.includes('else') &&
          !trimmedLine.includes('class ') &&
          !trimmedLine.includes('public:') &&
          !trimmedLine.includes('private:') &&
          trimmedLine !== '') {
        
        if (trimmedLine.includes('return ') || 
            trimmedLine.includes('=') ||
            /\w+\s*\(.*\)/.test(trimmedLine)) {
          errors.push({
            line: lineNum,
            column: line.length,
            message: `expected ';' before token`,
            severity: 'error',
            type: 'CompileError'
          })
        }
      }
    })
    
    return { errors, warnings }
  },

  // C validation
  validateC(code) {
    const errors = []
    const warnings = []
    
    // Skip validation for default templates
    if (this.isDefaultTemplate(code)) {
      return { errors, warnings }
    }
    
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const lineNum = index + 1
      const trimmedLine = line.trim()
      
      // Skip comment lines
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || 
          trimmedLine.startsWith('*')) {
        return
      }
      
      // Missing semicolons for statements
      if (trimmedLine && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}') &&
          !trimmedLine.includes('if (') &&
          !trimmedLine.includes('for (') &&
          !trimmedLine.includes('while (') &&
          !trimmedLine.includes('else') &&
          trimmedLine !== '') {
        
        if (trimmedLine.includes('return ') || 
            trimmedLine.includes('=') ||
            /\w+\s*\(.*\)/.test(trimmedLine)) {
          errors.push({
            line: lineNum,
            column: line.length,
            message: `expected ';' before token`,
            severity: 'error',
            type: 'CompileError'
          })
        }
      }
    })
    
    return { errors, warnings }
  },

  // Main validation function
  validateCode(code, language) {
    switch (language) {
      case 'javascript':
        return this.validateJavaScript(code)
      case 'python':
        return this.validatePython(code)
      case 'java':
        return this.validateJava(code)
      case 'cpp':
        return this.validateCpp(code)
      case 'c':
        return this.validateC(code)
      default:
        return { errors: [], warnings: [] }
    }
  },

  // Enhanced runtime error simulation
  simulateRuntimeErrors(code, language) {
    const runtimeErrors = []
    
    if (language === 'javascript') {
      if (code.includes('undefined.') || code.includes('null.')) {
        runtimeErrors.push({
          message: 'TypeError: Cannot read property of undefined',
          type: 'RuntimeError',
          line: this.findLineContaining(code, ['undefined.', 'null.'])
        })
      }
    }
    
    if (language === 'python') {
      if (code.includes('1/0') || code.includes('/0')) {
        runtimeErrors.push({
          message: 'ZeroDivisionError: division by zero',
          type: 'RuntimeError',
          line: this.findLineContaining(code, ['1/0', '/0'])
        })
      }
    }
    
    if (language === 'java') {
      if (code.includes('null.')) {
        runtimeErrors.push({
          message: 'NullPointerException',
          type: 'RuntimeError',
          line: this.findLineContaining(code, ['null.'])
        })
      }
    }
    
    if (language === 'cpp' || language === 'c') {
      if (code.includes('malloc') && !code.includes('free')) {
        runtimeErrors.push({
          message: 'Memory leak detected: malloc without corresponding free',
          type: 'RuntimeWarning',
          line: this.findLineContaining(code, ['malloc'])
        })
      }
    }
    
    return runtimeErrors
  },

  // Check if code has meaningful implementation beyond template
  hasActualImplementation(code, language) {
    const cleanCode = code.trim()
    
    if (!cleanCode) return false
    
    // Remove comments and normalize whitespace
    const codeWithoutComments = cleanCode
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/#.*$/gm, '') // Remove # comments (Python)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    
    // Language-specific template detection
    switch (language) {
      case 'javascript':
        // Check for empty function templates
        const jsTemplates = [
          /var\s+\w+\s*=\s*function\s*\([^)]*\)\s*{\s*}/,
          /function\s+\w+\s*\([^)]*\)\s*{\s*}/
        ]
        if (jsTemplates.some(template => template.test(codeWithoutComments))) {
          return false
        }
        // Check for meaningful implementation
        return codeWithoutComments.includes('return') && 
               (codeWithoutComments.includes('if') || 
                codeWithoutComments.includes('for') || 
                codeWithoutComments.includes('while') ||
                codeWithoutComments.length > 100)
      
      case 'python':
        // Check for empty class templates with only 'pass'
        if (/class\s+\w+\s*:\s*def\s+\w+\s*\([^)]*\)\s*:\s*pass\s*$/.test(codeWithoutComments)) {
          return false
        }
        // Check for meaningful implementation
        return codeWithoutComments.includes('return') && 
               !codeWithoutComments.endsWith('pass') &&
               (codeWithoutComments.includes('if') || 
                codeWithoutComments.includes('for') || 
                codeWithoutComments.includes('while') ||
                codeWithoutComments.length > 80)
      
      case 'java':
        // Check for empty method body
        if (/public\s+\w+\s+\w+\s*\([^)]*\)\s*{\s*}/.test(codeWithoutComments)) {
          return false
        }
        // Check for meaningful implementation
        return codeWithoutComments.includes('return') && 
               (codeWithoutComments.includes('if') || 
                codeWithoutComments.includes('for') || 
                codeWithoutComments.includes('while') ||
                codeWithoutComments.length > 100)
      
      case 'cpp':
        // Check for empty method body
        if (/\w+\s+\w+\s*\([^)]*\)\s*{\s*}/.test(codeWithoutComments)) {
          return false
        }
        // Check for meaningful implementation
        return codeWithoutComments.includes('return') && 
               (codeWithoutComments.includes('if') || 
                codeWithoutComments.includes('for') || 
                codeWithoutComments.includes('while') ||
                codeWithoutComments.length > 100)
      
      default:
        return codeWithoutComments.length > 50 && 
               (codeWithoutComments.includes('return') || 
                codeWithoutComments.includes('if') ||
                codeWithoutComments.includes('for'))
    }
  },

  // Analyze code quality for test result simulation
  analyzeCodeQuality(code, language) {
    const cleanCode = code.toLowerCase().replace(/\s+/g, ' ')
    
    const analysis = {
      hasReturnStatement: cleanCode.includes('return'),
      hasLogic: cleanCode.includes('if') || cleanCode.includes('for') || cleanCode.includes('while'),
      hasLoops: cleanCode.includes('for') || cleanCode.includes('while'),
      hasVariables: cleanCode.includes('let') || cleanCode.includes('var') || cleanCode.includes('='),
      hasComments: code.includes('//') || code.includes('#') || code.includes('/*'),
      complexity: 0,
      codeLength: cleanCode.length
    }
    
    // Calculate complexity score
    if (analysis.hasReturnStatement) analysis.complexity += 1
    if (analysis.hasLogic) analysis.complexity += 1
    if (analysis.hasLoops) analysis.complexity += 1
    if (analysis.hasVariables) analysis.complexity += 1
    if (analysis.hasComments) analysis.complexity += 0.5
    if (analysis.codeLength > 100) analysis.complexity += 1
    if (analysis.codeLength > 200) analysis.complexity += 1
    
    return analysis
  },

  // Helper functions
  isDefaultTemplate(code) {
    // Detect if this is a default LeetCode-style template with empty function body
    const trimmedCode = code.trim()
    
    // Check for patterns that indicate default templates
    const templatePatterns = [
      // JavaScript: var twoSum = function(nums, target) { };
      /var\s+\w+\s*=\s*function\s*\([^)]*\)\s*{\s*}[;\s]*$/,
      // Python: class Solution: def method(...): [empty or just whitespace]
      /class\s+\w+:\s*def\s+\w+\([^)]*\):\s*$/,
      // Java: class Solution { public type method(...) { } }
      /class\s+\w+\s*{\s*public\s+\w+\s+\w+\([^)]*\)\s*{\s*}\s*}$/,
      // C++: class Solution { public: type method(...) { } };
      /class\s+\w+\s*{\s*public:\s*\w+\s+\w+\([^)]*\)\s*{\s*}\s*};$/,
      // C: type* function(...) { }
      /\w+\*?\s+\w+\([^)]*\)\s*{\s*}$/
    ]
    
    return templatePatterns.some(pattern => pattern.test(trimmedCode)) || 
           trimmedCode.length < 100; // Very short code is likely a template
  },

  extractLineNumber(errorMessage, code) {
    const lineMatch = errorMessage.match(/line (\d+)/)
    if (lineMatch) {
      return parseInt(lineMatch[1])
    }
    return 1
  },

  findLineContaining(code, patterns) {
    const lines = code.split('\n')
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of patterns) {
        if (lines[i].includes(pattern)) {
          return i + 1
        }
      }
    }
    return 1
  }
}