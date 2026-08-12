import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';
import { usersApi } from '@/api/users';
import { PageHeader } from '@/components/layout/PageHeader';

import { GradientButton } from '@/components/shared/GradientButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';
import { useAuthStore } from '@/stores/auth.store';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';

export function ChatPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { hasPermission } = usePermissions();
  const canCreateChannel = hasPermission(PERMISSIONS.CHAT_CREATE_CHANNEL);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showMobileMessages, setShowMobileMessages] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState<'direct' | 'group'>('direct');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // region -- Queries --

  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ['chat-channels'],
    queryFn: () => chatApi.getChannels().then((r) => r.data),
  });

  const channels = channelsData?.data || [];

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', activeChannelId],
    queryFn: () => chatApi.getMessages(activeChannelId!).then((r) => r.data),
    enabled: !!activeChannelId,
    refetchInterval: 5000,
  });

  const messages = messagesData?.data || [];

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
    enabled: showNewChatModal,
  });

  const users = (usersData?.data || []).filter((u: any) => u.id !== currentUser?.id);

  // region -- Mutations --

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(activeChannelId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeChannelId] });
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
      setMessageInput('');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (channelId: string) => chatApi.markRead(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
    },
  });

  const createDirectMutation = useMutation({
    mutationFn: (userId: string) => chatApi.getOrCreateDirect(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
      const channel = res.data?.data;
      if (channel?.id) {
        setActiveChannelId(channel.id);
        setShowMobileMessages(true);
      }
      closeNewChatModal();
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: ({ name, memberIds }: { name: string; memberIds: string[] }) =>
      chatApi.createGroup(name, memberIds),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['chat-channels'] });
      const channel = res.data?.data;
      if (channel?.id) {
        setActiveChannelId(channel.id);
        setShowMobileMessages(true);
      }
      closeNewChatModal();
    },
  });

  // region -- Effects --

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (activeChannelId) {
      markReadMutation.mutate(activeChannelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannelId]);

  // region -- Handlers --

  function selectChannel(channelId: string) {
    setActiveChannelId(channelId);
    setShowMobileMessages(true);
  }

  function handleBackToChannels() {
    setShowMobileMessages(false);
  }

  function closeNewChatModal() {
    setShowNewChatModal(false);
    setNewChatType('direct');
    setSelectedUserId('');
    setGroupName('');
    setSelectedMemberIds([]);
  }

  function handleCreateChat() {
    if (newChatType === 'direct' && selectedUserId) {
      createDirectMutation.mutate(selectedUserId);
    } else if (newChatType === 'group' && groupName.trim() && selectedMemberIds.length > 0) {
      createGroupMutation.mutate({ name: groupName.trim(), memberIds: selectedMemberIds });
    }
  }

  function handleSendMessage() {
    const trimmed = messageInput.trim();
    if (!trimmed || !activeChannelId) return;
    sendMessageMutation.mutate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function toggleMember(userId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  // region -- Helpers --

  function getChannelName(channel: any) {
    if (channel.type === 'direct') {
      const other = channel.members?.find((m: any) => m.userId !== currentUser?.id);
      return other?.user?.fullName || 'Přímá zpráva';
    }
    if (channel.type === 'department') {
      return channel.workshop?.name || channel.name || 'Oddělení';
    }
    return channel.name || 'Kanál';
  }

  function getLastMessagePreview(channel: any) {
    if (!channel.lastMessage) return 'Žádné zprávy';
    const content = channel.lastMessage.content || '';
    return content.length > 50 ? content.slice(0, 50) + '…' : content;
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Včera';
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
  }

  function formatMessageTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  }

  function getInitial(name: string) {
    return name?.charAt(0)?.toUpperCase() || '?';
  }

  const activeChannel = channels.find((c: any) => c.id === activeChannelId);
  const memberCount = activeChannel?.members?.length || 0;

  // region -- Render --

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Chat" breadcrumbs={[{ label: 'Chat' }]} />

      <div className="flex flex-1 min-h-0 gap-0 rounded-lg border border-ev-200 dark:border-ev-600/40 overflow-hidden bg-white dark:bg-ev-800">
        {/* Channel list panel */}
        <div
          className={`${
            showMobileMessages ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-80 md:border-r border-ev-200 dark:border-ev-600/40 shrink-0`}
        >
          {/* Channel list header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ev-200 dark:border-ev-600/40">
            <h2 className="text-sm font-semibold text-ev-800 dark:text-ev-100">Konverzace</h2>
            {canCreateChannel && (
              <GradientButton size="sm" onClick={() => setShowNewChatModal(true)}>
                + Nový chat
              </GradientButton>
            )}
          </div>

          {/* Channel list */}
          <div className="flex-1 overflow-y-auto">
            {channelsLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="bar" height="48px" />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <EmptyState icon="info" title="Žádné konverzace" />
            ) : (
              <div className="flex flex-col">
                {[...channels]
                  .sort((a: any, b: any) => {
                    const dateA = a.lastMessage?.createdAt || a.createdAt || '';
                    const dateB = b.lastMessage?.createdAt || b.createdAt || '';
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                  })
                  .map((channel: any) => (
                    <button
                      key={channel.id}
                      onClick={() => selectChannel(channel.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                        channel.id === activeChannelId
                          ? 'bg-ev-100 dark:bg-ev-800/40'
                          : 'hover:bg-ev-50 dark:hover:bg-ev-800/30'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-ev-200 dark:bg-ev-700 flex items-center justify-center text-sm font-semibold text-ev-600 dark:text-ev-300 shrink-0">
                        {getInitial(getChannelName(channel))}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-ev-800 dark:text-ev-100 truncate">
                            {getChannelName(channel)}
                          </span>
                          {channel.lastMessage?.createdAt && (
                            <span className="text-xs text-ev-400 tabular-nums shrink-0">
                              {formatTime(channel.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ev-400 truncate">
                            {getLastMessagePreview(channel)}
                          </span>
                          {channel.unreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-petrol-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Message area panel */}
        <div
          className={`${
            showMobileMessages ? 'flex' : 'hidden md:flex'
          } flex-col flex-1 min-w-0`}
        >
          {activeChannelId && activeChannel ? (
            <>
              {/* Message header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-ev-200 dark:border-ev-600/40">
                <button
                  onClick={handleBackToChannels}
                  className="md:hidden rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 transition-colors duration-150"
                >
                  <Icon name="chevron-right" size={18} className="rotate-180 text-ev-500" />
                </button>
                <div>
                  <h3 className="text-sm font-semibold text-ev-800 dark:text-ev-100">
                    {getChannelName(activeChannel)}
                  </h3>
                  <span className="text-xs text-ev-400">{memberCount} členů</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {messagesLoading ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} variant="bar" height="40px" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState icon="info" title="Žádné zprávy" description="Napište první zprávu" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg: any) => {
                      const isOwn = msg.authorId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                            {!isOwn && (
                              <div className="w-7 h-7 rounded-full bg-ev-200 dark:bg-ev-700 flex items-center justify-center text-xs font-semibold text-ev-600 dark:text-ev-300 shrink-0">
                                {getInitial(msg.author?.fullName || '')}
                              </div>
                            )}
                            <div>
                              {!isOwn && (
                                <span className="block text-xs text-ev-400 mb-0.5 ml-1">
                                  {msg.author?.fullName}
                                </span>
                              )}
                              <div
                                className={`rounded-lg px-3 py-2 text-sm ${
                                  isOwn
                                    ? 'bg-ev-900 text-white dark:bg-ev-100 dark:text-ev-900'
                                    : 'bg-ev-100 dark:bg-ev-700 text-ev-700 dark:text-ev-300'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              </div>
                              <span
                                className={`block text-xs text-ev-400 mt-0.5 ${
                                  isOwn ? 'text-right mr-1' : 'ml-1'
                                }`}
                              >
                                {msg.createdAt && formatMessageTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message input */}
              <div className="px-4 py-3 border-t border-ev-200 dark:border-ev-600/40">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Napište zprávu…"
                    className="flex-1 rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150 resize-none"
                  />
                  <GradientButton
                    size="md"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  >
                    Odeslat
                  </GradientButton>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState icon="info" title="Vyberte konverzaci" description="Zvolte chat ze seznamu vlevo" />
            </div>
          )}
        </div>
      </div>

      {/* New chat modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={closeNewChatModal} />
          <div className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-md w-full shadow-lg animate-scale-in">
            <h2 className="text-lg font-bold text-ev-800 dark:text-ev-100 mb-4">
              Nový chat
            </h2>

            {/* Chat type tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setNewChatType('direct')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                  newChatType === 'direct'
                    ? 'bg-ev-900 text-white dark:bg-ev-100 dark:text-ev-900'
                    : 'text-ev-600 dark:text-ev-300 hover:bg-ev-100 dark:hover:bg-ev-700'
                }`}
              >
                Přímá zpráva
              </button>
              <button
                onClick={() => setNewChatType('group')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                  newChatType === 'group'
                    ? 'bg-ev-900 text-white dark:bg-ev-100 dark:text-ev-900'
                    : 'text-ev-600 dark:text-ev-300 hover:bg-ev-100 dark:hover:bg-ev-700'
                }`}
              >
                Skupinový chat
              </button>
            </div>

            {newChatType === 'direct' ? (
              <div>
                <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                  Vyberte uživatele
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150"
                >
                  <option value="">-- Vyberte --</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                    Název skupiny
                  </label>
                  <input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150"
                    placeholder="Název skupinového chatu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                    Členové
                  </label>
                  <div className="max-h-40 overflow-y-auto rounded-md border border-ev-200 dark:border-ev-600/40">
                    {users.map((u: any) => (
                      <label
                        key={u.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-ev-50 dark:hover:bg-ev-800/30 cursor-pointer transition-colors duration-150"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(u.id)}
                          onChange={() => toggleMember(u.id)}
                          className="rounded border-ev-300 dark:border-ev-600 text-petrol-500 focus:ring-petrol-500"
                        />
                        <span className="text-sm text-ev-700 dark:text-ev-300">{u.fullName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <GradientButton variant="ghost" onClick={closeNewChatModal}>
                Zrušit
              </GradientButton>
              <GradientButton
                onClick={handleCreateChat}
                disabled={
                  (newChatType === 'direct' && !selectedUserId) ||
                  (newChatType === 'group' && (!groupName.trim() || selectedMemberIds.length === 0)) ||
                  createDirectMutation.isPending ||
                  createGroupMutation.isPending
                }
              >
                Vytvořit
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
