'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { VideoReview, ForecastPlatform } from '@/types'
import ScoreRing from '@/components/ui/ScoreRing'
import PersonaChat from './PersonaChat'
import AdvisorChat from './AdvisorChat'

const TABS = ['Overview', 'Creative', 'Analytics', 'Forecast', 'Persona Chat', 'Recommendations'] as const
type Tab = typeof TABS[number]

const PLATFORM_META = {
  instagram: { label: 'Instagram Reels', color: 'from-pink-500 to-orange-400', icon: '📸' },
  tiktok: { label: 'TikTok', color: 'from-cyan-400 to-blue-500', icon: '🎵' },
  youtube_shorts: { label: 'YouTube Shorts', color: 'from-red-500 to-red-600', icon: '▶️' },
} as const

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function ViralityBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'bg-zinc-700 text-zinc-300',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    high: 'bg-green-500/20 text-green-400 border border-green-500/30',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[level]}`}>
      {level} virality
    </span>
  )
}

function MetricPair({ label, low, high }: { label: string; low: number; high: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-zinc-500 text-[10px] uppercase tracking-wide">{label}</span>
      <span className="text-white font-semibold text-sm">{fmt(low)}–{fmt(high)}</span>
    </div>
  )
}

function PlatformCard({ platform, data }: { platform: keyof typeof PLATFORM_META; data: ForecastPlatform }) {
  const meta = PLATFORM_META[platform]
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-3">
      {/* Header */}
      <div className={`bg-gradient-to-r ${meta.color} px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="text-white font-semibold text-sm">{meta.label}</span>
        </div>
        <ViralityBadge level={data.virality} />
      </div>

      {/* Views hero */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-0.5">Projected Views</p>
        <p className="text-white text-2xl font-bold">{fmt(data.views_low)}–{fmt(data.views_high)}</p>
      </div>

      {/* Watch-through bar */}
      <div className="px-5 pb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wide">Avg Watch-Through</span>
          <span className="text-zinc-300 text-xs font-semibold">{data.watch_through_pct}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${meta.color}`}
            style={{ width: `${data.watch_through_pct}%` }}
          />
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4 border-t border-zinc-800 pt-4">
        <MetricPair label="Likes" low={data.likes_low} high={data.likes_high} />
        <MetricPair label="Comments" low={data.comments_low} high={data.comments_high} />
        <MetricPair label="Shares" low={data.shares_low} high={data.shares_high} />
        <MetricPair label="Saves" low={data.saves_low} high={data.saves_high} />
      </div>

      {/* Reasoning */}
      <div className="px-5 pb-5 border-t border-zinc-800 pt-3">
        <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">
          Why — {data.confidence} confidence
        </p>
        <p className="text-zinc-400 text-xs leading-relaxed">{data.reasoning}</p>
      </div>
    </div>
  )
}

function ForecastTab({ forecast }: { forecast: VideoReview['forecast'] }) {
  if (!forecast) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <p className="text-zinc-500 text-sm">Forecast not available — re-analyze this video to generate predictions.</p>
      </div>
    )
  }
  return (
    <div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
        <p className="text-zinc-400 text-xs leading-relaxed">
          AI-powered performance forecast based on the video's hook strength, pacing, shareability, and content signals. Ranges reflect typical account sizes (1K–50K followers). Connect real analytics to improve accuracy over time.
        </p>
      </div>
      <PlatformCard platform="tiktok" data={forecast.tiktok} />
      <PlatformCard platform="instagram" data={forecast.instagram} />
      <PlatformCard platform="youtube_shorts" data={forecast.youtube_shorts} />
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
      <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
      <div className="text-white text-sm leading-relaxed">{children}</div>
    </div>
  )
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  if (!score) return null
  const color = score >= 70 ? 'bg-green-500' : score >= 45 ? 'bg-yellow-500' : 'bg-red-500'
  const textColor = score >= 70 ? 'text-green-400' : score >= 45 ? 'text-yellow-400' : 'text-red-400'
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-zinc-400 text-xs">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{score}/100</span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function ReviewTabs({
  review,
  videoId,
  videoName,
}: {
  review: VideoReview
  videoId: string
  videoName: string
}) {
  const [tab, setTab] = useState<Tab>('Overview')

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition',
              tab === t
                ? 'bg-violet-500 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div>
          {/* Score hero */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-3 flex items-center gap-5">
            <ScoreRing score={review.overall_score ?? 0} size={80} />
            <div>
              <p className="text-zinc-400 text-xs uppercase tracking-wide mb-1">Overall Score</p>
              <p className="text-white font-semibold text-base leading-snug">{review.summary}</p>
            </div>
          </div>

          {/* Quick scores */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-3">Performance Scores</p>
            <ScoreBar label="Thumb-Stop Power" score={review.thumb_stop_score} />
            <ScoreBar label="Watch-Through Rate" score={review.watch_through_score} />
          </div>

          {review.hook_analysis && (
            <Section label="Opening Hook">{review.hook_analysis}</Section>
          )}
          {(review.raw_analysis as Record<string,string>)?.clarity_of_idea && (
            <Section label="Clarity of Idea">{(review.raw_analysis as Record<string,string>).clarity_of_idea}</Section>
          )}
        </div>
      )}

      {/* Creative */}
      {tab === 'Creative' && (
        <div>
          {review.storytelling && <Section label="Storytelling">{review.storytelling}</Section>}
          {review.emotional_pull && <Section label="Emotional Pull">{review.emotional_pull}</Section>}
          {review.shareability && <Section label="Shareability">{review.shareability}</Section>}
          {review.viral_potential && <Section label="Viral Potential">{review.viral_potential}</Section>}
          {(review.raw_analysis as Record<string,string>)?.visual_interest && (
            <Section label="Visual Interest">{(review.raw_analysis as Record<string,string>).visual_interest}</Section>
          )}
          {(review.raw_analysis as Record<string,string>)?.audio_narration && (
            <Section label="Audio / Narration">{(review.raw_analysis as Record<string,string>).audio_narration}</Section>
          )}
          {(review.raw_analysis as Record<string,string>)?.on_screen_text && (
            <Section label="On-Screen Text">{(review.raw_analysis as Record<string,string>).on_screen_text}</Section>
          )}
        </div>
      )}

      {/* Analytics */}
      {tab === 'Analytics' && (
        <div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-3">Scores</p>
            <ScoreBar label="Thumb-Stop Power" score={review.thumb_stop_score} />
            <ScoreBar label="Watch-Through Rate Potential" score={review.watch_through_score} />
          </div>
          {review.pacing_analysis && <Section label="Pacing Breakdown">{review.pacing_analysis}</Section>}
          {review.drop_off_risks && <Section label="Drop-Off Risk Moments">{review.drop_off_risks}</Section>}
          {review.retention_curve && <Section label="Retention Curve Prediction">{review.retention_curve}</Section>}
          {(review.raw_analysis as Record<string,string>)?.cta_strength && (
            <Section label="CTA Strength">{(review.raw_analysis as Record<string,string>).cta_strength}</Section>
          )}
        </div>
      )}

      {/* Forecast */}
      {tab === 'Forecast' && (
        <ForecastTab forecast={review.forecast} />
      )}

      {/* Persona Chat */}
      {tab === 'Persona Chat' && (
        <PersonaChat videoId={videoId} videoName={videoName} />
      )}

      {/* Recommendations */}
      {tab === 'Recommendations' && (
        <div>
          {review.what_works && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-3">
              <p className="text-green-400 text-xs font-medium uppercase tracking-wide mb-2">What Works ✓</p>
              <p className="text-white text-sm leading-relaxed">{review.what_works}</p>
            </div>
          )}
          {review.what_to_cut && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-3">
              <p className="text-red-400 text-xs font-medium uppercase tracking-wide mb-2">What to Cut ✗</p>
              <p className="text-white text-sm leading-relaxed">{review.what_to_cut}</p>
            </div>
          )}
          {review.what_to_improve && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-3">
              <p className="text-yellow-400 text-xs font-medium uppercase tracking-wide mb-2">What to Improve</p>
              <p className="text-white text-sm leading-relaxed">{review.what_to_improve}</p>
            </div>
          )}
          {review.suggested_hook && (
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5 mb-3">
              <p className="text-violet-400 text-xs font-medium uppercase tracking-wide mb-2">Suggested Hook</p>
              <p className="text-white text-sm leading-relaxed italic">&ldquo;{review.suggested_hook}&rdquo;</p>
            </div>
          )}
          {review.suggested_caption && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-3">
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Suggested Caption</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{review.suggested_caption}</p>
            </div>
          )}
          {review.suggested_title && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Suggested Title / On-Screen Text</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{review.suggested_title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
