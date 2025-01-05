"use client"

import React, { useState } from 'react';
import { Briefcase, Users, ArrowRight, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation'; // <-- Use 'next/navigation'
import styles from '../../styles/signup.module.css';

interface RoleCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
                                               title,
                                               description,
                                               icon,
                                               isSelected,
                                               onClick,
                                           }) => (
    <div
        className={`${styles.roleCard} ${isSelected ? styles.selected : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
    >
        <div className={styles.iconWrapper}>{icon}</div>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDescription}>{description}</p>
    </div>
);

const RoleSelection: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'fetchDocument' | 'employee' | null>(null);
    const router = useRouter(); // Now from 'next/navigation'

    const handleContinue = async () => {
        if (selectedRole === 'employee') {
            router.push('/signup/employee');
        } else {
            router.push('/signup/fetchDocument');
        }
    };

    return (
        <div className={styles.container}>
            {/* Navigation */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logoContainer}>
                        <Brain className={styles.logoIcon} />
                        <span className={styles.logoText}>PDR AI</span>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.contentWrapper}>
                    <h1 className={styles.title}>Choose Your Role</h1>
                    <p className={styles.subtitle}>Select how you will be using PDR AI</p>

                    <div className={styles.cardsContainer}>
                        <RoleCard
                            title="I'm an Employer"
                            description="Upload and manage documents, track analytics, and oversee document processing"
                            icon={<Briefcase className={styles.cardIcon} />}
                            isSelected={selectedRole === 'fetchDocument'}
                            onClick={() => setSelectedRole('fetchDocument')}
                        />
                        <RoleCard
                            title="I'm an Employee"
                            description="Access and review documents and submit feedback."
                            icon={<Users className={styles.cardIcon} />}
                            isSelected={selectedRole === 'employee'}
                            onClick={() => setSelectedRole('employee')}
                        />
                    </div>
                    <button
                        className={`${styles.continueButton} ${selectedRole ? styles.active : ''}`}
                        onClick={handleContinue}
                        disabled={!selectedRole}
                    >
                        Continue
                        <ArrowRight className={styles.buttonIcon} />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RoleSelection;