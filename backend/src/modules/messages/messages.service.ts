import { prisma } from '../../config/database';
import { AuthorizationError, BusinessRuleError } from '../../shared/errors';

const participantSelect = {
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
};

const messageSelect = {
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
};

// Shape a raw message row into the API response shape (content → body alias).
function formatMessage(msg: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: unknown;
  isRead: boolean;
  readAt: Date | null;
  isSystemMessage: boolean;
  createdAt: Date;
  sender: { id: string; username: string; profile: { displayName: string | null; avatarUrl: string | null } | null };
}) {
  return {
    ...msg,
    body: msg.content, // alias so frontend can use either field
  };
}

export class MessagesService {
  async getOrCreateConversation(
    userId: string,
    recipientId: string,
    listingId?: string,
  ) {
    if (userId === recipientId) {
      throw new BusinessRuleError('Cannot start a conversation with yourself');
    }

    // Find existing conversation between these two users for this listing
    const existing = await prisma.conversation.findFirst({
      where: {
        listingId: listingId ?? null,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
      select: {
        id: true,
        listingId: true,
        subject: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: { id: true, title: true, price: true, status: true, images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } } },
        },
        participants: { select: participantSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, content: true, senderId: true, createdAt: true } },
      },
    });

    if (existing) {
      return this._shapeConversation(existing, userId);
    }

    const created = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      select: {
        id: true,
        listingId: true,
        subject: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: { id: true, title: true, price: true, status: true, images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } } },
        },
        participants: { select: participantSelect },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, content: true, senderId: true, createdAt: true } },
      },
    });

    return this._shapeConversation(created, userId);
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });

    if (!participant) throw new AuthorizationError('Not a participant in this conversation');
    if (participant.isBlocked) throw new BusinessRuleError('You are blocked from this conversation');

    const message = await prisma.message.create({
      data: { conversationId, senderId, content },
      select: messageSelect,
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return formatMessage(message);
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    if (!participant) throw new AuthorizationError();

    const offset = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId, deletedAt: null },
        select: messageSelect,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId, deletedAt: null } }),
    ]);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    const totalPages = Math.ceil(total / limit);
    return {
      data: messages.reverse().map(formatMessage),
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  async getUserConversations(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { participants: { some: { userId } } },
        select: {
          id: true,
          listingId: true,
          subject: true,
          createdAt: true,
          updatedAt: true,
          listing: {
            select: { id: true, title: true, price: true, status: true, images: { where: { isCover: true }, take: 1, select: { thumbnailUrl: true } } },
          },
          participants: { select: participantSelect },
          messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, content: true, senderId: true, createdAt: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.conversation.count({ where: { participants: { some: { userId } } } }),
    ]);

    // Attach unread count and shape each conversation
    const shaped = await Promise.all(
      data.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: { conversationId: conv.id, senderId: { not: userId }, isRead: false },
        });
        return { ...this._shapeConversation(conv, userId), unreadCount };
      }),
    );

    const totalPages = Math.ceil(total / limit);
    return {
      data: shaped,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      select: { id: true },
    });
    const convIds = conversations.map((c) => c.id);
    return prisma.message.count({
      where: { conversationId: { in: convIds }, senderId: { not: userId }, isRead: false },
    });
  }

  async markConversationRead(conversationId: string, userId: string) {
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  // Shape a raw conversation into a consistent API response.
  // Derives `otherUser` (the participant who is not the requesting user)
  // and `lastMessage` (with `body` alias for content).
  private _shapeConversation(
    conv: {
      id: string;
      listingId: string | null;
      subject: string | null;
      createdAt: Date;
      updatedAt: Date;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listing: { id: string; title: string; price: any; status: string; images: { thumbnailUrl: string | null }[] } | null;
      participants: Array<{
        userId: string;
        lastReadAt: Date | null;
        isBlocked: boolean;
        user: { id: string; username: string; profile: { displayName: string | null; avatarUrl: string | null } | null };
      }>;
      messages: Array<{ id: string; content: string; senderId: string; createdAt: Date }>;
    },
    requestingUserId: string,
  ) {
    const otherParticipant = conv.participants.find((p) => p.userId !== requestingUserId);
    const lastMsg = conv.messages[0] ?? null;

    return {
      id: conv.id,
      listingId: conv.listingId,
      subject: conv.subject,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      listing: conv.listing,
      participants: conv.participants.map((p) => p.user),
      otherUser: otherParticipant?.user ?? null,
      lastMessage: lastMsg
        ? { id: lastMsg.id, body: lastMsg.content, senderId: lastMsg.senderId, createdAt: lastMsg.createdAt }
        : null,
      unreadCount: 0, // overridden after this call when needed
    };
  }
}

export const messagesService = new MessagesService();
