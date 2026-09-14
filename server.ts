import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { io, Socket } from "socket.io-client";

// Cache for live Harem Altın market data
interface HaremItem {
  code: string;
  alis: string | number;
  satis: string | number;
  tarih?: string;
  kapanis?: string | number;
  dusuk?: string | number;
  yuksek?: string | number;
}

const latestHaremData: Record<string, HaremItem> = {
  ALTIN: {
    code: "ALTIN",
    alis: 6766.24,
    satis: 6798.69,
    kapanis: 6785.66,
    tarih: new Date().toLocaleTimeString("tr-TR"),
  },
};

let isHaremConnected = false;
let lastUpdateTime = Date.now();
let haremSocket: Socket | null = null;

function initHaremSocket() {
  try {
    haremSocket = io("wss://hrmsocketonly.haremaltin.com:443", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      extraHeaders: {
        Origin: "https://www.haremaltin.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    haremSocket.on("connect", () => {
      isHaremConnected = true;
      console.log("[Harem Altın] Canlı WebSocket bağlantısı başarıyla kuruldu.");
    });

    haremSocket.on("disconnect", () => {
      isHaremConnected = false;
      console.log("[Harem Altın] Bağlantı kesildi, yeniden bağlanılıyor...");
    });

    haremSocket.on("connect_error", (err) => {
      isHaremConnected = false;
      console.error("[Harem Altın] Bağlantı hatası:", err.message);
    });

    haremSocket.on("price_changed", (payload: any) => {
      if (payload && payload.data) {
        Object.assign(latestHaremData, payload.data);
        lastUpdateTime = Date.now();
      }
    });
  } catch (error) {
    console.error("[Harem Altın] Socket başlatma hatası:", error);
  }
}

// Start live socket connection immediately
initHaremSocket();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow iframe embedding from any domain (such as Wix)
  app.use((req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", haremConnected: isHaremConnected });
  });

  // Harem Altın Live Prices Endpoint
  app.get("/api/harem-altin", (req, res) => {
    const hasAltin = latestHaremData["ALTIN"] as Partial<HaremItem> | undefined;
    const parseNum = (val: string | number | undefined, def: number): number => {
      if (typeof val === "number") return val;
      if (!val) return def;
      const parsed = parseFloat(String(val).replace(",", "."));
      return isNaN(parsed) ? def : parsed;
    };

    const buyPrice = parseNum(hasAltin?.alis, 6766.24);
    const sellPrice = parseNum(hasAltin?.satis, 6798.69);
    const previousClose = parseNum(hasAltin?.kapanis, 6785.66);
    const changeRate =
      previousClose > 0
        ? ((sellPrice - previousClose) / previousClose) * 100
        : 0.48;

    res.json({
      connected: isHaremConnected,
      lastUpdated: lastUpdateTime,
      source: "Harem Altın (Canlı)",
      hasAltin: {
        code: "ALTIN",
        name: "Has Altın",
        buyPrice,
        sellPrice,
        previousClose,
        changeRate: Number(changeRate.toFixed(2)),
        time: hasAltin?.tarih || new Date().toLocaleTimeString("tr-TR"),
      },
      allPrices: latestHaremData,
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
