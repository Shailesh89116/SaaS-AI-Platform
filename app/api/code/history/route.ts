import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { getChatHistory } from "@/lib/redis";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const history = await getChatHistory(userId);
    return NextResponse.json(history);

  } catch (error) {
    console.log('[CODE_HISTORY_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 