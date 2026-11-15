// พร็อกซีสำรองบน Vercel: ขอข้อมูลโมเดล 3D จาก Roblox แทน Cloudflare Worker
module.exports = async (req, res) => {
  const userId = String(req.query.userId || "");
  if (!/^\d{1,15}$/.test(userId)) {
    res.status(400).json({ error: "bad userId" });
    return;
  }
  try {
    const r = await fetch("https://thumbnails.roblox.com/v1/users/avatar-3d?userId=" + userId, {
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
    });
    const text = await r.text();
    res.status(r.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
};
