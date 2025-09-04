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

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  description?: string;
  instruments: string[];
  spotify_link?: string;
  soundcloud_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
}

type DialogType = "create" | "invite" | null;

const JAM_NAMES = [
  "tiny-dancing-duck",
  "happy-fuzzy-bunny",
  "sleepy-polka-panda",
  "shiny-rainbow-fish",
  "funky-guitar-goose",
  "silly-purple-llama",
  "jumping-banana-frog",
  "wobbly-polka-pig",
  "cosmic-disco-cat",
  "jolly-marshmallow-moose",
  "spicy-taco-turtle",
  "bouncy-polka-bear",
  "lucky-cactus-crow",
  "mellow-mango-monkey",
  "happy-marble-hedgehog",
  "dancing-donut-dog",
  "tiny-marshmallow-moth",
  "silly-pizza-parrot",
  "fuzzy-laser-fox",
  "jelly-disco-deer",
  "sleepy-cupcake-koala",
  "funky-drum-duckling",
  "rainbow-bubble-bat",
  "giggly-marshmallow-mule",
  "tiny-bongo-badger",
  "sparkly-disco-dolphin",
  "mellow-bubble-bear",
  "happy-sundae-seal",
  "silly-bongo-sheep",
  "jazzy-marshmallow-jay",
];

const getRandomJamName = () => {
  return JAM_NAMES[Math.floor(Math.random() * JAM_NAMES.length)];
};

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jamName, setJamName] = useState(getRandomJamName());

  const handleDialogOpen = (type: DialogType) => {
    if (!session) {
      router.push("/login");
      return;
    }
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const createJam = async () => {
    if (!jamName.trim()) {
      alert("Please enter a jam name");
      return;
    }

    try {
      // First, create the jam
      const jamResponse = await fetch("/api/createJam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jamName: jamName,
        }),
      });

      if (!jamResponse.ok) {
        const result = await jamResponse.json();
        alert(result.error || "Failed to create jam");
        return;
      }

      const jamResult = await jamResponse.json();
      const jamId = jamResult.data.id;

      // Then, create the jam invite
      const inviteResponse = await fetch("/api/createInvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jamId: jamId,
          requesterEmail: session?.user?.email,
          respondantEmail: user?.email,
        }),
      });

      if (inviteResponse.ok) {
        setJamName(getRandomJamName());
        setIsDialogOpen(false);
        alert("Jam and invite created successfully!");
      } else {
        const inviteResult = await inviteResponse.json();
        alert(inviteResult.error || "Jam created but failed to create invite");
      }
    } catch (error) {
      console.error("Error creating jam:", error);
      alert("Failed to create jam");
    }
  };

  const getDialogContent = () => {
    switch (dialogType) {
      case "create":
        return {
          title: "Create New Jam Session",
          description: `Create a new jam session and invite ${user?.name} to join. You can set the date, time, location, and musical style for the session.`,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fill in the details below to get started.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jamName">Jam Session Name</Label>
                  <Input
                    id="jamName"
                    type="text"
                    placeholder="Enter jam session name..."
                    value={jamName}
                    onChange={(e) => setJamName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                {/* the create jam function creates a jam and a jam invite in the DB*/}
                <Button onClick={createJam}>Create Jam</Button>
              </div>
            </div>
          ),
        };
      case "invite":
        return {
          title: "Invite to Existing Jam",
          description: `Invite ${user?.name} to join one of your existing jam sessions. Select from your upcoming sessions below.`,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
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
          <p className="text-muted-foreground">{error}</p>
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
              <p className="text-xl text-muted-foreground">@{user.username}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            {user.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{user.description}</p>
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
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
