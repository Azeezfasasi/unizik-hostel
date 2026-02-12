'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, Zap } from 'lucide-react'

export default function MessageSlider() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/message')
      const data = await response.json()
      
      if (data.success) {
        setMessages(data.data)
      } else {
        setError(data.error || 'Failed to fetch messages')
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  // Prevent rendering if no messages
  if (!loading && messages.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-lg">
      <style>{`
        marquee {
          display: flex !important;
          align-items: center;
        }
      `}</style>
      
      {/* Marquee Container */}
      <div className="h-12 lg:h-12 overflow-hidden relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-3">
              <div className="h-4 w-4 bg-blue-400 rounded-full"></div>
              <div className="h-2 w-32 bg-blue-400 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center px-4 gap-2 text-yellow-300">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm lg:text-base">{error}</span>
          </div>
        ) : messages.length > 0 ? (
          <marquee
            scrollAmount={messages[0]?.speed === 'slow' ? 2 : messages[0]?.speed === 'fast' ? 8 : 4}
            behavior="scroll"
            direction="left"
            loop
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {/* Render all messages */}
            {messages.map((message, idx) => (
              <div
                key={`${message._id}-${idx}`}
                className="flex items-center gap-3 px-6 h-12 lg:h-12 whitespace-nowrap"
                style={{
                //   backgroundColor: message.backgroundColor,
                  color: message.textColor,
                  minWidth: 'fit-content',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <Zap size={18} className="flex-shrink-0 animate-pulse" />
                <span className="font-semibold text-sm lg:text-base">{message.text}</span>
              </div>
            ))}
          </marquee>
        ) : null}
      </div>

      {/* Desktop indicator */}
      <div className="hidden lg:flex justify-center gap-1.5 py-2 bg-black/20">
        {messages.map((_, idx) => (
          <div
            key={idx}
            className="h-1.5 rounded-full bg-blue-400/50 hover:bg-blue-400 transition-all cursor-pointer"
            style={{
              width: `${Math.max(4, Math.min(12, 20 / messages.length))}px`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}
