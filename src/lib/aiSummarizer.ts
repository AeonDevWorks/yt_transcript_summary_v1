import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function summarizeTranscript(transcript: string): Promise<string> {
  try {
    // Create a new chat model using gemini-1.5-flash-8b-exp-0827
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b-exp-0827" });

    // Prepare the prompt for summarization
    const prompt = `Summarize the following YouTube video transcript in a concise manner:

${transcript}

Please provide a summary that captures the main points and key ideas discussed in the video.`;

    // Generate the summary
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return summary;
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    throw error;
  }
}