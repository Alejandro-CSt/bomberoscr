import { Badge } from "@/features/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/shared/components/ui/card";

interface RecentIncidentsProps {
  incidents: {
    id: number;
    EEConsecutive: string;
    address: string;
    incidentTimestamp: Date;
    isOpen: boolean;
  }[];
}

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm leading-none">{incident.EEConsecutive}</p>
                  <p className="text-muted-foreground text-sm">{incident.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={incident.isOpen ? "default" : "outline"}>
                    {incident.isOpen ? "Open" : "Closed"}
                  </Badge>
                  <div className="text-muted-foreground text-sm">
                    {new Date(incident.incidentTimestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No recent incidents</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
