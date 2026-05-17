'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Zap, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type AdvisorType = 'creative' | 'performance'
type Message = { role: 'user' | 'advisor'; content: string }

const ADVISORS = {
  creative: {
    name: 'Creative Director',
    desc: 'Emotion · Storytelling · Relatability',
    icon: Zap,
    color: 'violet',
    suggestions: [
      'Does this feel worth watching?',
      'What emotion does this trigger?',
      'What would make people comment?',
      'Does the idea feel fresh?',
    ],
  },
  performance: {
    name: 'Performance Analyst',
    desc: 'Retention · Hook · Watch-through',
    icon: BarChart2,
    color: 'blue',
    suggestions: [
      'Where will most people drop off?',
      'How strong is the hook?',
      'What would improve watch-through rate?',
      'Second-by-second breakdown?',
    ],
  },
}

export default function AdvisorChat({ videoId }: { videoId: string }) {
  const [advisorType, setAdvisorType] = useState<AdvisorType>('creative')
  const [messages, setMessages] = useState<Record<AdvisorType, Message[]>>({ creative: [], performance: [] })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const advisor = ADVISORS[advisorType]
  const currentMessages = messages[advisorType]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, advisorType])

  async function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages((m) => ({ ...m, [advisorType]: [...m[advisorType], userMsg] }))
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          advisorType,
          question: text.trim(),
          history: messages[advisorType],
        }),
      })
      const data = await res.json()
      setMessages((m) => ({
        ...m,
        [advisorType]: [...m[advisorType], { role: 'advisor', content: data.reply ?? 'Something went wrong.' }],
      }))
    } catch {
      setMessages((m) => ({
        ...m,
        [advisorType]: [...m[advisorType], { role: 'advisor', content: 'Sorry, something went wrong. Try again.' }],
      }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[560px]">
      {/* Advisor switcher */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {(Object.entries(ADVISORS) as [AdvisorType, typeof ADVISORS.creative][]).map(([type, a]) => (
          <button
            key={type}
            onClick={() => setAdvisorType(type)}
            className={cn(
              'bg-zinc-900 border rounded-xl p-3 text-left transition',
              advisorType === type ? 'border-violet-500/50 bg-violet-500/5' : 'border-zinc-800 hover:border-zinc-700'
            )}
          >
            <a.icon className={cn('w-4 h-4 mb-1', advisorType === type ? 'text-violet-400' : 'text-zinc-500')} />
            <p className={cn('text-xs font-medium', advisorType === type ? 'text-white' : 'text-zinc-400')}>{a.name}</p>
            <p className="text-zinc-600 text-xs mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {currentMessages.length === 0 && (
          <div>
            <p className="text-zinc-500 text-xs mb-3 text-center">Ask the {advisor.name} about your video</p>
            <div className="flex flex-wrap gap-2">
              {advisor.suggestions.map((q) => (
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

        {currentMessages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'advisor' && (
              <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <advisor.icon className="w-3.5 h-3.5 text-violet-400" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
              m.role === 'user'
                ? 'bg-violet-500 text-white rounded-tr-sm'
                : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
            )}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
              <advisor.icon className="w-3.5 h-3.5 text-violet-400" />
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
          placeholder={`Ask the ${advisor.name}…`}
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
