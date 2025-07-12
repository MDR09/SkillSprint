import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

class CodeExecutionService {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp')
    this.ensureTempDir()
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir)
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true })
    }
  }

  async executeCode(code, language, testCases, functionName, parameters, returnType) {
    const executionId = uuidv4()
    const results = []

    try {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]
        const result = await this.runSingleTestCase(
          code, 
          language, 
          testCase, 
          functionName, 
          parameters, 
          returnType,
          executionId,
          i
        )
        results.push(result)
      }

      // Calculate overall result
      const passedTests = results.filter(r => r.passed).length
      const totalTests = results.length
      const score = (passedTests / totalTests) * 100

      return {
        success: true,
        score,
        passedTests,
        totalTests,
        results,
        executionTime: results.reduce((sum, r) => sum + (r.executionTime || 0), 0),
        memoryUsage: Math.max(...results.map(r => r.memoryUsage || 0))
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        score: 0,
        passedTests: 0,
        totalTests: testCases.length,
        results
      }
    }
  }

  async runSingleTestCase(code, language, testCase, functionName, parameters, returnType, executionId, testIndex) {
    const startTime = Date.now()
    
    try {
      let wrappedCode
      let filename
      let command
      let args

      switch (language.toLowerCase()) {
        case 'javascript':
          wrappedCode = this.wrapJavaScriptCode(code, testCase, functionName, parameters)
          filename = `${executionId}_${testIndex}.js`
          command = 'node'
          args = [filename]
          break

        case 'python':
          wrappedCode = this.wrapPythonCode(code, testCase, functionName, parameters)
          filename = `${executionId}_${testIndex}.py`
          command = 'python'
          args = [filename]
          break

        case 'java':
          wrappedCode = this.wrapJavaCode(code, testCase, functionName, parameters)
          filename = `${executionId}_${testIndex}.java`
          command = 'javac'
          args = [filename]
          break

        case 'cpp':
          wrappedCode = this.wrapCppCode(code, testCase, functionName, parameters)
          filename = `${executionId}_${testIndex}.cpp`
          command = 'g++'
          args = ['-o', `${executionId}_${testIndex}`, filename]
          break

        default:
          throw new Error(`Unsupported language: ${language}`)
      }

      const filePath = path.join(this.tempDir, filename)
      await fs.writeFile(filePath, wrappedCode)

      const result = await this.executeFile(command, args, filePath, language, executionId, testIndex)
      const endTime = Date.now()

      // Compare output with expected result
      const passed = this.compareResults(result.output, testCase.expectedOutput, returnType)

      return {
        testCase: testCase.isHidden ? 'Hidden test case' : testCase,
        passed,
        output: result.output,
        expectedOutput: testCase.expectedOutput,
        executionTime: endTime - startTime,
        memoryUsage: result.memoryUsage,
        error: result.error
      }

    } catch (error) {
      return {
        testCase: testCase.isHidden ? 'Hidden test case' : testCase,
        passed: false,
        output: null,
        expectedOutput: testCase.expectedOutput,
        executionTime: Date.now() - startTime,
        error: error.message
      }
    }
  }

  wrapJavaScriptCode(userCode, testCase, functionName, parameters) {
    const inputValues = this.prepareInputValues(testCase.input, parameters)
    
    return `
${userCode}

// Test execution
try {
  const input = ${JSON.stringify(testCase.input)};
  const args = [${inputValues.join(', ')}];
  const result = ${functionName}(...args);
  console.log(JSON.stringify(result));
} catch (error) {
  console.error('Runtime Error:', error.message);
  process.exit(1);
}
`
  }

  wrapPythonCode(userCode, testCase, functionName, parameters) {
    const inputValues = this.prepareInputValues(testCase.input, parameters, 'python')
    
    return `
import json
import sys

${userCode}

try:
    input_data = ${JSON.stringify(testCase.input)}
    args = [${inputValues.join(', ')}]
    result = ${functionName}(*args)
    print(json.dumps(result))
except Exception as error:
    print(f"Runtime Error: {error}", file=sys.stderr)
    sys.exit(1)
`
  }

  wrapJavaCode(userCode, testCase, functionName, parameters) {
    const className = `Solution${Date.now()}`
    
    return `
import java.util.*;
import com.google.gson.Gson;

public class ${className} {
    ${userCode}
    
    public static void main(String[] args) {
        try {
            ${className} solution = new ${className}();
            Gson gson = new Gson();
            
            // Parse input and call function
            // This is a simplified version - you'd need more complex parsing for different types
            Object result = solution.${functionName}(/* parsed inputs */);
            System.out.println(gson.toJson(result));
        } catch (Exception error) {
            System.err.println("Runtime Error: " + error.getMessage());
            System.exit(1);
        }
    }
}
`
  }

  wrapCppCode(userCode, testCase, functionName, parameters) {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

${userCode}

int main() {
    try {
        // Parse input and call function
        // This is a simplified version - you'd need more complex parsing for different types
        auto result = ${functionName}(/* parsed inputs */);
        
        json output = result;
        cout << output.dump() << endl;
        return 0;
    } catch (const exception& error) {
        cerr << "Runtime Error: " << error.what() << endl;
        return 1;
    }
}
`
  }

  prepareInputValues(input, parameters, language = 'javascript') {
    const values = []
    
    for (const param of parameters) {
      const value = input[param.name]
      
      if (language === 'python') {
        if (param.type.includes('[]') || param.pythonType?.includes('List')) {
          values.push(JSON.stringify(value))
        } else if (param.type === 'string' || param.pythonType === 'str') {
          values.push(`"${value}"`)
        } else {
          values.push(JSON.stringify(value))
        }
      } else {
        values.push(JSON.stringify(value))
      }
    }
    
    return values
  }

  async executeFile(command, args, filePath, language, executionId, testIndex) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: this.tempDir,
        timeout: 30000, // 30 second timeout
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process.on('close', async (code) => {
        try {
          // Clean up temp file
          await fs.unlink(filePath).catch(() => {})
          
          if (language === 'java' && code === 0) {
            // For Java, we need to run the compiled class
            const className = path.basename(filePath, '.java')
            const javaProcess = spawn('java', [className], {
              cwd: this.tempDir,
              timeout: 30000
            })
            
            let javaStdout = ''
            let javaStderr = ''
            
            javaProcess.stdout.on('data', (data) => {
              javaStdout += data.toString()
            })
            
            javaProcess.stderr.on('data', (data) => {
              javaStderr += data.toString()
            })
            
            javaProcess.on('close', (javaCode) => {
              resolve({
                output: javaCode === 0 ? javaStdout.trim() : null,
                error: javaCode !== 0 ? javaStderr : null,
                memoryUsage: 0 // Would need system-specific implementation
              })
            })
          } else if (language === 'cpp' && code === 0) {
            // For C++, run the compiled executable
            const execProcess = spawn(`./${executionId}_${testIndex}`, [], {
              cwd: this.tempDir,
              timeout: 30000
            })
            
            let cppStdout = ''
            let cppStderr = ''
            
            execProcess.stdout.on('data', (data) => {
              cppStdout += data.toString()
            })
            
            execProcess.stderr.on('data', (data) => {
              cppStderr += data.toString()
            })
            
            execProcess.on('close', (cppCode) => {
              resolve({
                output: cppCode === 0 ? cppStdout.trim() : null,
                error: cppCode !== 0 ? cppStderr : null,
                memoryUsage: 0
              })
            })
          } else {
            resolve({
              output: code === 0 ? stdout.trim() : null,
              error: code !== 0 ? stderr : null,
              memoryUsage: 0
            })
          }
        } catch (error) {
          reject(error)
        }
      })

      process.on('error', reject)
    })
  }

  compareResults(actualOutput, expectedOutput, returnType) {
    try {
      // Try to parse as JSON first
      const actual = JSON.parse(actualOutput)
      const expected = expectedOutput
      
      return this.deepEqual(actual, expected)
    } catch {
      // If JSON parsing fails, do string comparison
      return actualOutput?.toString().trim() === expectedOutput?.toString().trim()
    }
  }

  deepEqual(a, b) {
    if (a === b) return true
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => this.deepEqual(item, b[index]))
    }
    
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      
      if (keysA.length !== keysB.length) return false
      
      return keysA.every(key => this.deepEqual(a[key], b[key]))
    }
    
    return false
  }
}

export default CodeExecutionService
