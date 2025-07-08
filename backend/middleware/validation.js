import Joi from 'joi'

export const validateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    username: Joi.string().alphanum().min(3).max(30).optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  next()
}

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  next()
}

export const validateChallenge = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(5).max(100).required(),
    description: Joi.string().trim().min(10).max(5000).required(),
    problemStatement: Joi.string().trim().min(10).required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
    category: Joi.string().valid(
      'Algorithms', 'Data Structures', 'Dynamic Programming', 
      'Graph Theory', 'String Manipulation', 'System Design',
      'Database', 'Full Stack', 'Frontend', 'Backend',
      'Machine Learning', 'Other'
    ).required(),
    timeLimit: Joi.number().min(5).max(480).required(),
    memoryLimit: Joi.number().min(64).max(1024).optional(),
    allowedLanguages: Joi.array().items(
      Joi.string().valid('javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript')
    ).min(1).required(),
    sampleInput: Joi.string().required(),
    sampleOutput: Joi.string().required(),
    testCases: Joi.array().items(
      Joi.object({
        input: Joi.string().required(),
        expectedOutput: Joi.string().required(),
        isHidden: Joi.boolean().optional(),
        weight: Joi.number().min(1).optional()
      })
    ).min(1).required(),
    schedule: Joi.object({
      startTime: Joi.date().iso().required(),
      endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
      timezone: Joi.string().optional()
    }).required(),
    tags: Joi.array().items(Joi.string().max(30)).optional(),
    constraints: Joi.string().max(1000).optional(),
    hints: Joi.array().items(Joi.string().max(500)).optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  next()
}

export const validateSubmission = (req, res, next) => {
  const schema = Joi.object({
    challengeId: Joi.string().required(),
    code: Joi.string().min(1).max(50000).required(),
    language: Joi.string().valid(
      'javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'typescript'
    ).required()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  next()
}

export const validateTeam = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    description: Joi.string().trim().max(500).optional(),
    maxMembers: Joi.number().min(2).max(10).optional(),
    isPublic: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string().max(30)).optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  next()
}

export const validateDiscussion = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(5).max(200).required(),
    content: Joi.string().trim().min(10).max(5000).required(),
    type: Joi.string().valid('question', 'clarification', 'hint', 'solution', 'general').optional(),
    tags: Joi.array().items(Joi.string().max(30)).optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    })
  }
  next()
}
