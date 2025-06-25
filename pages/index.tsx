import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("⏳ Enviando evento de teste...");
  const [responseData, setResponseData] = useState<any>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const sendTestEvent = async () => {
    const now = new Date();
    const timeFormatted = now.toLocaleString("pt-BR");
    setTimestamp(timeFormatted);
    setStatus("⏳ Enviando evento de teste...");

    const event = {
      event_name: "TestEvent",
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: "https://www.digitalpaisagismo.online",
      custom_data: {
        diagnostic_mode: true,
        triggered_by: "manual_test",
      },
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [event] }),
      });

      const json = await res.json();
      setResponseData(json);

      if (json.events_received) {
        setStatus("✅ Evento recebido com sucesso pela Meta via proxy.");
      } else if (json.error) {
        setStatus("❌ Erro retornado pela Meta.");
      } else {
        setStatus("⚠️ Evento enviado, mas sem confirmação clara da Meta.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro na conexão com o proxy.");
    }
  };

  useEffect(() => {
    sendTestEvent();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>🔍 Diagnóstico do Proxy CAPI</h2>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Horário:</strong> {timestamp}</p>

      <button
        onClick={sendTestEvent}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        🔄 Reenviar evento de teste
      </button>

      <h3 style={{ marginTop: "30px" }}>📦 Resposta completa:</h3>
      <pre
        style={{
          backgroundColor: "#f4f4f4",
          padding: "20px",
          borderRadius: "8px",
          maxHeight: "400px",
          overflowY: "auto",
          fontSize: "14px"
        }}
      >
        {responseData ? JSON.stringify(responseData, null, 2) : "Aguardando resposta..."}
      </pre>
    </div>
  );
}
