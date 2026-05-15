import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { VideoLink } from '@/components/common/VideoLink'
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner'
import { SearchInput } from '@/components/common/SearchInput'
import { getVideosGrouped, getVideosByTopic } from '@/services/education'

export function EducationScreen() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<string>('')

  const grouped = getVideosGrouped()
  const topics = Object.keys(grouped).sort()
  const tabs = ['All', ...topics]

  let videos = activeTab && activeTab !== 'All'
    ? getVideosByTopic(activeTab)
    : Object.values(grouped).flat().map(v => ({ title: v.title, url: v.url, source: v.source }))

  if (query) {
    const q = query.toLowerCase()
    videos = videos.filter(v => v.title.toLowerCase().includes(q) || v.source.toLowerCase().includes(q))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-[52px] z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
        <DisclaimerBanner dismissible />
        <SearchInput value={query} onChange={setQuery} placeholder="Search educational videos…" />
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'All' ? '' : tab)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors min-h-[32px] ${
                (tab === 'All' && !activeTab) || activeTab === tab
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {videos.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <GraduationCap className="w-10 h-10 text-slate-700 mb-3" />
            <p className="text-sm text-slate-400">No videos found</p>
          </div>
        )}
        {videos.map((v, i) => <VideoLink key={i} video={v} />)}
      </div>
    </div>
  )
}
