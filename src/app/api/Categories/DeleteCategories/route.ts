import { NextResponse } from "next/server";
import { db } from "../../../../server/db/index";
import {users, company, category, document} from "../../../../server/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        await db.delete(category).where(eq(category.id, id));
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}