import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "../../../lib/llmApi";
import { generateImage } from "../../../lib/imageApi";
import { getMemory, setMemory } from "../../../lib/memoryManager";

const generateConsistentImage = async (prompt: string, memoryKey: string) => {
    const memory = getMemory(memoryKey);
    const seed = memory?.seed || Math.floor(Math.random() * 1000000);
    
    const imageBase64 = await generateImage({ 
        prompt,
        steps: 20,
        n: 1,
        width: 1024,
        height: 768,
        seed
    });

    if (imageBase64) {
        setMemory(memoryKey, {
            promptInfo: prompt,
            seed,
            imageUrl: imageBase64
        });
    }
    
    return imageBase64;
};

export async function POST(req: NextRequest) {
  try {
    console.log("API Key available:", !!process.env.TOGETHER_API_KEY);
    const { conversation, persona } = await req.json();

    // Get LLM response first
    const llmResponse = await callLLM({
      persona: persona || "You are a helpful AI assistant.",
      conversation,
    });

    let finalText = llmResponse.text;       
    let imageBase64: string | null = null;  

    // Check if image generation is needed
    const userLastMsg = conversation[conversation.length - 1]?.content?.toLowerCase() || "";
    const combinedText = (userLastMsg + " " + finalText).toLowerCase();
    const wantImage = /show|image|photo|picture|display|generate|create|draw|make/i.test(combinedText);

    if (wantImage) {
      try {
        console.log("Image generation triggered by:", combinedText);
        
        // Extract subject from user message
        const subject = userLastMsg.replace(/show|me|an?|the|image|of|picture|photo/gi, '').trim();
        const prompt = `High quality, detailed image of ${subject}`;
        
        console.log("Using prompt:", prompt);
        imageBase64 = await generateImage({
          prompt,
          steps: 4,
          n: 1,
          width: 1024,
          height: 768
        });

        if (imageBase64) {
          finalText += "\nHere's the image you requested!";
        } else {
          finalText += "\nI apologize, but I couldn't generate the image at this time.";
        }
      } catch (error) {
        console.error("Image generation error:", error);
        finalText += "\nI encountered an error while trying to generate the image.";
      }
    }

    return NextResponse.json({
      text: finalText,
      imageBase64,
    });
  } catch (error: any) {
    console.error("/api/chat error:", error);
    return NextResponse.json({ 
      text: "I apologize, but I encountered an error.",
      error: error.message 
    });
  }
}
