"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Client,
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/api/clients";
import { ClientCard } from "@/components/clients/client-card";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, X, Users } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchClients = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const data = await getClients(searchQuery);
      setClients(data.clients);
    } catch (err: any) {
      if (err instanceof Error && err.message === "Not authenticated") {
        router.push("/login"); // Redirect to login
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients(search);
  };

  const handleCreate = async (data: any) => {
    await createClient(data);
    setShowForm(false);
    fetchClients(search);
  };

  const handleUpdate = async (data: any) => {
    if (editingClient) {
      await updateClient(editingClient.id, data);
      setEditingClient(null);
      fetchClients(search);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
    fetchClients(search);
  };

  if (showForm || editingClient) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          {editingClient ? "Edit Client" : "New Client"}
        </h1>
        <ClientForm
          initialData={
            editingClient
              ? {
                  ...editingClient,
                  company: editingClient.company || undefined,
                  address: editingClient.address || undefined,
                  phone: editingClient.phone || undefined,
                  vat_number: editingClient.vat_number || undefined,
                }
              : undefined
          }
          onSubmit={editingClient ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client database.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                fetchClients();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No clients yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first client to get started.
          </p>
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Create your first client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={setEditingClient}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
