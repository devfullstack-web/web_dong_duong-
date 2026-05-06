import 'dotenv/config';
import { createServer } from 'node:http';
import { parse } from 'node:url';
import next from 'next';
import { Server } from 'socket.io';
import { chatStreamManager } from './services/chat-stream';
import { notificationService } from './services/notification-service';
import { cronService } from './services/cron-service';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(httpServer, {
        cors: {
        },
    });

    chatStreamManager.setIo(io);
    notificationService.setIo(io);

    io.on('connection', (socket) => {
        const sessionId = socket.handshake.query.sessionId as string;

        if (sessionId) {
            socket.join(sessionId);
        }

        const isAdmin = socket.handshake.query.isAdmin === 'true';

        if (isAdmin) {
            socket.join('admins');
        }

        socket.on('disconnect', () => {
            // cleanup handled by socket.io
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
            cronService.init();
        });
});
