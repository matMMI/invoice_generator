import { GlobalActivityProvider } from "@/components/providers/global-activity-provider";
import { MainNav } from "@/components/main-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalActivityProvider>
        <MainNav />
        <div className="flex-1 space-y-4 p-4 pt-4">{children}</div>
      </GlobalActivityProvider>
    </div>
  );
}
