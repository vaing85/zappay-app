// AI Chatbot Service for Contact Support
// This service provides AI-powered customer support through chat interface

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  suggestions?: string[];
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  name: string;
  url: string;
  size?: number;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'escalated';
  category: 'general' | 'technical' | 'billing' | 'security' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedAgent?: string;
  tags: string[];
}

export interface ChatbotResponse {
  message: string;
  suggestions: string[];
  category: string;
  confidence: number;
  requiresHuman: boolean;
  nextAction?: string;
  attachments?: ChatAttachment[];
}

class ChatbotService {
  private sessions: Map<string, ChatSession> = new Map();
  private currentSessionId: string | null = null;

  // Initialize a new chat session
  createSession(userId?: string): ChatSession {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      status: 'active',
      category: 'general',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    // Add welcome message
    this.addMessage(sessionId, {
      id: `msg_${Date.now()}`,
      type: 'bot',
      content: "👋 Hi! I'm your ZapPay AI assistant. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        "How do I send money?",
        "I can't log in",
        "How do I set up payments?",
        "I need help with my account",
        "How do I contact support?"
      ]
    });

    return session;
  }

  // Get current session
  getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) return null;
    return this.sessions.get(this.currentSessionId) || null;
  }

  // Add a message to the session
  addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date()
    };

    session.messages.push(newMessage);
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    return newMessage;
  }

  // Process user message and generate AI response
  async processMessage(sessionId: string, userMessage: string): Promise<ChatbotResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    // Add user message
    this.addMessage(sessionId, {
      type: 'user',
      content: userMessage
    });

    // Analyze the message and generate response
    const response = await this.generateAIResponse(userMessage, session);
    
    // Add bot response
    this.addMessage(sessionId, {
      type: 'bot',
      content: response.message,
      suggestions: response.suggestions,
      attachments: response.attachments
    });

    // Update session category and priority based on response
    if (response.category !== 'general') {
      session.category = response.category as any;
    }
    if (response.requiresHuman) {
      session.priority = 'high';
      session.status = 'escalated';
    }

    return response;
  }

  // Generate AI response based on user message
  private async generateAIResponse(userMessage: string, session: ChatSession): Promise<ChatbotResponse> {
    const message = userMessage.toLowerCase();
    
    // Payment-related queries
    if (message.includes('send money') || message.includes('transfer') || message.includes('payment')) {
      return {
        message: "💸 To send money with ZapPay:\n\n1. Tap 'Send Money' on the dashboard\n2. Enter the recipient's email or phone\n3. Enter the amount\n4. Add a note (optional)\n5. Confirm the transaction\n\nYou can also use QR codes for quick payments!",
        suggestions: [
          "How do I use QR codes?",
          "What are the limits?",
          "How long does it take?",
          "Can I cancel a payment?"
        ],
        category: 'general',
        confidence: 0.9,
        requiresHuman: false
      };
    }

    // Login issues
    if (message.includes('login') || message.includes('can\'t log in') || message.includes('password')) {
      return {
        message: "🔐 Having trouble logging in? Here are some solutions:\n\n1. Check your email/phone number\n2. Try 'Forgot Password' to reset\n3. Make sure you're using the correct app\n4. Check your internet connection\n\nIf you're still having issues, I can escalate this to our support team.",
        suggestions: [
          "Reset my password",
          "I don't have an account",
          "My account is locked",
          "Contact support"
        ],
        category: 'technical',
        confidence: 0.8,
        requiresHuman: false
      };
    }

    // Account setup
    if (message.includes('setup') || message.includes('account') || message.includes('register')) {
      return {
        message: "📱 Setting up your ZapPay account is easy:\n\n1. Download the app or visit zappay.site\n2. Tap 'Sign Up'\n3. Enter your email and phone\n4. Verify your identity\n5. Add a payment method\n6. Start sending money!\n\nNeed help with any specific step?",
        suggestions: [
          "How do I verify my identity?",
          "What payment methods work?",
          "Is my information secure?",
          "How do I add money?"
        ],
        category: 'general',
        confidence: 0.9,
        requiresHuman: false
      };
    }

    // Security concerns
    if (message.includes('security') || message.includes('hack') || message.includes('fraud') || message.includes('scam')) {
      return {
        message: "🛡️ Security is our top priority! Here's how we protect you:\n\n• End-to-end encryption for all transactions\n• Two-factor authentication\n• Real-time fraud detection\n• Secure payment processing\n• Regular security audits\n\nIf you suspect fraud, contact us immediately!",
        suggestions: [
          "I think I was scammed",
          "How do I enable 2FA?",
          "Is my data safe?",
          "Report suspicious activity"
        ],
        category: 'security',
        confidence: 0.9,
        requiresHuman: false
      };
    }

    // Billing and fees
    if (message.includes('fee') || message.includes('cost') || message.includes('billing') || message.includes('charge')) {
      return {
        message: "💰 ZapPay fees are simple and transparent:\n\n• Personal transfers: FREE\n• Business payments: 2.9% + $0.30\n• International transfers: 1% fee\n• Instant transfers: $0.50\n• Standard transfers: FREE\n\nAll fees are clearly shown before you confirm any transaction.",
        suggestions: [
          "What about international fees?",
          "How do I avoid fees?",
          "Why was I charged?",
          "View my transaction history"
        ],
        category: 'billing',
        confidence: 0.9,
        requiresHuman: false
      };
    }

    // Feature requests
    if (message.includes('feature') || message.includes('request') || message.includes('suggestion') || message.includes('improvement')) {
      return {
        message: "💡 We love hearing from our users! Your feedback helps us improve ZapPay.\n\nYou can:\n• Submit feature requests through the app\n• Join our beta program\n• Follow us for updates\n• Contact our product team\n\nWhat feature would you like to see?",
        suggestions: [
          "How do I join the beta?",
          "Submit a feature request",
          "What's coming next?",
          "Contact product team"
        ],
        category: 'feature_request',
        confidence: 0.8,
        requiresHuman: false
      };
    }

    // General help
    if (message.includes('help') || message.includes('support') || message.includes('contact')) {
      return {
        message: "🤝 I'm here to help! You can:\n\n• Ask me specific questions\n• Browse our help center\n• Contact our support team\n• Check our FAQ\n• Report issues\n\nWhat would you like to know about ZapPay?",
        suggestions: [
          "Browse help center",
          "Contact support team",
          "Check FAQ",
          "Report an issue"
        ],
        category: 'general',
        confidence: 0.7,
        requiresHuman: false
      };
    }

    // Default response for unrecognized queries
    return {
      message: "I understand you're looking for help. Let me connect you with the right information.\n\nCould you be more specific about what you need help with? I can assist with:\n• Sending and receiving money\n• Account setup and security\n• Billing and fees\n• Technical issues\n• Feature requests",
      suggestions: [
        "How do I send money?",
        "I can't log in",
        "Account security",
        "Contact human support"
      ],
      category: 'general',
      confidence: 0.5,
      requiresHuman: false
    };
  }

  // Get session history
  getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }

  // Close session
  closeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'resolved';
      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  // Escalate to human support
  escalateToHuman(sessionId: string, reason: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'escalated';
      session.priority = 'high';
      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);

      // Add escalation message
      this.addMessage(sessionId, {
        type: 'bot',
        content: `🔄 I've escalated your request to our human support team. Reason: ${reason}\n\nOur support team will contact you within 24 hours. In the meantime, you can continue chatting with me for other questions.`,
        suggestions: [
          "What's my ticket number?",
          "How long will it take?",
          "Can I add more details?",
          "Continue with other questions"
        ]
      });
    }
  }

  // Get all sessions for a user
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  // Clear all sessions (for testing)
  clearAllSessions(): void {
    this.sessions.clear();
    this.currentSessionId = null;
  }
}

export const chatbotService = new ChatbotService();
