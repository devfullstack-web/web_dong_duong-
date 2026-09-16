const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function getJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function run() {
    const chrome = spawn('google-chrome', [
        '--headless',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--window-size=390,844',
        'http://localhost:3000/vi'
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
        await new Promise(r => setTimeout(r, 1500));

        // Click on mobile hamburger button: aria-label="Toggle Menu"
        await send('Runtime.evaluate', {
            expression: `
                const btn = document.querySelector('button[aria-label="Toggle Menu"]');
                if (btn) btn.click();
            `
        });

        await new Promise(r => setTimeout(r, 1000));

        // Take screenshot
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            '/home/thanh/.gemini/antigravity-cli/brain/6479e5c1-4989-410e-b4a5-cff0dfd4e7d0/mobile_drawer_open_390.png',
            Buffer.from(shot.data, 'base64')
        );
        console.log('Mobile drawer screenshot saved successfully!');

        ws.close();
    } finally {
        chrome.kill();
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
