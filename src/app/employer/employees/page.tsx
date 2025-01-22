"use client";
import React, { useEffect, useState } from "react";
import { Brain, Trash2, CheckCircle } from "lucide-react";
import styles from "~/styles/employerEmployeeManagement.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import ProfileDropdown from "~/app/employer/_components/ProfileDropdown";
import LoadingPage from "~/app/_components/loading";

interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "verified" | "pending";
}

const ManageEmployeesPage = () => {
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
                if(response.status === 300){
                    router.push("/employee/pending-approval");
                    return;
                }
                else if (!response.ok) {
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
            // For demonstration, we fetch from a hypothetical endpoint
            // Adjust these endpoints to match your API routes
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
            // Call your remove endpoint
            await fetch(`/api/removeEmployees`, {
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
            // Call your approve endpoint
            await fetch(`/api/approveEmployees`, {
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
        {/* Navigation Bar */}
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <div className={styles.logoContainer}>
              <Brain className={styles.logoIcon} />
              <span className={styles.logoText}>PDR AI</span>
            </div>
            <ProfileDropdown />
          </div>
        </nav>

        <main className={styles.main}>
          <h1 className={styles.welcomeTitle}>Manage Employees</h1>

          {/* Approved Employees List */}
          <section className={styles.employeeSection}>
            <h2 className={styles.sectionTitle}>All Employees</h2>
            {employees.length === 0 ? (
              <p>No approved employees yet.</p>
            ) : (
              <table className={styles.employeeTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                      <td>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveEmployee(emp.id)}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Pending Employees List */}
          <section className={styles.employeeSection}>
            <h2 className={styles.sectionTitle}>Pending Approvals</h2>
            {pendingEmployees.length === 0 ? (
              <p>No pending employees.</p>
            ) : (
              <table className={styles.employeeTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.role}</td>
                      <td>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApproveEmployee(emp.id)}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveEmployee(emp.id)}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    );
};

export default ManageEmployeesPage;
