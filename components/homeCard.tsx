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

export default function HomeCard({
  title,
  instruments,
}: {
  title: string;
  instruments: string[];
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="flex gap-2">
          {instruments.map((instrument) => (
            <Badge variant="secondary">{instrument}</Badge>
          ))}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
