"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSettings, updateSettings } from "@/lib/api/settings";

const settingsSchema = z.object({
  company_name: z.string().min(1, "Le nom de l'entreprise est requis"),
  company_address: z.string().optional(),
  company_email: z
    .string()
    .email("E-mail invalide")
    .optional()
    .or(z.literal("")),
  company_phone: z.string().optional(),
  company_website: z.string().url("URL invalide").optional().or(z.literal("")),
  company_logo_url: z.string().optional(),
  company_siret: z.string().optional(),
  pdf_footer_text: z.string().optional(),

  // Fiscal
  is_vat_applicable: z.boolean().default(true),
  vat_exemption_text: z.string().optional(),
  late_payment_penalties: z.string().optional(),

  default_currency: z.string().min(1, "La devise est requise"),
  default_tax_rate: z.coerce.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: "",
      company_address: "",
      company_email: "",
      company_phone: "",
      company_website: "",
      company_logo_url: "",
      company_siret: "",
      pdf_footer_text: "",
      is_vat_applicable: true,
      vat_exemption_text: "TVA non applicable, art. 293 B du CGI",
      late_payment_penalties: "3 fois le taux d'intérêt légal",
      default_currency: "EUR",
      default_tax_rate: 20,
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        form.reset({
          company_name: data.company_name,
          company_address: data.company_address ?? "",
          company_email: data.company_email ?? "",
          company_phone: data.company_phone ?? "",
          company_website: data.company_website ?? "",
          company_logo_url: data.company_logo_url ?? "",
          company_siret: data.company_siret ?? "",
          pdf_footer_text: data.pdf_footer_text ?? "",
          is_vat_applicable: data.is_vat_applicable ?? true,
          vat_exemption_text: data.vat_exemption_text ?? "",
          late_payment_penalties: data.late_payment_penalties ?? "",
          default_currency: data.default_currency,
          default_tax_rate: data.default_tax_rate,
        });
      } catch (error) {
        toast.error("Échec du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [form]);

  async function onSubmit(data: SettingsFormValues) {
    try {
      setSaving(true);
      await updateSettings(data);
      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      toast.error("Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre entreprise et vos préférences PDF.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations Entreprise
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos devis et factures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise</FormLabel>
                      <FormControl>
                        <Input placeholder="Mon Entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 1 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://monsite.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro SIRET</FormLabel>
                      <FormControl>
                        <Input placeholder="123 456 789 00012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="123 Rue du Commerce&#10;75001 Paris"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL du Logo</FormLabel>
                    <FormControl>
                      <Input placeholder="/logo.png (or full URL)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Placez votre logo dans <code>public/logo.png</code>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mentions Légales & Fiscalité</CardTitle>
              <CardDescription>
                Configuration TVA et pénalités pour votre statut (ex:
                Micro-entreprise).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="is_vat_applicable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        TVA Applicable
                      </FormLabel>
                      <FormDescription>
                        Activez si vous êtes redevable de la TVA.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!form.watch("is_vat_applicable") && (
                <FormField
                  control={form.control}
                  name="vat_exemption_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mention Exonération TVA</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="TVA non applicable, art. 293 B du CGI"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Mention obligatoire sur les factures si vous ne facturez
                        pas la TVA.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="late_payment_penalties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pénalités de retard</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="3 fois le taux d'intérêt légal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration PDF</CardTitle>
              <CardDescription>
                Personnalisez l'apparence de vos documents générés.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="default_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise par défaut</FormLabel>
                      <FormControl>
                        <Input placeholder="EUR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux de TVA par défaut (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pdf_footer_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texte de pied de page</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SIRET: 123 456 789 00012 | IBAN: FR76..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
