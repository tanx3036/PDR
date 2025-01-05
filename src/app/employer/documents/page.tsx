"use client"
import React, {useEffect, useState} from 'react';
import { FileText, Search, Brain, ChevronRight, ChevronDown } from 'lucide-react';
import styles from '../../../styles/employerDocumentViewer.module.css';
import Link from "next/link";


interface DocumentType {
    id: number;
    name: string;        // or "title" if your DB uses that
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
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await fetch("/api/fetchDocument");
                if (!response.ok) {
                    throw new Error("Failed to fetch documents");
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const data: DocumentType[] = await response.json();

                setDocuments(data);
                // Optionally select the first document to show by default
                if (data.length > 0) {
                    setSelectedDoc(data[0]);
                }
            } catch (error) {
                console.error("Error fetching documents:", error);
            }
        };

        fetchDocuments();
    }, []);


    // Group documents by category
    const categories: CategoryGroup[] = Object.values(
        documents.reduce((acc: { [key: string]: CategoryGroup }, doc) => {
            // OPTIONAL: Filter by searchTerm if you want to hide docs that don't match
            // For example, match on doc.name or doc.aiSummary
            if (
                !doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
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
                                            <span className={styles.docName}>{doc.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {selectedDoc && (
                    <>
                        {/* Document Title */}
                        <div className={styles.docHeader}>
                            <h1 className={styles.docTitle}>{selectedDoc.name}</h1>
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