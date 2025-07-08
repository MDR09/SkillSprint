# Backend API Routes for Code Execution

Here are the API endpoints you'll need to implement on your backend:

## Code Execution Routes

### 1. POST `/api/code/run`
**Description**: Run code with test cases for immediate feedback
**Request Body**:
```json
{
  "code": "string (full executable code with boilerplate)",
  "language": "string (javascript|python|java|cpp|c)",
  "challengeId": "string",
  "testCases": "array (optional - specific test cases to run)"
}
```
**Response**:
```json
{
  "success": true,
  "testResults": {
    "passed": 3,
    "total": 5,
    "status": "Passed|Failed|Error",
    "executionTime": "245ms",
    "memoryUsage": "15.2MB",
    "results": [
      {
        "testCase": 1,
        "passed": true,
        "input": "[2,7,11,15], 9",
        "expectedOutput": "[0,1]",
        "actualOutput": "[0,1]",
        "executionTime": "2ms"
      }
    ]
  }
}
```

### 2. POST `/api/code/submit`
**Description**: Submit code for final evaluation and scoring
**Request Body**:
```json
{
  "code": "string (full executable code)",
  "userCode": "string (clean user code for storage)",
  "language": "string",
  "challengeId": "string",
  "userId": "string (from auth token)"
}
```
**Response**:
```json
{
  "success": true,
  "submissionId": "string",
  "score": 100,
  "status": "Accepted|Wrong Answer|Time Limit Exceeded|Runtime Error",
  "testResults": { /* same as run response */ },
  "ranking": {
    "position": 15,
    "totalSubmissions": 1245
  }
}
```

### 3. POST `/api/code/validate`
**Description**: Validate code syntax without execution
**Request Body**:
```json
{
  "code": "string",
  "language": "string"
}
```
**Response**:
```json
{
  "valid": true,
  "errors": [
    {
      "line": 5,
      "column": 12,
      "message": "Syntax error: missing semicolon",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "line": 3,
      "column": 8,
      "message": "Unused variable 'temp'",
      "severity": "warning"
    }
  ]
}
```

### 4. GET `/api/code/submissions`
**Description**: Get user's submission history for a challenge
**Query Parameters**:
- `challengeId`: string
- `userId`: string (optional, from auth token)
- `limit`: number (default: 10)
- `offset`: number (default: 0)

**Response**:
```json
{
  "submissions": [
    {
      "id": "string",
      "code": "string (user code only)",
      "language": "string",
      "status": "Accepted",
      "score": 100,
      "submittedAt": "2024-01-15T10:30:00Z",
      "executionTime": "245ms",
      "memoryUsage": "15.2MB"
    }
  ],
  "total": 25,
  "best": {
    "score": 100,
    "submissionId": "string"
  }
}
```

### 5. GET `/api/challenges/:id/languages`
**Description**: Get supported languages for a specific challenge
**Response**:
```json
{
  "languages": ["javascript", "python", "java", "cpp", "c"],
  "defaultLanguage": "javascript",
  "templates": {
    "javascript": "function solution() {\n  // Your code here\n}",
    "python": "def solution():\n    # Your code here\n    pass"
  }
}
```

## Code Execution Engine Requirements

### Security Considerations
1. **Sandboxing**: Use Docker containers or secure sandboxes
2. **Time Limits**: 5-30 seconds per execution
3. **Memory Limits**: 128MB-512MB per execution
4. **Resource Monitoring**: CPU, memory, network usage
5. **Input Validation**: Sanitize all code inputs

### Recommended Tech Stack
- **Docker**: For secure code execution environments
- **Judge0 API**: Ready-made code execution service
- **AWS Lambda**: Serverless code execution
- **Language-specific**: Node.js (JS), Python interpreter, OpenJDK (Java), GCC (C/C++)

### Example Docker Setup
```dockerfile
# Example for Python execution
FROM python:3.9-alpine
RUN adduser -D coderunner
USER coderunner
WORKDIR /app
COPY --chown=coderunner:coderunner . .
CMD ["python", "solution.py"]
```

### Rate Limiting
- 10 runs per minute per user
- 5 submissions per minute per user
- 100 validation requests per minute per user

This structure provides a complete LeetCode-style code execution system!
