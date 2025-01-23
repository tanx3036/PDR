"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import NavBar from "./NavBar";
import EmployeeTable from "./CurrentEmployeeTable";
import PendingEmployeeTable from "./PendingEmployeeTable";

import { Employee } from "./types";
import LoadingPage from "~/app/_components/loading";

import styles from "~/styles/employerEmployeeManagement.module.css";

const ManageEmployeesPage: React.FC = () => {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        if (!isLoaded) return;

        // If no user, redirect home
        if (!userId) {
            window.alert("Authentication failed! No user found.");
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

                if (response.status === 300) {
                    router.push("/employee/pending-approval");
                    return;
                } else if (!response.ok) {
                    // If the endpoint returns an error, also redirect
                    window.alert("Authentication failed! You are not an employer.");
                    router.push("/");
                    return;
                }

                // If employer check passes, load employees
                await loadEmployees();
            } catch (error) {
                console.error("Error checking employer role:", error);
                window.alert("Authentication failed! You are not an employer.");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        checkEmployerRole().catch(console.error);
    }, [isLoaded, userId, router]);

    const loadEmployees = async () => {
        try {
            const res = await fetch("/api/getAllEmployees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data: Employee[] = await res.json();

            // Separate approved from pending
            const approved = data.filter((emp) => emp.status === "verified");
            const pending = data.filter((emp) => emp.status === "pending");

            setEmployees(approved);
            setPendingEmployees(pending);
        } catch (error) {
            console.error("Error loading employees:", error);
        }
    };

    const handleRemoveEmployee = async (employeeId: string) => {
        try {
            await fetch("/api/removeEmployees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId }),
            });
            // Refresh the lists
            await loadEmployees();
        } catch (error) {
            console.error("Error removing employee:", error);
        }
    };

    const handleApproveEmployee = async (employeeId: string) => {
        try {
            await fetch("/api/approveEmployees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId }),
            });
            // Refresh the lists
            await loadEmployees();
        } catch (error) {
            console.error("Error approving employee:", error);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    return (
        <div className={styles.container}>
            <NavBar />

            <main className={styles.main}>
                <h1 className={styles.welcomeTitle}>Manage Employees</h1>

                {/* Approved Employees */}
                <section className={styles.employeeSection}>
                    <h2 className={styles.sectionTitle}>All Employees</h2>
                    <EmployeeTable
                        employees={employees}
                        onRemove={handleRemoveEmployee}
                    />
                </section>

                {/* Pending Employees */}
                <section className={styles.employeeSection}>
                    <h2 className={styles.sectionTitle}>Pending Approvals</h2>
                    <PendingEmployeeTable
                        employees={pendingEmployees}
                        onApprove={handleApproveEmployee}
                        onRemove={handleRemoveEmployee}
                    />
                </section>
            </main>
        </div>
    );
};

export default ManageEmployeesPage;
