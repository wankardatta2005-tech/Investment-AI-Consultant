import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader, Sparkles } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Hello! I am your AI Strategy Co-Pilot. I can analyze market trends, explain technical signals, or suggest risk adjustments. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await getChatResponse(userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-primary-600 to-accent-600'
        }`}
      >
        {isOpen ? <X className="text-white w-6 h-6" /> : <Sparkles className="text-white w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] z-50 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center mr-3">
               <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">QuantAI Co-Pilot</h3>
              <p className="text-xs text-green-400 flex items-center">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span> Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about strategy or news..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-primary-500 text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-primary-600 rounded-lg text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;