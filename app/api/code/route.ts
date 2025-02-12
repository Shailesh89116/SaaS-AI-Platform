import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

import { checkSubscription } from "@/lib/subscription";
import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";
import { getChatHistory, updateChatHistory } from "@/lib/redis";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const instructionMessage = {
  role: "system",
  content: "You are a code generator. You must answer only in markdown code snippets. Use code comments for explanations."
};

export async function POST(
  req: Request
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.GROQ_API_KEY) {
      return new NextResponse("Groq API Key not configured.", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
    }

    // Get previous chat history
    const chatHistory = await getChatHistory(userId);
    
    // Combine system message, chat history, and new messages
    const fullMessages = [
      instructionMessage,
      ...chatHistory,
      ...messages
    ];

    const response = await groq.chat.completions.create({
      messages: fullMessages,
      model: "mixtral-8x7b-32768",
    });

    // Update chat history with new messages
    await updateChatHistory(userId, [...chatHistory, ...messages, response.choices[0].message]);

    if (!isPro) {
      await incrementApiLimit();
    }

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log('[CODE_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
