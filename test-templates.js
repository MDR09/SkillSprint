import CodeTemplateGenerator from './backend/utils/codeTemplateGenerator.js'

// Sample challenge data (like what would come from database)
const sampleChallenge = {
  title: "Climbing Stairs",
  functionName: "climbStairs",
  parameters: [
    {
      name: "n",
      type: "number",
      pythonType: "int",
      javaType: "int",
      cppType: "int",
      description: "The number of steps in the staircase (1 to 45)"
    }
  ],
  returnType: "number",
  pythonReturnType: "int",
  javaReturnType: "int",
  cppReturnType: "int"
}

console.log("=== TESTING CODE TEMPLATE GENERATION ===\n")

// Test JavaScript template
console.log("🟨 JAVASCRIPT TEMPLATE:")
console.log("=" .repeat(50))
console.log(CodeTemplateGenerator.generateTemplate(sampleChallenge, 'javascript'))
console.log("\n")

// Test Python template
console.log("🐍 PYTHON TEMPLATE:")
console.log("=" .repeat(50))
console.log(CodeTemplateGenerator.generateTemplate(sampleChallenge, 'python'))
console.log("\n")

// Test Java template
console.log("☕ JAVA TEMPLATE:")
console.log("=" .repeat(50))
console.log(CodeTemplateGenerator.generateTemplate(sampleChallenge, 'java'))
console.log("\n")

// Test C++ template
console.log("⚡ C++ TEMPLATE:")
console.log("=" .repeat(50))
console.log(CodeTemplateGenerator.generateTemplate(sampleChallenge, 'cpp'))
console.log("\n")

console.log("✅ Template generation test completed!")
