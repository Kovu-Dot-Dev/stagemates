"use client";

import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleUser = async () => {
      console.log(session);
      if (session?.user?.email && session?.user?.name) {
        // Check if user exists
        const checkResponse = await fetch(
          `/api/userbyemail?email=${encodeURIComponent(session.user.email)}`
        );
        const checkResult = await checkResponse.json();

        if (!checkResult.data) {
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
          } else {
            console.error("Failed to create user");
          }
        }

        // Redirect to home page
        router.push("/");
      }
    };

    if (session) {
      handleUser();
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
      <div className="w-full max-w-md space-y-8">
        {!session ? (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Welcome to Stagemates
              </h1>
              <p className="mt-2 text-sm ">
                Sign in to your account to continue
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Redirecting...</h2>
              <p className="">Please wait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
