"use client";

import { UserProfileForm } from "@/components/user-profile-form";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return null; // Or loading spinner / redirect handled by middleware/layout
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>
      <div className="max-w-2xl">
        <UserProfileForm user={session.user} />
      </div>
    </div>
  );
}
