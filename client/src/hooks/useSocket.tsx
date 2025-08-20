import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface AnnouncementData {
  id: string;
  eventId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'announcement' | 'alert' | 'update';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface ChatMessageData {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorRole: 'participant' | 'organizer' | 'judge';
  message: string;
  type: 'question' | 'answer' | 'general';
  parentMessageId?: string;
  isAnswer: boolean;
  createdAt: Date;
}

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  sendAnnouncement: (eventId: string, announcement: {
    title: string;
    content: string;
    type?: 'announcement' | 'alert' | 'update';
    priority?: 'low' | 'medium' | 'high';
  }) => void;
  sendMessage: (eventId: string, message: {
    message: string;
    type?: 'question' | 'answer' | 'general';
    parentMessageId?: string;
  }) => void;
  getChatHistory: (eventId: string) => void;
  announcements: AnnouncementData[];
  messages: ChatMessageData[];
  onAnnouncement: (callback: (announcement: AnnouncementData) => void) => void;
  onMessage: (callback: (message: ChatMessageData) => void) => void;
}

export function useSocket(authToken?: string): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const announcementCallbackRef = useRef<((announcement: AnnouncementData) => void) | null>(null);
  const messageCallbackRef = useRef<((message: ChatMessageData) => void) | null>(null);

  useEffect(() => {
    if (!authToken) return;

    // Create Socket.IO connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}`;
    
    const socket = io(socketUrl, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setConnected(false);
    });

    // Event handlers
    socket.on('joined-event', (data) => {
      console.log('Successfully joined event:', data);
    });

    socket.on('announcements-history', (data: AnnouncementData[]) => {
      setAnnouncements(data);
    });

    socket.on('new-announcement', (announcement: AnnouncementData) => {
      setAnnouncements(prev => [announcement, ...prev]);
      if (announcementCallbackRef.current) {
        announcementCallbackRef.current(announcement);
      }
    });

    socket.on('announcement-sent', (announcement: AnnouncementData) => {
      console.log('Announcement sent successfully:', announcement);
    });

    socket.on('chat-history', (history: ChatMessageData[]) => {
      setMessages(history);
    });

    socket.on('new-message', (message: ChatMessageData) => {
      setMessages(prev => [...prev, message]);
      if (messageCallbackRef.current) {
        messageCallbackRef.current(message);
      }
    });

    socket.on('message-sent', (message: ChatMessageData) => {
      console.log('Message sent successfully:', message);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
    };
  }, [authToken]);

  const joinEvent = (eventId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-event', eventId);
    }
  };

  const leaveEvent = (eventId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-event', eventId);
    }
  };

  const sendAnnouncement = (eventId: string, announcement: {
    title: string;
    content: string;
    type?: 'announcement' | 'alert' | 'update';
    priority?: 'low' | 'medium' | 'high';
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('create-announcement', eventId, announcement);
    }
  };

  const sendMessage = (eventId: string, message: {
    message: string;
    type?: 'question' | 'answer' | 'general';
    parentMessageId?: string;
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', eventId, message);
    }
  };

  const getChatHistory = (eventId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('get-chat-history', eventId);
    }
  };

  const onAnnouncement = (callback: (announcement: AnnouncementData) => void) => {
    announcementCallbackRef.current = callback;
  };

  const onMessage = (callback: (message: ChatMessageData) => void) => {
    messageCallbackRef.current = callback;
  };

  return {
    socket: socketRef.current,
    connected,
    joinEvent,
    leaveEvent,
    sendAnnouncement,
    sendMessage,
    getChatHistory,
    announcements,
    messages,
    onAnnouncement,
    onMessage,
  };
}