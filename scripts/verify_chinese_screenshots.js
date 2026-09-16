const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/home/thanh/.gemini/antigravity-cli/brain/6479e5c1-4989-410e-b4a5-cff0dfd4e7d0';

async function getJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function capture(url, width, height, filename) {
    console.log(`Capturing ${url} at ${width}x${height} -> ${filename}`);
    const chrome = spawn('google-chrome', [
        '--headless',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        `--window-size=${width},${height}`,
        url
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const versionData = await getJson('http://127.0.0.1:9222/json/list');
        const page = versionData.find(t => t.type === 'page');
        if (!page || !page.webSocketDebuggerUrl) {
            throw new Error('No target page found');
        }

        const ws = new WebSocket(page.webSocketDebuggerUrl);
        let id = 1;
        const pending = new Map();

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.id && pending.has(msg.id)) {
                pending.get(msg.id)(msg.result);
                pending.delete(msg.id);
            }
        };

        await new Promise(r => ws.onopen = r);

        function send(method, params = {}) {
            return new Promise((resolve) => {
                const curId = id++;
                pending.set(curId, resolve);
                ws.send(JSON.stringify({ id: curId, method, params }));
            });
        }

        await send('Page.enable');
        await send('DOM.enable');
        await new Promise(r => setTimeout(r, 2500));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
        console.log(`Saved screenshot to ${filePath}`);

        ws.close();
    } finally {
        chrome.kill();
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function main() {
    await capture('http://localhost:3000/zh', 1280, 800, 'zh_home_desktop_verified.png');
    await capture('http://localhost:3000/zh', 390, 844, 'zh_home_mobile_verified.png');
    await capture('http://localhost:3000/zh/san-pham', 1280, 800, 'zh_products_desktop_verified.png');
    await capture('http://localhost:3000/zh/gioi-thieu', 390, 844, 'zh_about_mobile_verified.png');
    console.log('All verification screenshots captured!');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
