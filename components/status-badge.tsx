import { Badge } from "@/components/ui/badge";
import { QuoteStatus } from "@/lib/api/quotes";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    // Normalizing status string to match enum values regardless of case
    const normalizedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    switch (normalizedStatus) {
      case "Draft":
        return "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      case "Sent":
        return "bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "Accepted":
        return "bg-green-100 text-green-600 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "Rejected":
        return "bg-red-100 text-red-600 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase text-xs font-semibold px-2 py-0.5 border",
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </Badge>
  );
}
