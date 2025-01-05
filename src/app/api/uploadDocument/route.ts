import { NextResponse } from "next/server";
import { db } from "../../../server/db/index";
import { company, document,users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";

export async function POST(request: Request) {
    try {
        const { userId, documentName, documentUrl, documentCategory } = await request.json();

        // 1) Find the user in the database
        const [userInfo] = await db
            .select()
            .from(users)
            .where(eq(users.userId, userId));

        if (!userInfo) {
            return NextResponse.json(
                { error: "Invalid user." },
                { status: 400 }
            );
        }

        // 2) Insert new document for the found company
        const [insertedDocument] = await db
            .insert(document)
            .values({
                url: documentUrl,
                category: documentCategory,
                title: documentName,
                companyId: userInfo.companyId, // company that the user works at
            })
            .returning(); // Return the inserted record for confirmation

        // 3) Respond with the newly inserted document
        return NextResponse.json(
            { message: "Document created successfully", document: insertedDocument },
            { status: 201 }
        );

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || error }, { status: 500 });
    }
}