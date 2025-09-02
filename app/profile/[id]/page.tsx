"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmbedContent from "@/components/embedContent";

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

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

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
          <h1 className="text-2xl font-bold text-foreground">Profile Not Found</h1>
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
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            size="sm"
          >
            ← Back to Home
          </Button>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-3xl">{user.name}</CardTitle>
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
