import Together from "together-ai";

export interface ImageGenerationParams {
    prompt: string;
    steps?: number;
    n?: number;
    width?: number;
    height?: number;
    seed?: number;
}
  
/**
 * Generates an image using Together's FLUX.1-schnell-Free model.
 * Returns a base64 string for the first generated image (or null if fails).
 */
export async function generateImage({
    prompt,
    steps = 4,
    n = 1,
    width = 1024,
    height = 768,
    seed
}: ImageGenerationParams): Promise<string | null> {
    try {
        console.log("Generating image with prompt:", prompt);

        const together = new Together({ 
            apiKey: process.env.TOGETHER_API_KEY || '' 
        });

        const response = await together.images.create({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt,
            width,
            height,
            steps: Math.min(steps, 4),
            n,
            seed,
            response_format: "b64_json"
        });

        console.log("Image API response:", response);

        if (response?.data?.[0]?.b64_json) {
            return response.data[0].b64_json;
        }
        return null;
    } catch (err) {
        console.error("generateImage error:", err);
        return null;
    }
}
  