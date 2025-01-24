import { NextResponse } from "next/server";
import { db } from "~/server/db/index";
import { ChatHistory } from "~/server/db/schema";
import { eq } from "drizzle-orm";

type PostBody = {
    userId: string;
};

export async function POST(request: Request) {
    try {
        // Parse the request body for userId
        const { userId } = (await request.json()) as PostBody;

        // Retrieve all chat history records for the specified user
        const userChatHistory = await db
            .select()
            .from(ChatHistory)
            .where(eq(ChatHistory.UserId, userId));

        // Return the results
        return NextResponse.json({
            success: true,
            chatHistory: userChatHistory,
        });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}