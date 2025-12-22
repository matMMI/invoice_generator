"use client";

import { useState, useEffect } from "react";
import {
  Client,
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/api/clients";
import { ClientCard } from "@/components/clients/client-card";
import { ClientForm } from "@/components/clients/client-form";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const data = await getClients(searchQuery);
      setClients(data.clients);
    } catch (err) {
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + New Client
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchClients();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading clients...
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No clients yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first client
          </button>
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
