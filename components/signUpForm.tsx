"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

const onSubmit = async (
  values: z.infer<typeof formSchema>,
  session: Session | null,
  router: AppRouterInstance
) => {
  const response = await fetch("/api/adduser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: session?.user?.email,
      name: session?.user?.name,
      username: values.username,
      description: values.description || null,
      instruments: values.instruments,
      spotifyLink: values.spotifyLink || null,
      soundcloudLink: values.soundcloudLink || null,
      instagramLink: values.instagramLink || null,
      tiktokLink: values.tiktokLink || null,
    }),
  });

  if (response.ok) {
    // Redirect to home page after successful submission
    router.push("/");
  }
};

const formSchema = z.object({
  username: z.string().optional(),
  description: z.string().optional(),
  instruments: z
    .array(z.enum(["guitar", "piano", "drums", "bass", "vocals", "other"]))
    .optional(),
  spotifyLink: z.string().url().optional().or(z.literal("")),
  soundcloudLink: z.string().url().optional().or(z.literal("")),
  instagramLink: z.string().url().optional().or(z.literal("")),
  tiktokLink: z.string().url().optional().or(z.literal("")),
});

interface ProfileFormProps {
  username?: string;
  description?: string;
  instruments?: ("guitar" | "piano" | "drums" | "bass" | "vocals" | "other")[];
  spotifyLink?: string;
  soundcloudLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
}

export function ProfileForm({
  username = "",
  description = "",
  instruments = [],
  spotifyLink = "",
  soundcloudLink = "",
  instagramLink = "",
  tiktokLink = "",
}: ProfileFormProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: username || "",
      description: description || "",
      instruments: instruments || [],
      spotifyLink: spotifyLink || "",
      soundcloudLink: soundcloudLink || "",
      instagramLink: instagramLink || "",
      tiktokLink: tiktokLink || "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, session, router)
        )}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tell us about yourself and your music..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe your musical style, experience, or what you're looking
                for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instruments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrument</FormLabel>
              <FormControl>
                <ToggleGroup
                  className="w-full"
                  type="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <ToggleGroupItem value="guitar">Guitar</ToggleGroupItem>
                  <ToggleGroupItem value="piano">Piano</ToggleGroupItem>
                  <ToggleGroupItem value="drums">Drums</ToggleGroupItem>
                  <ToggleGroupItem value="bass">Bass</ToggleGroupItem>
                  <ToggleGroupItem value="vocals">Vocals</ToggleGroupItem>
                  <ToggleGroupItem value="other">Other</ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="spotifyLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spotify Link (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://open.spotify.com/artist/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="soundcloudLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SoundCloud Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://soundcloud.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instagramLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tiktokLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TikTok Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://tiktok.com/@..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="default" size="lg" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
