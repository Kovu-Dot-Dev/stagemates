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
import { ProfileForm } from "@/components/signUpForm";

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  description?: string;
  instruments?: ("guitar" | "piano" | "drums" | "bass" | "vocals" | "other")[];
  spotify_link?: string;
  soundcloud_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState<"view" | "edit">("view");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchUser = async (email: string) => {
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
      } else {
        setError(result.error || "User not found");
      }

      setLoading(false);
    };

    if (session && session.user && session.user.email) {
      fetchUser(session.user.email);
    }
  }, [session, status, router]);

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
                <p className="text-xl text-muted-foreground">
                  @{user.username}
                </p>
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
              {user.instruments && user.instruments.length > 0 && (
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
                <p className="text-muted-foreground">{user.email}</p>
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
