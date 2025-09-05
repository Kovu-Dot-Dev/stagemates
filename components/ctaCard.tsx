"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateJamForm } from "@/components/createBandForm";

interface CTACardProps {
  title: string;
  buttonText: string;
}

const onButtonClick = () => {
  console.log("Button clicked");
};

export default function CTACard({ title, buttonText }: CTACardProps) {
  return (
    <Card className="w-full max-w-md mx-auto flex">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <Dialog>
          <DialogTrigger>
            <Button onClick={onButtonClick} className="w-full" size="lg">
              {buttonText}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <CreateJamForm />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
