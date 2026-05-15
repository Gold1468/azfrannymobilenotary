import type { GlossaryTerm, MedItem, VideoLink } from '@/models/types'
import glossaryData from '@/data/glossary.json'
import medData from '@/data/medications.json'
import videoData from '@/data/videoLinks.json'

const glossary = glossaryData as GlossaryTerm[]
const medications = medData as MedItem[]

interface VideoEntry {
  id: string
  topic: string
  subtopic: string
  title: string
  url: string
  source: string
  tags: string[]
}

const videos = videoData as VideoEntry[]

export function searchGlossary(query: string): GlossaryTerm[] {
  if (!query.trim()) return glossary
  const q = query.toLowerCase()
  return glossary.filter(t =>
    t.term.toLowerCase().includes(q) ||
    (t.abbreviation ?? '').toLowerCase().includes(q) ||
    t.definition.toLowerCase().includes(q) ||
    t.nursingImplications.toLowerCase().includes(q)
  )
}

export function getGlossaryByCategory(category: string): GlossaryTerm[] {
  return glossary.filter(t => t.category === category)
}

export function getGlossaryCategories(): string[] {
  return [...new Set(glossary.map(t => t.category))].sort()
}

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return glossary.find(t => t.id === id)
}

export function getGlossaryTermByAbbrev(abbrev: string): GlossaryTerm | undefined {
  return glossary.find(t =>
    t.abbreviation?.toLowerCase() === abbrev.toLowerCase()
  )
}

export function getMedById(id: string): MedItem | undefined {
  return medications.find(m => m.id === id)
}

export function getMedByName(name: string): MedItem | undefined {
  const n = name.toLowerCase()
  return medications.find(m =>
    m.name.toLowerCase().includes(n) ||
    (m.genericName ?? '').toLowerCase().includes(n)
  )
}

export function searchMeds(query: string, type?: string): MedItem[] {
  let results = medications
  if (type) results = results.filter(m => m.type === type)
  if (!query.trim()) return results
  const q = query.toLowerCase()
  return results.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.genericName ?? '').toLowerCase().includes(q) ||
    m.category.toLowerCase().includes(q)
  )
}

export function getVideosByTopic(topic: string): VideoLink[] {
  const t = topic.toLowerCase()
  return videos
    .filter(v =>
      v.topic.toLowerCase().includes(t) ||
      v.subtopic.toLowerCase().includes(t) ||
      v.tags.some(tag => tag.toLowerCase().includes(t))
    )
    .map(v => ({ title: v.title, url: v.url, source: v.source }))
}

export function getVideoTopics(): string[] {
  return [...new Set(videos.map(v => v.topic))].sort()
}

export function getVideosGrouped(): Record<string, VideoEntry[]> {
  return videos.reduce<Record<string, VideoEntry[]>>((acc, v) => {
    if (!acc[v.topic]) acc[v.topic] = []
    acc[v.topic].push(v)
    return acc
  }, {})
}

export function insertGlossaryTermIntoSBAR(term: GlossaryTerm, _fieldHint?: string): string {
  if (term.abbreviation) {
    return `${term.term} (${term.abbreviation}): ${term.definition}`
  }
  return `${term.term}: ${term.definition}`
}
