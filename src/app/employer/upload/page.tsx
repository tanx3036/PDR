"use client";

import React, { useState } from "react";
import { UploadDropzone } from "~/app/utils/uploadthing"; // Adjust import path to your project structure
import { FileText, Calendar, FolderPlus, Plus } from "lucide-react";
import styles from "../../../styles/employerupload.module.css";

interface UploadFormData {
    title: string;
    category: string;
    uploadDate: string;
    fileUrl: string | null; // Store the uploaded file URL
}

const DocumentUpload: React.FC = () => {

    const [formData, setFormData] = useState<UploadFormData>({
        title: "",
        category: "",
        uploadDate: new Date().toISOString().split("T")[0],
        fileUrl: null, // Initially no file URL
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

        // TODO: Make your server POST request here, e.g.:
        // await fetch("/api/document/create", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(formData),
        // });

        // Reset the form or redirect
    };

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
                <div className={styles.uploadArea}>
                    {/* UploadDropzone from UploadThing */}
                    {!formData.fileUrl ? (
                        <UploadDropzone
                            endpoint="pdfUploader"
                            onClientUploadComplete={(res) => {
                                if (!res || !res.length) return;
                                const fileUrl = res[0].url;

                                setFormData((prev) => ({ ...prev, fileUrl: fileUrl }));
                                console.log(formData)
                            }}
                            onUploadError={(error) => {
                                console.error("Upload Error:", error);
                            }}
                        />
                    ) : (
                        <div className={styles.fileInfo}>
                            <FileText className={styles.fileIcon} />
                            <span className={styles.fileName}>PDF uploaded!</span>
                            <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, fileUrl: null }))}
                                className={styles.removeFile}
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>
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