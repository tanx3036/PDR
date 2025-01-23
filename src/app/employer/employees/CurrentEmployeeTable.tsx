"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import styles from "~/styles/employerEmployeeManagement.module.css";
import { Employee } from "./types";

interface EmployeeTableProps {
    employees: Employee[];
    onRemove: (employeeId: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onRemove }) => {
    if (employees.length === 0) {
        return <p>No approved employees yet.</p>;
    }

    return (
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
                    {/* If role is "employer", display "admin" instead */}
                    <td>{emp.role === "employer" ? "admin" : emp.role}</td>
                    <td>
                        {emp.role === "employee" && (
                            <button
                                className={styles.removeButton}
                                onClick={() => onRemove(emp.id)}
                            >
                                <Trash2 size={16} />
                                Remove
                            </button>
                        )}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default EmployeeTable;
