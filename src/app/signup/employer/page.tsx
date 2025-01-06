"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Eye, EyeOff, Building, Brain, Lock, Users } from "lucide-react";
// Import your CSS Module (with Tailwind's @apply rules)
import styles from "../../../styles/EmployerSignup.module.css";

interface SignUpFormData {
    companyName: string;
    managerPasscode: string;
    managerPasscodeConfirm: string;
    employeePasscode: string;
    employeePasscodeConfirm: string;
    staffCount: string;
}

interface SignUpFormErrors {
    companyName?: string;
    managerPasscode?: string;
    managerPasscodeConfirm?: string;
    employeePasscode?: string;
    employeePasscodeConfirm?: string;
    staffCount?: string;
}

interface SignInFormData {
    companyName: string;
    managerPasscode: string;
}

interface SignInFormErrors {
    companyName?: string;
    managerPasscode?: string;
}

const EmployerSignup: React.FC = () => {
    const router = useRouter();
    const { userId } = useAuth();

    // Sign Up State
    const [signUpFormData, setSignUpFormData] = useState<SignUpFormData>({
        companyName: "",
        managerPasscode: "",
        managerPasscodeConfirm: "",
        employeePasscode: "",
        employeePasscodeConfirm: "",
        staffCount: "",
    });

    const [signUpErrors, setSignUpErrors] = useState<SignUpFormErrors>({});

    // Sign In State
    const [signInFormData, setSignInFormData] = useState<SignInFormData>({
        companyName: "",
        managerPasscode: "",
    });

    const [signInErrors, setSignInErrors] = useState<SignInFormErrors>({});

    // Form Toggle
    const [isSignIn, setIsSignIn] = useState(false);

    // Eye-Icon Visibility Toggles
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [showSignUpPasswords, setShowSignUpPasswords] = useState({
        manager: false,
        managerConfirm: false,
        employee: false,
        employeeConfirm: false,
    });

    // -------------------------------
    // Sign In
    // -------------------------------
    const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignInFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error on user input
        if (signInErrors[name as keyof SignInFormErrors]) {
            setSignInErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateSignInForm = (): boolean => {
        const errors: SignInFormErrors = {};

        if (!signInFormData.companyName.trim()) {
            errors.companyName = "Company name is required";
        }
        if (!signInFormData.managerPasscode) {
            errors.managerPasscode = "Manager passcode is required";
        }

        setSignInErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitSignIn = async () => {
        if (!userId) return;
        await fetch("/api/signup/employer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                employerPasskey: signInFormData.managerPasscode,
            }),
        });
        router.push("/employer/home");
    };

    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSignInForm()) return;
        await submitSignIn();
    };

    // -------------------------------
    // Sign Up
    // -------------------------------
    const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignUpFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error on user input
        if (signUpErrors[name as keyof SignUpFormErrors]) {
            setSignUpErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validateSignUpForm = (): boolean => {
        const errors: SignUpFormErrors = {};

        if (!signUpFormData.companyName.trim()) {
            errors.companyName = "Company name is required";
        }
        if (signUpFormData.managerPasscode.length < 8) {
            errors.managerPasscode = "Manager passcode must be at least 8 characters";
        }
        if (signUpFormData.managerPasscode !== signUpFormData.managerPasscodeConfirm) {
            errors.managerPasscodeConfirm = "Manager passcodes do not match";
        }
        if (signUpFormData.employeePasscode.length < 8) {
            errors.employeePasscode = "Employee passcode must be at least 8 characters";
        }
        if (
            signUpFormData.employeePasscode !== signUpFormData.employeePasscodeConfirm
        ) {
            errors.employeePasscodeConfirm = "Employee passcodes do not match";
        }
        if (!signUpFormData.staffCount) {
            errors.staffCount = "Please enter approximate staff count";
        }

        setSignUpErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitSignUp = async () => {
        if (!userId) return;
        await fetch("/api/signup/employerCompany", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                companyName: signUpFormData.companyName,
                employerPasskey: signUpFormData.managerPasscode,
                employeePasskey: signUpFormData.employeePasscode,
                numberOfEmployees: signUpFormData.staffCount,
            }),
        });
        router.push("/employer/home");
    };

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSignUpForm()) return;
        await submitSignUp();
    };

    // -------------------------------
    // Render
    // -------------------------------
    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    {/* Logo */}
                    <div className={styles.logoContainer}>
                        <Brain className={styles.logoIcon} />
                        <span className={styles.logoText}>PDR AI</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.formContainer}>
                    {/* Toggle Buttons */}
                    <div className={styles.authToggle}>
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${
                                !isSignIn ? styles.active : ""
                            }`}
                            onClick={() => setIsSignIn(false)}
                        >
                            Sign Up
                        </button>
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${
                                isSignIn ? styles.active : ""
                            }`}
                            onClick={() => setIsSignIn(true)}
                        >
                            Sign In
                        </button>
                    </div>

                    <h1 className={styles.title}>
                        {isSignIn ? "Employer Sign In" : "Employer Registration"}
                    </h1>
                    <p className={styles.subtitle}>
                        {isSignIn
                            ? "Welcome back! Sign in to your company account"
                            : "Create your company account"}
                    </p>

                    {/* Sign In / Sign Up forms */}
                    {isSignIn ? (
                        // -------------------------------
                        // Sign In Form
                        // -------------------------------
                        <form onSubmit={handleSignInSubmit} className={styles.form}>
                            {/* Company Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Company Name</label>
                                <div className={styles.inputWrapper}>
                                    <Building className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={signInFormData.companyName}
                                        onChange={handleSignInChange}
                                        className={styles.input}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                {signInErrors.companyName && (
                                    <span className={styles.error}>{signInErrors.companyName}</span>
                                )}
                            </div>

                            {/* Manager Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Manager Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showSignInPassword ? "text" : "password"}
                                        name="managerPasscode"
                                        value={signInFormData.managerPasscode}
                                        onChange={handleSignInChange}
                                        className={styles.input}
                                        placeholder="Enter manager passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                                    >
                                        {showSignInPassword ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {signInErrors.managerPasscode && (
                                    <span className={styles.error}>
                    {signInErrors.managerPasscode}
                  </span>
                                )}
                            </div>

                            <button type="submit" className={styles.submitButton}>
                                Sign In
                            </button>
                        </form>
                    ) : (
                        // -------------------------------
                        // Sign Up Form
                        // -------------------------------
                        <form onSubmit={handleSignUpSubmit} className={styles.form}>
                            {/* Company Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Company Name</label>
                                <div className={styles.inputWrapper}>
                                    <Building className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={signUpFormData.companyName}
                                        onChange={handleSignUpChange}
                                        className={styles.input}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                {signUpErrors.companyName && (
                                    <span className={styles.error}>{signUpErrors.companyName}</span>
                                )}
                            </div>

                            {/* Manager Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Manager Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showSignUpPasswords.manager ? "text" : "password"}
                                        name="managerPasscode"
                                        value={signUpFormData.managerPasscode}
                                        onChange={handleSignUpChange}
                                        className={styles.input}
                                        placeholder="Enter manager passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowSignUpPasswords((prev) => ({
                                                ...prev,
                                                manager: !prev.manager,
                                            }))
                                        }
                                    >
                                        {showSignUpPasswords.manager ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {signUpErrors.managerPasscode && (
                                    <span className={styles.error}>
                    {signUpErrors.managerPasscode}
                  </span>
                                )}
                            </div>

                            {/* Confirm Manager Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm Manager Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showSignUpPasswords.managerConfirm ? "text" : "password"}
                                        name="managerPasscodeConfirm"
                                        value={signUpFormData.managerPasscodeConfirm}
                                        onChange={handleSignUpChange}
                                        className={styles.input}
                                        placeholder="Re-enter manager passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowSignUpPasswords((prev) => ({
                                                ...prev,
                                                managerConfirm: !prev.managerConfirm,
                                            }))
                                        }
                                    >
                                        {showSignUpPasswords.managerConfirm ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {signUpErrors.managerPasscodeConfirm && (
                                    <span className={styles.error}>
                    {signUpErrors.managerPasscodeConfirm}
                  </span>
                                )}
                            </div>

                            {/* Employee Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Employee Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showSignUpPasswords.employee ? "text" : "password"}
                                        name="employeePasscode"
                                        value={signUpFormData.employeePasscode}
                                        onChange={handleSignUpChange}
                                        className={styles.input}
                                        placeholder="Enter employee passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowSignUpPasswords((prev) => ({
                                                ...prev,
                                                employee: !prev.employee,
                                            }))
                                        }
                                    >
                                        {showSignUpPasswords.employee ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {signUpErrors.employeePasscode && (
                                    <span className={styles.error}>
                    {signUpErrors.employeePasscode}
                  </span>
                                )}
                            </div>

                            {/* Confirm Employee Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm Employee Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showSignUpPasswords.employeeConfirm ? "text" : "password"}
                                        name="employeePasscodeConfirm"
                                        value={signUpFormData.employeePasscodeConfirm}
                                        onChange={handleSignUpChange}
                                        className={styles.input}
                                        placeholder="Re-enter employee passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowSignUpPasswords((prev) => ({
                                                ...prev,
                                                employeeConfirm: !prev.employeeConfirm,
                                            }))
                                        }
                                    >
                                        {showSignUpPasswords.employeeConfirm ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {signUpErrors.employeePasscodeConfirm && (
                                    <span className={styles.error}>
                    {signUpErrors.employeePasscodeConfirm}
                  </span>
                                )}
                            </div>

                            {/* Staff Count */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Approximate Number of Staff
                                </label>
                                <div className={styles.inputWrapper}>
                                    <Users className={styles.inputIcon} />
                                    <input
                                        type="number"
                                        name="staffCount"
                                        value={signUpFormData.staffCount}
                                        onChange={handleSignUpChange}
                                        className={styles.input}
                                        placeholder="Enter staff count"
                                        min="1"
                                    />
                                </div>
                                {signUpErrors.staffCount && (
                                    <span className={styles.error}>{signUpErrors.staffCount}</span>
                                )}
                            </div>

                            <button type="submit" className={styles.submitButton}>
                                Create Account
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EmployerSignup;