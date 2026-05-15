import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getMedById, searchMeds } from '@/services/education'
import { MedInfoModal } from '@/components/medications/MedInfoModal'

export function MedDetailScreen() {
  const { medId } = useParams<{ medId: string }>()
  const navigate = useNavigate()

  const med = medId ? getMedById(medId) : undefined

  if (!med) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-slate-400 text-sm">Medication not found.</p>
        <button onClick={() => navigate(-1)} className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    )
  }

  return (
    <MedInfoModal item={med} onClose={() => navigate(-1)} />
  )
}
