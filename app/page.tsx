"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Band } from "@/types";
import Script from "next/script";
import MusicianCard from "@/components/musicianCard";
import { toast } from "sonner";

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
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const toastShown = useRef(false);

  useEffect(() => {
    const handleUser = async () => {
      if (session?.user?.email && session?.user?.name) {
        // Check if user exists
        const checkResponse = await fetch(
          `/api/userbyemail?email=${encodeURIComponent(session.user.email)}`
        );
        const checkResult = await checkResponse.json();
        if (checkResult.data) {
          setCurrentUserId(checkResult.data.id);
          setUserData(checkResult.data);
          localStorage.setItem("userData", JSON.stringify(checkResult.data));
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
              localStorage.setItem(
                "userData",
                JSON.stringify(newUserResult.data)
              );
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

    const fetchGenres = async () => {
      const response = await fetch("/api/genres");
      const result = await response.json();
      if (result.data) {
        setGenres(result.data);
      }
    };

    const fetchJams = async () => {
      const response = await fetch("/api/jams");
      const result = await response.json();
      if (result.data) {
        console.log("xx jams", result.data);
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
      fetchGenres();
    }
  }, [session, status, router, loading]);

  useEffect(() => {
    // Only show toast when not loading and toaster is ready
    if (!toastShown.current && !loading && status !== "loading") {
      toast.info("This is a prototype! Feedback? Hit that chat icon :)");
      toastShown.current = true;
    }
  }, [loading, status]);

  // vibe coded nonsense
  const getUserDataScore = (user: User) => {
    let score = 0;

    // Basic required fields (always present)
    if (user.name) score += 1;
    if (user.email) score += 1;

    // Optional fields with varying weights
    if (user.instruments && user.instruments.length > 0) {
      score += user.instruments.length; // More instruments = higher score
    }
    if (user.availability && user.availability.length > 0) {
      score += user.availability.length; // More available days = higher score
    }
    if (user.genres && user.genres.length > 0) {
      score += user.genres.length; // More genres = higher score
    }

    return score;
  };

  // Filter users based on search term and exclude current user
  const filteredUsers = users
    .filter(
      (user) =>
        // Exclude current user from the list
        user.id !== currentUserId &&
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.instruments?.some((instrument) =>
            instrument.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          user.genres?.some((genreId) => {
            const genre = genres.find((g) => g.id === genreId);
            return genre?.name.toLowerCase().includes(searchTerm.toLowerCase());
          }) ||
          user.availability?.some((day) =>
            day.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    )
    .sort((a, b) => {
      // Sort by data completeness score (highest first)
      const scoreA = getUserDataScore(a);
      const scoreB = getUserDataScore(b);
      return scoreB - scoreA;
    });

  // Helper to get genre names from ids (if available)
  // You may want to fetch all genres and map ids to names for a real app
  const getGenreName = (id: number) => {
    const genre = genres.find((genre) => genre.id === id);
    return genre ? genre.name : "Unknown";
  };

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

    const result = await sendInvites(
      jamId,
      bandId.toString(),
      currentUserId.toString()
    );

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
      {/* <AskJamie /> */}
      <Script src="https://deformity.ai/api/widget?variant=popover&id=w28pfTDPXxIA&buttonColor=%23000000&iconColor=%23ffffff&icon=chat" />
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
          <TabsList className="grid w-1/3 min-w-64 mb-4 mx-auto grid-cols-3">
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
                placeholder="Search musicians by name, instrument, genre, or available days..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Musicians List */}
            <div className="flex flex-col gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <MusicianCard
                    key={user.id}
                    userId={user.id}
                    title={user.name}
                    instruments={user.instruments ?? []}
                    availability={user.availability ?? []}
                    genres={user.genres?.map((genreId) =>
                      getGenreName(genreId)
                    )}
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
                    className="p-4 border border-gray-200 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4"
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
                      className="cursor-pointer "
                      size="sm"
                      onClick={() => {
                        setSelectedBand(band);
                        setIsDialogOpen(true);
                      }}
                    >
                      Invite band to Jam
                    </Button>
                    <Dialog
                      open={isDialogOpen}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                          setSelectedBand(null);
                          setSelectedJam("");
                        }
                      }}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Invite {selectedBand?.name} to your jam
                          </DialogTitle>
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
                                console.log(
                                  "Inviting band:",
                                  selectedBand.name,
                                  "id:",
                                  selectedBand.id,
                                  "to jam:",
                                  selectedJam
                                );
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
