import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function App() {
  const [health, setHealth] = useState('carregando...')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(d => setHealth(d.status || JSON.stringify(d)))
      .catch(() => setHealth('erro'))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>DevOps Study Frontend</h1>
      <p>Backend health: {health}</p>
    </div>
  )
}

