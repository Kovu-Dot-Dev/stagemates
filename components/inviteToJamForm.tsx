"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Session } from "next-auth";
import { Jam } from "@/types";

const inviteFormSchema = z.object({
  jamId: z.string().min(1, "Please select a jam session"),
});

const onSubmit = async (
  values: z.infer<typeof inviteFormSchema>,
  session: Session | null,
  router: AppRouterInstance,
  inviteUserEmail?: string,
  onSuccess?: () => void
) => {
  if (!values.jamId) {
    alert("Please select a jam session");
    return;
  }

  if (!inviteUserEmail) {
    alert("No user email provided for invitation");
    return;
  }

  try {
    console.log("Inviting user to existing jam");
    console.log("requesterEmail", session?.user?.email);
    console.log("respondantEmail", inviteUserEmail);
    console.log("jamId", values.jamId);

    const inviteResponse = await fetch("/api/createInvite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jamId: parseInt(values.jamId),
        requesterEmail: session?.user?.email,
        respondantEmail: inviteUserEmail,
      }),
    });

    if (inviteResponse.ok) {
      alert("Invite sent successfully!");
      onSuccess?.();
    } else {
      const inviteResult = await inviteResponse.json();
      alert(inviteResult.error || "Failed to send invite");
    }
  } catch (error) {
    console.error("Error sending invite:", error);
    alert("Failed to send invite");
  }
};

interface InviteToJamFormProps {
  inviteUserEmail?: string;
  onSuccess?: () => void;
}

export function InviteToJamForm({
  inviteUserEmail,
  onSuccess,
}: InviteToJamFormProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [availableJams, setAvailableJams] = useState<Jam[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      jamId: "",
    },
  });

  useEffect(() => {
    const fetchUserJams = async () => {
      try {
        // Use session email to fetch jams owned by current user
        if (!session?.user?.email) {
          console.error("No user email found in session");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/jams?userEmail=${encodeURIComponent(session.user.email)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();
        if (result.data) {
          // Filter to only show future jams (upcoming sessions)
          const today = new Date().toISOString().split("T")[0];
          const upcomingJams = result.data.filter(
            (jam: Jam) => jam.date_happening >= today
          );
          setAvailableJams(upcomingJams);
        } else {
          console.error("Error fetching jams:", result.error);
        }
      } catch (error) {
        console.error("Error fetching user jams:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserJams();
    }
  }, [session]);

  if (loading) {
    return <div className="text-center py-4">Loading available jams...</div>;
  }

  if (availableJams.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground mb-4">
          You do not have any upcoming jam sessions to invite users to.
        </p>
        <p className="text-sm text-muted-foreground">
          Create a new jam session first to send invites.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, session, router, inviteUserEmail, onSuccess)
        )}
      >
        <FormField
          control={form.control}
          name="jamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Jam Session</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a jam session to invite to" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableJams.map((jam) => (
                    <SelectItem key={jam.id} value={jam.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{jam.jam_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(jam.date_happening).toLocaleDateString()} at {jam.location}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select one of your upcoming jam sessions to invite this user to join.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Send Invite
          </Button>
        </div>
      </form>
    </Form>
  );
}
