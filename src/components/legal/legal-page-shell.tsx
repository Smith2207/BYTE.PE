export function LegalPageShell({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{titulo}</h1>
      {actualizado && (
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: {actualizado}</p>
      )}
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}
