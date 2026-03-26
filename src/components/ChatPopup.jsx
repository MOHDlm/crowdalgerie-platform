import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { X, Minus, Send, MessageCircle } from "lucide-react";

/**
 * ChatPopup Component
 * مكون محادثة منبثق قابل لإعادة الاستخدام
 */
export default function ChatPopup({
  isOpen,
  onClose,
  chatData = {},
  collectionName = "messages",
  welcomeMessage = "",
  autoReplyMessage = "شكراً لرسالتك! سنتواصل معك قريباً.",
  autoReplyDelay = 1000,
}) {
  const [message, setMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      const defaultWelcome =
        welcomeMessage ||
        `مرحباً! ${
          chatData.title
            ? `أنت الآن تتواصل معنا بخصوص "${chatData.title}".`
            : ""
        } كيف يمكننا مساعدتك؟`;

      const welcomeMsg = {
        id: Date.now(),
        text: defaultWelcome,
        sender: "system",
        time: new Date().toLocaleTimeString("ar-DZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages([welcomeMsg]);
    }
  }, [isOpen, chatData.title, welcomeMessage, chatMessages.length]);

  // Mutation to save message to Firebase
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const messagesRef = collection(db, collectionName);
      await addDoc(messagesRef, {
        ...messageData,
        ...(chatData.metadata || {}),
        timestamp: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([collectionName]);
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString("ar-DZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    try {
      await sendMessageMutation.mutateAsync({
        context_id: chatData.id || null,
        context_type: chatData.type || null,
        context_title: chatData.title || null,
        message: message,
        sender: "user",
        status: "pending",
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }

    setMessage("");

    if (autoReplyMessage) {
      setTimeout(() => {
        const systemReply = {
          id: Date.now() + 1,
          text: autoReplyMessage,
          sender: "system",
          time: new Date().toLocaleTimeString("ar-DZ", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prev) => [...prev, systemReply]);
      }, autoReplyDelay);
    }
  };

  const handleClose = () => {
    setChatMessages([]);
    setMessage("");
    setIsMinimized(false);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 z-50 ${
        isMinimized ? "h-16" : "h-[500px]"
      }`}
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          {chatData.icon || <MessageCircle className="w-6 h-6" />}
          <div>
            <h3 className="font-bold text-sm">
              {chatData.title || "محادثة جديدة"}
            </h3>
            {chatData.subtitle && (
              <p className="text-xs opacity-90">{chatData.subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition"
            title={isMinimized ? "تكبير" : "تصغير"}
            type="button"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={handleClose}
            className="hover:bg-white/20 p-1 rounded transition"
            title="إغلاق"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div className="h-[360px] overflow-y-auto p-4 bg-gray-50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none shadow"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition"
                title="إرسال"
                type="button"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

ChatPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  chatData: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    icon: PropTypes.node,
    metadata: PropTypes.object,
  }),
  collectionName: PropTypes.string,
  welcomeMessage: PropTypes.string,
  autoReplyMessage: PropTypes.string,
  autoReplyDelay: PropTypes.number,
};
