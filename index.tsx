export default function Home() {
  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", paddingTop: "50px" }}>
      <h1>🔧 Proxy CAPI Ativo</h1>
      <p>O endpoint <code>/api/events</code> está operacional.</p>
      <p>Status: OK ✅</p>
      <p>{new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
    </div>
  );
}
