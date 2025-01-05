"use client"
import React from 'react';
import { Upload, FileText, BarChart, Brain } from 'lucide-react';
import styles from '../../../styles/employerhome.module.css';
import {useRouter} from "next/navigation";
import ProfileDropdown from "~/app/employer/_components/ProfileDropdown";

const HomeScreen = () => {
    const router = useRouter();
    const menuOptions = [
        {
            icon: <Upload className={styles.menuIcon} />,
            title: "Upload Documents",
            description: "Add new documents to the database for AI analysis",
            path: "/employer/upload"
        },
        {
            icon: <FileText className={styles.menuIcon} />,
            title: "View Documents",
            description: "Browse and manage your uploaded documents",
            path: "/employer/documents"
        },
        {
            icon: <BarChart className={styles.menuIcon} />,
            title: "Document Statistics",
            description: "View analytics and insights about document usage",
            path: "/unavailable"
        }
    ];

    const handleNavigation = (path : string) => {
        // Navigation logic will go here
        console.log(`Navigating to: ${path}`);
        router.push(path)
    };

    return (
        <div className={styles.container}>
            {/* Navigation Bar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logoContainer}>
                        <Brain className={styles.logoIcon} />
                        <span className={styles.logoText}>PDR AI</span>
                    </div>
                    <ProfileDropdown />
                </div>
            </nav>

            {/* Welcome Section */}
            <main className={styles.main}>
                <div className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>Welcome to PDR AI</h1>
                    <p className={styles.welcomeText}>
                        Your AI integrated document management assistant and interpreter. Choose an option below to get started.
                    </p>
                </div>

                {/* Menu Options */}
                <div className={styles.menuGrid}>
                    {menuOptions.map((option, index) => (
                        <div
                            key={index}
                            className={styles.menuCard}
                            onClick={() => handleNavigation(option.path)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className={styles.iconContainer}>
                                {option.icon}
                            </div>
                            <h2 className={styles.menuTitle}>{option.title}</h2>
                            <p className={styles.menuDescription}>{option.description}</p>
                            <div className={styles.cardFooter}>
                                <span className={styles.getStarted}>Get Started →</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats */}
                {/*<div className={styles.statsContainer}>*/}
                {/*    <div className={styles.stat}>*/}
                {/*        <span className={styles.statNumber}>124</span>*/}
                {/*        <span className={styles.statLabel}>Documents Processed</span>*/}
                {/*    </div>*/}
                {/*    <div className={styles.stat}>*/}
                {/*        <span className={styles.statNumber}>3,487</span>*/}
                {/*        <span className={styles.statLabel}>Total Views</span>*/}
                {/*    </div>*/}
                {/*    <div className={styles.stat}>*/}
                {/*        <span className={styles.statNumber}>98%</span>*/}
                {/*        <span className={styles.statLabel}>Accuracy Rate</span>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </main>
        </div>
    );
};

export default HomeScreen;