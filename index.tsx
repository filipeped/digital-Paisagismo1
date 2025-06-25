export default function handler(req, res) {
  res.status(200).json({
    message: "Proxy CAPI Ativo",
    status: "OK ✅",
    timestamp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  });
}
