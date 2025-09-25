import React, { useState, useEffect, useRef } from 'react';
import { useToast } from './ToastProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

function CommunityChat({ user }) {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMessages();
    }
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}`);
      if (response.ok) {
        const data = await response.json();
        setCommunity(data);
      } else {
        navigate('/community');
      }
    } catch (error) {
      console.error('Failed to fetch community:', error);
      navigate('/community');
    }
  };

  const fetchMessages = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/communities/${communityId}/messages?page=${page}&limit=20`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
        }
        setHasMore(data.messages.length === 20);
      } else {
        const errorData = await response.json();
        if (errorData.message === 'You are not a member of this community') {
          toast.error('You are not a member of this community');
          navigate('/community');
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'text'
        })
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleStartReply = (messageId) => {
    setReplyingToId(messageId);
    setReplyText('');
    setExpandedReplies((prev) => ({ ...prev, [messageId]: true }));
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyText('');
  };

  const handleSubmitReply = async (e, messageId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/communities/messages/${messageId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: replyText.trim() })
      });

      if (response.ok) {
        const newReply = {
          _id: Math.random().toString(36).slice(2),
          user: { _id: user.id, name: user.name },
          content: replyText.trim(),
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => prev.map((m) => {
          if (m._id !== messageId) return m;
          const currentReplies = Array.isArray(m.replies) ? m.replies : [];
          return { ...m, replies: [...currentReplies, newReply] };
        }));
        setReplyText('');
        setReplyingToId(null);
      } else {
        const errorData = await response.json();
        // no notifications for reply system per requirement
      }
    } catch (error) {
      // silent failure for reply per requirement
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMessages(nextPage, true);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && !community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Community not found</h2>
          <button
            onClick={() => navigate('/community')}
            className="modern-btn modern-btn-primary"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="content-wrapper">
        {/* Community Header */}
        <div className="modern-card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => navigate('/community')}
                className="text-gray-600 hover:text-black text-xl sm:text-2xl flex-shrink-0"
              >
                <i className="bx bx-arrow-back"></i>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-black truncate">{community.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{community.description}</p>
                <div className="flex items-center space-x-2 sm:space-x-4 mt-1 sm:mt-2 text-xs text-gray-500">
                  <span>{community.memberCount} members</span>
                  <span>•</span>
                  <span>{community.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-xs sm:text-sm text-gray-600">
                {String(community.createdBy._id) === user.id ? 'Creator' : 
                 community.moderators.some(mod => String(mod._id) === user.id) ? 'Moderator' : 'Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="modern-card p-0 overflow-hidden">
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="h-80 sm:h-96 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4"
            onScroll={(e) => {
              if (e.target.scrollTop === 0 && hasMore && !loading) {
                handleLoadMore();
              }
            }}
          >
            {loading && messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <i className="bx bx-message-square-dots text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message._id} className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                    {message.sender.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                      <span className="font-semibold text-black text-xs sm:text-sm">{message.sender.name}</span>
                      <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                      {message.isEdited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                      <p className="text-gray-800 text-xs sm:text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className="flex items-center space-x-3 sm:space-x-4 mt-1 sm:mt-2 text-xs text-gray-500">
                      <button onClick={() => handleStartReply(message._id)} className="hover:text-gray-700 flex items-center space-x-1">
                        <i className="bx bx-reply"></i>
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                      <button className="hover:text-gray-700 flex items-center space-x-1">
                        <i className="bx bx-smile"></i>
                        <span className="hidden sm:inline">React</span>
                      </button>
                      {message.replies && message.replies.length > 0 && (
                        <button
                          onClick={() => setExpandedReplies(prev => ({...prev, [message._id]: !prev[message._id]}))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedReplies[message._id] ? 'Hide' : 'Show'} {message.replies.length} replies
                        </button>
                      )}
                    </div>
                    {/* Replies */}
                    {message.replies && message.replies.length > 0 && expandedReplies[message._id] && (
                      <div className="mt-2 space-y-2">
                        {message.replies.map((r) => (
                          <div key={r._id} className="ml-6 sm:ml-8 bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center text-[10px]">
                                {r.user?.name ? r.user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="text-xs font-semibold text-black">{r.user?.name || 'User'}</span>
                              <span className="text-[10px] text-gray-500">{formatTime(r.createdAt)}</span>
                            </div>
                            <div className="text-xs text-gray-700 whitespace-pre-wrap">{r.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    {replyingToId === message._id && (
                      <form onSubmit={(e) => handleSubmitReply(e, message._id)} className="mt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="modern-input text-xs sm:text-sm"
                          maxLength={500}
                        />
                        <button type="submit" className="modern-btn modern-btn-primary text-xs">Reply</button>
                        <button type="button" onClick={handleCancelReply} className="modern-btn modern-btn-secondary text-xs">Cancel</button>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more messages'}
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-3 sm:p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="modern-input text-sm"
                  maxLength={1000}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="modern-btn modern-btn-primary flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 text-sm"
              >
                <i className="bx bx-send text-base sm:text-lg"></i>
                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityChat;
