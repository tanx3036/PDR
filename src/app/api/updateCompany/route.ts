import { NextResponse } from "next/server";
import { db } from "../../../server/db/index";
import { company, document,users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";


export async function POST(request: Request) {
    try {
        const { userId, name, employerPasskey, employeePasskey, numberOfEmployees  } = await request.json();

        /*
                    userId,
                    name: companyName,
                    employerPasskey,
                    employeePasskey,
                    numberOfEmployees: staffCount,
         */

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

        const [updatedCompany] = await db
            .update(company)                        // 1) switch from .insert() to .update()
            .set({                                  // 2) .values(...) becomes .set(...)
                name: name,
                employerpasskey: employerPasskey,
                employeepasskey: employeePasskey,
                numberOfEmployees: numberOfEmployees ?? '0',
            })
            .where(eq(company.id, companyId))  // 3) specify which row to update
            .returning({ id: company.id });         // optionally return specific columns

        // Return as JSON
        return NextResponse.json( { status: 200 });
    } catch (error: any) {
        console.error("Error fetching documents:", error);
        return NextResponse.json(
            { error: "Unable to fetch documents" },
            { status: 500 }
        );
    }
}