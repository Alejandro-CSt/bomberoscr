import { Card, CardContent, CardHeader, CardTitle } from "@/features/shared/components/ui/card";
import { cn } from "@/features/shared/lib/utils";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  className?: string;
}

export function DashboardCard({ title, value, icon, description, className }: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </CardContent>
    </Card>
  );
}
