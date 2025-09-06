// show all bands
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
import { JamModal } from "@/components/jamCard";

interface Band {
  id: number;
  name: string;
  genre: string[];
  members: number;
}

export default function Bands() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bands, setBands] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("session", session);
    console.log("loading", loading);
    // Fetch bands from database
    const fetchBands = async () => {
      try {
        const response = await fetch("/api/bands");
        const result = await response.json();
        if (result.data) {
          setBands(result.data);
          console.log("bands fetched");
        }
      } catch (error) {
        console.error("Error fetching bands:", error);
      } finally {
        console.log("finally");
        setLoading(false);
        console.log("loading set to false");
      }
    };

    fetchBands();
  }, [session, status, router, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  //   if (status === "unauthenticated") {
  //     router.push("/login");
  //     return null;
  //   }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push("/")} size="sm">
          ← Back to Home
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-4">Bands</h1>
      <Input
        type="text"
        placeholder="Search bands..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bands
          .filter((band) =>
            band.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((band) => (
            <div
              key={band.id}
              className="border p-4 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/bands/${band.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{band.name}</h2>
              <p className="mb-2">Genre: {band.genre}</p>
              <p className="mb-2">Members: {band.members}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
