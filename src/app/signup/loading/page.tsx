// app/loading/page.tsx (or wherever your loading page is)
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../server/db/index";
import { users } from "../../../server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function LoadingPage() {
    // 1) Get Clerk's userId server-side
    const { userId } = await auth();
    console.log('Server side Id:' + userId);

    if(!userId) {
        redirect("/");
    }

    // 2) Check if user exists in the DB
    const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.userId, userId));

    // 3) Redirect accordingly
    if (!existingUser) {
        redirect("/signup");
    } else if (existingUser.role === "employer" || existingUser.role === "owner") {
        redirect("/employer/home");
    } else {
        redirect("/employee/documents");
    }

    return null;
}