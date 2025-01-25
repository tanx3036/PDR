// DocumentViewer/DocumentsSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
    FileText,
    Search,
    Brain,
    ChevronRight,
    ChevronDown,
    LogOut,
    Home,
} from "lucide-react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import styles from "~/styles/Employer/DocumentViewer.module.css";
import { useRouter } from "next/navigation";

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

// Define our "view mode" type if you need typed usage
type ViewMode = "document-only" | "with-summary" | "with-ai-qa";

interface DocumentsSidebarProps {
    categories: CategoryGroup[];
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
    selectedDoc: DocumentType | null;
    setSelectedDoc: (doc: DocumentType) => void;
    viewMode: ViewMode;
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

export const DocumentsSidebar: React.FC<DocumentsSidebarProps> = ({
                                                                      categories,
                                                                      searchTerm,
                                                                      setSearchTerm,
                                                                      selectedDoc,
                                                                      setSelectedDoc,
                                                                      viewMode,
                                                                      setViewMode,
                                                                  }) => {
    const router = useRouter();
    return (
        <aside className={styles.sidebar}>
            {/* Header */}
            <div className={styles.sidebarHeader}>
                <button className={styles.logoContainer}>
                    <Brain className={styles.logoIcon}/>
                    <span className={styles.logoText}>PDR AI</span>
                </button>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon}/>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* View-Mode Buttons */}
            <div className={styles.viewModeButtons}>
                <button
                    className={`${styles.viewModeButton} ${
                        viewMode === "document-only" ? styles.activeViewMode : ""
                    }`}
                    onClick={() => setViewMode("document-only")}
                >
                    Document Only
                </button>

                {/*
          If you still want the "with-summary" button, uncomment below:
          <button
            className={`${styles.viewModeButton} ${
              viewMode === "with-summary" ? styles.activeViewMode : ""
            }`}
            onClick={() => setViewMode("with-summary")}
          >
            AI Summary + Doc
          </button>
        */}

                <button
                    className={`${styles.viewModeButton} ${
                        viewMode === "with-ai-qa" ? styles.activeViewMode : ""
                    }`}
                    onClick={() => setViewMode("with-ai-qa")}
                >
                    AI Q&A + Doc
                </button>
            </div>

            {/* Document List */}
            <nav className={styles.docList}>
                {categories.map((category) => (
                    <div key={category.name} className={styles.categoryGroup}>
                        <div className={styles.categoryHeader}>
                            {category.isOpen ? (
                                <ChevronDown className={styles.chevronIcon}/>
                            ) : (
                                <ChevronRight className={styles.chevronIcon}/>
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
                                            selectedDoc && selectedDoc.id === doc.id
                                                ? styles.selected
                                                : ""
                                        }`}
                                    >
                                        <FileText className={styles.docIcon}/>
                                        <span className={styles.docName}>{doc.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Profile Section */}
            <div className={styles.sidebarFooter}>
                <Link href="/employer/home">
                    <button className={styles.homeButton}>
                        <Home className={styles.homeIcon}/>
                        <span>Home</span>
                    </button>
                </Link>
            </div>
        </aside>
    );
};
