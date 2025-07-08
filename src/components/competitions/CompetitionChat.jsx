import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { sendChatMessage, addChatMessage } from '../../store/slices/competitionSlice'
import socketService from '../../services/socketService'

const CompetitionChat = ({ competitionId }) => {
  const dispatch = useDispatch()
  const { chatMessages } = useSelector((state) => state.competition)
  const { user } = useSelector((state) => state.auth)
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Join competition room
    socketService.joinCompetition(competitionId)

    // Listen for new messages
    const handleNewMessage = (messageData) => {
      dispatch(addChatMessage({ competitionId, message: messageData }))
    }

    socketService.onCompetitionMessage(handleNewMessage)

    return () => {
      socketService.leaveCompetition(competitionId)
      socketService.off('competition-message', handleNewMessage)
    }
  }, [competitionId, dispatch])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) return

    const messageText = message.trim()
    setMessage('')

    try {
      await dispatch(sendChatMessage({ competitionId, message: messageText })).unwrap()
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessage(messageText) // Restore message on error
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const isOwnMessage = (msgUser) => {
    return msgUser._id === user._id || msgUser === user._id
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-96 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Competition Chat</h3>
          <span className="text-xs text-gray-500">
            • Keep it respectful and competitive! •
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs">Start the conversation!</p>
            </div>
          ) : (
            chatMessages.map((msg, index) => {
              const isOwn = isOwnMessage(msg.user)
              const showAvatar = index === 0 || 
                !isOwnMessage(chatMessages[index - 1].user) ||
                chatMessages[index - 1].user._id !== msg.user._id

              return (
                <motion.div
                  key={msg._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isOwn && showAvatar && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {(msg.user.username || msg.user.name || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-8 mr-2" />}

                    {/* Message Bubble */}
                    <div className={`relative px-3 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      {/* Username (for others' messages) */}
                      {!isOwn && showAvatar && (
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {msg.user.username || msg.user.name}
                        </p>
                      )}
                      
                      {/* Message Text */}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      
                      {/* Timestamp */}
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>

                    {/* Own message avatar space */}
                    {isOwn && <div className="w-8 ml-2" />}
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100"
        >
          Someone is typing...
        </motion.div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            maxLength={500}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {message.length}/500 characters
        </p>
      </form>
    </div>
  )
}

export default CompetitionChat
