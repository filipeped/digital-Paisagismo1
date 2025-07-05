import { useEffect, useState } from "react";

// Gera um event_id único para deduplicação
function generateEventId() {
  return "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
}

// Captura o valor de um cookie pelo nome
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : "";
}

// Gera um hash SHA-256
async function hashSHA256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.trim().toLowerCase());
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Home() {
  const [status, setStatus] = useState("⏳ Enviando evento de teste...");
  const [responseData, setResponseData] = useState<any>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const sendTestEvent = async () => {
    setTimestamp(new Date().toLocaleString("pt-BR"));
    setStatus("⏳ Enviando evento de teste...");

    const externalId = await hashSHA256("usuario@exemplo.com");

    const event = {
      event_name: "TestEvent",
      event_time: Math.floor(Date.now() / 1000),
      event_id: generateEventId(),
      action_source: "website",
      event_source_url: window.location.href,
      user_data: {
        external_id: [externalId],
        client_ip_address: "auto",
        client_user_agent: navigator.userAgent,
        fbp: getCookie("_fbp") || "",
        fbc: getCookie("_fbc") || "",
      },
      custom_data: {
        diagnostic_mode: true,
        triggered_by: "manual_test",
        value: 1850,
        currency: "BRL",
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
          cursor: "pointer",
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
          fontSize: "14px",
        }}
      >
        {responseData ? JSON.stringify(responseData, null, 2) : "Aguardando resposta..."}
      </pre>
    </div>
  );
}
