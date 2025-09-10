"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Session } from "next-auth";

const bandFormSchema = z.object({
  bandName: z.string().min(1, "Band name is required"),
  genre: z.string().min(1, "Genre is required"),
  memberIds: z.array(z.string()).min(1, "At least one member is required"),
});

const BAND_NAMES = [
    "pavement ghosts",
    "crayon warfare",
    "the velvet lungs",
    "acid postcard",
    "midnight fax machine",
    "cactus divorce",
    "hollow elevators",
    "plastic monsoon",
    "rented halos",
    "the sodium kids",
    "quantum dandruff",
    "broken vhs",
    "opera for insects",
    "wristwatch funeral",
    "dust motel",
    "fluorescent scarecrow",
    "laundry riots",
    "chrome lullaby",
    "detuned cathedral",
    "avocado regrets",
    "the paper bruises",
    "rust opera",
    "fake horizons",
    "kaleidoscope ashtray",
    "concrete butterflies",
    "the anxious tractors",
    "graveyard bubblegum",
    "submarine honey",
    "piano eclipse",
    "cosmic janitors"
  ];
  

const getRandomBandName = () => {
  return BAND_NAMES[Math.floor(Math.random() * BAND_NAMES.length)];
};

const onSubmit = async (
  values: z.infer<typeof bandFormSchema>,
  session: Session | null,
  router: AppRouterInstance,
  onSuccess?: () => void,
  user?: User
) => {
  if (!values.bandName.trim()) {
    alert("Please enter a band name");
    return;
  }

  try {
    const bandResponse = await fetch("/api/bands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bandName: values.bandName,
        genre: values.genre,
        memberIds: values.memberIds,
      }),
    });

    if (!bandResponse.ok) {
      const result = await bandResponse.json();
      alert(result.error || "Failed to create band");
      return;
    }

    const bandResult = await bandResponse.json();
    console.log("Band created successfully:", bandResult);
    alert("Band created successfully!");
    onSuccess?.();
  } catch (error) {
    console.error("Error creating band:", error);
    alert("Failed to create band");
  }
};

interface CreateBandFormProps {
  bandName?: string;
  genre?: string;
  users?: User[];
  memberIds?: string[];
  onSuccess?: () => void;
  user?: User;
}

export function CreateBandForm({
  bandName = "",
  genre = "",
  users = [],
  memberIds = [],
  onSuccess,
  user,
}: CreateBandFormProps = {}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState("");

  console.log('xx user', user)
  console.log('xx users', users)
  
  const form = useForm<z.infer<typeof bandFormSchema>>({
    resolver: zodResolver(bandFormSchema),
    defaultValues: {
      bandName: bandName || getRandomBandName(),
      genre: genre || "",
      memberIds: memberIds || [],
    },
  });

  const addSelectedUser = (userId: string) => {
    if (userId) {
      const currentIds = form.getValues("memberIds");
      if (!currentIds.includes(userId)) {
        form.setValue("memberIds", [...currentIds, userId]);
        setSelectedUser("");
      }
    }
  };

  const removeMemberId = (idToRemove: string) => {
    const currentIds = form.getValues("memberIds");
    form.setValue("memberIds", currentIds.filter(id => id !== idToRemove));
  };

  const getSelectedUsers = () => {
    const currentIds = form.getValues("memberIds");
    return users.filter(user => currentIds.includes(user.id.toString()));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit(values, session, router, onSuccess)
        )}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="bandName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Band Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter band name" {...field} />
              </FormControl>
              <FormDescription>
                Give your band a memorable name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter genre (e.g., Rock, Jazz, Electronic)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                What genre of music does your band play?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="memberIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Band Members</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Select 
                    value={selectedUser} 
                    onValueChange={(value) => {
                      addSelectedUser(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user to add to the band" />
                    </SelectTrigger>
                    <SelectContent>
                        {users
                        .filter(user => !field.value.includes(user.id.toString()))
                        .map((currentUser) => (
                          currentUser.id === user?.id ? null : (
                            <SelectItem key={currentUser.id} value={currentUser.id.toString()}>
                              {currentUser.name}
                            </SelectItem>
                          )
                        ))}
                    </SelectContent>
                  </Select>
                  
                  {getSelectedUsers().length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getSelectedUsers().map((user) => (
                        <Badge 
                          key={user.id} 
                          variant="secondary" 
                          className="flex items-center gap-1"
                        >
                          <span>{user.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMemberId(user.id.toString())}
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                          >
                            ×
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Select users who will be members of this band.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="default" size="lg" className="w-full">
          Create Band
        </Button>
      </form>
    </Form>
  );
}
