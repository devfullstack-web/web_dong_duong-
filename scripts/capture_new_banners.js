/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/home/thanh/.gemini/antigravity-cli/brain/6479e5c1-4989-410e-b4a5-cff0dfd4e7d0';

function getJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function captureHero(url, filename, slideIndex = 0) {
    console.log(`Capturing hero from ${url} (slide ${slideIndex}) -> ${filename}`);
    const chrome = spawn('google-chrome', [
        '--headless=new',
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--window-size=1440,1100',
        url
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const targets = await getJson('http://127.0.0.1:9222/json/list');
        const page = targets.find(t => t.type === 'page');
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

        await new Promise(r => setTimeout(r, 3000));

        // If slideIndex > 0, click the next button
        if (slideIndex > 0) {
            for (let i = 0; i < slideIndex; i++) {
                await send('Runtime.evaluate', {
                    expression: `
                        const btns = document.querySelectorAll('button');
                        for (const b of btns) {
                            if (b.querySelector('svg.lucide-chevron-right') || b.innerHTML.includes('chevron-right')) {
                                b.click();
                                break;
                            }
                        }
                    `
                });
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        const res = await send('Page.captureScreenshot', {
            format: 'png',
            clip: {
                x: 0,
                y: 0,
                width: 1440,
                height: 800,
                scale: 1,
            }
        });

        const buffer = Buffer.from(res.data, 'base64');
        const outPath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(outPath, buffer);
        console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);

        ws.close();
    } finally {
        chrome.kill();
        await new Promise(r => setTimeout(r, 1000));
    }
}

async function main() {
    // Capture slide 1 Vietnamese (Showroom & Big Slab tiles / HVAC)
    await captureHero('http://localhost:3001/vi', 'hero_slide1_dongduong_vi.png', 0);
    // Capture slide 2 Vietnamese (Tiles gallery)
    await captureHero('http://localhost:3001/vi', 'hero_slide2_tiles_vi.png', 1);
    // Capture slide 3 Vietnamese (Central HVAC rooftop)
    await captureHero('http://localhost:3001/vi', 'hero_slide3_hvac_vi.png', 2);
    // Capture slide 1 Chinese
    await captureHero('http://localhost:3001/zh', 'hero_slide1_dongduong_zh.png', 0);
    // Capture slide 2 Chinese
    await captureHero('http://localhost:3001/zh', 'hero_slide2_tiles_zh.png', 1);
    // Capture slide 3 Chinese
    await captureHero('http://localhost:3001/zh', 'hero_slide3_hvac_zh.png', 2);
    console.log('All slides captured successfully!');
}

main().catch(console.error);
