// pages/index.tsx

export default function Home() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>🔧 Proxy CAPI Ativo</h1>
      <p>Este endpoint está configurado para enviar eventos à Meta API.</p>
      <p>Use <code>/api/events</code> para POST de eventos.</p>
      <p>Status: ✅ Online</p>
    </div>
  )
}
