import {db} from "~/server/db";
import {company, users} from "~/server/db/schema";
import {NextResponse} from "next/server";
import console from "console";


export async function POST(request: Request) {
    try {
        const {userId, companyName, employerPasskey, employeePasskey, numberOfEmployees} = await request.json();


        const [newCompany] = await db
            .insert(company)
            .values({
                name: companyName,
                employerpasskey: employerPasskey,  // MUST match the property name in createTable
                employeepasskey: employeePasskey,  // Ditto
                numberOfEmployees: numberOfEmployees || "0",
            })
            .returning({ id: company.id });


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



