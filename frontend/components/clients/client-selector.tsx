"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClients, Client } from "@/lib/api/clients";

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

  return (
    <Select value={value} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-[300px]">
        <SelectValue
          placeholder={loading ? "Loading clients..." : "Select a client"}
        />
      </SelectTrigger>
      <SelectContent>
        {clients.length === 0 && !loading && (
          <div className="p-2 text-sm text-muted-foreground">
            No clients found. Create one first.
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
