import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { MessageCircle, Send, HelpCircle, CheckCircle, Clock, Users } from 'lucide-react';

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

interface ChatPanelProps {
  eventId: string;
  userRole: 'participant' | 'organizer' | 'judge';
  userName: string;
  authToken?: string;
}

export function ChatPanel({ eventId, userRole, userName, authToken }: ChatPanelProps) {
  const { toast } = useToast();
  const { connected, joinEvent, sendMessage, getChatHistory, messages, onMessage } = useSocket(authToken);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageType, setMessageType] = useState<'question' | 'answer' | 'general'>('general');
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (connected && eventId) {
      joinEvent(eventId);
      getChatHistory(eventId);
    }
  }, [connected, eventId, joinEvent, getChatHistory]);

  useEffect(() => {
    onMessage((message) => {
      // Auto-scroll to bottom on new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }, [onMessage]);

  useEffect(() => {
    // Scroll to bottom when messages load
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) {
      return;
    }

    const messageData = {
      message: currentMessage,
      type: messageType,
      parentMessageId: replyToMessage || undefined,
    };

    sendMessage(eventId, messageData);
    setCurrentMessage('');
    setReplyToMessage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'organizer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'judge':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getMessageIcon = (type: string, isAnswer: boolean) => {
    if (isAnswer) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    switch (type) {
      case 'question':
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReplyToMessage = (parentId: string) => {
    return messages.find(msg => msg.id === parentId);
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const key = message.parentMessageId || message.id;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(message);
    return groups;
  }, {} as Record<string, ChatMessageData[]>);

  return (
    <Card className="h-full flex flex-col" data-testid="chat-panel">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-xl">Event Chat & Q&A</CardTitle>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
        <CardDescription>
          Ask questions, share updates, and connect with other participants
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {Object.entries(groupedMessages).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([threadId, threadMessages]) => {
                const mainMessage = threadMessages.find(msg => !msg.parentMessageId) || threadMessages[0];
                const replies = threadMessages.filter(msg => msg.parentMessageId);
                
                return (
                  <div key={threadId} className="space-y-2">
                    {/* Main Message */}
                    <div className="flex gap-3 group">
                      <div className="flex-shrink-0">
                        {getMessageIcon(mainMessage.type, mainMessage.isAnswer)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{mainMessage.authorName}</span>
                          <Badge variant="secondary" className={`text-xs ${getRoleColor(mainMessage.authorRole)}`}>
                            {mainMessage.authorRole}
                          </Badge>
                          {mainMessage.type === 'question' && (
                            <Badge variant="outline" className="text-xs">
                              Question
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(mainMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{mainMessage.message}</p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => setReplyToMessage(mainMessage.id)}
                            data-testid={`button-reply-${mainMessage.id}`}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
                        {replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="flex-shrink-0">
                              {getMessageIcon(reply.type, reply.isAnswer)}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{reply.authorName}</span>
                                <Badge variant="secondary" className={`text-xs ${getRoleColor(reply.authorRole)}`}>
                                  {reply.authorRole}
                                </Badge>
                                {reply.isAnswer && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Answer
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm">{reply.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Reply Indicator */}
        {replyToMessage && (
          <div className="px-6 py-2 bg-muted/50 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Replying to: {getReplyToMessage(replyToMessage)?.authorName}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyToMessage(null)}
                data-testid="button-cancel-reply"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Message Input */}
        <div className="flex-shrink-0 p-6 border-t bg-background">
          <div className="flex gap-2 mb-2">
            <Select value={messageType} onValueChange={(value) => setMessageType(value as any)}>
              <SelectTrigger className="w-32" data-testid="select-message-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                {(userRole === 'organizer' || userRole === 'judge') && (
                  <SelectItem value="answer">Answer</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!connected}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!connected || !currentMessage.trim()}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}