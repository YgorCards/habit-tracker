import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'

import { auth, db, googleProvider } from '../firebase'

export default function SmokeTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true)
    setResult('')
    setError('')

    try {
      const { user } = await signInWithPopup(auth, googleProvider)

      await addDoc(collection(db, 'users', user.uid, 'habits'), {
        name: 'teste',
        color: '#22c55e',
      })

      setResult(`Login e gravação OK. UID: ${user.uid}`)
    } catch (caughtError) {
      console.error(caughtError)
      const message =
        caughtError instanceof Error ? caughtError.message : 'Erro desconhecido.'
      setError(`Erro no teste: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="smoke-test-card" aria-labelledby="smoke-test-title">
      <div>
        <h2 id="smoke-test-title">Conexão Firebase</h2>
        <p>Teste temporário de login e gravação no Firestore.</p>
      </div>
      <button
        type="button"
        className="primary-button"
        onClick={run}
        disabled={loading}
      >
        {loading ? 'Testando…' : 'Testar Firebase'}
      </button>
      {result && <p className="smoke-test-result">{result}</p>}
      {error && <p className="smoke-test-error">{error}</p>}
    </section>
  )
}
