'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, MessageCircle } from 'lucide-react'

const PERSONA_NAME = 'Mia, 27 · NYC'
const PERSONA_DESC = 'Women 18–35 · Metro · Everyday creator viewer'

const SUGGESTED_QUESTIONS = [
  'Would you keep watching this?',
  'What part made you curious?',
  'What part felt boring?',
  'Would you share this?',
  'Would you follow this creator?',
  'What did this make you feel?',
]

type Message = { role: 'user' | 'persona'; content: string }

export default function PersonaChat({ videoId, videoName }: { videoId: string; videoName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/persona-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, question: text.trim(), history: messages }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'persona', content: data.reply ?? 'Something went wrong.' }])
    } catch {
      setMessages((m) => [...m, { role: 'persona', content: 'Sorry, something went wrong. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[560px]">
      {/* Persona header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{PERSONA_NAME}</p>
          <p className="text-zinc-500 text-xs">{PERSONA_DESC}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && (
          <div>
            <p className="text-zinc-500 text-xs mb-3 text-center">Ask Mia what she thinks about your video</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'persona' && (
              <div className="w-7 h-7 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-violet-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-violet-500 text-white rounded-tr-sm'
                : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Ask Mia anything about your video…"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-3 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
