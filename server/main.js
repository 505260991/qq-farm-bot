const http = require('http');
const fs = require('fs');
const path = require('path');
const bot = require('./bot');
const {registerIPC, deployIPC} = require('./ipc');
const store = require('./store');

// 静态服务器
const server = http.createServer((req, res) => {
    // 解析 URL，忽略 query string
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, '../dist', urlPath === '/' ? 'index.html' : urlPath);
    
    // 防止路径穿越：确保 filePath 在 dist 目录下
    const distDir = path.resolve(__dirname, '../dist');
    filePath = path.resolve(filePath);
    if (!filePath.startsWith(distDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File Not Found');
            return;
        }
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
        }[ext] || 'application/octet-stream';

        res.writeHead(200, {'Content-Type': contentType});
        res.end(content);
    });
});

async function main() {
    registerIPC(server);
    await bot.init();

    server.listen(3000, () => {
        console.log('🚀 服务运行在 http://localhost:3000');
    });
}

async function gracefulShutdown(signal) {
    console.log(`🚀 退出信号: ${signal}`)
    // 执行机器人的断开逻辑
    bot.botDisconnect();
    // 确保配置立即写入磁盘
    store.saveImmediate();
    // 关闭 IPC 通道
    await deployIPC();
    // 关闭 HTTP 服务器
    await new Promise(resolve => server.close(resolve));
    console.log('🌐 HTTP 服务器已关闭');
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
main().catch(console.error);
