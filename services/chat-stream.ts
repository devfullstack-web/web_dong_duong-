import { Server } from 'socket.io';

class ChatStreamManager {
    private get io(): Server | null {
        return (global as any).chatIo || null;
    }

    private set io(val: Server | null) {
        (global as any).chatIo = val;
    }

    setIo(io: Server) {
        this.io = io;
        console.log('[ChatStream] Socket.io instance attached');
    }

    broadcastMessage(message: any) {
        if (!this.io) return;
        // Send to the session room (customer widget receives this)
        this.io.to(message.session_id).emit('message', message);
        // Always send to admins room so admin dashboard updates in realtime
        this.io.to('admins').emit('message', message);
    }

    broadcastMessageUpdate(message: any) {
        if (!this.io) return;
        this.io.to(message.session_id).emit('message_update', message);
        this.io.to('admins').emit('message_update', message);
    }

    broadcastSessionUpdate(session: any) {
        if (!this.io) return;
        this.io.to(session.id).emit('session_update', session);
        this.io.to('admins').emit('session_update', session);
    }

    broadcastSessionRemoval(sessionId: string) {
        if (!this.io) return;
        this.io.to(sessionId).emit('session_removed', { sessionId });
        this.io.to('admins').emit('session_removed', { sessionId });
    }
}

export const chatStreamManager = new ChatStreamManager();
