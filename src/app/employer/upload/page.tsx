"use client";

import React, {useEffect, useState} from "react";
import { UploadDropzone } from "~/app/utils/uploadthing"; // Adjust import path to your project structure
import { FileText, Calendar, FolderPlus, Plus } from "lucide-react";
import styles from "../../../styles/employerupload.module.css";
import {useAuth} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingPage from "~/app/_components/loading";

interface UploadFormData {
    title: string;
    category: string;
    uploadDate: string;
    fileUrl: string | null; // Store the uploaded file URL
    fileName: string;
}

const DocumentUpload: React.FC = () => {
    const auth = useAuth();
    const router = useRouter();

    //check if authorized. If not authorized as employer, return home
    const { isLoaded, userId } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        // If there is no user at all, send them home
        if (!userId) {
            router.push("/");
            return;
        }

        // Check if the user’s role is employer
        const checkEmployerRole = async () => {
            try {
                const response = await fetch("/api/employerAuth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) {
                    // If the endpoint returns an error, also redirect
                    router.push("/");
                    return;
                }

            } catch (error) {
                console.error("Error checking employer role:", error);
                // If there is any error, also redirect or handle appropriately
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        checkEmployerRole();
    }, [userId, router]);



    const [formData, setFormData] = useState<UploadFormData>({
        title: "",
        category: "",
        uploadDate: new Date().toISOString().split("T")[0],
        fileUrl: null, // Initially no file URL
        fileName: "",
    });

    const [errors, setErrors] = useState<Partial<UploadFormData>>({});

    // Predefined categories (can be moved to a separate config or fetched from an API)
    const categories = [
        "Financial",
        "HR",
        "Legal",
        "Marketing",
        "Operations",
        "Planning",
        "Other",
    ];

    // -----------------------------
    // Handle Input Changes
    // -----------------------------
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    // -----------------------------
    // Validation
    // -----------------------------
    const validateForm = (): boolean => {
        const newErrors: Partial<UploadFormData> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!formData.category) {
            newErrors.category = "Category is required";
        }
        if (!formData.fileUrl) {
            newErrors.fileUrl = "Please upload a PDF file";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // -----------------------------
    // Form Submission
    // -----------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // At this point, you have a valid form with:
        //   formData.fileUrl (PDF URL)
        //   formData.title
        //   formData.category
        //   formData.uploadDate

        console.log("Uploading document to server with data:", formData);

        const response = await fetch("/api/uploadDocument", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              userId: auth.userId,
              documentName: formData.title,
              documentCategory: formData.category,
              documentUrl: formData.fileUrl,
          }),
        });
        console.log(response)

        router.push("/fetchDocument/documents")


        // Reset the form or redirect
    };

    if(loading){
        return <LoadingPage />;
    }

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Upload New Document</h1>
                <p className={styles.subtitle}>Add a new document to your repository</p>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* File Upload Area */}
                    {/* UploadDropzone from UploadThing */}
                    {!formData.fileUrl ? (
                        <UploadDropzone
                            endpoint="pdfUploader"
                            onClientUploadComplete={(res) => {
                                if (!res || !res.length) return;
                                const fileUrl = res[0].url;
                                const fileName = res[0].name;
                                setFormData((prev) => ({ ...prev, fileUrl: fileUrl, fileName: fileName}));
                            }}
                            onUploadError={(error) => {
                                console.error("Upload Error:", error);
                            }}
                            style={{ width: "100%", height: "100%" }}
                        />
                    ) : (
                        <div className={styles.fileInfo}>
                            <FileText className={styles.fileIcon} />
                            <span className={styles.fileName}>{formData.fileName}</span>
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, fileUrl: null }))}
                                className={styles.removeFile}
                            >
                                Remove
                            </button>
                        </div>
                    )}
                {errors.fileUrl && <span className={styles.error}>{errors.fileUrl}</span>}

                {/* Document Details */}
                <div className={styles.formFields}>
                    {/* Title */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Document Title</label>
                        <div className={styles.inputWrapper}>
                            <FileText className={styles.inputIcon} />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Enter document title"
                            />
                        </div>
                        {errors.title && <span className={styles.error}>{errors.title}</span>}
                    </div>

                    {/* Category */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Category</label>
                        <div className={styles.inputWrapper}>
                            <FolderPlus className={styles.inputIcon} />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={styles.select}
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.category && (
                            <span className={styles.error}>{errors.category}</span>
                        )}
                    </div>

                    {/* Upload Date */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Upload Date</label>
                        <div className={styles.inputWrapper}>
                            <Calendar className={styles.inputIcon} />
                            <input
                                type="date"
                                name="uploadDate"
                                value={formData.uploadDate}
                                onChange={handleInputChange}
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className={styles.submitButton}>
                    <Plus className={styles.buttonIcon} />
                    Upload Document
                </button>
            </form>
        </div>
    );
};

export default DocumentUpload;