"use client"
import React, {useEffect, useState} from 'react';
import {FileText, Search, Brain, ChevronRight, ChevronDown, Home} from 'lucide-react';
import styles from '../../../styles/employerDocumentViewer.module.css';
import Link from "next/link";
import {useAuth} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingDoc from "~/app/employer/documents/loading-doc";


interface DocumentType {
    id: number;
    title: string;
    category: string;
    aiSummary?: string;  // optional if some documents don't have an AI summary
    url: string;
}


interface CategoryGroup {
    name: string;
    isOpen: boolean;
    documents: DocumentType[];
}


const DocumentViewer: React.FC = () => {
    const router = useRouter();
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { userId } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If userId is not yet available, skip the fetch
        if (!userId) return;

        const fetchDocuments = async () => {
            try {
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
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [userId]); // re-run when userId becomes available



// Group documents by category
    const categories: CategoryGroup[] = Object.values(
        documents.reduce((acc: { [key: string]: CategoryGroup }, doc) => {
            // OPTIONAL: Filter by searchTerm if you want to hide docs that don't match
            // For example, match on doc.name or doc.aiSummary
            if (
                !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(doc.aiSummary || "").toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                return acc; // skip this doc if it doesn't match search
            }

            if (!acc[doc.category]) {
                acc[doc.category] = {
                    name: doc.category,
                    isOpen: true, // or false if you prefer them collapsed initially
                    documents: [],
                };
            }
            acc[doc.category].documents.push(doc);
            return acc;
        }, {})
    );

    if (!userId) {
        return <LoadingDoc />;
    }

    if (loading) {
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
                                                selectedDoc && selectedDoc.id === doc.id ? styles.selected : ""
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





                { /* Home Button */ }
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

                        {/* AI Summary (if present) */}
                        {selectedDoc.aiSummary && (
                            <div className={styles.summaryContainer}>
                                <div className={styles.summaryHeader}>
                                    <Brain className={styles.summaryIcon} />
                                    <h2 className={styles.summaryTitle}>AI Summary</h2>
                                </div>
                                <p className={styles.summaryText}>{selectedDoc.aiSummary}</p>
                            </div>
                        )}

                            <div className={styles.summaryContainer}>
                                <div className={styles.summaryHeader}>
                                    <Brain className={styles.summaryIcon} />
                                    <h2 className={styles.summaryTitle}>AI Summary</h2>
                                </div>
                                <p className={styles.summaryText}>AI Summary currently unavailable.</p>
                            </div>

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