"use client";
import React, { useState } from 'react';
import {
    FileText,
    Search,
    Brain,
    ChevronRight,
    ChevronDown,
    User,
    LogOut,
} from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation"; // If you are using next/navigation router
import styles from '../../../styles/employeeDocumentViewer.module.css';

// Mock data for documents
const documents = [
    {
        id: 1,
        name: 'Apple Financial Report Q1 2025',
        category: 'Financial',
        aiSummary:
            'Apple Inc. reported strong financial results for Q4 2023 ... robust performance and financial stability during the quarter.',
        url: 'https://utfs.io/f/zllPuoqtDQmMunOGjZkCWhtoxfrJp6Db5dHg8iIVBLawUOs2',
    },
    {
        id: 2,
        name: 'Employee Handbook 2025.pdf',
        category: 'HR',
        aiSummary:
            'Updated employee handbook for 2025 includes new remote work policies ... and mental health support.',
        url: '/documents/handbook.pdf',
    },
    {
        id: 3,
        name: 'Project Roadmap 2025.pdf',
        category: 'Planning',
        aiSummary:
            'Strategic roadmap outlining key initiatives for 2025 ... resource allocation.',
        url: '/documents/roadmap.pdf',
    },
];

interface Category {
    name: string;
    isOpen: boolean;
    documents: typeof documents;
}

const DocumentViewer: React.FC = () => {
    const router = useRouter();
    const [selectedDoc, setSelectedDoc] = useState(documents[0]);
    const [searchTerm, setSearchTerm] = useState('');

    // Group documents by category
    const categories: Category[] = Object.values(
        documents.reduce((acc: { [key: string]: Category }, doc) => {
            if (!acc[doc.category]) {
                acc[doc.category] = {
                    name: doc.category,
                    isOpen: true,
                    documents: [],
                };
            }
            acc[doc.category].documents.push(doc);
            return acc;
        }, {})
    );

    // Example user data - replace with actual user information in a real app
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
    };

    // Handle logout action
    const handleLogout = () => {
        // Example logout logic:
        // 1. Clear auth tokens from local storage
        // 2. Call logout endpoint if needed
        // 3. Redirect to login or home page

        // For now, let's just redirect to the main home page:
        router.push('/');
    };

    return (
        <div className={styles.container}>
            {/* Side Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>

                        <button className={styles.logoContainer}>
                            <Brain className={styles.logoIcon} />
                            <span className={styles.logoText}>PDR AI</span>
                        </button>

                    {/* Search Bar */}
                    <div className={styles.searchContainer}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Document List */}
                <nav className={styles.docList}>
                    {categories.map((category) => (
                        <div key={category.name} className={styles.categoryGroup}>
                            <div className={styles.categoryHeader}>
                                {category.isOpen ? (
                                    <ChevronDown className={styles.chevronIcon} />
                                ) : (
                                    <ChevronRight className={styles.chevronIcon} />
                                )}
                                <span className={styles.categoryName}>{category.name}</span>
                            </div>
                            {category.isOpen && (
                                <div className={styles.categoryDocs}>
                                    {category.documents
                                        .filter((doc) =>
                                            doc.name.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((doc) => (
                                            <button
                                                key={doc.id}
                                                onClick={() => setSelectedDoc(doc)}
                                                className={`${styles.docItem} ${
                                                    selectedDoc.id === doc.id ? styles.selected : ''
                                                }`}
                                            >
                                                <FileText className={styles.docIcon} />
                                                <span className={styles.docName}>{doc.name}</span>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className={styles.profileSection}>
                    <div className={styles.userDetails}>
                        <User className={styles.userIcon} />
                        <div>
                            <p className={styles.username}>{user.name}</p>
                            <p className={styles.userEmail}>{user.email}</p>
                        </div>
                    </div>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <LogOut className={styles.logoutIcon} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {selectedDoc && (
                    <>
                        {/* Document Title */}
                        <div className={styles.docHeader}>
                            <h1 className={styles.docTitle}>{selectedDoc.name}</h1>
                        </div>

                        {/* AI Summary */}
                        <div className={styles.summaryContainer}>
                            <div className={styles.summaryHeader}>
                                <Brain className={styles.summaryIcon} />
                                <h2 className={styles.summaryTitle}>AI Summary</h2>
                            </div>
                            <p className={styles.summaryText}>{selectedDoc.aiSummary}</p>
                        </div>

                        {/* PDF Viewer */}
                        <div className={styles.pdfContainer}>
                            <iframe
                                src={selectedDoc.url}
                                className={styles.pdfViewer}
                                title={selectedDoc.name}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DocumentViewer;