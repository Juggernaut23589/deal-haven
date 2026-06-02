'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare, ChevronRight, Send, Loader2, ArrowLeft, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useRequireAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { messagesApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import { formatPostedAgo } from '@/lib/formatters';
import type { Conversation, Message } from '@/types/order';

// ─── Conversation List ─────────────────────────────────────────────────────────

function ConversationList({
  conversations, activeId, onSelect, isLoading,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (c: Conversation) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }
  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No conversations yet</p>
        <p className="text-xs text-slate-400 mt-1">Message a seller from any listing page.</p>
      </div>
    );
  }
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {conversations.map((conv) => {
        const other = conv.seller?.id === conv.buyerId ? conv.buyer : conv.seller;
        const otherName = (other as { profile?: { displayName?: string }; username?: string })?.profile?.displayName ?? (other as { username?: string })?.username ?? 'User';
        const hasUnread = (conv.unreadCount ?? 0) > 0;
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
              activeId === conv.id && 'bg-primary/5 dark:bg-primary/10',
              hasUnread && activeId !== conv.id && 'bg-primary/5 dark:bg-primary/10'
            )}
          >
            <Avatar src={(other as { profile?: { avatarUrl?: string } })?.profile?.avatarUrl} name={otherName} size="md" className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className={cn('text-sm truncate', hasUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300')}>
                  {otherName}
                </p>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {conv.lastMessage ? formatPostedAgo(conv.lastMessage.createdAt) : ''}
                </span>
              </div>
              {conv.listing && <p className="text-[11px] text-slate-400 truncate">Re: {conv.listing.title}</p>}
              <p className={cn('text-xs mt-0.5 truncate', hasUnread ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400')}>
                {conv.lastMessage?.body ?? 'No messages yet'}
              </p>
            </div>
            {hasUnread && (
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Message Thread ─────────────────────────────────────────────────────────────

function MessageThread({
  conversation, currentUserId, onBack,
}: {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const typingTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const token = useAuthStore((s) => s.accessToken);

  const other = (conversation as { seller?: { id?: string }; buyerId?: string; buyer?: unknown }).seller?.id === (conversation as { buyerId?: string }).buyerId
    ? (conversation as { buyer?: { profile?: { displayName?: string; avatarUrl?: string }; username?: string } }).buyer
    : (conversation as { seller?: { profile?: { displayName?: string; avatarUrl?: string }; username?: string } }).seller;
  const otherName = (other as { profile?: { displayName?: string }; username?: string })?.profile?.displayName ?? (other as { username?: string })?.username ?? 'User';

  React.useEffect(() => {
    setIsLoading(true);
    messagesApi.getMessages(conversation.id, 1, 50)
      .then((res) => setMessages(res.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
    messagesApi.markRead(conversation.id).catch(() => {});
  }, [conversation.id]);

  React.useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    socket.emit('join_conversation', conversation.id);
    socket.emit('mark_read', conversation.id);

    const onMessage = (msg: Message) => {
      if (msg.conversationId !== conversation.id) return;
      setMessages((prev) => prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]);
      socket.emit('mark_read', conversation.id);
    };

    const onTyping = (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      if (data.conversationId !== conversation.id || data.userId === currentUserId) return;
      setTypingUsers((prev) =>
        data.isTyping ? [...new Set([...prev, data.userId])] : prev.filter((u) => u !== data.userId)
      );
    };

    socket.on('message_received', onMessage);
    socket.on('user_typing', onTyping);
    return () => {
      socket.emit('leave_conversation', conversation.id);
      socket.off('message_received', onMessage);
      socket.off('user_typing', onTyping);
    };
  }, [conversation.id, currentUserId, token]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const body = input.trim();
    if (!body || isSending || !token) return;
    setInput('');
    setIsSending(true);
    const socket = getSocket(token);
    socket.emit('send_message', { conversationId: conversation.id, body }, (res: { error?: string }) => {
      setIsSending(false);
      if (res?.error) setInput(body);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (!token) return;
    const socket = getSocket(token);
    socket.emit('typing', { conversationId: conversation.id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing', { conversationId: conversation.id, isTyping: false });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button onClick={onBack} className="md:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Back">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <Avatar src={(other as { profile?: { avatarUrl?: string } })?.profile?.avatarUrl} name={otherName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{otherName}</p>
          {conversation.listing && <p className="text-xs text-slate-400 truncate">Re: {conversation.listing.title}</p>}
        </div>
        {conversation.listing && (
          <Link href={`/listing/${conversation.listing.id}`} className="shrink-0">
            <Button variant="ghost" size="sm" leftIcon={<Package className="h-3.5 w-3.5" />}>View listing</Button>
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn('flex gap-2', i % 2 === 0 && 'justify-end')}>
                {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
            <MessageSquare className="h-8 w-8" />
            <p className="text-sm">No messages yet — say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={cn('flex gap-2 items-end', isOwn && 'flex-row-reverse')}>
                {!isOwn && <Avatar src={(other as { profile?: { avatarUrl?: string } })?.profile?.avatarUrl} name={otherName} size="xs" className="shrink-0" />}
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                  isOwn ? 'bg-primary text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm'
                )}>
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <p className={cn('text-[10px] mt-1', isOwn ? 'text-white/70 text-right' : 'text-slate-400')}>
                    {formatPostedAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {typingUsers.length > 0 && (
          <div className="flex gap-2 items-end">
            <Avatar src={(other as { profile?: { avatarUrl?: string } })?.profile?.avatarUrl} name={otherName} size="xs" className="shrink-0" />
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-2 shrink-0">
        {['Is this still available?', "What's your best price?", 'Can we meet today?'].map((r) => (
          <button key={r} onClick={() => setInput(r)}
            className="shrink-0 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors">
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-4 pb-4 pt-1 shrink-0 border-t border-slate-100 dark:border-slate-800">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className={cn(
            'flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700',
            'bg-white dark:bg-slate-900 px-3 py-2.5 text-sm',
            'text-slate-900 dark:text-slate-100 placeholder:text-slate-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary max-h-32 overflow-y-auto'
          )}
          style={{ minHeight: '2.75rem' }}
        />
        <Button onClick={() => void handleSend()} disabled={!input.trim() || isSending} className="self-end shrink-0" size="sm" aria-label="Send">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MessagesInner() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeConversation, setActiveConversation] = React.useState<Conversation | null>(null);
  const [showThread, setShowThread] = React.useState(false);

  React.useEffect(() => {
    messagesApi.getConversations(1)
      .then((res) => setConversations(res.data ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const [isCreatingConversation, setIsCreatingConversation] = React.useState(false);

  React.useEffect(() => {
    const listingId = searchParams.get('listing');
    const sellerId = searchParams.get('seller');
    const quick = searchParams.get('quick');
    if (!listingId) return;

    // Wait for conversations to load before deciding whether to create
    if (isLoading) return;

    // Check if a conversation for this listing already exists
    const existing = conversations.find((c) => c.listing?.id === listingId);
    if (existing) {
      setActiveConversation(existing);
      setShowThread(true);
      return;
    }

    // No existing conversation — create one if we have the sellerId
    if (!sellerId || isCreatingConversation) return;
    setIsCreatingConversation(true);
    messagesApi.getOrCreateConversation(listingId, sellerId)
      .then((conv) => {
        setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
        setActiveConversation(conv);
        setShowThread(true);
        // Auto-send quick message if requested
        if (quick === 'available') {
          // Short delay so the thread renders first
          setTimeout(() => {
            messagesApi.sendMessage(conv.id, 'Is this still available?').catch(() => {});
          }, 400);
        }
      })
      .catch(() => {})
      .finally(() => setIsCreatingConversation(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, isLoading, searchParams]);

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          <span className="font-medium text-slate-900 dark:text-slate-100">Messages</span>
        </nav>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mb-6">Messages</h1>
        <div className={cn(
          'rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-card overflow-hidden',
          'grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-240px)] min-h-[500px]'
        )}>
          <div className={cn('border-r border-slate-100 dark:border-slate-800 overflow-y-auto', showThread && 'hidden md:block')}>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isLoading ? '…' : `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <ConversationList conversations={conversations} activeId={activeConversation?.id ?? null}
              onSelect={(c) => { setActiveConversation(c); setShowThread(true); }} isLoading={isLoading} />
          </div>
          <div className={cn('flex flex-col', !showThread && 'hidden md:flex')}>
            {activeConversation && user ? (
              <MessageThread conversation={activeConversation} currentUserId={user.id} onBack={() => setShowThread(false)} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <MessageSquare className="h-10 w-10" />
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function MessagesPage() {
  return (
    <React.Suspense fallback={null}>
      <MessagesInner />
    </React.Suspense>
  );
}
