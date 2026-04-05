import type { FastifyInstance } from 'fastify';
import { messagesService } from './messages.service';
import { requireAuth } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';
import { z } from 'zod';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.string(),
        name: z.string(),
        size: z.number(),
      }),
    )
    .optional(),
});

const createConversationSchema = z.object({
  recipientId: z.string().uuid(),
  listingId: z.string().uuid().optional(),
  initialMessage: z.string().min(1).max(2000),
});

export async function messageRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all conversations
  fastify.get('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const q = req.query as { page?: string; limit?: string };
    const result = await messagesService.getUserConversations(
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '20', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });

  // Get unread count
  fastify.get('/unread-count', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const count = await messagesService.getUnreadCount(user.id);
    void reply.status(200).send({ success: true, data: { count } });
  });

  // Start or get conversation
  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = createConversationSchema.parse(req.body);
    const conversation = await messagesService.getOrCreateConversation(
      user.id,
      body.recipientId,
      body.listingId,
    );

    // Send initial message
    const message = await messagesService.sendMessage(
      conversation.id,
      user.id,
      body.initialMessage,
    );

    void reply.status(201).send({ success: true, data: { conversation, message } });
  });

  // Get messages in conversation
  fastify.get('/:conversationId/messages', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { conversationId } = req.params as { conversationId: string };
    const q = req.query as { page?: string; limit?: string };
    const result = await messagesService.getMessages(
      conversationId,
      user.id,
      parseInt(q.page ?? '1', 10),
      parseInt(q.limit ?? '50', 10),
    );
    void reply.status(200).send({ success: true, ...result });
  });

  // Send message
  fastify.post('/:conversationId/messages', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { conversationId } = req.params as { conversationId: string };
    const body = sendMessageSchema.parse(req.body);
    const message = await messagesService.sendMessage(
      conversationId,
      user.id,
      body.content,
      body.attachments,
    );
    void reply.status(201).send({ success: true, data: message });
  });
}
