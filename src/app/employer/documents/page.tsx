"use client";
import React, { useEffect, useState } from "react";
import {
    FileText,
    Search,
    Brain,
    ChevronRight,
    ChevronDown,
    Home,
} from "lucide-react";
import styles from "../../../styles/employerDocumentViewer.module.css";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingDoc from "~/app/employer/documents/loading-doc";
import LoadingPage from "~/app/_components/loading";

/** Types **/
interface DocumentType {
    id: number;
    title: string;
    category: string;
    aiSummary?: string;
    url: string;
}

interface CategoryGroup {
    name: string;
    isOpen: boolean;
    documents: DocumentType[];
}

const DocumentViewer: React.FC = () => {
    const router = useRouter();
    const { isLoaded, userId } = useAuth();

    // 1) Role-check loading
    const [roleLoading, setRoleLoading] = useState(true);

    // 2) Document-fetch loading
    const [docsLoading, setDocsLoading] = useState(false);

    // 3) Document data
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

    // 4) Search
    const [searchTerm, setSearchTerm] = useState("");

    /**
     * ROLE CHECK
     * - Wait for Clerk to load
     * - If no userId, redirect
     * - Otherwise, verify role
     */
    useEffect(() => {
        if (!isLoaded) return; // Wait until Clerk is fully ready

        // No user => redirect home
        if (!userId) {
            window.alert("Authentication failed! No user found.");
            router.push("/");
            return;
        }

        const checkEmployerRole = async () => {
            try {
                const response = await fetch("/api/employerAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    // Not an employer or user not found => redirect
                    window.alert("Authentication failed! You are not an employer.");
                    router.push("/");
                    return;
                }
            } catch (error) {
                console.error("Error checking employer role:", error);
                window.alert("Authentication failed! You are not an employer.");
                router.push("/");
            } finally {
                setRoleLoading(false);
            }
        };

        checkEmployerRole();
    }, [isLoaded, userId, router]);

    // If still checking role, show general loading


    /**
     * DOCUMENT FETCH
     * - Only call once we know user is an employer
     */
    useEffect(() => {
        if (!userId) return;

        const fetchDocuments = async () => {
            try {
                setDocsLoading(true);

                const response = await fetch("/api/fetchDocument", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch documents");
                }

                const data: DocumentType[] = await response.json();
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setDocsLoading(false);
            }
        };

        fetchDocuments();
    }, [userId]);

    // If documents are still loading, show doc-specific loader


    /**
     * GROUPING DOCS BY CATEGORY
     * + Basic search filtering
     */
    const categories: CategoryGroup[] = Object.values(
        documents.reduce((acc: { [key: string]: CategoryGroup }, doc) => {
            // Filter by search term on title or AI summary
            if (
                !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(doc.aiSummary || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            ) {
                return acc;
            }

            if (!acc[doc.category]) {
                acc[doc.category] = {
                    name: doc.category,
                    isOpen: true, // or false if you want them collapsed initially
                    documents: [],
                };
            }
            acc[doc.category].documents.push(doc);
            return acc;
        }, {})
    );

    if (roleLoading) {
        return <LoadingPage />;
    }
    else if (docsLoading){
            return <LoadingDoc />;

    }
    return (
        <div className={styles.container}>
            {/* Side Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/employer/home">
                        <button className={styles.logoContainer}>
                            <Brain className={styles.logoIcon} />
                            <span className={styles.logoText}>PDR AI</span>
                        </button>
                    </Link>

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
                                    {category.documents.map((doc) => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoc(doc)}
                                            className={`${styles.docItem} ${
                                                selectedDoc?.id === doc.id ? styles.selected : ""
                                            }`}
                                        >
                                            <FileText className={styles.docIcon} />
                                            <span className={styles.docName}>{doc.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Home Button */}
                <div className={styles.sidebarFooter}>
                    <Link href="/employer/home">
                        <button className={styles.homeButton}>
                            <Home className={styles.homeIcon} />
                            <span>Home</span>
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {selectedDoc && (
                    <>
                        {/* Document Title */}
                        <div className={styles.docHeader}>
                            <h1 className={styles.docTitle}>{selectedDoc.title}</h1>
                        </div>

                        {/* AI Summary */}
                        {selectedDoc.aiSummary ? (
                            <div className={styles.summaryContainer}>
                                <div className={styles.summaryHeader}>
                                    <Brain className={styles.summaryIcon} />
                                    <h2 className={styles.summaryTitle}>AI Summary</h2>
                                </div>
                                <p className={styles.summaryText}>{selectedDoc.aiSummary}</p>
                            </div>
                        ) : (
                            <div className={styles.summaryContainer}>
                                <div className={styles.summaryHeader}>
                                    <Brain className={styles.summaryIcon} />
                                    <h2 className={styles.summaryTitle}>AI Summary</h2>
                                </div>
                                <p className={styles.summaryText}>
                                    AI Summary currently unavailable.
                                </p>
                            </div>
                        )}

                        {/* PDF Viewer */}
                        <div className={styles.pdfContainer}>
                            <iframe
                                src={selectedDoc.url}
                                className={styles.pdfViewer}
                                title={selectedDoc.title}
                            />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DocumentViewer;