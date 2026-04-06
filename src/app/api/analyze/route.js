import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageUrl, expectedKeywords, prompt } = body;
    const userPrompt = prompt?.trim() || "What is in this image? Be precise.";

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content ?? "";

    // Accuracy check: does the response include any expected keywords?
    let accuracy = false;
    if (Array.isArray(expectedKeywords) && expectedKeywords.length > 0) {
      const lowerResponse = response.toLowerCase();
      accuracy = expectedKeywords.some((kw) =>
        lowerResponse.includes(kw.trim().toLowerCase())
      );
    }

    return NextResponse.json({ response, accuracy });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
