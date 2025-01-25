"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Brain, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import EmployerAuthCheck from "./EmployerAuthCheck";
import UploadForm from "./UploadForm";
import CategoryManagement from "./CategoryManagement";
import styles from "../../../styles/employerupload.module.css";

interface Category {
    id: string;
    name: string;
}

const Page: React.FC = () => {
    const router = useRouter();

    // --- Category state and logic (fetched from server) ---
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchCategories = useCallback(async (userId: string) => {
        try {
            const res = await fetch("/api/Categories/GetCategories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch categories");
            }
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const handleAddCategory = useCallback(
        async (userId: string, newCategory: string) => {
            if (!newCategory.trim()) return;
            try {
                const res = await fetch("/api/Categories/AddCategories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, CategoryName: newCategory }),
                });
                if (!res.ok) {
                    throw new Error("Failed to create category");
                }
                const createdCategory = await res.json();

                setCategories((prev) => [...prev, createdCategory]);
            } catch (error) {
                console.error(error);
                alert("Error creating category. Check console for details.");
            }
        },
        [],
    );

    const handleRemoveCategory = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await fetch("/api/Categories/DeleteCategories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                throw new Error("Failed to remove category");
            }
            setCategories((prev) => prev.filter((cat) => cat.id !== id));
        } catch (error) {
            console.error(error);
            alert("Error removing category. Check console for details.");
        }
    }, []);

    // --- Render ---
    return (
        <EmployerAuthCheck onAuthSuccess={fetchCategories}>
            {/* Navbar / Header */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.logoWrapper}>
                        <Brain className={styles.logoIcon} />
                        <span className={styles.logoText}>PDR AI</span>
                    </div>
                    <button
                        onClick={() => router.push("/employer/home")}
                        className={styles.homeButton}
                    >
                        <Home className={styles.homeIcon} />
                        Home
                    </button>
                </div>
            </nav>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Upload New Document</h1>
                    <p className={styles.subtitle}>Add a new document to your repository</p>
                </div>

                {/* Upload Form */}
                <UploadForm categories={categories} />

                {/* Category Management */}
                <CategoryManagement
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onRemoveCategory={handleRemoveCategory}
                />
            </div>
        </EmployerAuthCheck>
    );
};

export default Page;
