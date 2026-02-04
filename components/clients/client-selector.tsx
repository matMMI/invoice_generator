"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, getClients } from "@/lib/api/clients";
import { useEffect, useState } from "react";

interface ClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClientSelector({ value, onChange }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClients();
        setClients(data.clients);
      } catch (error) {
        console.error("Failed to load clients", error);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  // Find the selected client to display its name
  const selectedClient = clients.find((c) => c.id === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={loading ? "Chargement..." : "Sélectionner un client"}
        >
          {selectedClient
            ? selectedClient.company || selectedClient.name
            : loading
            ? "Chargement..."
            : value
            ? "Client inconnu"
            : "Sélectionner un client"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {clients.length === 0 && !loading && (
          <div className="p-2 text-sm text-muted-foreground">
            Aucun client trouvé. Créez-en un d'abord.
          </div>
        )}
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.company || client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
