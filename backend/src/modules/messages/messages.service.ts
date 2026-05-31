import { prisma } from '../../config/database';
import { AuthorizationError, BusinessRuleError } from '../../shared/errors';

const conversationSelect = {
  id: true,
  listingId: true,
  subject: true,
  createdAt: true,
  updatedAt: true,
  listing: {
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } },
    },
  },
  participants: {
    select: {
      userId: true,
      lastReadAt: true,
      isBlocked: true,
      user: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: {
      id: true,
      content: true,
      senderId: true,
      createdAt: true,
      isRead: true,
    },
  },
};

export class MessagesService {
  async getOrCreateConversation(
    userId: string,
    recipientId: string,
    listingId?: string,
  ) {
    if (userId === recipientId) {
      throw new BusinessRuleError('Cannot start a conversation with yourself');
    }

    // Check if conversation already exists between these two users for this listing
    const existing = await prisma.conversation.findFirst({
      where: {
        listingId: listingId ?? null,
        participants: {
          every: { userId: { in: [userId, recipientId] } },
        },
      },
      include: {
        participants: true,
      },
    });

    if (existing && existing.participants.length === 2) {
      return existing;
    }

    return prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      select: conversationSelect,
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachments?: Array<{ url: string; type: string; name: string; size: number }>,
  ) {
    // Verify sender is participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });

    if (!participant) throw new AuthorizationError('Not a participant in this conversation');
    if (participant.isBlocked) {
      throw new BusinessRuleError('You are blocked from this conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachments: attachments ?? undefined,
      },
      select: {
        id: true,
        conversationId: true,
        senderId: true,
        content: true,
        attachments: true,
        isRead: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            profile: { select: { displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participant) throw new AuthorizationError();

    const offset = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          attachments: true,
          isRead: true,
          readAt: true,
          isSystemMessage: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              username: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId, deletedAt: null } }),
    ]);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    // Update participant's last read
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    return {
      data: messages.reverse(), // Return chronological order
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getUserConversations(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { participants: { some: { userId } } },
        select: conversationSelect,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.conversation.count({
        where: { participants: { some: { userId } } },
      }),
    ]);

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      data.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });
        return { ...conv, unreadCount };
      }),
    );

    return {
      data: conversationsWithUnread,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      select: { id: true },
    });

    const convIds = conversations.map((c) => c.id);
    return prisma.message.count({
      where: {
        conversationId: { in: convIds },
        senderId: { not: userId },
        isRead: false,
      },
    });
  }

  async markConversationRead(conversationId: string, userId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

export const messagesService = new MessagesService();
