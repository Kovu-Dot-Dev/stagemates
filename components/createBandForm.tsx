"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";

const jamFormSchema = z.object({
  jamName: z.string().min(1, "Jam name is required"),
  location: z.string().min(1, "Location is required"),
  dateHappening: z.string().min(1, "Date is required"),
  capacity: z.number().min(1, "Capacity must be at least 1").max(100, "Capacity cannot exceed 100"),
});

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

const onSubmit = async (
  values: z.infer<typeof jamFormSchema>,
  session: any,
  router: any,
  inviteUserEmail?: string,
  onSuccess?: () => void
) => {
  if (!values.jamName.trim()) {
    alert("Please enter a jam name");
    return;
  }

  try {
    // First, create the jam
    const jamResponse = await fetch("/api/createJam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jamName: values.jamName,
        location: values.location,
        dateHappening: values.dateHappening,
        capacity: values.capacity,
        creatorEmail: session?.user?.email,
      }),
    });

    if (!jamResponse.ok) {
      const result = await jamResponse.json();
      alert(result.error || "Failed to create jam");
      return;
    }

    const jamResult = await jamResponse.json();
    const jamId = jamResult.data.id;

    // If we have a user to invite, create the jam invite
    if (inviteUserEmail) {
      const inviteResponse = await fetch("/api/createInvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jamId: jamId,
          requesterEmail: session?.user?.email,
          respondantEmail: inviteUserEmail,
        }),
      });

      if (inviteResponse.ok) {
        alert("Jam and invite created successfully!");
        onSuccess?.();
      } else {
        const inviteResult = await inviteResponse.json();
        alert(inviteResult.error || "Jam created but failed to create invite");
        onSuccess?.();
      }
    } else {
      console.log("Jam created successfully:", jamResult);
      alert("Jam created successfully!");
      onSuccess?.();
    }
  } catch (error) {
    console.error("Error creating jam:", error);
    alert("Failed to create jam");
  }
};

interface CreateJamFormProps {
  jamName?: string;
  location?: string;
  dateHappening?: string;
  capacity?: number;
  inviteUserEmail?: string;
  onSuccess?: () => void;
}

export function CreateJamForm({
  jamName = "",
  location = "",
  dateHappening = "",
  capacity = 5,
  inviteUserEmail,
  onSuccess,
}: CreateJamFormProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const form = useForm<z.infer<typeof jamFormSchema>>({
    resolver: zodResolver(jamFormSchema),
    defaultValues: {
      jamName: jamName || getRandomJamName(),
      location: location || "",
      dateHappening: dateHappening || "",
      capacity: capacity || 5,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, session, router, inviteUserEmail, onSuccess)
        )}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="jamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jam Session Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter jam session name" {...field} />
              </FormControl>
              <FormDescription>
                Give your jam session a memorable name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location (e.g., Studio A, 123 Music St)" {...field} />
              </FormControl>
              <FormDescription>
                Where will the jam session take place?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateHappening"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                When will the jam session happen?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="100" 
                  placeholder="5"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Maximum number of participants for this jam session.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="default" size="lg" className="w-full">
          Create Jam Session
        </Button>
      </form>
    </Form>
  );
}
