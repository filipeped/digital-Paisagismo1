import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: "Proxy CAPI Ativo",
    status: "OK ✅",
    timestamp: new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo"
    })
  });
}
