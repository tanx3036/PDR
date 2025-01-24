import { NextResponse } from "next/server";
import { db } from "~/server/db/index";
import {users, category, ChatHistory} from "~/server/db/schema";
import { eq } from "drizzle-orm";

type PostBody = {
    userId: string;
    question: string;
    response: string;
};

export async function POST(request: Request) {
    try {
        const { userId, question, response } = (await request.json()) as PostBody;

        // Insert new user
        await db.insert(ChatHistory).values({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            UserId: userId,
            question: question,
            response: response,
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    }
}
