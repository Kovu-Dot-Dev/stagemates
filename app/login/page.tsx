"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      {!session ? (
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-md hover:bg-primary-foreground hover:text-primary"
          onClick={() => signIn("google")}
        >
          Sign in with Google
        </button>
      ) : (
        <div className="text-center">
          <p className="mb-4">Welcome {session.user?.name}</p>
          <button
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow-md hover:bg-secondary-foreground hover:text-secondary"
            onClick={() => signOut()}
          >
            Sign out
          </button>
          <button
            className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-md shadow-md hover:bg-accent-foreground hover:text-accent"
            onClick={async () => {
              await fetch("/api/adduser", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@example.com", name: "Ryan" }),
              });
            }}
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
}
