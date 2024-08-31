import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function summarizeTranscript(transcript: string): Promise<string> {
  try {
    // Create a new chat model using gemini-1.5-flash-8b-exp-0827
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b-exp-0827" });

    // Prepare the prompt for summarization
    const prompt = `Summarize the following YouTube video transcript concisely and coherently:

${transcript}

Please provide a summary that:
1. Captures the main topics and key points discussed in the video.
2. Highlights any important facts, figures, or statistics mentioned.
3. Identifies the overall purpose or message of the video.
4. Is written in a clear, engaging style that's easy for viewers to understand.
5. Is structured in 3-5 distinct paragraphs, with clear line breaks between them.
6. Each paragraph should focus on a specific aspect or section of the video content.

Your summary should give readers a comprehensive overview of the video's content without needing to watch it in full. Ensure that each paragraph is separated by a blank line for clear formatting.`;

    // Generate the summary
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return summary;
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    throw error;
  }
}