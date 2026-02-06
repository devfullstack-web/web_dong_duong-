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
            console.log(`Socket ${socket.id} joined room ${sessionId}`);
        }

        const isAdmin = socket.handshake.query.isAdmin === 'true';
        console.log(`[Socket] New connection: ${socket.id}, isAdmin: ${isAdmin}`);

        if (isAdmin) {
            socket.join('admins');
            console.log(`[Socket] Socket ${socket.id} successfully joined 'admins' room`);
        }

        socket.on(
            'typing',
            (data: { sessionId: string; senderType: 'guest' | 'admin'; isTyping: boolean }) => {
                chatStreamManager.broadcastTyping(data.sessionId, data.senderType, data.isTyping);
            },
        );

        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected`);
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
