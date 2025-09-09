"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HomeCard from "@/components/homeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JamCard from "@/components/jamCard";
import { Jam, User } from "@/types";
import { JamModal } from "@/components/jamCard";
import CTACard from "@/components/ctaCard";
import { sendInvites } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Band {
  id: number;
  name: string;
  genre: string;
  members: User[];
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
  const [bands, setBands] = useState<Band[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedJam, setSelectedJam] = useState<string>("");
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    console.log("session", session);
    console.log("loading", loading);

    const handleUser = async () => {
      console.log(session);
      if (session?.user?.email && session?.user?.name) {
        // Check if user exists
        const checkResponse = await fetch(
          `/api/userbyemail?email=${encodeURIComponent(session.user.email)}`
        );
        const checkResult = await checkResponse.json();
        if (checkResult.data) {
          setCurrentUserId(checkResult.data.id);
          setUserData(checkResult.data);
        } else {
          // User doesn't exist, create them
          const createResponse = await fetch("/api/adduser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              username: null,
              description: null,
              instruments: [],
              spotifyLink: null,
              soundcloudLink: null,
              instagramLink: null,
              tiktokLink: null,
            }),
          });

          if (createResponse.ok) {
            console.log("User created successfully");
            // Fetch the newly created user to get their ID
            const newUserResponse = await fetch(
              `/api/userbyemail?email=${encodeURIComponent(session.user.email)}`
            );
            const newUserResult = await newUserResponse.json();
            if (newUserResult.data) {
              setCurrentUserId(newUserResult.data.id);
              setUserData(newUserResult.data);
            }
          } else {
            console.error("Failed to create user");
          }
        }
      }
    };

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
      const response = await fetch("/api/jams");
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
          // Fetch members for each band
          const bandsWithMembers = await Promise.all(
            result.data.map(async (band: Band) => {
              try {
                const memberResponse = await fetch(
                  `/api/user?bandId=${band.id}`
                );
                const memberResult = await memberResponse.json();
                return {
                  ...band,
                  members: memberResult.data || [],
                };
              } catch (error) {
                console.error(
                  `Error fetching members for band ${band.id}:`,
                  error
                );
                return {
                  ...band,
                  members: [],
                };
              }
            })
          );

          console.log("bands with members", bandsWithMembers);
          setBands(bandsWithMembers);
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
      handleUser(); // Handle user creation/checking
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

  // Filter jams by owner email matching session user email
  const userOwnedJams = jams.filter(
    (jam) => jam.owner_email === session?.user?.email
  );

  // Function to send invites to band members
  const handleSendInvites = async (jamId: string, bandId: number) => {
    if (!currentUserId) {
      console.error("No current user ID available");
      alert("Please log in to send invites.");
      return;
    }

    const result = await sendInvites(jamId, bandId.toString(), currentUserId.toString());

    if (result.success) {
      alert(result.message || "Invites sent successfully!");
    } else {
      alert(`Error sending invites: ${result.error}`);
    }
  };

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
                    instruments={user.instruments ?? []}
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
                    className="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-start"
                  >
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold mb-2">
                        {band.name}
                      </h2>
                      <p className="mb-3">
                        <span className="font-semibold">Genre:</span>{" "}
                        {band.genre}
                      </p>
                      <div>
                        <span className="font-semibold mb-2 block">
                          Members:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {band.members.map((member) => (
                            <Badge key={member.id} variant="secondary">
                              {member.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      size="sm"
                      onClick={() => {
                        console.log('xxxxx', band.id)
                        console.log('xxxx', band.name)
                        setSelectedBand(band);
                        setIsDialogOpen(true);
                      }}
                    >
                      Invite band to Jam
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setSelectedBand(null);
                        setSelectedJam("");
                      }
                    }}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite {selectedBand?.name} to your jam</DialogTitle>
                          <DialogDescription>
                            Select a jam to invite this band to
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Select your jam:
                            </label>
                            <Select
                              value={selectedJam}
                              onValueChange={(value) => {
                                setSelectedJam(value);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a jam to invite the band to" />
                              </SelectTrigger>
                              <SelectContent>
                                {userOwnedJams.map((jam) => (
                                  <SelectItem
                                    key={jam.id}
                                    value={jam.id.toString()}
                                  >
                                    {jam.jam_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={() => {
                              if (selectedJam && selectedBand) {
                                console.log('Inviting band:', selectedBand.name, 'id:', selectedBand.id, 'to jam:', selectedJam);
                                handleSendInvites(selectedJam, selectedBand.id);
                                setIsDialogOpen(false);
                              } else if (!selectedJam) {
                                alert("Please select a jam first");
                              } else {
                                alert("No band selected");
                              }
                            }}
                          >
                            Invite Band
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
