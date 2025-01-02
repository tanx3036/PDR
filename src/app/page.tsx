import Link from "next/link";
import React from 'react';
import { FileText, Brain, Zap, ArrowRight, Check } from 'lucide-react';
import styles from '../styles/home.module.css';

export default function HomePage() {
  return (
      <div className={styles['documind-container']}>
          {/* Navigation */}
          <nav className={styles['nav-container']}>
              <div className={styles['nav-content']}>
                  <div className={styles['nav-wrapper']}>
                      <div className={styles['logo-container']}>
                          <Brain className={styles['icon-purple']} />
                          <span className={styles['logo-text']}>PDR AI</span>
                      </div>
                      <div className={styles['nav-links']}>
                          <button className={`${styles.btn} ${styles['btn-ghost']}`}>Features</button>
                          <button className={`${styles.btn} ${styles['btn-ghost']}`}>Pricing</button>
                          <button className={`${styles.btn} ${styles['btn-ghost']}`}>About</button>
                          <button className={`${styles.btn} ${styles['btn-primary']}`}>Get Started</button>
                      </div>
                  </div>
              </div>
          </nav>

          {/* Hero Section */}
          <div className={styles['hero-section']}>
              <div className={styles['hero-content']}>
                  <h1 className={styles['hero-title']}>
                      Transform Your Document Workflow with AI
                  </h1>
                  <p className={styles['hero-description']}>
                      Instantly analyze, interpret, and extract insights from your professional documents using advanced AI technology.
                  </p>
                  <div className={styles['hero-buttons']}>
                      <button className={`${styles.btn} ${styles['btn-primary']} ${styles['btn-lg']}`}>
                          Try For Free
                          <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                      <button className={`${styles.btn} ${styles['btn-outline']} ${styles['btn-lg']}`}>
                          Watch Demo
                      </button>
                  </div>
              </div>
          </div>

          {/* Features Section */}
          <div className={styles['features-section']}>
              <div className={styles['features-container']}>
                  <h2 className={styles['features-title']}>
                      Powerful Features
                  </h2>
                  <div className={styles['features-grid']}>
                      <FeatureCard
                          icon={<FileText className={styles['icon-purple']} />}
                          title="Professional Document Analysis"
                          description="Advanced AI algorithms analyze your documents in seconds, extracting key information and insights automatically."
                      />
                      <FeatureCard
                          icon={<Zap className={styles['icon-purple']} />}
                          title="AI Reinforced interpretation"
                          description="Get immediate understanding of complex documents with AI-powered summaries and explanations."
                      />
                      <FeatureCard
                          icon={<Brain className={styles['icon-purple']} />}
                          title="AI Reinforced interpretation"
                          description="Our AI learns from your document patterns to provide increasingly accurate and relevant insights."
                      />
                  </div>
              </div>
          </div>

          {/* Benefits Section */}
          <div className={styles['benefits-section']}>
              <div className={styles['benefits-grid']}>
                  <div>
                      <h2 className={styles['benefits-title']}>
                          Why Choose PDR-AI?
                      </h2>
                      <div className={styles['benefits-list']}>
                          <BenefitItem text="Employees save up to 80% of time spent on reading professional document" />
                          <BenefitItem text="Improved interpretationa with AI-powered accuracy" />
                          <BenefitItem text="Seamless integration with your existing workflow" />
                          <BenefitItem text="Enterprise-grade security and compliance" />
                          <BenefitItem text="24/7 support from our expert team" />
                      </div>
                  </div>
                  <div className={styles['demo-container']}>
                      <div className="aspect-w-16 aspect-h-9 bg-purple-200 rounded-lg"></div>
                  </div>
              </div>
          </div>
      </div>
  );
}


const FeatureCard = ({ icon, title, description }) => (
    <div className={styles['feature-card']}>
        <div className={styles['feature-icon']}>
            {icon}
        </div>
        <h3 className={styles['feature-title']}>{title}</h3>
        <p className={styles['feature-description']}>{description}</p>
    </div>
);

const BenefitItem = ({ text }) => (
    <div className={styles['benefit-item']}>
        <Check className={styles['icon-check']} />
        <span className={styles['benefit-text']}>{text}</span>
    </div>
);
