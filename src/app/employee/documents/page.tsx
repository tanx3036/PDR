"use client";
import React, {useEffect, useState} from 'react';
import {
    FileText,
    Search,
    Brain,
    ChevronRight,
    ChevronDown,
    User,
    LogOut,
    Home,
} from 'lucide-react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from '../../../styles/employeeDocumentViewer.module.css';
import { SignOutButton, useAuth, UserButton } from "@clerk/nextjs";
import LoadingDoc from "~/app/employee/documents/loading-doc";
import LoadingPage from "~/app/_components/loading";
import { fetchWithRetries } from "./fetchWithRetries";

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

interface LangChainResponse {
    success: boolean;
    summarizedAnswer: string;
    recommendedPages: number[];
}



type ViewMode = "document-only" | "with-summary" | "with-ai-qa";

const DocumentViewer: React.FC = () => {
    const router = useRouter();
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const { isLoaded, userId } = useAuth();

    // 1) Role-check loading
    const [roleLoading, setRoleLoading] = useState(true);

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>("document-only");

    // AI Search Variables
    const [aiQuestion, setAiQuestion] = useState("");
    const [aiAnswer, setAiAnswer] = useState("");
    const [aiError, setAiError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    // Reference pages
    const [referencePages, setReferencePages] = useState<number[]>([]);

    // PDF page to display (defaults to 1)
    const [pdfPageNumber, setPdfPageNumber] = useState<number>(1);

    // Load PDF with page number
    const pdfSrcWithPage = (baseUrl: string, pageNumber: number) => {
        // Some PDF readers support #page=N
        // console.log("PDF URL:", `${baseUrl}#page=${pageNumber}`);
        return `${baseUrl}#page=${pageNumber}`;

    };


    // Handle Authentication
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
                const response = await fetch("/api/employeeAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if(response.status === 300){
                    router.push("/employee/pending-approval");
                    return;
                }
                else if (!response.ok) {
                    window.alert("Authentication failed! You are not an employee.");
                    router.push("/");
                    return;
                }
            } catch (error) {
                console.error("Error checking employee role:", error);
                window.alert("Authentication failed! You are not an employee.");
                router.push("/");
            } finally {
                setRoleLoading(false);
            }
        };

        checkEmployerRole().catch(console.error);
    }, [isLoaded, userId, router]);

    // Fetch documents
    useEffect(() => {
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

                const rawData : unknown = await response.json();
                if (!Array.isArray(rawData)) {
                    throw new Error("Invalid data format, expected an array.");
                }
                const data = rawData as DocumentType[];
                setDocuments(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments().catch(console.error);
    }, [userId]);

    // Group documents by category (filter by search term)
    const categories: CategoryGroup[] = Object.values(
        documents.reduce((acc: Record<string, CategoryGroup>, doc) => {
            if (
                !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(doc.aiSummary ?? "").toLowerCase().includes(searchTerm.toLowerCase())
            ) {
                return acc;
            }

            if (!acc[doc.category]) {
                acc[doc.category] = {
                    name: doc.category,
                    isOpen: true,
                    documents: [],
                };
            }

            acc[doc.category]!.documents.push(doc);
            return acc;
        }, {})
    );

    // Handle AI Search
    const handleAiSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setAiError("");
        setAiAnswer("");
        setReferencePages([]); // Reset before new request

        if (!aiQuestion.trim()) return;

        try {
            setAiLoading(true);

            // 2) Use our helper with up to 5 retries
            const data = (await fetchWithRetries("/api/LangChain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    documentId: selectedDoc?.id,
                    question: aiQuestion,
                }),
            }, 5)) as LangChainResponse; // cast to your response type if needed

            // 3) Handle success
            setAiAnswer(data.summarizedAnswer);

            // remove duplicates from recommended pages
            if (Array.isArray(data.recommendedPages)) {
                const uniquePages = Array.from(new Set(data.recommendedPages));
                setReferencePages(uniquePages);
            }
        } catch (err: unknown) {
            // 4) If all retries fail or error is non-timeout
            setAiError("Timeout error: Please try again later.");
        } finally {
            setAiLoading(false);
        }
    };

    if (roleLoading) {
        return <LoadingPage />;
    }
    if (loading) {
        return <LoadingDoc />;
    }

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

                {/* VIEW-MODE BUTTONS */}
                <div className={styles.viewModeButtons}>
                    <button
                        className={`${styles.viewModeButton} ${
                            viewMode === "document-only" ? styles.activeViewMode : ""
                        }`}
                        onClick={() => setViewMode("document-only")}
                    >
                        Document Only
                    </button>
                    {/*<button*/}
                    {/*    className={`${styles.viewModeButton} ${*/}
                    {/*        viewMode === "with-summary" ? styles.activeViewMode : ""*/}
                    {/*    }`}*/}
                    {/*    onClick={() => setViewMode("with-summary")}*/}
                    {/*>*/}
                    {/*    AI Summary + Doc*/}
                    {/*</button>*/}
                    <button
                        className={`${styles.viewModeButton} ${
                            viewMode === "with-ai-qa" ? styles.activeViewMode : ""
                        }`}
                        onClick={() => setViewMode("with-ai-qa")}
                    >
                        AI Q&A + Doc
                    </button>
                </div>
                {/* END VIEW-MODE BUTTONS */}

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
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setPdfPageNumber(1); // reset to page 1 when doc changes
                                                setAiAnswer("");
                                                setReferencePages([]);
                                            }}
                                            className={`${styles.docItem} ${
                                                selectedDoc && selectedDoc.id === doc.id
                                                    ? styles.selected
                                                    : ""
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

                {/* Profile Section */}
                <div className={styles.profileSection}>
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            variables: {
                                colorPrimary: "#8B5CF6",
                                colorText: "#4F46E5",
                                borderRadius: "0.5rem",
                                fontFamily: "Inter, sans-serif",
                            },
                            elements: {
                                userButtonAvatarBox: "border-2 border-purple-300",
                                userButtonTrigger:
                                    "hover:bg-purple-50 transition-colors p-1 flex items-center rounded-lg",
                                userButtonPopoverCard: "shadow-md border border-gray-100",
                                userButtonPopoverFooter: "bg-gray-50 border-t border-gray-100 p-2",
                            },
                        }}
                    />
                    <SignOutButton>
                        <button className={styles.logoutButton}>
                            <LogOut className={styles.logoutIcon} />
                            <span>Logout</span>
                        </button>
                    </SignOutButton>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* No document selected */}
                {!selectedDoc && (
                    <div className={styles.noDocSelected}>
                        <h1 className={styles.noDocTitle}>Select a document to view</h1>
                    </div>
                )}

                {/* Document Viewer */}
                {selectedDoc && (
                    <>
                        <div className={styles.docHeader}>
                            <h1 className={styles.docTitle}>{selectedDoc.title}</h1>
                        </div>

                        {/* Conditionally render AI Summary */}
                        {viewMode === "with-summary" && selectedDoc.aiSummary && (
                            <div className={styles.summaryContainer}>
                                <div className={styles.summaryHeader}>
                                    <Brain className={styles.summaryIcon} />
                                    <h2 className={styles.summaryTitle}>AI Summary</h2>
                                </div>
                                <p className={styles.summaryText}>{selectedDoc.aiSummary}</p>
                            </div>
                        )}

                        {/* If there's no AI summary but we're in "with-summary" mode */}
                        {viewMode === "with-summary" && !selectedDoc.aiSummary && (
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

                        {/* Conditionally render AI Q&A */}
                        {viewMode === "with-ai-qa" && (
                            <div className={styles.summaryContainer}>
                                <div className={styles.summaryHeader}>
                                    <Brain className={styles.summaryIcon} />
                                    <h2 className={styles.summaryTitle}>AI Q&A</h2>
                                </div>

                                <form onSubmit={handleAiSearch} className="flex flex-col space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Ask a question about your documents..."
                                        value={aiQuestion}
                                        onChange={(e) => setAiQuestion(e.target.value)}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none"
                                    >
                                        {aiLoading ? "Asking AI..." : "Ask AI"}
                                    </button>
                                </form>

                                {aiError && <p className="text-red-500 mt-2">{aiError}</p>}
                                {aiAnswer && (
                                    <div className="bg-gray-100 rounded p-3 mt-2">
                                        <p className="text-gray-700">{aiAnswer}</p>
                                        {/* REFERENCE PAGES */}
                                        {referencePages.length > 0 && (
                                            <div className="mt-4">
                                                <p className="font-semibold text-gray-700 mb-2">
                                                    Reference Pages:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {referencePages.map((page) => (
                                                        <button
                                                            key={page}
                                                            onClick={() => setPdfPageNumber(page)}
                                                            className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-md
                                                                        hover:bg-purple-200 transition-colors"
                                                        >
                                                            Page {page}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        )}

                        {/* PDF Viewer (always visible as long as a doc is selected) */}
                        <div className={styles.pdfContainer}>
                            <iframe
                                key={pdfPageNumber}
                                src={pdfSrcWithPage(selectedDoc.url, pdfPageNumber)}
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
