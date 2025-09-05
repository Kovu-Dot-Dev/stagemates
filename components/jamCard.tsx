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
import { useRouter } from "next/navigation";

export interface Jam {
  created_at: string;
  id: number;
  name: string;
  location: string;
}

export default function JamCard({
  imageUrl = "https://picsum.photos/id/237/200/300",
  jam,
}: {
  imageUrl?: string;
  jam: Jam;
}) {
  const router = useRouter();
  const handleCardClick = () => {
    // Navigate to jam details page when implemented
    console.log("Card clicked");
    router.push(`/jam/${jam.id}`);
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
