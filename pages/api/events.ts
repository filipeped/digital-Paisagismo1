import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// Defina o domínio permitido para CORS
const ALLOWED_ORIGIN = "https://www.digitalpaisagismo.com.br";

// Use variáveis de ambiente para segurança
const PIXEL_ID = process.env.FB_PIXEL_ID || "2528271940857156";
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || "EAAQfmxkTTZCcBPJ0w6gByvnfatW0caXRcpI5j74zPZCZArvcFT7ZA0zmO7zoTJJW64IVeoC3Ed9svVIuS8AGY1SaqzZAvmRPSiNoZAocY20EJFbRePZArXCnqy7wEe8adFd3abkmLxZBbv5X6M78QwnWoR73XTilfDu68b99QWt3KJBgS8HMWtCfZAQ7DdZCeZAIgZDZD";

// Função para gerar hash SHA256
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// ✅ 2. Função para verificar se já está hashado
function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/.test(value);
}

// ✅ 2. Função para hash apenas se necessário
function hashIfNeeded(value: string): string {
  return isSha256(value) ? value : hashData(value);
}

// Função para gerar event_id único
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Função para processar user_data com hash inteligente
function processUserData(userData: any): any {
  const processed: any = {};

  // ✅ 2. Hash de email apenas se necessário
  if (userData.em) {
    processed.em = hashIfNeeded(userData.em);
  }

  // ✅ 2. Hash de telefone apenas se necessário
  if (userData.ph) {
    processed.ph = hashIfNeeded(userData.ph);
  }

  // ✅ 2. Hash de external_id apenas se necessário
  if (userData.external_id) {
    processed.external_id = hashIfNeeded(userData.external_id);
  }

  // Manter outros campos como estão
  if (userData.fn) processed.fn = userData.fn;
  if (userData.ln) processed.ln = userData.ln;
  if (userData.ct) processed.ct = userData.ct;
  if (userData.st) processed.st = userData.st;
  if (userData.country) processed.country = userData.country;
  if (userData.zip) processed.zip = userData.zip;

  return processed;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configura CORS
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Fb-Pixel-Id, X-Fb-Event-Source");

  // Pré-voo CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Só aceita POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { data } = req.body;

    // Validação do payload
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Payload inválido - campo 'data' deve ser um array" });
    }

    // Processa cada evento individualmente
    const processedData = data.map((event: any) => {
      // ✅ 3. Adiciona action_source se não presente
      if (!event.action_source) {
        event.action_source = "website";
      }

      // ✅ 3. Adiciona event_source_url se não presente
      if (!event.event_source_url) {
        event.event_source_url = ALLOWED_ORIGIN;
      }

      // ✅ 2. Adiciona event_id com deduplicação se não presente
      if (!event.event_id) {
        event.event_id = generateEventId();
      }

      // ✅ 3. Processa user_data com hash inteligente
      if (event.user_data) {
        event.user_data = processUserData(event.user_data);
      }

      // ✅ 1. Persistência inteligente do external_id por sessão
      if (!event.user_data?.external_id) {
        if (!event.user_data) event.user_data = {};
        const sessionId = req.headers["cookie"]?.match(/session_id=([^;]+)/)?.[1] || generateEventId();
        event.user_data.external_id = hashData(sessionId);
      }

      // ✅ 4. Adiciona fbp e fbc se disponíveis nos cookies
      const cookies = req.headers.cookie || '';
      const fbpMatch = cookies.match(/fbp=([^;]+)/);
      const fbcMatch = cookies.match(/fbc=([^;]+)/);

      if (fbpMatch && !event.user_data?.fbp) {
        if (!event.user_data) event.user_data = {};
        event.user_data.fbp = fbpMatch[1];
      }

      if (fbcMatch && !event.user_data?.fbc) {
        if (!event.user_data) event.user_data = {};
        event.user_data.fbc = fbcMatch[1];
      }

      return event;
    });

    // ✅ CORREÇÃO CRÍTICA: Monta o payload final para o Facebook
    // client_user_agent e client_ip_address FORA do user_data, no payload principal
    const payload = {
      data: processedData,
      client_user_agent: req.headers["user-agent"],
      client_ip_address: req.headers["x-forwarded-for"] || req.connection.remoteAddress
    };

    // Envia para o Facebook CAPI
    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await fbResponse.json();

    // Retorna o status e resposta do Facebook
    return res.status(fbResponse.status).json(result);
  } catch (err) {
    console.error("❌ Erro no Proxy CAPI:", err);
    return res.status(500).json({ error: "Erro interno no servidor do proxy CAPI." });
  }
}
