import { Bot, Send } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { askDashboardBot } from '../services/huggingFaceService';
import { buildChatContext, getRestrictedAnswer, isLikelyInDashboardScope } from '../utils/buildChatContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Chatbot({ iss, people, news }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useLocalStorage('dashboard-chat-messages', [
    {
      role: 'bot',
      content: 'Ask me about the current ISS position, crew, or visible news dashboard data.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const formRef = useRef(null);

  const context = useMemo(() => buildChatContext({ iss, people, news }), [iss, news, people]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isTyping) return;

    const nextMessages = [...messages, { role: 'user', content: question }].slice(-30);
    setMessages(nextMessages);
    setInput('');

    if (!isLikelyInDashboardScope(question)) {
      setMessages([...nextMessages, { role: 'bot', content: getRestrictedAnswer() }].slice(-30));
      return;
    }

    setIsTyping(true);
    const answer = await askDashboardBot({ question, context });
    setMessages([...nextMessages, { role: 'bot', content: answer }].slice(-30));
    setIsTyping(false);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <>
      {!isOpen && (
        <button className="chat-fab" type="button" onClick={() => setIsOpen(true)} aria-label="Open chat">
          <Bot size={24} />
        </button>
      )}
      {isOpen && (
        <aside className="chat-window" aria-label="Dashboard chatbot">
          <div className="chat-header">
            <div>
              <strong>AI Assistant</strong>
            </div>
            <button className="button button-secondary" type="button" onClick={clearChat}>
              Clear
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {isTyping && <div className="chat-message bot typing">Typing...</div>}
          </div>
          <form className="chat-input" onSubmit={sendMessage} ref={formRef}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask from dashboard data only"
              aria-label="Ask chatbot"
            />
            <button className="button button-secondary" type="submit" disabled={isTyping}>
              <Send size={18} />
              Send
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
