const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = "127.0.0.1";
const PORT = 8080;
const ROOT = __dirname;

const MIME_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".bin": "application/octet-stream",
    ".gltf": "model/gltf+json",
    ".glb": "model/gltf-binary",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function sendFile(filePath, response) {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "Content-Type": contentType
    });

    fs.createReadStream(filePath).pipe(response);
}

function sendError(response, statusCode, message) {
    response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(message);
}

const server = http.createServer((request, response) => {
    const cleanPath = decodeURIComponent((request.url || "/").split("?")[0]);
    const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT, relativePath);

    if (!filePath.startsWith(ROOT)) {
        sendError(response, 403, "Accesso negato.");
        return;
    }

    fs.stat(filePath, (error, stats) => {
        if (error || !stats.isFile()) {
            sendError(response, 404, "File non trovato.");
            return;
        }

        sendFile(filePath, response);
    });
});

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.log(`Server gia attivo su http://${HOST}:${PORT}/`);
        process.exit(0);
    }

    console.error("Errore server:", error);
    process.exit(1);
});

server.listen(PORT, HOST, () => {
    console.log(`Server avviato su http://${HOST}:${PORT}/`);
});
