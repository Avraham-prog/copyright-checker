import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Menu, Image as ImageIcon, Send, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: number;
}

interface Thread {
  id: string;
  name: string;
  messages: Message[];
}

const FormDataSender: React.FC = () => {
  // State for chat threads and current session
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string>('');
  // State for user input text and any attached image
  const [userInput, setUserInput] = useState<string>('');
  const [attachedImageFile, setAttachedImageFile] = useState<File | null>(null);
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  // State for loading indicators
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState<boolean>(false);
  // Track last sent image URL for context
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  // Ref for auto-scrolling
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom (called after new messages or thread switch)
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load threads and active thread from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedThreads = localStorage.getItem('chat_threads');
    const storedActiveId = localStorage.getItem('chat_active_thread_id');
    if (storedThreads) {
      try {
        const parsed: Thread[] = JSON.parse(storedThreads);
        setThreads(parsed);
        if (storedActiveId && parsed.find(t => t.id === storedActiveId)) {
          setCurrentThreadId(storedActiveId);
        } else if (parsed.length > 0) {
          setCurrentThreadId(parsed[0].id);
        }
      } catch {
        // If parsing fails, start fresh
        const newId = 'thread-' + Date.now();
        const initialThread: Thread = { id: newId, name: 'New Chat', messages: [] };
        setThreads([initialThread]);
        setCurrentThreadId(newId);
      }
    } else {
      // No existing threads, initialize one
      const newId = 'thread-' + Date.now();
      const initialThread: Thread = { id: newId, name: 'New Chat', messages: [] };
      setThreads([initialThread]);
      setCurrentThreadId(newId);
    }
  }, []);

  // Save threads to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_threads', JSON.stringify(threads));
    }
  }, [threads]);

  // Save active thread id to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined' && currentThreadId) {
      localStorage.setItem('chat_active_thread_id', currentThreadId);
    }
  }, [currentThreadId]);

  // Auto-scroll to bottom when threads or current thread change (new message or switch)
  useEffect(() => {
    scrollToBottom();
  }, [threads, currentThreadId]);

  // Handle image file selection
  const handleSelectImage = (file: File) => {
    // Validate type and size (JPEG, PNG, GIF under 5MB)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image (JPEG, PNG, or GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be under 5MB.');
      return;
    }
    setAttachedImageFile(file);
    setPreviewImageUrl(URL.createObjectURL(file)); // show local preview
    // Upload to Cloudinary
    uploadImageToCloudinary(file);
  };

  // Upload image to Cloudinary and get secure URL
  const uploadImageToCloudinary = async (file: File) => {
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      console.error('Cloudinary configuration missing');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setAttachedImageUrl(data.secure_url);
      } else {
        console.error('Cloudinary upload failed:', data);
        alert('Image upload failed. Please try again.');
        // Clear the attachment preview on failure
        setAttachedImageFile(null);
        setPreviewImageUrl(null);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  // Send a message (text and/or image) to the chat
  const handleSendMessage = async () => {
    if (isUploading || isLoadingResponse) return; // prevent sending during upload or while waiting for response
    const text = userInput.trim();
    if (!text && !attachedImageUrl) {
      return; // don't send empty messages (unless an image is attached)
    }
    if (!currentThreadId) return;
    // Prepare the new user message object
    const newMessageId = 'msg-' + Date.now();
    const userMsgImage = attachedImageUrl || undefined;
    const userMessage: Message = {
      id: newMessageId,
      role: 'user',
      content: text,
      imageUrl: userMsgImage,
      timestamp: Date.now(),
    };
    // Prepare a placeholder assistant message (for loading indicator)
    const placeholderId = 'msg-' + (Date.now() + 1);
    const placeholderMsg: Message = {
      id: placeholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    // Update state: add user message and placeholder to current thread
    setThreads(prevThreads => prevThreads.map(thread => {
      if (thread.id !== currentThreadId) return thread;
      const isFirstMessage = thread.messages.length === 0;
      const updatedName = isFirstMessage
        ? (text ? text.substring(0, 20) : '[Image]')
        : thread.name;
      return {
        ...thread,
        name: updatedName,
        messages: [...thread.messages, userMessage, placeholderMsg],
      };
    }));
    // Update lastImageUrl context if an image was sent
    if (userMsgImage) {
      setLastImageUrl(userMsgImage);
    }
    // Clear the input and attached image state for next message
    setUserInput('');
    setAttachedImageFile(null);
    setAttachedImageUrl(null);
    setPreviewImageUrl(null);
    // Indicate loading (assistant is "typing")
    setIsLoadingResponse(true);

    try {
      // Build the payload for server: include text, image (if any), and full history
      const currentThreadMessages = threads.find(t => t.id === currentThreadId)?.messages || [];
      const history = [...currentThreadMessages, userMessage];
      const imageToSend = userMsgImage ? userMsgImage : lastImageUrl;
      const payload = {
        text: text,
        image: imageToSend || null,
        history: history,
      };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      const assistantText = data.answer || '';
      // Update the placeholder message with the actual assistant response
      setThreads(prevThreads => prevThreads.map(thread => {
        if (thread.id !== currentThreadId) return thread;
        return {
          ...thread,
          messages: thread.messages.map(msg =>
            msg.id === placeholderId ? { ...msg, content: assistantText } : msg
          ),
        };
      }));
    } catch (error) {
      console.error('Error fetching assistant response:', error);
      // If an error occurs, replace placeholder with an error message
      setThreads(prevThreads => prevThreads.map(thread => {
        if (thread.id !== currentThreadId) return thread;
        return {
          ...thread,
          messages: thread.messages.map(msg =>
            msg.id === placeholderId ? { ...msg, content: '❗ Error: could not get response.' } : msg
          ),
        };
      }));
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Start a brand new chat thread
  const handleNewChat = () => {
    const newId = 'thread-' + Date.now();
    const newThread: Thread = { id: newId, name: 'New Chat', messages: [] };
    setThreads(prev => [...prev, newThread]);
    setCurrentThreadId(newId);
  };

  // Remove the currently attached image (if user decides to cancel before sending)
  const removeAttachedImage = () => {
    if (isUploading) {
      return; // (Optional) we could abort the upload here if we implemented AbortController
    }
    setAttachedImageFile(null);
    setAttachedImageUrl(null);
    setPreviewImageUrl(null);
  };

  const currentThread = threads.find(t => t.id === currentThreadId);

  return (
    <div className="flex h-screen">
      {/* Sidebar (thread list) for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:h-full bg-gray-800 text-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button variant="ghost" size="icon" onClick={handleNewChat}>
            +
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => setCurrentThreadId(thread.id)}
              className={`px-4 py-2 text-sm cursor-pointer truncate ${
                thread.id === currentThreadId ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              {thread.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="flex flex-col flex-1 h-full">
        {/* Top bar for mobile (hamburger + title) */}
        <div className="flex md:hidden items-center justify-between p-4 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <h2 className="text-lg font-semibold mb-3">Chats</h2>
              <SheetClose asChild>
                <Button className="w-full mb-2" onClick={handleNewChat}>
                  New Chat
                </Button>
              </SheetClose>
              {threads.map(thread => (
                <SheetClose asChild key={thread.id}>
                  <div
                    onClick={() => setCurrentThreadId(thread.id)}
                    className={`px-3 py-2 rounded cursor-pointer text-sm truncate ${
                      thread.id === currentThreadId ? 'bg-gray-300 font-medium' : 'hover:bg-gray-100'
                    }`}
                  >
                    {thread.name}
                  </div>
                </SheetClose>
              ))}
            </SheetContent>
          </Sheet>
          <h2 className="text-base font-semibold">Chat</h2>
        </div>

        {/* Messages display area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {currentThread && currentThread.messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isAssistant = msg.role === 'assistant';
            const isLast = idx === currentThread.messages.length - 1;
            const isTypingIndicator = isAssistant && msg.content === '' && isLoadingResponse && isLast;
            return (
              <div key={msg.id} className={`mb-3 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`rounded px-3 py-2 max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'bg-blue-100 text-gray-900' : 'bg-gray-100 text-gray-900'}`}>
                  {/* If message contains an image, show it */}
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="uploaded" className="mb-2 rounded" />
                  )}
                  {/* Message text or typing indicator */}
                  {isTypingIndicator ? (
                    <div className="flex space-x-1">
                      <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
                <span className={`mt-1 text-xs text-gray-500 ${isUser ? 'self-end' : 'self-start'}`}>
                  {isUser ? 'You' : 'Assistant'} • {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
          {/* Anchor element for auto-scroll */}
          <div ref={bottomRef}></div>
        </div>

        {/* Message input area */}
        <div className="border-t p-4 flex items-center space-x-2">
          {/* Image upload button (hidden file input) */}
          <input 
            id="chat-image-input" 
            type="file" 
            accept="image/*" 
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleSelectImage(file);
            }}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => document.getElementById('chat-image-input')?.click()} 
            disabled={isLoadingResponse}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          {/* Image preview thumbnail (if an image is attached but not sent yet) */}
          {previewImageUrl && (
            <div className="relative">
              <img src={previewImageUrl} alt="preview" className="w-10 h-10 object-cover rounded" />
              <button 
                onClick={removeAttachedImage} 
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {/* Text input for the message */}
          <Input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1" 
            value={userInput} 
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoadingResponse}
          />
          {/* Send button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={isLoadingResponse || isUploading}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormDataSender;
