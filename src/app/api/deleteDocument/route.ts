import { NextResponse } from 'next/server';
import { db } from "../../../server/db/index";
import { company, document, users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";


export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { docId } = body;

        await db.delete(document).where(eq(document.id, docId));

        // Return a success response
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Error deleting document' }, { status: 500 });
    }
}