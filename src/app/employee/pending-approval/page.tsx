"use client"

import React from 'react';
import { Brain, Clock, Building, Mail, AlertCircle } from 'lucide-react';
import styles from '~/styles/employeePendingApproval.module.css';

interface PendingApprovalProps {
    employeeData?: {
        name: string;
        email: string;
        company: string;
        submissionDate: string;
    };
}

const PendingApproval: React.FC<PendingApprovalProps> = ({
                                                             employeeData = {
                                                                 name: "John Doe",
                                                                 email: "john.doe@company.com",
                                                                 company: "Tech Corp",
                                                                 submissionDate: "2025-01-20"
                                                             }
                                                         }) => {
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
                <div className={styles.statusCard}>
                    {/* Status Icon */}
                    <div className={styles.statusIconContainer}>
                        <Clock className={styles.statusIcon} />
                    </div>

                    {/* Status Message */}
                    <h1 className={styles.title}>Pending Approval</h1>
                    <p className={styles.subtitle}>
                        Your account is currently awaiting approval from your employer
                    </p>

                    {/* Application Details */}
                    <div className={styles.detailsContainer}>
                        <h2 className={styles.detailsTitle}>Application Details</h2>

                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <Building className={styles.detailIcon} />
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>Company</span>
                                    <span className={styles.detailValue}>{employeeData.company}</span>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <Mail className={styles.detailIcon} />
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>Email</span>
                                    <span className={styles.detailValue}>{employeeData.email}</span>
                                </div>
                            </div>

                            <div className={styles.detailItem}>
                                <Clock className={styles.detailIcon} />
                                <div className={styles.detailContent}>
                                    <span className={styles.detailLabel}>Submission Date</span>
                                    <span className={styles.detailValue}>{employeeData.submissionDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className={styles.notice}>
                        <AlertCircle className={styles.noticeIcon} />
                        <p className={styles.noticeText}>
                            You will receive an email notification once your account has been approved.
                            This process typically takes 1-2 business days.
                        </p>
                    </div>

                    {/* Support Section */}
                    <div className={styles.supportSection}>
                        <p className={styles.supportText}>
                            Need assistance? Contact support at{' '}
                            <a href="mailto:tlin56@jh.edu" className={styles.supportLink}>
                                tlin56@jh.edu
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PendingApproval;
