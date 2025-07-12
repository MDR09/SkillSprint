class CodeTemplateGenerator {
  static generateTemplate(challenge, language) {
    const { functionName, parameters, returnType } = challenge
    
    switch (language.toLowerCase()) {
      case 'javascript':
        return this.generateJavaScriptTemplate(functionName, parameters, returnType)
      case 'python':
        return this.generatePythonTemplate(functionName, parameters, challenge.pythonReturnType)
      case 'java':
        return this.generateJavaTemplate(functionName, parameters, challenge.javaReturnType)
      case 'cpp':
        return this.generateCppTemplate(functionName, parameters, challenge.cppReturnType)
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }

  static generateJavaScriptTemplate(functionName, parameters, returnType) {
    const paramList = parameters.map(p => p.name).join(', ')
    const paramComments = parameters.map(p => ` * @param {${p.type}} ${p.name} ${p.description || ''}`).join('\n')
    
    return `/**
${paramComments}
 * @return {${returnType}}
 */
var ${functionName} = function(${paramList}) {
    
};`
  }

  static generatePythonTemplate(functionName, parameters, returnType) {
    const typeHints = parameters.map(p => `${p.name}: ${p.pythonType || p.type}`).join(', ')
    
    return `class Solution:
    def ${functionName}(self, ${typeHints}) -> ${returnType}:
        `
  }

  static generateJavaTemplate(functionName, parameters, returnType) {
    const paramList = parameters.map(p => `${p.javaType || p.type} ${p.name}`).join(', ')
    
    return `class Solution {
    public ${returnType} ${functionName}(${paramList}) {
        
    }
}`
  }

  static generateCppTemplate(functionName, parameters, returnType) {
    const paramList = parameters.map(p => `${p.cppType || p.type} ${p.name}`).join(', ')
    
    return `class Solution {
public:
    ${returnType} ${functionName}(${paramList}) {
        
    }
};`
  }

  static getExampleValue(type, language = 'javascript') {
    const typeMap = {
      javascript: {
        'number': '0',
        'string': '""',
        'boolean': 'false',
        'number[]': '[1, 2, 3]',
        'string[]': '["a", "b", "c"]',
        'ListNode': 'null'
      },
      python: {
        'int': '0',
        'str': '""',
        'bool': 'False',
        'List[int]': '[1, 2, 3]',
        'List[str]': '["a", "b", "c"]',
        'Optional[ListNode]': 'None',
        'ListNode': 'None'
      },
      java: {
        'int': '0',
        'String': '""',
        'boolean': 'false',
        'int[]': 'new int[]{1, 2, 3}',
        'String[]': 'new String[]{"a", "b", "c"}',
        'ListNode': 'null'
      },
      cpp: {
        'int': '0',
        'string': '""',
        'bool': 'false',
        'vector<int>': '{1, 2, 3}',
        'vector<string>': '{"a", "b", "c"}',
        'ListNode*': 'nullptr'
      }
    }
    
    return typeMap[language]?.[type] || '/* example value */'
  }

  static generateTestCaseRunner(challenge, language, userCode) {
    const testCases = challenge.testCases.filter(tc => !tc.isHidden) // Only visible test cases for frontend
    
    switch (language.toLowerCase()) {
      case 'javascript':
        return this.generateJavaScriptTestRunner(challenge, userCode, testCases)
      case 'python':
        return this.generatePythonTestRunner(challenge, userCode, testCases)
      default:
        return null // For now, only support JS and Python test runners
    }
  }

  static generateJavaScriptTestRunner(challenge, userCode, testCases) {
    const { functionName, parameters } = challenge
    
    return `
${userCode}

// Test runner
const testCases = ${JSON.stringify(testCases, null, 2)};

console.log('Running test cases...');
let passed = 0;
let total = testCases.length;

testCases.forEach((testCase, index) => {
  try {
    const input = testCase.input;
    const expected = testCase.expectedOutput;
    
    // Extract parameters
    const args = [${parameters.map(p => `input.${p.name}`).join(', ')}];
    
    // Run the function
    const result = ${functionName}(...args);
    
    // Compare results
    const isCorrect = JSON.stringify(result) === JSON.stringify(expected);
    
    console.log(\`Test Case \${index + 1}: \${isCorrect ? 'PASS' : 'FAIL'}\`);
    console.log(\`  Input: \${JSON.stringify(input)}\`);
    console.log(\`  Expected: \${JSON.stringify(expected)}\`);
    console.log(\`  Got: \${JSON.stringify(result)}\`);
    console.log('');
    
    if (isCorrect) passed++;
  } catch (error) {
    console.log(\`Test Case \${index + 1}: ERROR\`);
    console.log(\`  Error: \${error.message}\`);
    console.log('');
  }
});

console.log(\`Results: \${passed}/\${total} test cases passed\`);
`
  }

  static generatePythonTestRunner(challenge, userCode, testCases) {
    const { functionName, parameters } = challenge
    
    return `
import json

${userCode}

# Test runner
test_cases = ${JSON.stringify(testCases, null, 2)}

print('Running test cases...')
passed = 0
total = len(test_cases)

for i, test_case in enumerate(test_cases):
    try:
        input_data = test_case['input']
        expected = test_case['expectedOutput']
        
        # Extract parameters
        args = [${parameters.map(p => `input_data['${p.name}']`).join(', ')}]
        
        # Run the function
        result = ${functionName}(*args)
        
        # Compare results
        is_correct = json.dumps(result, sort_keys=True) == json.dumps(expected, sort_keys=True)
        
        print(f'Test Case {i + 1}: {"PASS" if is_correct else "FAIL"}')
        print(f'  Input: {json.dumps(input_data)}')
        print(f'  Expected: {json.dumps(expected)}')
        print(f'  Got: {json.dumps(result)}')
        print('')
        
        if is_correct:
            passed += 1
    except Exception as error:
        print(f'Test Case {i + 1}: ERROR')
        print(f'  Error: {str(error)}')
        print('')

print(f'Results: {passed}/{total} test cases passed')
`
  }
}

export default CodeTemplateGenerator
