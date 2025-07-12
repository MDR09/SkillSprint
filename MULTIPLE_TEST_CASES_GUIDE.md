# Multiple Test Cases Implementation Guide

## 📋 Overview

SkillSprint now supports LeetCode-style challenges with multiple test cases, comprehensive problem descriptions, examples, and automated code evaluation.

## 🔧 How It Works

### 1. Challenge Structure

Each challenge now supports:
- **Function signature definition** (parameters, return types for different languages)
- **Multiple examples** with explanations
- **Visible test cases** (shown to users for debugging)
- **Hidden test cases** (used for final evaluation)
- **Constraints and hints**
- **Algorithm complexity information**

### 2. Test Case Evaluation

The system:
1. Runs user code against visible test cases first (for immediate feedback)
2. Evaluates against all test cases (including hidden ones) for final scoring
3. Provides partial credit based on number of test cases passed
4. Shows detailed results for each test case

## 📊 Getting Problem Data

### Option A: Create Your Own Problems (Recommended)

Use the provided JSON format to create original problems:

```json
{
  "title": "Problem Name",
  "difficulty": "Easy|Medium|Hard",
  "description": "Problem description",
  "functionName": "solutionFunction",
  "parameters": [
    {
      "name": "param1",
      "type": "number",
      "pythonType": "int",
      "javaType": "int",
      "cppType": "int"
    }
  ],
  "returnType": "number",
  "examples": [...],
  "testCases": [...],
  "constraints": [...],
  "hints": [...]
}
```

### Option B: Alternative Problem Sources

Since LeetCode doesn't provide a public API, consider these alternatives:

1. **HackerRank API** (if available)
2. **Codeforces API** - Has public API for contest problems
3. **CodeChef API** - Limited but available
4. **Open source problem datasets**
5. **Educational platforms** with open content

### Option C: Manual Problem Creation

Create problems inspired by common algorithmic patterns:

1. **Array/String Problems**: Two Sum, Palindrome Check, etc.
2. **Dynamic Programming**: Fibonacci, Climbing Stairs, etc.
3. **Graph Problems**: BFS, DFS, Shortest Path
4. **Tree Problems**: Traversals, Validation
5. **Sorting/Searching**: Binary Search, Merge Sort

## 🚀 Using the System

### 1. Import Sample Problems

```bash
cd backend
npm run import-challenges
```

This will import the sample problems from the `sample-problems/` directory.

### 2. Add New Problems

1. Create a JSON file in `sample-problems/` directory
2. Follow the schema shown in existing examples
3. Run the import script again

### 3. Frontend Features

- **Code Editor**: Multi-language support with syntax highlighting
- **Template Generation**: Automatic code templates for each language
- **Test Runner**: Run visible test cases immediately
- **Real-time Feedback**: See results as you code

### 4. Backend API Endpoints

- `GET /api/challenges/:id/template/:language` - Get code template
- `POST /api/challenges/:id/test` - Run test cases
- `POST /api/challenges/:id/submit` - Submit solution for evaluation

## 📝 Code Template Examples

### JavaScript Template
```javascript
function twoSum(nums, target) {
    // Write your code here
    
}
```

### Python Template
```python
def two_sum(nums: List[int], target: int) -> List[int]:
    """
    Your solution here
    """
    pass
```

### Java Template
```java
public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        
    }
}
```

## 🔒 Legal Considerations

1. **Don't scrape copyrighted content** from LeetCode or similar platforms
2. **Create original problems** or use open-source alternatives
3. **Respect Terms of Service** of any platform you integrate with
4. **Give proper attribution** when using open-source problems

## 🛠 Technical Implementation

### Code Execution Pipeline

1. **Template Generation**: Create language-specific boilerplate
2. **Code Wrapping**: Inject test case execution logic
3. **Sandboxed Execution**: Run in isolated environment
4. **Result Comparison**: Deep equality checking for complex data types
5. **Scoring**: Calculate points based on passed test cases

### Security Features

- **Input Validation**: Sanitize all user inputs
- **Time Limits**: Prevent infinite loops
- **Memory Limits**: Control resource usage
- **Sandboxing**: Isolated execution environment

## 📈 Future Enhancements

1. **Real-time Collaboration**: Multiple users on same problem
2. **Advanced Metrics**: Execution time, memory usage tracking
3. **Custom Test Cases**: Let users add their own test cases
4. **Explanation Videos**: Embedded solution explanations
5. **Peer Reviews**: Community-driven solution reviews

## 🔧 Configuration

Update your environment variables:

```env
# Code execution settings
ENABLE_CODE_EXECUTION=true
CODE_TIMEOUT=30000
MAX_MEMORY_MB=256
TEMP_DIR=./temp

# Supported languages
SUPPORTED_LANGUAGES=javascript,python,java,cpp
```

## 🐛 Troubleshooting

### Common Issues

1. **Template not loading**: Check challenge has required fields
2. **Code execution fails**: Verify language runtime is installed
3. **Test cases not showing**: Ensure proper JSON format
4. **Performance issues**: Optimize test case complexity

### Debug Mode

Enable debug logging:
```javascript
// In your environment
DEBUG_CODE_EXECUTION=true
```

This system provides a robust foundation for coding challenges similar to LeetCode, with the flexibility to add your own content and customize the experience for your users.
