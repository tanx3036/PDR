"use client";
import React, {useEffect, useState} from "react";
import {useAuth, useUser} from "@clerk/nextjs";
import styles from "../../../styles/employersettings.module.css";
import {Brain, Home} from "lucide-react";
import {useRouter} from "next/navigation";
import LoadingPage from "~/app/_components/loading";

const SettingsPage = () => {
    const router = useRouter();

    //check if authorized. If not authorized as employer, return home
    const { isLoaded, userId } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        // If there is no user at all, send them home
        if (!userId) {
            window.alert("Authentication failed! No user found.");
            router.push("/");
            return;
        }

        // Check if the user’s role is employer
        const checkEmployerRole = async () => {
            try {
                const response = await fetch("/api/employerAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    // If the endpoint returns an error, also redirect
                    window.alert("Authentication failed! You are not an employer.");
                    router.push("/");
                    return;
                }

            } catch (error) {
                console.error("Error checking employer role:", error);
                // If there is any error, also redirect or handle appropriately
                window.alert("Authentication failed! You are not an employer.");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        checkEmployerRole();
    }, [userId, router]);




    const { user } = useUser();

    // Existing fields (from Clerk user)
    const [displayName, setDisplayName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(
        user?.emailAddresses[0]?.emailAddress || ""
    );

    // New fields you want to manage
    const [companyName, setCompanyName] = useState("");
    const [employerPasskey, setEmployerPasskey] = useState("");
    const [employeePasskey, setEmployeePasskey] = useState("");
    const [staffCount, setStaffCount] = useState("");

    const handleSave = async () => {
        try {
            // Example: call your API route to save in the database
            const response = await fetch("/api/settings/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    displayName,
                    email,
                    companyName,
                    employerPasskey,
                    employeePasskey,
                    staffCount,
                }),
            });

            if (!response.ok) {
                throw new Error("Error updating settings");
            }

            // Optionally, handle success (e.g., show a success message, etc.)
            console.log("Settings updated successfully");
        } catch (error) {
            // Handle error (e.g., display a toast or message)
            console.error(error);
        }
    };

    if(loading){
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

                {/*
          --------------------------------------------------
          Existing Fields
          --------------------------------------------------
      */}
                <div className={styles.formGroup}>
                    <label htmlFor="displayName" className={styles.label}>
                        Display Name
                    </label>
                    <input
                        id="displayName"
                        type="text"
                        className={styles.input}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
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
                        onChange={(e) => setEmail(e.target.value)}
                        disabled // Typically you might not let the user change the main email here
                    />
                </div>

                {/*
          --------------------------------------------------
          New Fields
          --------------------------------------------------
      */}
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

                <button onClick={handleSave} className={styles.saveButton}>
                    Save
                </button>
            </div>


        </div>




    );
};

export default SettingsPage;