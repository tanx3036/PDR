import {db} from "~/server/db";
import {company, users} from "~/server/db/schema";
import {NextResponse} from "next/server";
import console from "console";
import {eq} from "drizzle-orm";


export async function POST(request: Request) {
    try {
        const {userId, companyName, employerPasskey, employeePasskey, numberOfEmployees} = await request.json();

        // Check if company already exists
        const [existingCompany] = await db
            .select()
            .from(company)
            .where(eq(company.name, companyName));

        if (existingCompany) {
            return NextResponse.json(
                { error: "Company already exists." },
                { status: 400 }
            );
        }


        const [newCompany] = await db
            .insert(company)
            .values({
                name: companyName,
                employerpasskey: employerPasskey,  // MUST match the property name in createTable
                employeepasskey: employeePasskey,  // Ditto
                numberOfEmployees: numberOfEmployees || "0",
            })
            .returning({ id: company.id });


        // @ts-ignore
        const companyId = newCompany.id.toString();


        await db.insert(users).values({
            userId,
            companyId,
            role: "employer",
        });

        return NextResponse.json({ success: true });

    }
    catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error}, { status: 500 });
    }
}



