"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmbedContent from "@/components/embedContent";
import { ProfileForm } from "@/components/signUpForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { UserProfile, Jam } from "@/types";

interface JamWithParticipants extends Jam {
  participants: UserProfile[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pastJams, setPastJams] = useState<JamWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<"view" | "edit">("view");
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchData = async (email: string) => {
      console.log("Fetching user with email:", email);
      const response = await fetch(
        `/api/userbyemail?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();
      if (result.data) {
        setUser(result.data);
        // Fetch jams for this user (in actual pracise, id will be stored in client so no need fetch) bad practice for now
        await fetchUserJams(result.data.id);
      } else {
        setError(result.error || "User not found");
      }

      console.log("user id", result.data.id);
      const response_invites = await fetch(
        `/api/invites?respondant_id=${result.data.id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result_invites = await response_invites.json();
      if (result_invites.data) {
        console.log("respondant data", result_invites.data);
        setInvites(result_invites.data);
      } else {
        setError(result_invites.error || "Invites not found");
      }

      setLoading(false);
    };

    const fetchUserJams = async (userId: number) => {
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
                participants
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

    const fetchJamParticipants = async (jamId: number): Promise<UserProfile[]> => {
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

    if (session && session.user && session.user.email) {
      fetchData(session.user.email);
    }
  }, [session, status, router]);

  const handleAcceptInvite = async (inviteId: string) => {
    console.log("Accepting invite:", inviteId);
    const response = await fetch(`/api/acceptInvite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    const result = await response.json();
    if (result.data) {
      console.log("Invite accepted successfully");
      alert("Invite accepted successfully!");
    } else {
      setError(result.error || "Invite not accepted");
    }
  };

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

  if (!user) {
    return null;
  }

  const socialLinks = [
    { label: "Spotify", url: user.spotify_link, color: "bg-green-600" },
    { label: "SoundCloud", url: user.soundcloud_link, color: "bg-orange-600" },
    { label: "Instagram", url: user.instagram_link, color: "bg-pink-600" },
    { label: "TikTok", url: user.tiktok_link, color: "bg-black" },
  ].filter((link) => link.url);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/")} size="sm">
            ← Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setPageState(pageState === "view" ? "edit" : "view");
            }}
            size="sm"
          >
            {pageState === "view" ? "Edit Profile" : "View Profile"}
          </Button>
        </div>
        {pageState === "view" ? (
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <CardTitle className="flex justify-between items-center">
                  <div className="text-3xl flex">{user.name}</div>
                </CardTitle>
                <p className="text-xl ">@{user.username}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {user.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="">{user.description}</p>
                </div>
              )}
              {invites.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Invites</AlertTitle>
                  <AlertDescription>
                    <p>
                      You have {invites.length} invite{" "}
                      {invites.length > 1 ? "s" : ""}
                    </p>
                    <div>
                      {invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between"
                        >
                          <p>{invite.requester.name}</p>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptInvite(invite.id)}
                            className="ml-2 text-primary"
                          >
                            Accept
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Instruments */}
              {user.instruments && user.instruments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Instruments</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.instruments.map((instrument, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm"
                      >
                        {instrument}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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
                <p className="">{user.email}</p>
              </div>

              {/* Past Jams */}
              <div>
                <h3 className="text-lg font-semibold mb-3">My Past Jams</h3>
                {pastJams.length > 0 ? (
                  <div className="space-y-4">
                    {pastJams.map((jam) => (
                      <div key={jam.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-lg">{jam.jam_name}</h4>
                          <Badge variant="outline" className="text-xs">
                            ID: {jam.id}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">📍 Location:</span>
                              <span className="text-sm">{jam.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">👥 Capacity:</span>
                              <span className="text-sm">{jam.capacity} people</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">📅 Jam Date:</span>
                              <span className="text-sm">
                                {new Date(jam.date_happening).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">👤 Owner:</span>
                              <span className="text-sm">{jam.owner_email}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Participants */}
                        {jam.participants && jam.participants.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <h5 className="text-sm font-medium mb-2">🎵 Participants:</h5>
                            <div className="flex flex-wrap gap-2">
                              {jam.participants.map((participant) => (
                                <Badge key={participant.id} variant="secondary" className="text-xs">
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                username={user.username}
                description={user.description}
                instruments={user.instruments}
                spotifyLink={user.spotify_link}
                soundcloudLink={user.soundcloud_link}
                instagramLink={user.instagram_link}
                tiktokLink={user.tiktok_link}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
