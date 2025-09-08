"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeCard from "@/components/homeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JamCard from "@/components/jamCard";
import { Jam, User } from "@/types";
import { JamModal } from "@/components/jamCard";
import CTACard from "@/components/ctaCard";

interface Band {
  id: number;
  name: string;
  genre: string;
  members: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [jams, setJams] = useState<Jam[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentJam, setCurrentJam] = useState<Jam | null>(null);
  const [bands, setBands] = useState([]);

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

    const fetchBands = async () => {
      try {
        const response = await fetch("/api/bands");
        const result = await response.json();
        if (result.data) {
          setBands(result.data);
        }
      } catch (error) {
        console.error("Error fetching bands:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "loading") return; // Still loading

    if (session == null || session) {
      console.log("session is not null");
      fetchJams();
      fetchUsers();
      fetchBands();
    }
  }, [session, status, router, loading]);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.instruments?.some((instrument) =>
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
        <Tabs defaultValue="jams" className="w-full flex justify-center">
          <TabsList className="grid w-1/3 mx-auto grid-cols-3">
            <TabsTrigger value="jams" className="cursor-pointer">
              Jams
            </TabsTrigger>
            <TabsTrigger value="musicians" className="cursor-pointer">
              Musicians
            </TabsTrigger>
            <TabsTrigger value="bands" className="cursor-pointer">
              Bands
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <CTACard title="Create a Jam" buttonText="Create Jam" />
          </div>

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
                <p className="text-center ">
                  No musicians found matching {searchTerm}
                </p>
              ) : users.length === 0 ? (
                <p className="text-center ">No musicians found</p>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="jams" className="space-y-6 mt-6">
            <div className="flex flex-col gap-4">
              {jams.length > 0 ? (
                jams.map((jam) => (
                  <JamCard
                    key={jam.id}
                    jam={jam}
                    handleClick={() => {
                      setCurrentJam(jam);
                      setShowModal(true);
                    }}
                  />
                ))
              ) : (
                <p className="text-center ">No jams found</p>
              )}
            </div>
            <JamModal
              show={showModal}
              onClose={() => setShowModal(false)}
              jam={currentJam!}
            />
          </TabsContent>
          <TabsContent value="bands" className="space-y-6 mt-6">
            <div className="flex flex-col gap-4">
              {bands.length > 0 ? (
                bands.map((band: Band) => (
                  <div
                    key={band.id}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm"
                  >
                    <h2 className="text-xl font-semibold mb-2">{band.name}</h2>
                    <p className="mb-1">
                      <span className="font-semibold">Genre:</span> {band.genre}
                    </p>
                    <p>
                      <span className="font-semibold">Members:</span>{" "}
                      {band.members}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center ">No bands found</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
