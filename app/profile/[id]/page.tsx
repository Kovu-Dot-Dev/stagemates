"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmbedContent from "@/components/embedContent";
import { CreateJamForm } from "@/components/createJamForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { UserProfile, Jam, Band } from "@/types";
import { addUserToBand } from "@/lib/utils";

interface JamWithParticipants extends Jam {
  participants: UserProfile[];
}

type DialogType = "create" | "invite" | null;

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pastJams, setPastJams] = useState<JamWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [isBandDialogOpen, setIsBandDialogOpen] = useState(false);
  const [userBands, setUserBands] = useState<Band[]>([]);
  const [selectedBand, setSelectedBand] = useState<string>("");

  const handleDialogOpen = (type: DialogType) => {
    if (!session) {
      router.push("/login");
      return;
    }
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const getDialogContent = () => {
    switch (dialogType) {
      case "create":
        return {
          title: "Create New Jam Session",
          description: `Create a new jam session and invite ${profile?.name} to join. You can set the date, time, location, and musical style for the session.`,
          content: (
            <CreateJamForm
              inviteUserEmail={profile?.email}
              onSuccess={() => setIsDialogOpen(false)}
            />
          ),
        };
      case "invite":
        return {
          title: "Invite to Existing Jam",
          description: `Invite ${profile?.name} to join one of your existing jam sessions. Select from your upcoming sessions below.`,
          content: (
            <div className="space-y-4">
              <p className="text-sm ">
                Choose an existing jam session to invite {profile?.name} to
                join.
              </p>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>
                  Send Invite
                </Button>
              </div>
            </div>
          ),
        };
      default:
        return {
          title: "",
          description: "",
          content: null,
        };
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    const fetchProfile = async () => {
      try {
        // Await params before using them
        const resolvedParams = await params;
        const response = await fetch(`/api/user?userId=${resolvedParams.id}`);
        const result = await response.json();

        if (response.ok) {
          setProfile(result.data);
          // Fetch jams for this user
          await fetchProfileJams(result.data.id);
        } else {
          setError(result.error || "User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    const fetchGenres = async () => {
      const response = await fetch("/api/genres");
      const result = await response.json();
      if (result.data) {
        setGenres(result.data);
        console.log("genres fetched");
        console.log(genres);
      }
    };

    const fetchProfileJams = async (userId: number) => {
      console.log("Fetching jams for user ID:", userId);
      try {
        const response = await fetch(`/api/jams?id=${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();
        if (result.data) {
          console.log("User jams result:", result.data);
          // Filter jams to only include past jams (date_happening is before today)
          const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
          const filteredPastJams = result.data.filter(
            (jam: Jam) => jam.date_happening < today
          );
          console.log("Filtered past jams:", filteredPastJams);

          // Fetch participants for each jam
          const jamsWithParticipants = await Promise.all(
            filteredPastJams.map(async (jam: Jam) => {
              const participants = await fetchJamParticipants(jam.id);
              return {
                ...jam,
                participants,
              };
            })
          );

          setPastJams(jamsWithParticipants);
        } else {
          console.error("Error fetching jams:", result.error);
        }
      } catch (error) {
        console.error("Error fetching user jams:", error);
      }
    };

    const fetchJamParticipants = async (
      jamId: number
    ): Promise<UserProfile[]> => {
      console.log("Fetching participants for jam ID:", jamId);
      try {
        const response = await fetch(`/api/user?jamId=${jamId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();
        if (result.data) {
          console.log(`Participants for jam ${jamId}:`, result.data);
          return result.data;
        } else {
          console.error("Error fetching jam participants:", result.error);
          return [];
        }
      } catch (error) {
        console.error("Error fetching jam participants:", error);
        return [];
      }
    };

    const fetchUserBands = async (userId: number) => {
      const response = await fetch(`/api/bands?userId=${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      console.log("User bands result:", result.data);
      if (result.data) {
        setUserBands(result.data);
      }
    };

    // Get userData from localStorage and fetch user bands
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        if (parsedUserData?.id) {
          fetchUserBands(parsedUserData.id);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }

    if (params) {
      fetchGenres();
      fetchProfile();
    }
  }, [params, session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Profile Not Found
          </h1>
          <p className="">{error}</p>
          <Button onClick={() => router.push("/")} variant="default">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const socialLinks = [
    { label: "Spotify", url: profile.spotify_link, color: "bg-green-600" },
    {
      label: "SoundCloud",
      url: profile.soundcloud_link,
      color: "bg-orange-600",
    },
    { label: "Instagram", url: profile.instagram_link, color: "bg-pink-600" },
    { label: "TikTok", url: profile.tiktok_link, color: "bg-black" },
  ].filter((link) => link.url);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/")} size="sm">
            ← Back to Home
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="flex justify-between items-center">
                <div className="text-3xl flex">{profile.name}</div>
                {/* SEND JAM REQ BUTTON */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                      >
                        Send Jam Request
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDialogOpen("create")}
                      >
                        Create Jam
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDialogOpen("invite")}
                      >
                        Invite to Existing Jam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{getDialogContent().title}</DialogTitle>
                        <DialogDescription>
                          {getDialogContent().description}
                        </DialogDescription>
                      </DialogHeader>
                      {getDialogContent().content}
                    </DialogContent>
                  </Dialog>
                </div>
                {/* ADD TO BAND BUTTON */}
                <div>
                  <Button
                    className="cursor-pointer"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBandDialogOpen(true);
                    }}
                  >
                    Add to Band
                  </Button>
                  <Dialog open={isBandDialogOpen} onOpenChange={setIsBandDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Band</DialogTitle>
                        <DialogDescription>
                          Add {profile?.name} to your band
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Select your band:
                          </label>
                          <Select
                            value={selectedBand}
                            onValueChange={(value) => {
                              setSelectedBand(value);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a band to add the user to" />
                            </SelectTrigger>
                            <SelectContent>
                              {userBands.map((band) => (
                                <SelectItem
                                  key={band.id}
                                  value={band.id.toString()}
                                >
                                  {band.name} - {band.genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedBand("");
                              setIsBandDialogOpen(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              if (selectedBand && profile?.id) {
                                const result = await addUserToBand(selectedBand, profile.id.toString());

                                if (result.success) {
                                  alert(result.message || "User added to band successfully!");
                                  setSelectedBand("");
                                  setIsBandDialogOpen(false);
                                } else {
                                  alert(`Error adding user to band: ${result.error}`);
                                }
                              } else if (!selectedBand) {
                                alert("Please select a band first");
                              } else {
                                alert("Profile user ID not available");
                              }
                            }}
                          >
                            Add to Band
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
              <p className="text-xl ">@{profile.username}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {profile.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="">{profile.description}</p>
              </div>
            )}

            {/* Genre */}
            {user.genres && user.genres.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Preferred Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {user.genres.map((genreId, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm"
                    >
                      {genres.find((g) => g.id === genreId)?.name || "Unknown"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Instruments */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Instruments</h3>
              <div className="flex flex-wrap gap-2">
                {profile.instruments?.map((instrument, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {instrument}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Availability</h3>
              <div className="flex flex-wrap gap-2">
                {user.availability?.map((day, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>          

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Social Links</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => (
                    <EmbedContent key={index} url={link.url || ""} />
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="">{profile.email}</p>
            </div>

            {/* Past Jams */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Past Jams</h3>
              {pastJams.length > 0 ? (
                <div className="space-y-4">
                  {pastJams.map((jam) => (
                    <div key={jam.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">
                          {jam.jam_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          ID: {jam.id}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              📍 Location:
                            </span>
                            <span className="text-sm">{jam.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              👥 Capacity:
                            </span>
                            <span className="text-sm">
                              {jam.capacity} people
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              📅 Jam Date:
                            </span>
                            <span className="text-sm">
                              {new Date(
                                jam.date_happening
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              👤 Owner:
                            </span>
                            <span className="text-sm">{jam.owner_email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Participants */}
                      {jam.participants && jam.participants.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <h5 className="text-sm font-medium mb-2">
                            🎵 Participants:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {jam.participants.map((participant) => (
                              <Badge
                                key={participant.id}
                                variant="secondary"
                                className="text-xs"
                              >
                                {participant.name} (@{participant.username})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No past jams found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
