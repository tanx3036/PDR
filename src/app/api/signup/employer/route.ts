import { NextResponse } from "next/server";
import { db } from "../../../../server/db/index";
import { users, company } from "../../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";


export async function POST(request: Request) {
    try {
        const {userId, employerPasskey} = await request.json();

        let companyId: string;
        const [existingCompany] = await db
            .select()
            .from(company)
            .where(eq(company.employerpasskey, employerPasskey));

        if (!existingCompany) {
            return NextResponse.json(
                {error: "Invalid fetchDocument passkey."},
                {status: 400}
            );
        }

        // eslint-disable-next-line prefer-const
        companyId = existingCompany.id.toString();

        await db.insert(users).values({
            userId,
            companyId,
            role: "employer",
        });

    }
    catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error}, { status: 500 });
    }
}