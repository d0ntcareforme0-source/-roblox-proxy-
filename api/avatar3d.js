const ROBLOX_COOKIE = process.env.ROBLOSECURITY;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { userId, file, checkenv } = req.query;

  if (checkenv) {
    return res.status(200).json({
      hasCookie: !!ROBLOX_COOKIE,
      length: ROBLOX_COOKIE ? ROBLOX_COOKIE.length : 0,
      startsOk: ROBLOX_COOKIE ? ROBLOX_COOKIE.startsWith("_|WARNING") : false,
      hasWhitespace: ROBLOX_COOKIE ? /\s/.test(ROBLOX_COOKIE) : false,
    });
  }

  try {
    // โหมด 2: proxy ไฟล์จาก rbxcdn (obj / mtl / texture)
    if (file) {
      const url = new URL(file);
      if (!url.hostname.endsWith(".rbxcdn.com")) {
        return res.status(400).json({ error: "invalid host" });
      }
      const r = await fetch(url);
      res.setHeader(
        "Content-Type",
        r.headers.get("content-type") || "application/octet-stream"
      );
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(r.status).send(Buffer.from(await r.arrayBuffer()));
    }

    // โหมด 1: ดึง metadata ของอวาตาร์ 3D
    if (!/^\d+$/.test(userId || "")) {
      return res.status(400).json({ error: "invalid userId" });
    }
    if (!ROBLOX_COOKIE) {
      return res.status(500).json({ error:
