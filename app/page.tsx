"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeCard from "@/components/homeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JamCard from "@/components/jamCard";
import { Jam } from "@/components/jamCard";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [jams, setJams] = useState<Jam[]>([]);

  useEffect(() => {
    console.log("session", session);
    console.log("loading", loading);
    // Fetch users from database
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const result = await response.json();
        if (result.data) {
          setUsers(result.data);
          console.log("users fetched");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        console.log("finally");
        setLoading(false);
        console.log("loading set to false");
      }
    };

    const fetchJams = async () => {
      const response = await fetch("/api/getJams");
      const result = await response.json();
      if (result.data) {
        console.log(result.data);
        setJams(result.data);
      }
    };

    if (status === "loading") return; // Still loading

    if (session == null || session) {
      console.log("session is not null");
      fetchJams();
      fetchUsers();
    }
  }, [session, status, router]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.instruments.some((instrument) =>
        instrument.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="font-sans flex flex-col min-h-screen p-8 gap-8">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Stagemates</h1>
        <div>
          {session ? (
            <>
              <Button
                variant="outline"
                className="cursor-pointer mr-2"
                size="sm"
                onClick={() => {
                  router.push("/userprofile");
                }}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        <Tabs defaultValue="musicians" className="w-full flex justify-center">
          <TabsList className="grid w-1/3 mx-auto grid-cols-2">
            <TabsTrigger value="musicians" className="cursor-pointer">
              Musicians
            </TabsTrigger>
            <TabsTrigger value="jams" className="cursor-pointer">
              Jams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="musicians" className="space-y-6 mt-6">
            {/* Search */}
            <div className="w-full max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search musicians by name or instrument..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Musicians List */}
            <div className="flex flex-col gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <HomeCard
                    key={user.id}
                    userId={user.id}
                    title={user.name}
                    instruments={user.instruments}
                  />
                ))
              ) : searchTerm ? (
                <p className="text-center text-muted-foreground">
                  No musicians found matching "{searchTerm}"
                </p>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No musicians found
                </p>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="jams" className="space-y-6 mt-6">
            <div className="flex flex-col gap-4">
              {jams.length > 0 ? (
                jams.map((jam) => <JamCard key={jam.id} jam={jam} />)
              ) : (
                <p className="text-center text-muted-foreground">
                  No jams found
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
