"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import HomeCard from "@/components/homeCard";

interface User {
  id: number;
  name: string;
  email: string;
  instruments: string[];
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/login");
      return;
    }
    
    // Fetch users from database
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const result = await response.json();
        if (result.data) {
          setUsers(result.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-2xl font-bold text-foreground">List of Musicians</h1>
      <div className="flex flex-col gap-4 w-2/3">
        {users.length > 0 ? (
          users.map((user) => (
            <HomeCard 
              key={user.id}
              title={user.name} 
              description={Array.isArray(user.instruments) ? user.instruments.join(", ") : user.instruments || "No instruments listed"} 
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground">No musicians found</p>
        )}
      </div>
    </div>
  );
}
