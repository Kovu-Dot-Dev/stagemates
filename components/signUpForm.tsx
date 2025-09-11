"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Genre } from "@/types";
import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";

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

const instagramRegex = /^https:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]{5,20}\/?(?:\?[^\s]*)?$/;
const tiktokRegex = /^https:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+\/?(?:\?[^\s]*)?$|^https:\/\/vt\.tiktok\.com\/[A-Za-z0-9]+\/?$/;
const spotifyRegex = /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}\/?(?:\?[^\s]*)?$/;
const soundcloudRegex = /^(?:https:\/\/soundcloud\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/?(?:\?[^\s]*)?|https:\/\/on\.soundcloud\.com\/[A-Za-z0-9]+\/?)$/;

const formSchema = z.object({
  username: z.string().optional(),
  description: z.string().optional(),
  instruments: z
    .array(z.enum(["guitar", "piano", "drums", "bass", "vocals", "other"]))
    .optional(),
  spotifyLink: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || spotifyRegex.test(val),
      {
        message: "Please enter a valid Spotify track URL (e.g., https://open.spotify.com/track/yourtrackid)",
      }
    ),
  soundcloudLink: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || soundcloudRegex.test(val),
      {
        message: "Please enter a valid SoundCloud track URL (e.g., https://soundcloud.com/yourname/yourtrack)",
      }
    ),
  instagramLink: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || instagramRegex.test(val),
      {
        message: "Please enter a valid public Instagram post URL (e.g., https://www.instagram.com/p/yourshortcode/)",
      }
    ),
  tiktokLink: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || tiktokRegex.test(val),
      {
        message: "Please enter a valid TikTok post URL (e.g., https://www.tiktok.com/@yourusername/video/yourvideoid, https://vt.tiktok.com/yourshortcode/)",
      }
    ),
  availability: z
    .array(z.enum(daysOfWeek))
    .optional(),
  preferredGenres: z.array(z.number().optional()).max(3),
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
  const [selectedGenre, setSelectedGenre] = useState('');


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
                </ToggleGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredGenres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Genres</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Select
                    value={selectedGenre}
                    onValueChange={(value) => {
                      console.log("Selected genre value:", value);
                      const curGenres = form.getValues("preferredGenres");
                      if (!curGenres.includes(Number(value))) {
                        form.setValue("preferredGenres", [...curGenres, Number(value)]);
                        setSelectedGenre('');
                      }
                    }}
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
                  
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((genreId) => {
                        const genre = genres.find(g => g.id === genreId);
                        if (!genre) return null;
                        return (
                          <Badge
                            key={genre.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <span>{genre.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {form.setValue("preferredGenres", field.value.filter(id => id !== genre.id))}}
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                            >
                              &times;
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <ToggleGroupItem value="monday">
                    <span className="hidden sm:inline">Monday</span>
                    <span className="sm:hidden">M</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="tuesday">
                    <span className="hidden sm:inline">Tuesday</span>
                    <span className="sm:hidden">T</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="wednesday">
                    <span className="hidden sm:inline">Wednesday</span>
                    <span className="sm:hidden">W</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="thursday">
                    <span className="hidden sm:inline">Thursday</span>
                    <span className="sm:hidden">T</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="friday">
                    <span className="hidden sm:inline">Friday</span>
                    <span className="sm:hidden">F</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="saturday">
                    <span className="hidden sm:inline">Saturday</span>
                    <span className="sm:hidden">S</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="sunday">
                    <span className="hidden sm:inline">Sunday</span>
                    <span className="sm:hidden">S</span>
                  </ToggleGroupItem>
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

        {/* <FormField
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
        /> */}

        <Button type="submit" variant="default" size="lg" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
