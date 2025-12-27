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
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { SearchHeader } from "@/components/dashboard/search-header";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const LIMIT = 9; // Grid layout 3x3 nicely

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchClients = async (searchQuery?: string, page: number = 1) => {
    try {
      setLoading(true);
      const data = await getClients(searchQuery, page, LIMIT);
      setClients(data.clients);
      setTotalPages(Math.ceil(data.total / LIMIT));
      setCurrentPage(page);
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
    fetchClients(search, currentPage);
  }, [currentPage]); // Re-fetch when page changes. Search is handled separately.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1
    fetchClients(search, 1);
  };

  const handleCreate = async (data: any) => {
    try {
      await createClient(data);
      setShowForm(false);
      toast.success("Client créé avec succès");
      fetchClients(search);
    } catch (err: any) {
      toast.error(err.message || "Échec de la création du client");
    }
  };

  const handleUpdate = async (data: any) => {
    if (editingClient) {
      try {
        await updateClient(editingClient.id, data);
        setEditingClient(null);
        toast.success("Client mis à jour avec succès");
        fetchClients(search);
      } catch (err: any) {
        toast.error(err.message || "Échec de la mise à jour du client");
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      toast.success("Client supprimé avec succès");
      fetchClients(search, currentPage);
    } catch (err: any) {
      toast.error(err.message || "Échec de la suppression du client");
    }
  };

  if (showForm || editingClient) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          {editingClient ? "Modifier le Client" : "Nouveau Client"}
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
    <div className="page-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Gérez votre base de clients.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      <SearchHeader
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
        onClear={() => {
          setSearch("");
          setCurrentPage(1);
          fetchClients("", 1);
        }}
        placeholder="Rechercher par nom ou email..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <ClientCard key={i} isLoading={true} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-6">
            {search
              ? "Aucun résultat pour votre recherche."
              : "Ajoutez votre premier client pour commencer."}
          </p>
          {search ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
                fetchClients("", 1);
              }}
            >
              Effacer la recherche
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Créer votre premier client
            </Button>
          )}
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
