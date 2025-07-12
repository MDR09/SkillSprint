import { useState, useCallback } from 'react'

// Custom hook to manage locally deleted competitions
export const useDeletedCompetitions = () => {
  const [deletedCompetitions, setDeletedCompetitions] = useState(new Set())

  const markAsDeleted = useCallback((competitionId) => {
    setDeletedCompetitions(prev => new Set([...prev, competitionId]))
    
    // Auto-remove from local state after 3 seconds
    setTimeout(() => {
      setDeletedCompetitions(prev => {
        const newSet = new Set(prev)
        newSet.delete(competitionId)
        return newSet
      })
    }, 3000)
  }, [])

  const isDeleted = useCallback((competitionId) => {
    return deletedCompetitions.has(competitionId)
  }, [deletedCompetitions])

  const clearDeleted = useCallback(() => {
    setDeletedCompetitions(new Set())
  }, [])

  return {
    markAsDeleted,
    isDeleted,
    clearDeleted
  }
}
