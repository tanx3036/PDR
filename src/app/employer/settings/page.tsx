"use client";
import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import styles from "../../../styles/employersettings.module.css";
import { Brain, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingPage from "~/app/_components/loading";

const SettingsPage = () => {
    const router = useRouter();

    // Clerk Auth
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();

    // Loading state for page data
    const [loading, setLoading] = useState(true);

    // Saving state for the form submission
    const [isSaving, setIsSaving] = useState(false);

    // Existing fields (from Clerk user)
    const [displayName, setDisplayName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress || "");
    console.log(user);

    // New fields
    const [companyName, setCompanyName] = useState("");
    const [employerPasskey, setEmployerPasskey] = useState("");
    const [employeePasskey, setEmployeePasskey] = useState("");
    const [staffCount, setStaffCount] = useState("");

    useEffect(() => {
        if (!isLoaded) return;

        if (!userId) {
            window.alert("Authentication failed! No user found.");
            router.push("/");
            return;
        }

        // Check the employer role, then fetch the company's data
        const checkEmployerAndFetchCompany = async () => {
            try {
                // 1) Verify the user is an employer
                const response = await fetch("/api/employerAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    window.alert("Authentication failed! You are not an employer.");
                    router.push("/");
                    return;
                }

                // 2) Fetch company info
                const companyResponse = await fetch("/api/fetchCompany", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!companyResponse.ok) {
                    throw new Error("Failed to fetch company info");
                }

                const data = await companyResponse.json();

                setCompanyName(data[0].name || "");
                setEmployerPasskey(data[0].employerpasskey || "");
                setEmployeePasskey(data[0].employeepasskey || "");
                setStaffCount(data[0].numberOfEmployees || "");
                setDisplayName(user?.fullName || "");
                setEmail(user?.emailAddresses[0]?.emailAddress || "");

            } catch (error) {
                console.error("Error checking employer role or fetching company info:", error);
                window.alert("Something went wrong. Redirecting you home.");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        checkEmployerAndFetchCompany();
    }, [isLoaded, userId, router]);

    // Save handler
    const handleSave = async () => {
        setIsSaving(true); // Start saving

        try {
            const response = await fetch("/api/updateCompany", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    name: companyName,
                    employerPasskey,
                    employeePasskey,
                    numberOfEmployees: staffCount,
                }),
            });

            if (!response.ok) {
                throw new Error("Error updating settings");
            }

            console.log("Settings updated successfully");
            window.alert("Company settings saved!");
        } catch (error) {
            console.error(error);
            window.alert("Failed to update settings. Please try again.");
        } finally {
            setIsSaving(false); // End saving
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className={styles.container}>
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logoWrapper}>
                        <Brain className={styles.logoIcon} />
                        <span className={styles.logoText}>PDR AI</span>
                    </div>
                    <button
                        onClick={() => router.push("/employer/home")}
                        className={styles.homeButton}
                    >
                        <Home className={styles.homeIcon} />
                        Home
                    </button>
                </div>
            </nav>

            <div className={styles.settingsContainer}>
                <h1 className={styles.settingsTitle}>Settings</h1>

                {/* --------------------------------------------------
                    Existing Fields
                -------------------------------------------------- */}
                <div className={styles.formGroup}>
                    <label htmlFor="displayName" className={styles.label}>
                        Display Name
                    </label>
                    <input
                        id="displayName"
                        type="text"
                        className={styles.input}
                        value={displayName}
                        disabled
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={styles.input}
                        value={email}
                        disabled // Typically, the main email wouldn't be changed here
                    />
                </div>

                {/* --------------------------------------------------
                    New Fields
                -------------------------------------------------- */}
                <div className={styles.formGroup}>
                    <label htmlFor="companyName" className={styles.label}>
                        Company Name
                    </label>
                    <input
                        id="companyName"
                        type="text"
                        className={styles.input}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="employerPasskey" className={styles.label}>
                        Employer Passkey
                    </label>
                    <input
                        id="employerPasskey"
                        type="text"
                        className={styles.input}
                        value={employerPasskey}
                        onChange={(e) => setEmployerPasskey(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="employeePasskey" className={styles.label}>
                        Employee Passkey
                    </label>
                    <input
                        id="employeePasskey"
                        type="text"
                        className={styles.input}
                        value={employeePasskey}
                        onChange={(e) => setEmployeePasskey(e.target.value)}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="staffCount" className={styles.label}>
                        Number of Staff
                    </label>
                    <input
                        id="staffCount"
                        type="number"
                        className={styles.input}
                        value={staffCount}
                        onChange={(e) => setStaffCount(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSave}
                    className={styles.saveButton}
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;