import { CalendarDays, Grid2X2, ListPlus } from 'lucide-react'
import type { Screen } from '../types'

type Props = { screen: Screen; onChange: (screen: Screen) => void }

const items = [
  { id: 'today', label: 'Hoje', icon: CalendarDays },
  { id: 'heatmap', label: 'Heatmap', icon: Grid2X2 },
  { id: 'habits', label: 'Hábitos', icon: ListPlus },
] as const

export default function BottomNav({ screen, onChange }: Props) {
  return <nav className="bottom-nav" aria-label="Navegação principal">{items.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={`nav-item ${screen === id ? 'active' : ''}`} onClick={() => onChange(id)} aria-current={screen === id ? 'page' : undefined}><Icon size={19} strokeWidth={2} /><span>{label}</span></button>)}</nav>
}
