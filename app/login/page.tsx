"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/signUpForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userExists, setUserExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      if (session?.user?.email) {
        console.log(session);
        
        const response = await fetch("/api/checkuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
          }),
        });
        
        const result = await response.json();
        
        if (result.exists) {
          // User exists, redirect to home page
          router.push("/");
        } else {
          // User doesn't exist, stay on page and show signup form
          setUserExists(false);
        }
      }
    };

    if (session) {
      checkUser();
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
              <p className="mt-2 text-sm text-muted-foreground">
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
        ) : userExists === false ? (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Complete Your Profile</h2>
              <p className="text-muted-foreground">{session.user?.name}</p>
            </div>
            <ProfileForm />
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Checking your profile...</h2>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
