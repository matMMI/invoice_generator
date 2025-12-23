"use client";

import { Client } from "@/lib/api/clients";
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
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{client.name}</h3>
          <p className="text-sm text-gray-600">{client.email}</p>
          {client.company && (
            <p className="text-sm text-gray-500 mt-1">{client.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(client)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete client?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete "
                  {client.name}" and all associated quotes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(client.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {(client.phone || client.address || client.vat_number) && (
        <div className="text-sm text-gray-600 space-y-1">
          {client.phone && <p>📞 {client.phone}</p>}
          {client.address && <p>📍 {client.address}</p>}
          {client.vat_number && <p>🏢 VAT: {client.vat_number}</p>}
        </div>
      )}
    </div>
  );
}
