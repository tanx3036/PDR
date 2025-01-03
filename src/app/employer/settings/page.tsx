"use client";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import styles from "../../../styles/employersettings.module.css";

const SettingsPage = () => {
    const { user } = useUser();
    const [displayName, setDisplayName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.emailAddresses[0]?.emailAddress || "");

    const handleSave = () => {
        // You can use Clerk’s update user functionality here if needed
        // e.g., user?.update({ firstName, lastName, ... })
        console.log("Saving new user info...");
    };

    return (
        <div className={styles.settingsContainer}>
            <h1 className={styles.settingsTitle}>Settings</h1>

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
                    disabled // Typically you might not let the user edit their main email, or you handle email changes differently
                />
            </div>

            <button onClick={handleSave} className={styles.saveButton}>
                Save
            </button>
        </div>
    );
};

export default SettingsPage;