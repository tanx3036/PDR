import { NextResponse } from "next/server";
import { db } from "../../../server/db/index";
import { company, document } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import * as console from "console";

export async function POST(request: Request) {
    try {
        const { userId, employerPasskey, documentName, documentUrl, documentCategory } = await request.json();

        // 1) Validate the employerPasskey / find the company
        const [existingCompany] = await db
            .select()
            .from(company)
            .where(eq(company.employerpasskey, employerPasskey));

        if (!existingCompany) {
            return NextResponse.json(
                { error: "Invalid employer passkey." },
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
                companyId: existingCompany.id.toString(), // or existingCompany.id if already a string
                // createdAt / updatedAt are handled automatically if your schema defaults are set
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