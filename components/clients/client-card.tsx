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

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col">
      {/* Client Info */}
      <div className="mb-3 min-w-0">
        <h3 className="font-semibold text-lg truncate">{client.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
        {client.company && (
          <p className="text-sm text-muted-foreground/80 mt-1 truncate">
            {client.company}
          </p>
        )}
      </div>

      {/* Contact Details */}
      {(client.phone || client.address || client.vat_number) && (
        <div className="text-sm text-muted-foreground space-y-1 mb-3">
          {client.phone && <p className="truncate">📞 {client.phone}</p>}
          {client.address && <p className="truncate">📍 {client.address}</p>}
          {client.vat_number && (
            <p className="truncate">🏢 TVA: {client.vat_number}</p>
          )}
        </div>
      )}

      {/* Action Buttons - Always at bottom */}
      <div className="flex gap-2 mt-auto pt-2 border-t">
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
      </div>
    </div>
  );
}
