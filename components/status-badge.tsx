import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusLabels: Record<string, string> = {
  Draft: "Brouillon",
  Sent: "Envoyé",
  Accepted: "Accepté",
  Rejected: "Refusé",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const getVariant = (status: string) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Sent":
        return "info";
      case "Accepted":
        return "success";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const label = statusLabels[normalizedStatus] || status;
  const variant = getVariant(normalizedStatus);

  return (
    <Badge variant={variant as any} className={cn("font-medium", className)}>
      {label}
    </Badge>
  );
}
