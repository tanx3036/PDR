"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, Building, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/employeesignin.module.css";

interface SignInData {
    companyName: string;
    employeePasscode: string;
}

interface SignInErrors {
    companyName?: string;
    employeePasscode?: string;
}

const EmployeeSignIn: React.FC = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Sign-in form state
    const [signInData, setSignInData] = useState<SignInData>({
        companyName: "",
        employeePasscode: "",
    });

    // Error state
    const [signInErrors, setSignInErrors] = useState<SignInErrors>({});

    // Handle sign-in input changes
    const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignInData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (signInErrors[name as keyof SignInErrors]) {
            setSignInErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Validate and submit sign-in form
    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();

        const errors: SignInErrors = {};

        if (!signInData.companyName.trim()) {
            errors.companyName = "Company name is required";
        }
        if (!signInData.employeePasscode.trim()) {
            errors.employeePasscode = "Employee passcode is required";
        }

        setSignInErrors(errors);

        if (Object.keys(errors).length === 0) {
            // Handle sign-in logic (e.g. call API)
            console.log("Employee signing in with:", signInData);

            // On success, redirect or route accordingly
            // For now, let's just route to a placeholder
            router.push("/employee/documents");
        }
    };

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logoContainer}>
                        <Brain className={styles.logoIcon} />
                        <span className={styles.logoText}>PDR AI</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>Employee Sign In</h1>
                    <p className={styles.subtitle}>Access your employee account below</p>

                    <form onSubmit={handleSignIn} className={styles.form}>
                        {/* Company Name */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Company Name</label>
                            <div className={styles.inputWrapper}>
                                <Building className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="companyName"
                                    value={signInData.companyName}
                                    onChange={handleSignInChange}
                                    className={styles.input}
                                    placeholder="Enter company name"
                                />
                            </div>
                            {signInErrors.companyName && (
                                <span className={styles.error}>{signInErrors.companyName}</span>
                            )}
                        </div>

                        {/* Employee Passcode */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Employee Passcode</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="employeePasscode"
                                    value={signInData.employeePasscode}
                                    onChange={handleSignInChange}
                                    className={styles.input}
                                    placeholder="Enter employee passcode"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className={styles.eyeIcon} />
                                    ) : (
                                        <Eye className={styles.eyeIcon} />
                                    )}
                                </button>
                            </div>
                            {signInErrors.employeePasscode && (
                                <span className={styles.error}>{signInErrors.employeePasscode}</span>
                            )}
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Sign In
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EmployeeSignIn;