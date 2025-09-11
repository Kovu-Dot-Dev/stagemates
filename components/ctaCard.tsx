"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateJamForm } from "@/components/createJamForm";

interface CTACardProps {
  title: string;
  buttonText: string;
}

export default function CTACard({ title, buttonText }: CTACardProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const onButtonClick = () => {
    // route to login if not logged in
    if (!session) {
      router.push("/login");
      return;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto flex">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={onButtonClick} className="w-full" size="lg">
              {buttonText}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create a New Jam Session</DialogTitle>
            <CreateJamForm onSuccess={() => setOpen(false)}/>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
