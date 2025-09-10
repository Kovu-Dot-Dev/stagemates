"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Genre } from "@/types";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      availability: values.availability,
      preferredGenres: values.preferredGenres?.filter((id) => id !== undefined) || null,
    }),
  });

  if (response.ok) {
    // Redirect to home page after successful submission
    router.push("/");
  }
};

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

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
  availability: z
    .array(z.enum(daysOfWeek))
    .optional(),
  preferredGenres: z.array(z.number().optional()).max(3).optional(),
});

interface ProfileFormProps {
  username?: string;
  description?: string;
  instruments?: ("guitar" | "piano" | "drums" | "bass" | "vocals" | "other")[];
  spotifyLink?: string;
  soundcloudLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
  availability?: ("monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday")[];
  genres?: Genre[];
  preferredGenres?: number[]; // genre ids
}

export function ProfileForm({
  username = "",
  description = "",
  instruments = [],
  spotifyLink = "",
  soundcloudLink = "",
  instagramLink = "",
  tiktokLink = "",
  availability = [],
  genres = [],
  preferredGenres = [],
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
      availability: availability || [],
      preferredGenres: preferredGenres || [],
    },
  });
  const prefGenres = useWatch({
    control: form.control,
    name: "preferredGenres",
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
                Describe your musical style, experience, or what you are looking
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

        {/* Preferred Genres Dropdowns */}
        <div className="grid gap-2">
          <FormLabel>Preferred Genres</FormLabel>
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((idx) => (
              <FormField
                key={idx}
                control={form.control}
                name={`preferredGenres.${idx}` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Select
                          value={field.value ? String(field.value) : ""}
                          onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                          disabled={
                            genres.length === 0 ||
                            (idx === 1 && !prefGenres?.[0]) ||
                            (idx === 2 && !prefGenres?.[1])
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a genre" />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((genre) => (
                              <SelectItem key={genre.id} value={String(genre.id)}>
                                {genre.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const current = form.getValues("preferredGenres") ?? [];
                            console.log("Current preferredGenres:", current);
                            const newArr = [...current];
                            for (let j = idx; j < newArr.length; j++) {
                              newArr[j] = undefined;
                            }
                            form.setValue("preferredGenres", newArr);
                            console.log("Updated preferredGenres:", newArr);
                          }}
                          aria-label="Clear selection"
                          disabled={!field.value}
                        >
                          ✕
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="availability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <ToggleGroup
                  className="w-full"
                  type="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <ToggleGroupItem value="monday">Monday</ToggleGroupItem>
                  <ToggleGroupItem value="tuesday">Tuesday</ToggleGroupItem>
                  <ToggleGroupItem value="wednesday">Wednesday</ToggleGroupItem>
                  <ToggleGroupItem value="thursday">Thursday</ToggleGroupItem>
                  <ToggleGroupItem value="friday">Friday</ToggleGroupItem>
                  <ToggleGroupItem value="saturday">Saturday</ToggleGroupItem>
                  <ToggleGroupItem value="sunday">Sunday</ToggleGroupItem>
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
