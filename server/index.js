import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env из /server/.env
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const API_KEY = process.env.API_KEY;
const FOLDER_ID = process.env.FOLDER_ID;

console.log("API_KEY:", API_KEY ? "OK" : "MISSING");
console.log("FOLDER_ID:", FOLDER_ID || "MISSING");

/**
 * 📌 Получить список файлов из корневой папки
 */
app.get("/api/files", async (req, res) => {
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("Google Drive API error:", data);
            return res.status(400).json(data);
        }

        const audioFiles = (data.files || [])
            .filter(
                (file) =>
                    file.mimeType?.startsWith("audio/") ||
                    file.name.endsWith(".mp3") ||
                    file.name.endsWith(".ogg")
            )
            .map((file) => ({
                id: file.id,
                name: file.name,
                folderName: null,
                url: `${req.protocol}://${req.get("host")}/api/stream/${
                    file.id
                }`, // ✅ полный URL
            }));

        res.json(audioFiles);
    } catch (err) {
        console.error("Ошибка /api/files:", err);
        res.status(500).json({ error: "Ошибка при получении файлов" });
    }
});

/**
 * 📌 Получить список подпапок и треков в них
 */
app.get("/api/folders", async (req, res) => {
    try {
        const folderResp = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`
        );
        const folderData = await folderResp.json();

        if (folderData.error) {
            console.error("Google Drive API error:", folderData);
            return res.status(400).json(folderData);
        }

        const folders = folderData.files || [];
        const tracks = [];

        for (const folder of folders) {
            const filesResp = await fetch(
                `https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents+and+(mimeType contains 'audio/')&key=${API_KEY}&fields=files(id,name,mimeType)`
            );
            const filesData = await filesResp.json();

            (filesData.files || []).forEach((f) => {
                if (f.id && f.name) {
                    tracks.push({
                        id: f.id,
                        name: f.name,
                        folderName: folder.name,
                        url: `${req.protocol}://${req.get("host")}/api/stream/${
                            f.id
                        }`, // ✅ полный URL
                    });
                }
            });
        }

        res.json(tracks);
    } catch (err) {
        console.error("Ошибка /api/folders:", err);
        res.status(500).json({ error: "Не удалось получить папки" });
    }
});

/**
 * 📌 Стриминг файла
 */
app.get("/api/stream/:id", async (req, res) => {
    const { id } = req.params;
    const range = req.headers.range;
    const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`;

    try {
        const headers = {};
        if (range) headers.Range = range;

        const response = await fetch(url, { headers });

        if (!response.ok && response.status !== 206) {
            const t = await response.text().catch(() => "");
            console.error("Download error:", response.status, t);
            return res
                .status(502)
                .json({ error: "Не удалось получить файл с Drive" });
        }

        const contentType =
            response.headers.get("content-type") || "audio/mpeg";
        const contentLength = response.headers.get("content-length");
        const contentRange = response.headers.get("content-range");
        const status = contentRange ? 206 : 200;

        res.status(status);
        res.setHeader("Content-Type", contentType);
        res.setHeader("Accept-Ranges", "bytes");
        if (contentLength) res.setHeader("Content-Length", contentLength);
        if (contentRange) res.setHeader("Content-Range", contentRange);
        res.setHeader("Content-Disposition", "inline");

        response.body.pipe(res);
    } catch (err) {
        console.error("Stream proxy error:", err);
        res.status(500).json({ error: "Ошибка при стриминге файла" });
    }
});

/**
 * 📌 Раздача фронтенда (для Render)
 */
const distPath = path.resolve(__dirname, "../dist");
if (fs.existsSync(distPath)) {
    console.log("📦 Обнаружен dist, включаем раздачу фронта");
    app.use(express.static(distPath));

    // Перенаправление всех остальных маршрутов на index.html (SPA fallback)
    app.get("/*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });

} else {
    console.log("⚠️ dist не найден, фронт не будет отдаваться");
}

app.listen(PORT, () => {
    console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
