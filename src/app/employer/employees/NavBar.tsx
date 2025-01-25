"use client";

import React from "react";
import {Brain, Home} from "lucide-react";
import styles from "~/styles/employerEmployeeManagement.module.css";
import { useRouter } from "next/navigation";

const NavBar = () => {
    const router = useRouter();
    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <div className={styles.logoContainer}>
                    <Brain className={styles.logoIcon} />
                    <span className={styles.logoText}>PDR AI</span>
                </div>
                <button
                    onClick={() => router.push("/employer/home")}
                    className={styles.homeButton}
                >
                    <Home className={styles.homeIcon}/>
                    Home
                </button>
            </div>
        </nav>
    );
};

export default NavBar;
