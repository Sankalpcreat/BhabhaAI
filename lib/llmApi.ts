interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
  }
  
  interface LLMRequest {
    persona: string;            
    conversation: ChatMessage[]; 
  }
  
  interface LLMResponse {
    text: string; 
  }
  
  export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
    try {
      const endpoint = process.env.OLLAMA_ENDPOINT || "http://localhost:11434";
  
      // Format the conversation for Ollama
      let combinedPrompt = `${req.persona}\n\n`;
      req.conversation.forEach(msg => {
        if (msg.role === "user") {
          combinedPrompt += `Human: ${msg.content}\n`;
        } else if (msg.role === "assistant") {
          combinedPrompt += `Assistant: ${msg.content}\n`;
        }
      });
      combinedPrompt += "Assistant:";
  
      console.log("Sending prompt to Ollama:", combinedPrompt);
  
      const response = await fetch(`${endpoint}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2:latest",
          prompt: combinedPrompt,
          stream: false 
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Ollama response:", data);
  
      return { text: data.response || "" };
    } catch (err) {
      console.error("callLLM error:", err);
      return { text: "I apologize, but I'm having trouble responding right now." };
    }
  }
  