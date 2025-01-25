// DocumentViewer/index.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import styles from "../../../styles/Employee/DocumentViewer.module.css";

import LoadingDoc from "~/app/employee/documents/loading-doc";
import LoadingPage from "~/app/_components/loading";

import { fetchWithRetries } from "./fetchWithRetries";
import { DocumentsSidebar } from "./DocumentsSidebar";
import { DocumentContent } from "./DocumentContent";

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

type ViewMode = "document-only" | "with-summary" | "with-ai-qa";

interface LangChainResponse {
    success: boolean;
    summarizedAnswer: string;
    recommendedPages: number[];
}

const DocumentViewer: React.FC = () => {
    const router = useRouter();
    const { isLoaded, userId } = useAuth();

    // State for documents
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

    // Searching/filtering
    const [searchTerm, setSearchTerm] = useState("");

    // Loading states
    const [loading, setLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(true); // for role-check

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>("document-only");

    // AI Q&A states
    const [aiQuestion, setAiQuestion] = useState("");
    const [aiAnswer, setAiAnswer] = useState("");
    const [aiError, setAiError] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [referencePages, setReferencePages] = useState<number[]>([]);

    // PDF page states
    const [pdfPageNumber, setPdfPageNumber] = useState<number>(1);

    // 1. Check Clerk Auth & Role
    useEffect(() => {
        if (!isLoaded) return; // wait until Clerk is loaded

        if (!userId) {
            window.alert("Authentication failed! No user found.");
            router.push("/");
            return;
        }

        const checkEmployeeRole = async () => {
            try {
                const response = await fetch("/api/employeeAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });

                if (response.status === 300) {
                    // Pending approval
                    router.push("/employee/pending-approval");
                    return;
                } else if (!response.ok) {
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

        checkEmployeeRole().catch(console.error);
    }, [isLoaded, userId, router]);

    // 2. Fetch documents for this employee
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

                const data: unknown = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format, expected an array.");
                }

                setDocuments(data);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments().catch(console.error);
    }, [userId]);

    // 3. Build category groups
    const categories: CategoryGroup[] = Object.values(
        documents.reduce((acc: Record<string, CategoryGroup>, doc) => {
            // Filter by searchTerm in either "title" or "aiSummary"
            const inTitle = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
            const inSummary =
                doc.aiSummary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;

            if (!inTitle && !inSummary) return acc;

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

    // 4. Handle AI Q&A
    const handleAiSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setAiError("");
        setAiAnswer("");
        setReferencePages([]);

        if (!aiQuestion.trim()) return; // skip if empty question

        try {
            setAiLoading(true);

            // Use our fetchWithRetries
            const data = (await fetchWithRetries(
                "/api/LangChain",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        documentId: selectedDoc?.id,
                        question: aiQuestion,
                    }),
                },
                5
            )) as LangChainResponse;

            setAiAnswer(data.summarizedAnswer);

            // De-duplicate recommended pages
            if (Array.isArray(data.recommendedPages)) {
                const uniquePages = Array.from(new Set(data.recommendedPages));
                setReferencePages(uniquePages);
            }
        } catch (err: unknown) {
            // If all retries fail or a non-timeout error:
            setAiError("Timeout error: Please try again later.");
        } finally {
            setAiLoading(false);
        }
    };

    // 5. Display loading states
    if (roleLoading) {
        return <LoadingPage />;
    }
    if (loading) {
        return <LoadingDoc />;
    }

    // 6. Render
    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <DocumentsSidebar
                categories={categories}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedDoc={selectedDoc}
                setSelectedDoc={(doc) => {
                    // Whenever we pick a doc, reset some states
                    setSelectedDoc(doc);
                    setPdfPageNumber(1);
                    setAiAnswer("");
                    setReferencePages([]);
                }}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {/* Main Content */}
            <main className={styles.mainContent}>
                <DocumentContent
                    selectedDoc={selectedDoc}
                    viewMode={viewMode}
                    aiQuestion={aiQuestion}
                    setAiQuestion={setAiQuestion}
                    aiAnswer={aiAnswer}
                    aiError={aiError}
                    aiLoading={aiLoading}
                    handleAiSearch={handleAiSearch}
                    referencePages={referencePages}
                    pdfPageNumber={pdfPageNumber}
                    setPdfPageNumber={setPdfPageNumber}
                />
            </main>
        </div>
    );
};

export default DocumentViewer;
