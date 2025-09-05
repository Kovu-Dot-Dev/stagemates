import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/app/page";
export interface Jam {
  id: number;
  name: string;
  date?: string;
  time?: string;
  location: string;
  attendees: User[];
  created_at: string;
}

export function JamModal({ show, onClose, jam }: { show: boolean, onClose: () => void, jam: Jam }) {
  if (!show) return null;
  return (
    // use shadcnui components to make a modal
    <div
      className="fixed inset-0 bg-gray-100/75 flex items-center
      justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">{jam.name}</h2>
        <p className="mb-2">
          <span className="font-semibold">Location:</span> {jam.location}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Happening:</span>{" "}
          {jam.date
            ? new Date(jam.date).toLocaleDateString()
            : new Date().toLocaleDateString()}
          {jam.time
            ? ` at ${jam.time}`
            : ` at ${new Date().toLocaleTimeString()}`}
        </p>
        <div className="mb-4">
          <span className="font-semibold">Attendees:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {jam.attendees?.length > 0 &&
              jam.attendees.map((attendee: User) => (
                <Badge key={attendee.id} variant="default">
                  {attendee.name}
                </Badge>
              ))}
          </div>
          <div>
            {/* capacity */}
            <span className="font-semibold">Capacity:</span> 10
          </div>
          <Button onClick={onClose}>Close</Button>
          {/* Request to join button */}
          <Button variant="outline" className="mt-4" onClick={() => {}}>
            Request to Join
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function JamCard({
  imageUrl = "https://picsum.photos/id/237/200/300",
  handleClick,
  jam,
}: {
  imageUrl?: string;
  jam: Jam;
  handleClick?: () => void;
}) {
  // const router = useRouter();
  const handleCardClick = () => {
    // router.push(`/jams/${jam.id}`);
    handleClick?.();
  };
  return (
    <Card
      className="w-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex">
        {imageUrl && (
          <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-l-lg">
            <img
              src={imageUrl}
              alt={jam.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <CardTitle>{jam.name}</CardTitle>
          <CardDescription>
            <Badge variant="outline">{jam.location}</Badge>
          </CardDescription>
        </CardHeader>
      </div>
    </Card>
  );
}
