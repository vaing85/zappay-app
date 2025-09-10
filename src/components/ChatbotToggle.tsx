import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Chatbot from './Chatbot';

interface ChatbotToggleProps {
  userId?: string;
  className?: string;
}

const ChatbotToggle: React.FC<ChatbotToggleProps> = ({ userId, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${className}`}
        aria-label="Open AI Assistant"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Chatbot Modal */}
      <Chatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
      />
    </>
  );
};

export default ChatbotToggle;
