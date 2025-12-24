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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSettings,
  updateSettings,
  resetAccount,
  TaxStatus,
} from "@/lib/api/settings";

const settingsSchema = z.object({
  // Identity
  name: z.string().min(1, "Le nom est requis"),
  business_name: z.string().optional().or(z.literal("")),
  email: z.string().email(),
  siret: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  tax_status: z.nativeEnum(TaxStatus),
  logo_url: z.string().optional().or(z.literal("")),

  // Contact
  company_email: z
    .string()
    .email("E-mail invalide")
    .optional()
    .or(z.literal("")),
  company_phone: z.string().optional().or(z.literal("")),
  company_website: z.string().url("URL invalide").optional().or(z.literal("")),

  // Preferences
  default_currency: z.string().min(1, "La devise est requise"),
  default_tax_rate: z.coerce.number().min(0).max(100),
  pdf_footer_text: z.string().optional().or(z.literal("")),
  vat_exemption_text: z.string().optional().or(z.literal("")),
  late_payment_penalties: z.string().optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      business_name: "",
      email: "",
      siret: "",
      address: "",
      tax_status: TaxStatus.FRANCHISE,
      logo_url: "",
      company_email: "",
      company_phone: "",
      company_website: "",
      default_currency: "EUR",
      default_tax_rate: 20,
      pdf_footer_text: "",
      vat_exemption_text: "TVA non applicable, art. 293 B du CGI",
      late_payment_penalties: "3 fois le taux d'intérêt légal",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        form.reset({
          name: data.name,
          business_name: data.business_name ?? "",
          email: data.email,
          siret: data.siret ?? "",
          address: data.address ?? "",
          tax_status: data.tax_status,
          logo_url: data.logo_url ?? "",
          company_email: data.company_email ?? "",
          company_phone: data.company_phone ?? "",
          company_website: data.company_website ?? "",
          default_currency: data.default_currency,
          default_tax_rate: data.default_tax_rate,
          pdf_footer_text: data.pdf_footer_text ?? "",
          vat_exemption_text: data.vat_exemption_text ?? "",
          late_payment_penalties: data.late_payment_penalties ?? "",
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
          Gérez votre profil, votre identité fiscale et vos préférences.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Identité Entreprise
              </CardTitle>
              <CardDescription>
                Informations légales affichées sur vos documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet (Entrepreneur)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="business_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom Commercial (Optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="JD Solutions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siret"
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
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse du Siège</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Rue de la Paix, 75000 Paris"
                          {...field}
                        />
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
                      <FormLabel>E-mail (Contact)</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@pro.com" {...field} />
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
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du Logo</FormLabel>
                      <FormControl>
                        <Input placeholder="/logo.png" {...field} />
                      </FormControl>
                      <FormDescription>
                        Fichier dans <code>public/</code> ou URL externe.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Régime Fiscal (TVA)</CardTitle>
              <CardDescription>
                Configurez votre statut pour les calculs automatiques.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="tax_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Régime TVA</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre régime" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TaxStatus.FRANCHISE}>
                          Micro-entreprise (Franchise en base - Pas de TVA)
                        </SelectItem>
                        <SelectItem value={TaxStatus.ASSUJETTI}>
                          Régime Réel (Assujetti à la TVA)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Détermine si la TVA est calculée sur vos devis (0% ou
                      20%).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("tax_status") === TaxStatus.FRANCHISE && (
                <FormField
                  control={form.control}
                  name="vat_exemption_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mention Exonération</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Apparaît sur les factures sans TVA.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("tax_status") === TaxStatus.ASSUJETTI && (
                <FormField
                  control={form.control}
                  name="default_tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux TVA par défaut (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
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
                      <Input {...field} />
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
                Personnalisation visuelle du document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="default_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <FormControl>
                        <Input placeholder="EUR" {...field} />
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
                    <FormLabel>Pied de page personnalisé</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Infos bancaires, mentions spéciales..."
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

      <div className="mt-8 border-t pt-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de Danger</CardTitle>
            <CardDescription className="text-destructive/80">
              Actions irréversibles concernant vos données.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Réinitialiser toutes les données
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Êtes-vous absolument sûr ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est <strong>irréversible</strong>. Elle
                    supprimera définitivement :
                    <ul className="list-disc list-inside mt-2 mb-2">
                      <li>Tous vos devis et factures</li>
                      <li>Tous vos clients</li>
                    </ul>
                    Votre compte utilisateur sera conservé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={async () => {
                      try {
                        await resetAccount();
                        toast.success("Compte réinitialisé avec succès", {
                          description: "Toutes vos données ont été effacées.",
                        });
                      } catch (error) {
                        toast.error("Erreur lors de la réinitialisation");
                      }
                    }}
                  >
                    Confirmer la suppression
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
