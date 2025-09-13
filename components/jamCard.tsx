import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Jam } from "@/types";
import { useEffect, useState } from "react";
import { User } from "@/types";

export function JamModal({
  show,
  onClose,
  jam,
}: {
  show: boolean;
  onClose: () => void;
  jam: Jam;
}) {
  const [attendees, setAttendees] = useState<User[]>([]);

  useEffect(() => {
    console.log("xxx jam", jam);
    const getAttendees = async () => {
      const response = await fetch(`/api/getAttendees?jamId=${jam.id}`);
      const result = await response.json();

      console.log("attendees", result);
      if (result.data) {
        setAttendees(result.data);
      }
    };
    getAttendees();
    console.log(jam);
  }, [jam]);

  if (!show) return null;
  return (
    // use shadcnui components to make a modal
    <div
      className="fixed inset-0 bg-gray-100/75 flex items-center
      justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-2">{jam.jam_name}</h2>
        <p className="mb-2">
          <span className="font-semibold">Location:</span> {jam.location}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Happening: </span>
          {jam.date_happening
            ? new Date(jam.date_happening).toLocaleDateString()
            : new Date().toLocaleDateString()}
        </p>
        <div className="mb-2">
          <span className="font-semibold">Attendees:</span>
          {attendees.map((attendee) => (
            <Badge variant="default" key={attendee.id}>
              {attendee.name}
            </Badge>
          ))}

          <div>
            {/* capacity */}
            <span className="font-semibold">Capacity: </span>
            {jam.capacity}
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function JamCard({
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
  const [attendees, setAttendees] = useState<User[]>([]);
  
  // Generate predictable room image based on jam data (0-5)
  const roomNumber = jam.id % 6;
  const roomImageSrc = `/rooms/room${roomNumber}.jpeg`;

  // Helper function to get date status
  const getDateStatus = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jamDate = new Date(dateString);
    jamDate.setHours(0, 0, 0, 0);

    if (jamDate.getTime() === today.getTime()) {
      return { status: "Live", variant: "destructive" as const };
    } else if (jamDate > today) {
      return { status: "Upcoming", variant: "secondary" as const };
    } else {
      return { status: "Past", variant: "outline" as const };
    }
  };

  const dateStatus = getDateStatus(jam.date_happening);

  useEffect(() => {
    const getAttendees = async () => {
      const response = await fetch(`/api/getAttendees?jamId=${jam.id}`);
      const result = await response.json();
      if (result.data) {
        setAttendees(result.data);
      }
    };
    getAttendees();
  }, [jam]);
  return (
    <Card
      className="w-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex">
        <div className="flex-shrink w-48 min-w-8 pl-6 flex items-center justify-center">
          <img
            src={roomImageSrc}
            alt="room"
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
        <CardHeader className="min-w-48">
          <CardTitle className="break-words">{jam.jam_name}</CardTitle>
          <CardDescription>
            <Badge variant="outline">{jam.location}</Badge>
          </CardDescription>
          <CardDescription>
            <Badge variant={dateStatus.variant}>{dateStatus.status}</Badge>
          </CardDescription>
          <CardDescription>
            {jam.date_happening
              ? new Date(jam.date_happening).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </CardDescription>
          <CardDescription>
            {attendees.map((attendee, index) => (
              <Badge
                variant="outline"
                className={`mb-2 ${index < attendees.length - 1 ? "mr-2" : ""}`}
                key={attendee.id}
              >
                {attendee.name}
              </Badge>
            ))}
          </CardDescription>
        </CardHeader>
      </div>
    </Card>
  );
}
