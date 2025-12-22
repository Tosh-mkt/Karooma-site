import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import karooImage from "@assets/karoo_1766395905884.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatConfig {
  name: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  widgetPosition: string;
  widgetPrimaryColor: string;
  widgetTitle: string;
  isActive: boolean;
}

interface ChatWidgetProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialMessage?: string;
  onInitialMessageSent?: () => void;
}

export function ChatWidget({ 
  isOpen: controlledIsOpen, 
  onOpenChange,
  initialMessage,
  onInitialMessageSent 
}: ChatWidgetProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: config, isLoading: configLoading } = useQuery<ChatConfig>({
    queryKey: ["/api/chatbot/config/public"],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log("[ChatWidget] Sending message:", message, "sessionId:", sessionId);
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error("[ChatWidget] Error response:", errorData);
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && config?.welcomeMessage) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: config.welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, config]);

  useEffect(() => {
    if (isOpen && initialMessage && initialMessage.trim() && messages.length <= 1) {
      const timer = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: "user",
            content: initialMessage,
            timestamp: new Date(),
          },
        ]);
        chatMutation.mutate(initialMessage);
        onInitialMessageSent?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialMessage, messages.length]);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    chatMutation.mutate(userMessage);
  };

  const handleSuggestedQuestion = (question: string) => {
    if (chatMutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: question,
        timestamp: new Date(),
      },
    ]);

    chatMutation.mutate(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (configLoading || !config?.isActive) {
    return null;
  }

  const positionClasses =
    config.widgetPosition === "bottom-left"
      ? "left-4"
      : "right-4";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-20 ${positionClasses} z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}
            data-testid="chat-widget-container"
          >
            <div
              className="flex items-center justify-between px-4 py-3 text-white"
              style={{ backgroundColor: config.widgetPrimaryColor }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{config.name}</h3>
                  <p className="text-xs opacity-80">Online agora</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                data-testid="button-close-chat"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="h-[350px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-indigo-100 dark:bg-indigo-900"
                          : "bg-purple-100 dark:bg-purple-900"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                      }`}
                      data-testid={`message-${message.role}-${message.id}`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {chatMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {messages.length === 1 && config.suggestedQuestions && config.suggestedQuestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Perguntas sugeridas:</p>
                  <div className="flex flex-wrap gap-2">
                    {config.suggestedQuestions.map((question, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        data-testid={`button-suggested-${i}`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-full border-gray-300 dark:border-gray-600"
                  disabled={chatMutation.isPending}
                  data-testid="input-chat-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="rounded-full w-10 h-10 p-0"
                  style={{ backgroundColor: config.widgetPrimaryColor }}
                  data-testid="button-send-message"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                Powered by Karooma AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 ${positionClasses} z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden transition-colors ${isOpen ? 'bg-gray-700' : ''}`}
        style={isOpen ? {} : { padding: 0 }}
        data-testid="button-toggle-chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-white"
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <img 
                src={karooImage} 
                alt="Karoo" 
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
          className={`fixed bottom-6 ${
            config.widgetPosition === "bottom-left" ? "left-20" : "right-20"
          } z-40 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-[200px]`}
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {config.widgetTitle}
          </p>
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rotate-45 ${
              config.widgetPosition === "bottom-left"
                ? "-left-1.5 border-l border-b"
                : "-right-1.5 border-r border-t"
            }`}
          />
        </motion.div>
      )}
    </>
  );
}
