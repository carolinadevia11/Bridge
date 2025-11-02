import React, { useState } from 'react';
import { Send, Smile, FileText, AlertCircle, CheckCircle, Search, Filter, Plus, MessageSquare, Calendar, User, Clock, Star, Archive, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import BridgetteAvatar from './BridgetteAvatar';

interface Message {
  id: string;
  sender: 'mom' | 'dad';
  content: string;
  timestamp: Date;
  tone: 'matter-of-fact' | 'friendly' | 'neutral-legal';
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  subject: string;
  category: 'custody' | 'medical' | 'school' | 'activities' | 'financial' | 'general' | 'urgent';
  participants: ('mom' | 'dad')[];
  messages: Message[];
  lastMessage: Date;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
}

const MessagingInterface: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      subject: 'Saturday Pickup Confirmation',
      category: 'custody',
      participants: ['mom', 'dad'],
      lastMessage: new Date(Date.now() - 1800000),
      unreadCount: 0,
      isStarred: false,
      isArchived: false,
      messages: [
        {
          id: '1',
          sender: 'mom',
          content: "Hi! Just confirming pickup time for Saturday is still 10am?",
          timestamp: new Date(Date.now() - 3600000),
          tone: 'friendly',
          status: 'read'
        },
        {
          id: '2',
          sender: 'dad',
          content: "Yes, 10am works perfectly. I'll have Emma ready with her overnight bag.",
          timestamp: new Date(Date.now() - 1800000),
          tone: 'matter-of-fact',
          status: 'read'
        }
      ]
    },
    {
      id: '2',
      subject: 'Emma\'s Soccer Tournament Schedule',
      category: 'activities',
      participants: ['mom', 'dad'],
      lastMessage: new Date(Date.now() - 86400000),
      unreadCount: 2,
      isStarred: true,
      isArchived: false,
      messages: [
        {
          id: '3',
          sender: 'dad',
          content: "The soccer tournament schedule is out. Emma has games on March 15th and 22nd. Can you take the 15th?",
          timestamp: new Date(Date.now() - 172800000),
          tone: 'matter-of-fact',
          status: 'read'
        },
        {
          id: '4',
          sender: 'mom',
          content: "Yes, I can definitely take March 15th. What time should I have her there?",
          timestamp: new Date(Date.now() - 86400000),
          tone: 'friendly',
          status: 'delivered'
        }
      ]
    },
    {
      id: '3',
      subject: 'Medical Insurance Update',
      category: 'medical',
      participants: ['mom', 'dad'],
      lastMessage: new Date(Date.now() - 259200000),
      unreadCount: 0,
      isStarred: false,
      isArchived: false,
      messages: [
        {
          id: '5',
          sender: 'mom',
          content: "I received the new insurance cards. Emma's pediatrician visit is covered under the new plan.",
          timestamp: new Date(Date.now() - 259200000),
          tone: 'neutral-legal',
          status: 'read'
        }
      ]
    },
    {
      id: '4',
      subject: 'School Parent-Teacher Conference',
      category: 'school',
      participants: ['mom', 'dad'],
      lastMessage: new Date(Date.now() - 432000000),
      unreadCount: 1,
      isStarred: false,
      isArchived: false,
      messages: [
        {
          id: '6',
          sender: 'dad',
          content: "Emma's teacher wants to schedule a conference. Are you available next Tuesday at 3pm?",
          timestamp: new Date(Date.now() - 432000000),
          tone: 'matter-of-fact',
          status: 'delivered'
        }
      ]
    }
  ]);

  const [activeConversation, setActiveConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState<'matter-of-fact' | 'friendly' | 'neutral-legal'>('friendly');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationSubject, setNewConversationSubject] = useState('');
  const [newConversationCategory, setNewConversationCategory] = useState<'custody' | 'medical' | 'school' | 'activities' | 'financial' | 'general' | 'urgent'>('general');

  const categoryColors = {
    custody: 'bg-blue-100 text-blue-800',
    medical: 'bg-red-100 text-red-800',
    school: 'bg-green-100 text-green-800',
    activities: 'bg-purple-100 text-purple-800',
    financial: 'bg-yellow-100 text-yellow-800',
    general: 'bg-gray-100 text-gray-800',
    urgent: 'bg-orange-100 text-orange-800'
  };

  const categoryIcons = {
    custody: Calendar,
    medical: AlertCircle,
    school: FileText,
    activities: Star,
    financial: FileText,
    general: MessageSquare,
    urgent: AlertCircle
  };

  const toneDescriptions = {
    'matter-of-fact': 'Direct and clear communication',
    'friendly': 'Warm and collaborative tone',
    'neutral-legal': 'Professional and documented'
  };

  const toneColors = {
    'matter-of-fact': 'bg-blue-100 text-blue-800',
    'friendly': 'bg-green-100 text-green-800',
    'neutral-legal': 'bg-gray-100 text-gray-800'
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterCategory === 'all' || conv.category === filterCategory;
    const notArchived = !conv.isArchived;
    return matchesSearch && matchesFilter && notArchived;
  });

  const activeConv = conversations.find(conv => conv.id === activeConversation);

  const sendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'mom', // In real app, this would be the current user
      content: newMessage,
      timestamp: new Date(),
      tone: selectedTone,
      status: 'sent'
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: new Date()
        };
      }
      return conv;
    }));

    setNewMessage('');
  };

  const createNewConversation = () => {
    if (!newConversationSubject.trim()) return;

    const newConv: Conversation = {
      id: Date.now().toString(),
      subject: newConversationSubject,
      category: newConversationCategory,
      participants: ['mom', 'dad'],
      messages: [],
      lastMessage: new Date(),
      unreadCount: 0,
      isStarred: false,
      isArchived: false
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setNewConversationSubject('');
    setNewConversationCategory('general');
    setShowNewConversation(false);
  };

  const toggleStar = (convId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === convId ? { ...conv, isStarred: !conv.isStarred } : conv
    ));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Bridgette Helper */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <BridgetteAvatar size="md" expression="encouraging" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Hey Sarah, I'm here to help. Ask anything!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Organize your conversations by subject and category to easily find important discussions later! 💬
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-2xl shadow-lg h-[700px] flex">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
              <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={newConversationSubject}
                        onChange={(e) => setNewConversationSubject(e.target.value)}
                        placeholder="What's this conversation about?"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newConversationCategory} onValueChange={(value: any) => setNewConversationCategory(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custody">Custody & Scheduling</SelectItem>
                          <SelectItem value="medical">Medical & Health</SelectItem>
                          <SelectItem value="school">School & Education</SelectItem>
                          <SelectItem value="activities">Activities & Sports</SelectItem>
                          <SelectItem value="financial">Financial & Expenses</SelectItem>
                          <SelectItem value="urgent">Urgent Matter</SelectItem>
                          <SelectItem value="general">General Discussion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={createNewConversation} className="flex-1">
                        Start Conversation
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewConversation(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="custody">Custody & Scheduling</SelectItem>
                  <SelectItem value="medical">Medical & Health</SelectItem>
                  <SelectItem value="school">School & Education</SelectItem>
                  <SelectItem value="activities">Activities & Sports</SelectItem>
                  <SelectItem value="financial">Financial & Expenses</SelectItem>
                  <SelectItem value="urgent">Urgent Matters</SelectItem>
                  <SelectItem value="general">General Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const CategoryIcon = categoryIcons[conv.category];
                const lastMsg = conv.messages[conv.messages.length - 1];
                
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <CategoryIcon className="w-4 h-4 text-gray-500" />
                        <h3 className={`font-medium text-sm truncate ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                          {conv.subject}
                        </h3>
                        {conv.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      </div>
                      <div className="flex items-center space-x-1">
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                            {conv.unreadCount}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(conv.id);
                          }}
                          className="p-1 h-auto"
                        >
                          <Star className={`w-3 h-3 ${conv.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </div>
                    
                    <Badge className={`${categoryColors[conv.category]} text-xs mb-2`}>
                      {conv.category}
                    </Badge>
                    
                    {lastMsg && (
                      <p className="text-xs text-gray-600 truncate mb-1">
                        {lastMsg.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTime(conv.lastMessage)}</span>
                      <span>{conv.messages.length} messages</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{activeConv.subject}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={categoryColors[activeConv.category]}>
                        {activeConv.category}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {activeConv.messages.length} messages
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStar(activeConv.id)}
                    >
                      <Star className={`w-4 h-4 ${activeConv.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeConv.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'mom' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'mom' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${toneColors[message.tone]}`}>
                          {message.tone}
                        </span>
                        <span className="text-xs opacity-70 ml-2">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end mt-2">
                        {message.status === 'read' && <CheckCircle className="w-3 h-3 opacity-70" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="mb-3">
                  <Select value={selectedTone} onValueChange={(value: any) => setSelectedTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">
                        <div className="flex items-center">
                          <Smile className="w-4 h-4 mr-2 text-green-500" />
                          <div>
                            <div className="font-medium">Friendly</div>
                            <div className="text-xs text-gray-500">Warm and collaborative</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="matter-of-fact">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                          <div>
                            <div className="font-medium">Matter-of-fact</div>
                            <div className="text-xs text-gray-500">Direct and clear</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="neutral-legal">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-gray-500" />
                          <div>
                            <div className="font-medium">Neutral Legal</div>
                            <div className="text-xs text-gray-500">Professional and documented</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  🔒 All messages are encrypted and logged for legal documentation
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingInterface;