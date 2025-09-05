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

export default function HomeCard({
  userId,
  title,
  instruments,
}: {
  userId: number;
  title: string;
  instruments: string[];
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
        <CardDescription className="flex gap-2">
          {instruments && instruments.map((instrument, index) => (
            <Badge key={index} variant="default">
              {instrument}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
