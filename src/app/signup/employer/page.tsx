"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Building, Brain, Lock, Users } from "lucide-react";
import {useRouter} from "next/navigation";
// Import your CSS Module (with Tailwind's @apply rules)
import styles from "../../../styles/EmployerSignup.module.css";

interface FormData {
    companyName: string;
    managerPasscode: string;
    managerPasscodeConfirm: string;
    employeePasscode: string;
    employeePasscodeConfirm: string;
    staffCount: string;
}

interface FormErrors {
    companyName?: string;
    managerPasscode?: string;
    managerPasscodeConfirm?: string;
    employeePasscode?: string;
    employeePasscodeConfirm?: string;
    staffCount?: string;
}

interface SignInData {
    companyName: string;
    managerPasscode: string;
}

const EmployerSignup: React.FC = () => {
    const router = useRouter();


    const [formData, setFormData] = useState<FormData>({
        companyName: "",
        managerPasscode: "",
        managerPasscodeConfirm: "",
        employeePasscode: "",
        employeePasscodeConfirm: "",
        staffCount: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPasswords, setShowPasswords] = useState({
        manager: false,
        managerConfirm: false,
        employee: false,
        employeeConfirm: false,
    });

    // Validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = "Company name is required";
        }
        if (formData.managerPasscode.length < 8) {
            newErrors.managerPasscode = "Manager passcode must be at least 8 characters";
        }
        if (formData.managerPasscode !== formData.managerPasscodeConfirm) {
            newErrors.managerPasscodeConfirm = "Manager passcodes do not match";
        }
        if (formData.employeePasscode.length < 8) {
            newErrors.employeePasscode = "Employee passcode must be at least 8 characters";
        }
        if (formData.employeePasscode !== formData.employeePasscodeConfirm) {
            newErrors.employeePasscodeConfirm = "Employee passcodes do not match";
        }
        if (!formData.staffCount) {
            newErrors.staffCount = "Please enter approximate staff count";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit sign-up form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log("Form submitted:", formData);
            router.push("/employer/home")
        }
    };

    // Handle sign-up input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const [isSignIn, setIsSignIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Sign-in form state
    const [signInData, setSignInData] = useState<SignInData>({
        companyName: "",
        managerPasscode: "",
    });

    const [signInErrors, setSignInErrors] = useState<Partial<SignInData>>({});

    // Potential sign-up data from a previous component usage
    const [signUpData, setSignUpData] = useState({
        companyName: "",
        managerPasscode: "",
        managerPasscodeConfirm: "",
        employeePasscode: "",
        employeePasscodeConfirm: "",
        staffCount: "",
    });

    // Submit sign-in form
    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Partial<SignInData> = {};

        if (!signInData.companyName.trim()) {
            errors.companyName = "Company name is required";
        }
        if (!signInData.managerPasscode) {
            errors.managerPasscode = "Manager passcode is required";
        }

        setSignInErrors(errors);

        if (Object.keys(errors).length === 0) {
            console.log("Signing in with:", signInData);
            // Handle sign-in logic
        }
    };

    // Handle sign-in input changes
    const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignInData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (signInErrors[name as keyof SignInData]) {
            setSignInErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

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

                    {/* Sign In / Sign Up forms */}
                    {isSignIn ? (
                        // Sign In Form
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

                            {/* Manager Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Manager Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="managerPasscode"
                                        value={signInData.managerPasscode}
                                        onChange={handleSignInChange}
                                        className={styles.input}
                                        placeholder="Enter manager passcode"
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
                                {signInErrors.managerPasscode && (
                                    <span className={styles.error}>{signInErrors.managerPasscode}</span>
                                )}
                            </div>

                            <button type="submit" className={styles.submitButton}>
                                Sign In
                            </button>
                        </form>
                    ) : (
                        // Sign Up Form
                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Company Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Company Name</label>
                                <div className={styles.inputWrapper}>
                                    <Building className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                {errors.companyName && (
                                    <span className={styles.error}>{errors.companyName}</span>
                                )}
                            </div>

                            {/* Manager Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Manager Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showPasswords.manager ? "text" : "password"}
                                        name="managerPasscode"
                                        value={formData.managerPasscode}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Enter manager passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                manager: !prev.manager,
                                            }))
                                        }
                                    >
                                        {showPasswords.manager ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {errors.managerPasscode && (
                                    <span className={styles.error}>{errors.managerPasscode}</span>
                                )}
                            </div>

                            {/* Confirm Manager Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm Manager Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showPasswords.managerConfirm ? "text" : "password"}
                                        name="managerPasscodeConfirm"
                                        value={formData.managerPasscodeConfirm}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Re-enter manager passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                managerConfirm: !prev.managerConfirm,
                                            }))
                                        }
                                    >
                                        {showPasswords.managerConfirm ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {errors.managerPasscodeConfirm && (
                                    <span className={styles.error}>{errors.managerPasscodeConfirm}</span>
                                )}
                            </div>

                            {/* Employee Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Employee Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showPasswords.employee ? "text" : "password"}
                                        name="employeePasscode"
                                        value={formData.employeePasscode}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Enter employee passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                employee: !prev.employee,
                                            }))
                                        }
                                    >
                                        {showPasswords.employee ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {errors.employeePasscode && (
                                    <span className={styles.error}>{errors.employeePasscode}</span>
                                )}
                            </div>

                            {/* Confirm Employee Passcode */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirm Employee Passcode</label>
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} />
                                    <input
                                        type={showPasswords.employeeConfirm ? "text" : "password"}
                                        name="employeePasscodeConfirm"
                                        value={formData.employeePasscodeConfirm}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Re-enter employee passcode"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() =>
                                            setShowPasswords((prev) => ({
                                                ...prev,
                                                employeeConfirm: !prev.employeeConfirm,
                                            }))
                                        }
                                    >
                                        {showPasswords.employeeConfirm ? (
                                            <EyeOff className={styles.eyeIcon} />
                                        ) : (
                                            <Eye className={styles.eyeIcon} />
                                        )}
                                    </button>
                                </div>
                                {errors.employeePasscodeConfirm && (
                                    <span className={styles.error}>{errors.employeePasscodeConfirm}</span>
                                )}
                            </div>

                            {/* Staff Count */}
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Approximate Number of Staff</label>
                                <div className={styles.inputWrapper}>
                                    <Users className={styles.inputIcon} />
                                    <input
                                        type="number"
                                        name="staffCount"
                                        value={formData.staffCount}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Enter staff count"
                                        min="1"
                                    />
                                </div>
                                {errors.staffCount && (
                                    <span className={styles.error}>{errors.staffCount}</span>
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