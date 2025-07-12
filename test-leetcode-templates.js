import CodeTemplateGenerator from './backend/utils/codeTemplateGenerator.js'

// Test LeetCode-style templates
const twoSumChallenge = {
  functionName: "twoSum",
  parameters: [
    { name: "nums", type: "number[]", pythonType: "List[int]", javaType: "int[]", cppType: "vector<int>", description: "Array of integers" },
    { name: "target", type: "number", pythonType: "int", javaType: "int", cppType: "int", description: "Target sum" }
  ],
  returnType: "number[]",
  pythonReturnType: "List[int]",
  javaReturnType: "int[]",
  cppReturnType: "vector<int>"
}

const climbStairsChallenge = {
  functionName: "climbStairs",
  parameters: [
    { name: "n", type: "number", pythonType: "int", javaType: "int", cppType: "int", description: "Number of steps" }
  ],
  returnType: "number",
  pythonReturnType: "int",
  javaReturnType: "int",
  cppReturnType: "int"
}

console.log("=== LEETCODE-STYLE TEMPLATES ===\n")

console.log("🟨 JavaScript (Two Sum):")
console.log(CodeTemplateGenerator.generateTemplate(twoSumChallenge, 'javascript'))
console.log("\n" + "=".repeat(50) + "\n")

console.log("🐍 Python (Climbing Stairs):")
console.log(CodeTemplateGenerator.generateTemplate(climbStairsChallenge, 'python'))
console.log("\n" + "=".repeat(50) + "\n")

console.log("☕ Java (Two Sum):")
console.log(CodeTemplateGenerator.generateTemplate(twoSumChallenge, 'java'))
console.log("\n" + "=".repeat(50) + "\n")

console.log("⚡ C++ (Climbing Stairs):")
console.log(CodeTemplateGenerator.generateTemplate(climbStairsChallenge, 'cpp'))
console.log("\n")

console.log("✅ LeetCode-style templates generated!")
