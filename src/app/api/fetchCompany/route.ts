import { NextResponse } from "next/server";
import { db } from "../../../server/db/index";
import { company, document,users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";


export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

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

        const companyId = userInfo.companyId;

        const companies = await db
            .select()
            .from(company)
            .where(eq(company.id, companyId));

        // Return as JSON
        return NextResponse.json(companies, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching documents:", error);
        return NextResponse.json(
            { error: "Unable to fetch documents" },
            { status: 500 }
        );
    }
}