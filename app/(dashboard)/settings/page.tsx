"use client";

import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";
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

// --- Schema ---

const settingsSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  business_name: z.string().optional().or(z.literal("")),
  email: z.string().email(),
  siret: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^\d{14}$/.test(val.replace(/\s/g, "")), {
      message: "Le SIRET doit contenir exactement 14 chiffres",
    }),
  address: z.string().optional().or(z.literal("")),
  tax_status: z.nativeEnum(TaxStatus),
  logo_url: z.string().optional().or(z.literal("")),
  company_email: z
    .string()
    .email("E-mail invalide")
    .optional()
    .or(z.literal("")),
  company_phone: z.string().optional().or(z.literal("")),
  company_website: z.string().url("URL invalide").optional().or(z.literal("")),
  default_currency: z.string().min(1, "La devise est requise"),
  default_tax_rate: z.coerce.number().min(0).max(100),
  pdf_footer_text: z.string().optional().or(z.literal("")),
  vat_exemption_text: z.string().optional().or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const DEFAULT_VALUES: SettingsFormValues = {
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
};

// --- Reusable Field Components ---

function TextField({
  form,
  name,
  label,
  placeholder,
  description,
  type = "text",
}: {
  form: UseFormReturn<SettingsFormValues>;
  name: keyof SettingsFormValues;
  label: string;
  placeholder?: string;
  description?: string;
  type?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={String(field.value ?? "")}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- Sections ---

function IdentitySection({
  form,
}: {
  form: UseFormReturn<SettingsFormValues>;
}) {
  return (
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
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            form={form}
            name="name"
            label="Nom complet (Entrepreneur)"
            placeholder="Jean Dupont"
          />
          <TextField
            form={form}
            name="business_name"
            label="Nom Commercial (Optionnel)"
            placeholder="JD Solutions"
          />
          <TextField
            form={form}
            name="siret"
            label="Numéro SIRET"
            placeholder="123 456 789 00012"
          />
          <TextField
            form={form}
            name="address"
            label="Adresse du Siège"
            placeholder="123 Rue de la Paix, 75000 Paris"
          />
          <TextField
            form={form}
            name="company_email"
            label="E-mail (Contact)"
            placeholder="contact@pro.com"
          />
          <TextField
            form={form}
            name="company_phone"
            label="Téléphone"
            placeholder="+33 1 23 45 67 89"
          />
          <TextField
            form={form}
            name="company_website"
            label="Site web"
            placeholder="https://monsite.fr"
          />
          <TextField
            form={form}
            name="logo_url"
            label="URL du Logo"
            placeholder="/logo.png"
            description="Fichier dans public/ ou URL externe."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TaxSection({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  const taxStatus = form.watch("tax_status");

  return (
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
                value={field.value}
                defaultValue={TaxStatus.FRANCHISE}
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
                Détermine si la TVA est calculée sur vos devis (0% ou 20%).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {taxStatus === TaxStatus.FRANCHISE && (
          <TextField
            form={form}
            name="vat_exemption_text"
            label="Mention Exonération"
            description="Apparaît sur les factures sans TVA."
          />
        )}

        {taxStatus === TaxStatus.ASSUJETTI && (
          <TextField
            form={form}
            name="default_tax_rate"
            label="Taux TVA par défaut (%)"
            type="number"
          />
        )}
      </CardContent>
    </Card>
  );
}

function PdfSection({ form }: { form: UseFormReturn<SettingsFormValues> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration PDF</CardTitle>
        <CardDescription>
          Personnalisation visuelle du document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            form={form}
            name="default_currency"
            label="Devise"
            placeholder="EUR"
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
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function DangerZone() {
  const [resetting, setResetting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await resetAccount();
      toast.success("Compte r\u00e9initialis\u00e9 avec succ\u00e8s", {
        description: "Toutes vos donn\u00e9es ont \u00e9t\u00e9 effac\u00e9es.",
      });
      setDialogOpen(false);
      window.location.reload();
    } catch {
      toast.error("Erreur lors de la r\u00e9initialisation");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Zone de Danger</CardTitle>
          <CardDescription className="text-destructive/80">
            Actions irréversibles concernant vos données.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                Réinitialiser toutes les données
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="text-sm text-muted-foreground">
                    Cette action est <strong>irréversible</strong>. Elle
                    supprimera définitivement :
                    <ul className="list-disc list-inside mt-2 mb-2">
                      <li>Tous vos devis et factures</li>
                      <li>Tous vos clients</li>
                    </ul>
                    Votre compte utilisateur sera conservé.
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={resetting}>
                  Annuler
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  disabled={resetting}
                  onClick={handleReset}
                >
                  {resetting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {resetting ? "Suppression..." : "Confirmer la suppression"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page ---

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    getSettings()
      .then((data) => {
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
        });
      })
      .catch(() => toast.error("Échec du chargement des paramètres"))
      .finally(() => setLoading(false));
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setSaving(true);
      await updateSettings(data);
      toast.success("Param\u00e8tres enregistr\u00e9s avec succ\u00e8s");
    } catch {
      toast.error("\u00c9chec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

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
          <IdentitySection form={form} />
          <TaxSection form={form} />
          <PdfSection form={form} />

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </form>
      </Form>
      <DangerZone />
    </div>
  );
}
