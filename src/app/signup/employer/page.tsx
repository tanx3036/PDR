"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import SignInForm from "~/app/signup/employer/SignInForm";
import SignUpForm from "~/app/signup/employer/SignUpForm";
import styles from "../../../styles/Employer/Signup.module.css";

/** --------------- */
/** TYPES          */
/** --------------- */
interface SignInFormData {
    companyName: string;
    managerPasscode: string;
}
interface SignInFormErrors {
    companyName?: string;
    managerPasscode?: string;
}

interface SignUpFormDazta {
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

/** --------------- */
/** MAIN COMPONENT */
/** --------------- */
const EmployerSignup: React.FC = () => {
    const router = useRouter();
    const { userId } = useAuth();
    const { user } = useUser();

    // --------------------------------------------------
    // Toggle: Sign In or Sign Up
    // --------------------------------------------------
    const [isSignIn, setIsSignIn] = useState(false);

    // --------------------------------------------------
    // Sign In State & Handlers
    // --------------------------------------------------
    const [signInFormData, setSignInFormData] = useState<SignInFormData>({
        companyName: "",
        managerPasscode: "",
    });
    const [signInErrors, setSignInErrors] = useState<SignInFormErrors>({});
    const [showSignInPassword, setShowSignInPassword] = useState(false);

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
            errors.managerPasscode = "Manager passkey is required";
        }
        setSignInErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitSignIn = async () => {
        // Make sure user is logged in via Clerk
        if (!userId || !user) return;

        const response = await fetch("/api/signup/employer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                name: user?.fullName,
                email: user?.emailAddresses[0]?.emailAddress,
                companyName: signInFormData.companyName,
                employerPasskey: signInFormData.managerPasscode,
            }),
        });

        if (response.status === 400) {
            const { error } = await response.json();
            setSignInErrors((prev) => ({ ...prev, managerPasscode: error }));
            return;
        }
        router.push("/employer/home");
    };

    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSignInForm()) return;
        await submitSignIn();
    };

    // --------------------------------------------------
    // Sign Up State & Handlers
    // --------------------------------------------------
    const [signUpFormData, setSignUpFormData] = useState<SignUpFormData>({
        companyName: "",
        managerPasscode: "",
        managerPasscodeConfirm: "",
        employeePasscode: "",
        employeePasscodeConfirm: "",
        staffCount: "",
    });
    const [signUpErrors, setSignUpErrors] = useState<SignUpFormErrors>({});

    // Local states for showing/hiding password fields in SignUp
    const [showSignUpPasswords, setShowSignUpPasswords] = useState({
        manager: false,
        managerConfirm: false,
        employee: false,
        employeeConfirm: false,
    });

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
            errors.managerPasscode = "Manager passkey must be at least 8 characters";
        }
        if (signUpFormData.managerPasscode !== signUpFormData.managerPasscodeConfirm) {
            errors.managerPasscodeConfirm = "Manager passkeys do not match";
        }
        if (signUpFormData.employeePasscode.length < 8) {
            errors.employeePasscode = "Employee passkey must be at least 8 characters";
        }
        if (
            signUpFormData.employeePasscode !== signUpFormData.employeePasscodeConfirm
        ) {
            errors.employeePasscodeConfirm = "Employee passkeys do not match";
        }
        if (!signUpFormData.staffCount) {
            errors.staffCount = "Please enter approximate staff count";
        }
        setSignUpErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitSignUp = async () => {
        // Make sure user is logged in via Clerk
        if (!userId || !user) return;

        const response = await fetch("/api/signup/employerCompany", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                name: user?.fullName,
                email: user?.emailAddresses[0]?.emailAddress,
                companyName: signUpFormData.companyName,
                employerPasskey: signUpFormData.managerPasscode,
                employeePasskey: signUpFormData.employeePasscode,
                numberOfEmployees: signUpFormData.staffCount,
            }),
        });

        if (response.status === 400) {
            const { error } = await response.json();
            setSignUpErrors((prev) => ({ ...prev, companyName: error }));
            return;
        }
        router.push("/employer/home");
    };

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateSignUpForm()) return;
        await submitSignUp();
    };

    // Helper to toggle each password field in SignUp
    const toggleSignUpPassword = (
        field: keyof typeof showSignUpPasswords
    ) => {
        setShowSignUpPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------
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
                            className={`${styles.toggleButton} ${!isSignIn ? styles.active : ""}`}
                            onClick={() => setIsSignIn(false)}
                        >
                            Sign Up
                        </button>
                        <button
                            type="button"
                            className={`${styles.toggleButton} ${isSignIn ? styles.active : ""}`}
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

                    {isSignIn ? (
                        <SignInForm
                            formData={signInFormData}
                            errors={signInErrors}
                            showPassword={showSignInPassword}
                            onChange={handleSignInChange}
                            onSubmit={handleSignInSubmit}
                            onTogglePassword={() => setShowSignInPassword(!showSignInPassword)}
                        />
                    ) : (
                        <SignUpForm
                            formData={signUpFormData}
                            errors={signUpErrors}
                            showPasswords={showSignUpPasswords}
                            onChange={handleSignUpChange}
                            onSubmit={handleSignUpSubmit}
                            onTogglePassword={toggleSignUpPassword}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default EmployerSignup;