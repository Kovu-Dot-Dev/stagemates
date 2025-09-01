"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/signUpForm";

export default function Login() {
  const { data: session } = useSession();

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
        ) : (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Welcome back!</h2>
              <p className="text-muted-foreground">{session.user?.name}</p>
            </div>
            <ProfileForm />
            <div className="space-y-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full cursor-pointer"
                onClick={() => signOut()}
              >
                Sign out
              </Button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
