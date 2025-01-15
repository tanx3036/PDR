import { NextResponse } from 'next/server';
import { db } from "../../../server/db/index";
import { document } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";

type PostBody = {
    docId: string;
};

export async function DELETE(request: Request) {
    try {
        const { docId } = (await request.json()) as PostBody;

        await db.delete(document).where(eq(document.id, Number(docId)));

        // Return a success response
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Error deleting document' }, { status: 500 });
    }
}