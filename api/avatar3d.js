export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { userId, file } = req.query;

  try {
    // โหมด 2: proxy ไฟล์จาก rbxcdn (obj / mtl / texture)
    if (file) {
      const url = new URL(file);
      if (!url.hostname.endsWith(".rbxcdn.com")) {
        return res.status(400).json({ error: "invalid host" });
      }
      const r = await fetch(url);
      res.setHeader("Content-Type", r.headers.get("content-type") || "application/octet-stream");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.status(r.status).send(Buffer.from(await r.arrayBuffer()));
    }

    // โหมด 1: ดึง metadata ของอวาตาร์ 3D
    if (!/^\d+$/.test(userId || "")) {
      return res.status(400).json({ error: "invalid userId" });
    }
    const meta = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${userId}`
    ).then((r) => r.json());

    if (meta.state !== "Completed") {
      return res.status(202).json({ state: meta.state });
    }
    const model = await fetch(meta.imageUrl).then((r) => r.json());
    return res.status(200).json(model); // มี obj, mtl, textures (hash)
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
