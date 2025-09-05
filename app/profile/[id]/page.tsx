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
import { UserProfile } from "@/types";

type DialogType = "create" | "invite" | null;

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
          description: `Create a new jam session and invite ${user?.name} to join. You can set the date, time, location, and musical style for the session.`,
          content: (
            <CreateJamForm
              inviteUserEmail={user?.email}
              onSuccess={() => setIsDialogOpen(false)}
            />
          ),
        };
      case "invite":
        return {
          title: "Invite to Existing Jam",
          description: `Invite ${user?.name} to join one of your existing jam sessions. Select from your upcoming sessions below.`,
          content: (
            <div className="space-y-4">
              <p className="text-sm ">
                Choose an existing jam session to invite {user?.name} to join.
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

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${params.id}`);
        const result = await response.json();

        if (response.ok) {
          setUser(result.data);
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

    if (params.id) {
      fetchUser();
    }
  }, [params.id, session, status, router]);

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
        </div>
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="flex justify-between items-center">
                <div className="text-3xl flex">{user.name}</div>
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

            {/* Instruments */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Instruments</h3>
              <div className="flex flex-wrap gap-2">
                {user.instruments.map((instrument, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {instrument}
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
              <p className="">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
