import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Captura IP de múltiplas fontes
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "0.0.0.0"; // placeholder seguro

    const payload = {
      ...req.body,
      client_ip_address: ip
    };

    const response = await fetch("https://graph.facebook.com/v19.0/3474069809483558/events?access_token=EAAQfmxkTTZCcBOwAhY9Qpfqm0gQ1L3ZAhV3EpsZCSC298vN5oaPMwgdsc6ZCWXFRaBzQlyAHfs4HWlUZAefUh50FGw4gn3NIES5iYFZBoumN2HZAMdVvMh1Wtu9OAunizQoYrZAwJUcFSlZCgvg4HMXp1vgSXQDPBiIadqRO4CgxQU0tCYQBN9JMUMrUY8TMRuQZDZD", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": typeof ip === "string" ? ip : "",
        "X-Real-IP": typeof ip === "string" ? ip : ""
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Erro no Proxy CAPI:", err);
    res.status(500).json({ error: "Erro interno no servidor CAPI." });
  }
}
