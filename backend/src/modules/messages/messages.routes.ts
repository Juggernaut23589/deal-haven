import type { FastifyInstance } from 'fastify';
import { messagesService } from './messages.service';
import { requireAuth } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../shared/types';
import { z } from 'zod';


const createConversationSchema = z.object({
  // Support both frontend shapes
  recipientId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  listingId: z.string().uuid().optional(),
  initialMessage: z.string().min(1).max(2000).optional(),
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
    void reply.status(200).send({ success: true, data: result });
  });

  // Get unread count
  fastify.get('/unread-count', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const count = await messagesService.getUnreadCount(user.id);
    void reply.status(200).send({ success: true, data: { count } });
  });

  // Start or get conversation (supports recipientId or sellerId)
  fastify.post('/', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const body = createConversationSchema.parse(req.body);
    const recipientId = body.recipientId ?? body.sellerId;
    if (!recipientId) {
      void reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'recipientId or sellerId is required' } });
      return;
    }
    const conversation = await messagesService.getOrCreateConversation(
      user.id,
      recipientId,
      body.listingId,
    );

    if (body.initialMessage) {
      await messagesService.sendMessage(conversation.id, user.id, body.initialMessage);
    }

    void reply.status(201).send({ success: true, data: conversation });
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
    void reply.status(200).send({ success: true, data: result });
  });

  // Send message (accepts both 'content' and 'body' field names)
  fastify.post('/:conversationId/messages', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { conversationId } = req.params as { conversationId: string };
    const raw = req.body as Record<string, unknown>;
    const content = (raw.content ?? raw.body) as string | undefined;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      void reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message content is required' } });
      return;
    }
    const message = await messagesService.sendMessage(conversationId, user.id, content.trim());
    void reply.status(201).send({ success: true, data: message });
  });

  // Mark conversation as read
  fastify.patch('/:conversationId/read', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = (req as AuthenticatedRequest).user;
    const { conversationId } = req.params as { conversationId: string };
    await messagesService.markConversationRead(conversationId, user.id);
    void reply.status(200).send({ success: true });
  });
}
