import { MainNav } from "@/components/main-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  );
}
