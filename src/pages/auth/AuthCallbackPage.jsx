import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchUser } from '../../store/slices/authSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Authentication failed. Please try again.')
      navigate('/login')
      return
    }

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token)
      
      // Load user data
      dispatch(fetchUser())
      toast.success('Successfully logged in!')
      navigate('/dashboard')
    } else {
      toast.error('No authentication token received')
      navigate('/login')
    }
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
