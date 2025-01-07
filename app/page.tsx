"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageBase64?: string;
  timestamp?: number;
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [persona] = useState(
    "You are Rancho from 3 Idiots movie. You are creative, intelligent, and have a unique perspective on education. You love engineering and innovation. Respond in character and generate images when appropriate."
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    try {
        setIsLoading(true);
        const newUserMsg: Message = { 
          role: "user", 
          content: input,
          timestamp: Date.now()
        };
        const updated = [...messages, newUserMsg];
        setMessages(updated);
        setInput("");

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation: updated, persona }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            throw new Error(data.error || `HTTP error! status: ${res.status}`);
        }

        const newAssistantMsg: Message = {
            role: "assistant",
            content: data.text,
            imageBase64: data.imageBase64,
            timestamp: Date.now()
        };

        setMessages([...updated, newAssistantMsg]);
    } catch (error) {
        console.error("Chat error:", error);
        setMessages([...messages, {
            role: "assistant",
            content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Chat with Rancho
        </h1>
        
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6 border border-gray-700">
          <div className="space-y-6 mb-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`max-w-[80%] ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-700 text-gray-100"
                } rounded-2xl px-6 py-4 shadow-lg`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${msg.role === "user" ? "bg-blue-500" : "bg-gray-600"}`}>
                      <span className="text-white text-sm font-medium">
                        {msg.role === "user" ? "You" : "R"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                      {msg.imageBase64 && (
                        <div className="mt-4">
                          <Image
                            src={`data:image/png;base64,${msg.imageBase64}`}
                            alt="Generated"
                            width={400}
                            height={300}
                            className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                          />
                        </div>
                      )}
                      {msg.timestamp && (
                        <p className="text-xs opacity-50 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animation-delay-400"></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 bg-gray-900 p-3 rounded-xl">
            <input
              type="text"
              className="flex-1 bg-gray-800 text-white p-4 rounded-lg border border-gray-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Rancho anything..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium text-white transition-colors duration-200
                ${isLoading 
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
