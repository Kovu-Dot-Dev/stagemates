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

export default function MusicianCard({
  userId,
  title,
  instruments,
  availability = [],
  genres = [],
}: {
  userId: number;
  title: string;
  instruments: string[];
  availability?: string[];
  genres?: string[];
}) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/profile/${userId}`);
  };

  return (
    <Card
      className="w-full cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {instruments &&
              instruments.map((instrument, index) => (
                <Badge key={"inst-" + index} variant="default">
                  {instrument}
                </Badge>
              ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {availability &&
              availability.map((day, index) => (
                <Badge key={"avail-" + index} variant="secondary">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Badge>
              ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {genres &&
              genres.map((genre, index) => (
                <Badge key={"genre-" + index} variant="outline">
                  {genre}
                </Badge>
              ))}
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
