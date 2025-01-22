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
    const [displayName, setDisplayName] = useState(user?.fullName ?? "");
    const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress ?? "");

    // New fields
    const [companyName, setCompanyName] = useState("");
    const [employerPasskey, setEmployerPasskey] = useState("");
    const [employeePasskey, setEmployeePasskey] = useState("");
    const [staffCount, setStaffCount] = useState("");

    // --------------------------------------------------------------------------
    // Popup (Modal) Management
    // --------------------------------------------------------------------------
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [redirectPath, setRedirectPath] = useState("");

    // A helper to show a popup without redirect
    const showPopup = (message:string) => {
        setPopupMessage(message);
        setRedirectPath("");
        setPopupVisible(true);
    };

    // A helper to show a popup *and* redirect after closing
    const showPopupAndRedirect = (message:string, path:string) => {
        setPopupMessage(message);
        setRedirectPath(path);
        setPopupVisible(true);
    };

    // Called when user clicks "OK" on the popup
    const handlePopupClose = () => {
        setPopupVisible(false);

        // If a redirect path was set, redirect after closing the popup
        if (redirectPath) {
            router.push(redirectPath);
        }
    };
    // --------------------------------------------------------------------------

    useEffect(() => {
        if (!isLoaded) return;

        if (!userId) {
            // Show popup and redirect home
            showPopupAndRedirect("Authentication failed! No user found.", "/");
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
                if(response.status === 300){
                    router.push("/employee/pending-approval");
                    return;
                }
                else if (!response.ok) {
                    // If the endpoint returns an error, also redirect
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

                const rawData:unknown = await companyResponse.json();

                if (typeof rawData !== "object") {
                    throw new Error("Invalid response from server");
                }
                const data = rawData as { data: { name: string; employerpasskey: string; employeepasskey: string; numberOfEmployees: string }[] };

                if(data.data.length === 0) {
                    throw new Error("No company data found");
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/ban-ts-comment
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                setCompanyName(data[0].name || "");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/ban-ts-comment
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                setEmployerPasskey(data[0].employerpasskey || "");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/ban-ts-comment
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                setEmployeePasskey(data[0].employeepasskey || "");
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/ban-ts-comment
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                setStaffCount(data[0].numberOfEmployees || "");
                setDisplayName(user?.fullName ?? "");
                setEmail(user?.emailAddresses[0]?.emailAddress ?? "");

            } catch (error) {
                console.error(
                    "Error checking employer role or fetching company info:",
                    error
                );
                showPopupAndRedirect("Something went wrong. Redirecting you home.", "/");
            } finally {
                setLoading(false);
            }
        };

        checkEmployerAndFetchCompany().catch(console.error);
    }, [isLoaded, userId, router, user?.fullName, user?.emailAddresses]);

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
            showPopup("Company settings saved!");
        } catch (error) {
            console.error(error);
            showPopup("Failed to update settings. Please try again.");
        } finally {
            setIsSaving(false);
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

            {/* ------------------------------------------------------------------
          Custom Popup (Modal)
      ------------------------------------------------------------------ */}
            {popupVisible && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <p>{popupMessage}</p>
                        <button className={styles.popupButton} onClick={handlePopupClose}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;