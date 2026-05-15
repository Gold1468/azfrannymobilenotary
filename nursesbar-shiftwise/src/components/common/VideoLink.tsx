import { ExternalLink, PlayCircle } from 'lucide-react'
import type { VideoLink as VideoLinkType } from '@/models/types'

interface Props {
  video: VideoLinkType & { source?: string }
}

function getYoutubeId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/) ?? url.match(/youtu\.be\/([^?]+)/)
  return match?.[1] ?? null
}

export function VideoLink({ video }: Props) {
  const ytId = getYoutubeId(video.url)
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-3 hover:border-cyan-600 hover:bg-slate-750 transition-colors min-h-[56px] group"
      aria-label={`Watch: ${video.title}`}
    >
      {thumb ? (
        <div className="relative shrink-0 w-16 h-10 rounded-lg overflow-hidden bg-slate-700">
          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      ) : (
        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-cyan-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug">{video.title}</p>
        {video.source && <p className="text-xs text-slate-500 mt-0.5">{video.source}</p>}
      </div>
      <ExternalLink className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-cyan-400 transition-colors" />
    </a>
  )
}
