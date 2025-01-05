import React from 'react';
import { Brain } from 'lucide-react';
import styles from '../../styles/authenticating.module.css';

const LoadingPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Logo */}
                <div className={styles.logoWrapper}>
                    <Brain className={styles.logoIcon} />
                    <span className={styles.logoText}>DocuMind AI</span>
                </div>

                {/* Loading Animation */}
                <div className={styles.loadingContainer}>
                    <div className={styles.dots}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                    <h1 className={styles.loadingText}>Authenticating</h1>
                </div>

                {/* Message */}
                <p className={styles.message}>
                    Please wait while we verify your credentials
                </p>
            </div>
        </div>
    );
};

export default LoadingPage;