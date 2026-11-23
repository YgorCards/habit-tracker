import { Activity } from 'lucide-react'

type Props = {
  busy: boolean
  error: string
  onSignIn: () => void
}

export default function SignInScreen({ busy, error, onSignIn }: Props) {
  return (
    <main className="sign-in-screen">
      <div className="sign-in-card">
        <span className="brand-mark sign-in-mark">
          <Activity size={20} />
        </span>
        <h1>ritmo<span>.</span></h1>
        <p>Entre para acompanhar seus hábitos.</p>
        <button
          type="button"
          className="google-sign-in-button"
          onClick={onSignIn}
          disabled={busy}
        >
          <span className="google-g" aria-hidden="true">G</span>
          {busy ? 'Conectando…' : 'Continuar com Google'}
        </button>
        {error && <p className="sign-in-error" role="alert">{error}</p>}
      </div>
    </main>
  )
}
