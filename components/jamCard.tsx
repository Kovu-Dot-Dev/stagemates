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
  
  export default function JamCard({
    location,
    imageUrl = "https://picsum.photos/id/237/200/300",
    jamName,
  }: {
    location: string;
    imageUrl?: string ;
    jamName: string;
  }) {
  
    const handleCardClick = () => {
      // Navigate to jam details page when implemented
      // router.push(`/jam/${jamId}`);
    };
  
    return (
      <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
        <div className="flex">
          {imageUrl && (
            <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-l-lg">
              <img 
                src={imageUrl} 
                alt={jamName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className="flex-1">
            <CardTitle>{jamName}</CardTitle>
            <CardDescription>
              <Badge variant="outline">{location}</Badge>
            </CardDescription>
          </CardHeader>
        </div>
      </Card>
    );
  }
  