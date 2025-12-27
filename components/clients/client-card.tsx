"use client";

import { Client } from "@/lib/api/clients";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientCardProps {
  client?: Client;
  onEdit?: (client: Client) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
  isLoading,
}: ClientCardProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3 mt-1" />
        </CardHeader>
        <CardContent className="pb-3 flex-grow">
          <Skeleton className="h-4 w-2/3 mb-1" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <CardFooter className="pt-3 border-t mt-auto gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </CardFooter>
      </Card>
    );
  }

  if (!client || !onEdit || !onDelete) return null;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg truncate">{client.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
        {client.company && (
          <p className="text-sm text-muted-foreground/80 mt-1 truncate">
            {client.company}
          </p>
        )}
      </CardHeader>

      {(client.phone || client.address || client.vat_number) && (
        <CardContent className="pb-3 flex-grow">
          <div className="text-sm text-muted-foreground space-y-1">
            {client.phone && <p className="truncate">📞 {client.phone}</p>}
            {client.address && <p className="truncate">📍 {client.address}</p>}
            {client.vat_number && (
              <p className="truncate">🏢 TVA: {client.vat_number}</p>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-3 border-t mt-auto gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(client)}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Modifier
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex-1">
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le client &quot;{client.name}
                &quot; et tous ses devis associés seront définitivement
                supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(client.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
