import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-8xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
