"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  await fetch("/api/adduser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      name: values.username,
      instruments: values.instruments,
    }),
  });
};

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  instruments: z.array(z.enum(["guitar", "piano", "drums", "bass", "vocals", "other"])).min(1, "Please select at least one instrument"),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      instruments: [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <Button type="submit" variant="default" size="lg" className="w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
