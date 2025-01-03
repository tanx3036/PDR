"use client";
import React, { useState, useRef, useEffect } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "../../../styles/employerprofiledropdown.module.css";

const ProfileDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();          // Clerk user object
    const { signOut } = useClerk();      // Clerk sign-out method
    const router = useRouter();

    // Close the dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSettings = () => {
        router.push("/employer/settings");
        setIsOpen(false);
    };

    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <SignedIn>
                {/* Profile Button */}
                <button
                    className={styles.profileButton}
                    onClick={handleToggleDropdown}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {user?.profileImageUrl ? (
                        <img
                            src={user.profileImageUrl}
                            alt="User Avatar"
                            className={styles.profileImage}
                        />
                    ) : (
                        <User className={styles.defaultAvatar} />
                    )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className={styles.dropdownMenu}>
                        <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.fullName || "User"}
              </span>
                            <span className={styles.userEmail}>{user?.emailAddresses[0]?.emailAddress}</span>
                        </div>
                        <div className={styles.divider} />
                        <button
                            className={styles.dropdownItem}
                            onClick={handleSettings}
                        >
                            Settings
                        </button>
                        <button
                            className={styles.dropdownItem}
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </SignedIn>

            {/* If not signed in, show a sign-in button or link */}
            <SignedOut>
                <button onClick={() => router.push("/sign-in")}>
                    Sign In
                </button>
            </SignedOut>
        </div>
    );
};

export default ProfileDropdown;