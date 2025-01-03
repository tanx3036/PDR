"use client"

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Calendar, FolderPlus, Plus } from 'lucide-react';
import styles from '../../../styles/employerupload.module.css';

interface UploadFormData {
    title: string;
    category: string;
    uploadDate: string;
    file: File | null;
}

const DocumentUpload: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState<UploadFormData>({
        title: '',
        category: '',
        uploadDate: new Date().toISOString().split('T')[0],
        file: null
    });
    const [errors, setErrors] = useState<Partial<UploadFormData>>({});

    // Predefined categories (can be moved to a separate config)
    const categories = [
        'Financial',
        'HR',
        'Legal',
        'Marketing',
        'Operations',
        'Planning',
        'Other'
    ];

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            setFormData(prev => ({ ...prev, file }));
            setErrors(prev => ({ ...prev, file: undefined }));
        } else {
            setErrors(prev => ({ ...prev, file: 'Please upload a PDF file' }));
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setFormData(prev => ({ ...prev, file }));
            setErrors(prev => ({ ...prev, file: undefined }));
        } else {
            setErrors(prev => ({ ...prev, file: 'Please upload a PDF file' }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<UploadFormData> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }
        if (!formData.file) {
            newErrors.file = 'Please upload a PDF file';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            console.log('Uploading document:', formData);
            // Handle upload logic
        }
    };

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
                <div
                    className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''} ${formData.file ? styles.hasFile : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {formData.file ? (
                        <div className={styles.fileInfo}>
                            <FileText className={styles.fileIcon} />
                            <span className={styles.fileName}>{formData.file.name}</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                                className={styles.removeFile}
                            >
                                <X className={styles.removeIcon} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload className={styles.uploadIcon} />
                            <p className={styles.uploadText}>
                                Drag and drop your PDF here, or
                                <label className={styles.browseButton}>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileInput}
                                        className={styles.fileInput}
                                    />
                                    browse
                                </label>
                            </p>
                            <p className={styles.uploadHint}>Only PDF files are supported</p>
                        </>
                    )}
                </div>
                {errors.file && <span className={styles.error}>{errors.file}</span>}

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
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        {errors.category && <span className={styles.error}>{errors.category}</span>}
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