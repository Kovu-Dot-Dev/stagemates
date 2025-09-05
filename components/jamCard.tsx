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
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Jam {
  created_at: string;
  id: number;
  name: string;
  location: string;
}

export function JamModal({ show, onClose, jam }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-gray-100/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">{jam.name}</h2>
        <p className="mb-2">
          <strong>Location:</strong> {jam.location}
        </p>
        <p className="mb-4">
          <strong>Created At:</strong>{" "}
          {new Date(jam.created_at).toLocaleString()}
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button>
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
