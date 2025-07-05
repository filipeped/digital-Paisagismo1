// ✅ Código atualizado para teste completo com CAPI via proxy Meta com segurança e deduplicação
import { useEffect, useState } from "react";

// Gera um event_id único
function generateEventId() {
  return "evt_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
}

// Função principal do componente
export default function Home() {
  const [status, setStatus] = useState("⏳ Enviando evento de teste...");
  const [responseData, setResponseData] = useState<any>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const sendTestEvent = async () => {
    const now = new Date();
    setTimestamp(now.toLocaleString("pt-BR"));
    setStatus("⏳ Enviando evento de teste...");

    const event = {
      event_name: "TestEvent",
      event_time: Math.floor(Date.now() / 1000),
      event_id: generateEventId(),
      action_source: "website",
      event_source_url: window.location.href,
      user_data: {
        external_id: "dec28dba1ef8f7a974d0daa5fb417e886d608ff870dea037176fafd3ef931045",
        client_ip_address: "123.123.123.123",
        client_user_agent: navigator.userAgent,
        fbp: "fb.1.1751360590432.213448171908285443",
        fbc: "fb.1.1751360590432.Ix7qN8DF"
      },
      custom_data: {
        diagnostic_mode: true,
        triggered_by: "manual_test",
        value: 1850,
        currency: "BRL"
      }
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [event],
          pixel_id: "1288254999387848",
          access_token: "EAAQfmxkTTZCcBPGq9eYbjjEizIShrgEHNng25xnFw5nBDvQsgjMHa5AF9LmPJjBhLAsrnnZCI61UYucOpESRRQ22i7YZC9ZCWfqzruQZCNgcuH9brof0GBv7nELfzq0NBve9iTZCyvmRDG5fgaRFWa5byUybdeyjjmhY1Ap3kUNTRs6vz6FDq0Bb8JqtvmdwZDZD"
        })
      });

      const json = await res.json();
      setResponseData(json);

      if (json.events_received) {
        setStatus("✅ Evento recebido com sucesso pela Meta via proxy.");
      } else if (json.error) {
        setStatus("❌ Erro retornado pela Meta.");
      } else {
        setStatus("⚠️
