import { NextResponse } from "next/server";
import { db } from "../../../../server/db/index";
import { users, company } from "../../../../server/db/schema";
import { and, eq } from "drizzle-orm";

type PostBody = {
    userId: string;
    employeePasskey: string;
    companyName: string;
};

export async function POST(request: Request) {
    try {
        const { userId, employeePasskey, companyName } = (await request.json()) as PostBody;

        // Find company by company name
        const [existingCompany] = await db
            .select()
            .from(company)
            .where(
                and(
                    eq(company.name, companyName),
                    eq(company.employeepasskey, employeePasskey)
                )
            );

        if (!existingCompany) {
            return NextResponse.json(
                { error: "Invalid company name or passkey." },
                { status: 400 }
            );
        }

        // Insert new user
        await db.insert(users).values({
            userId,
            companyId: existingCompany.id.toString(),
            role: "employee",
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}