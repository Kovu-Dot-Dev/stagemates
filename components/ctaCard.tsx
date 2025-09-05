"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CTACardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function CTACard({
  title,
  description,
  buttonText,
  onButtonClick,
}: CTACardProps) {
  return (
    <Card className="w-full max-w-md mx-auto flex">
      <div className="flex flex-col">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Button onClick={onButtonClick} className="w-full" size="lg">
            {buttonText}
          </Button>
        </CardContent>
      </div>
      <div className="flex-1">
        <img
          src={"/accoustic-guitar-rock.svg"}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </Card>
  );
}
