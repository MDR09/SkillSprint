// Utility functions for formatting and calculations

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

export const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

export const formatPoints = (points) => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}K`
  } else {
    return points.toString()
  }
}

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'green'
    case 'medium':
      return 'yellow'
    case 'hard':
      return 'red'
    default:
      return 'gray'
  }
}

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'accepted':
    case 'passed':
      return 'green'
    case 'in_progress':
    case 'running':
      return 'blue'
    case 'failed':
    case 'rejected':
    case 'error':
      return 'red'
    case 'pending':
    case 'queued':
      return 'yellow'
    default:
      return 'gray'
  }
}

export const calculateProgress = (completed, total) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export const calculateSuccessRate = (submissions) => {
  if (!submissions || submissions.length === 0) return 0
  const successful = submissions.filter(sub => sub.status === 'accepted').length
  return Math.round((successful / submissions.length) * 100)
}

export const getLanguageIcon = (language) => {
  const icons = {
    javascript: '🟨',
    python: '🐍',
    java: '☕',
    cpp: '⚡',
    'c++': '⚡',
    csharp: '#️⃣',
    'c#': '#️⃣',
    go: '🔵',
    rust: '🦀',
    php: '🐘',
    ruby: '💎',
    swift: '🍎',
    kotlin: '🟣',
    typescript: '🔷'
  }
  return icons[language?.toLowerCase()] || '📝'
}

export const generateAvatarUrl = (name, size = 40) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&format=svg`
}

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength).trim() + '...'
}

export const generateTeamName = () => {
  const adjectives = ['Awesome', 'Epic', 'Lightning', 'Thunder', 'Stellar', 'Cosmic', 'Phoenix', 'Dragon']
  const nouns = ['Coders', 'Hackers', 'Developers', 'Engineers', 'Ninjas', 'Warriors', 'Masters', 'Heroes']
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  
  return `${adjective} ${noun}`
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return re.test(password)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackErr) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

export const downloadFile = (data, filename, type = 'text/plain') => {
  const file = new Blob([data], { type })
  const a = document.createElement('a')
  const url = URL.createObjectURL(file)
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 0)
}

export const isValidJSON = (str) => {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}
