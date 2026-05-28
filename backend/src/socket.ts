import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { verifyAccessToken } from './middleware/auth';
import { prisma } from './config/database';
import { logger } from './config/logger';

export let io: SocketIOServer;

export function initSocket(httpServer: HttpServer | HttpsServer): SocketIOServer {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    transports: ['websocket', 'polling'],
  });

  // Auth middleware — verify JWT on connection
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ??
      (socket.handshake.headers.authorization?.replace('Bearer ', '') ?? '');
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyAccessToken(token);
      (socket as unknown as SocketWithUser).userId = payload.sub as string;
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as unknown as SocketWithUser).userId;
    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    // Join personal room for direct notifications
    void socket.join(`user:${userId}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId: string) => {
      void socket.join(`conv:${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      void socket.leave(`conv:${conversationId}`);
    });

    // Send message
    socket.on(
      'send_message',
      async (data: { conversationId: string; body: string }, callback?: (r: unknown) => void) => {
        try {
          // Verify user is a participant
          const participant = await prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId: data.conversationId, userId } },
          });
          if (!participant) {
            callback?.({ error: 'Not a participant' });
            return;
          }

          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: userId,
              content: data.body.trim(),
            },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  profile: { select: { displayName: true, avatarUrl: true } },
                },
              },
            },
          });

          // Update conversation updatedAt
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: { updatedAt: new Date() },
          });

          // Emit to all in the conversation room
          io.to(`conv:${data.conversationId}`).emit('message_received', message);

          // Notify the other participant via their personal room
          const others = await prisma.conversationParticipant.findMany({
            where: { conversationId: data.conversationId, userId: { not: userId } },
            select: { userId: true },
          });
          for (const other of others) {
            io.to(`user:${other.userId}`).emit('unread_count_changed', {
              conversationId: data.conversationId,
            });
          }

          callback?.({ success: true, message });
        } catch (err) {
          logger.error({ err }, 'send_message error');
          callback?.({ error: 'Failed to send message' });
        }
      },
    );

    // Typing indicator
    socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
      socket.to(`conv:${data.conversationId}`).emit('user_typing', {
        userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async (conversationId: string) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true, readAt: new Date() },
        });
        await prisma.conversationParticipant.update({
          where: { conversationId_userId: { conversationId, userId } },
          data: { lastReadAt: new Date() },
        });
        io.to(`conv:${conversationId}`).emit('messages_read', { conversationId, userId });
      } catch (err) {
        logger.error({ err }, 'mark_read error');
      }
    });

    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'Socket disconnected');
    });
  });

  return io;
}

type SocketWithUser = import('socket.io').Socket & { userId: string };

export function emitToUser(userId: string, event: string, data: unknown): void {
  io?.to(`user:${userId}`).emit(event, data);
}
