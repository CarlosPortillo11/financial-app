import { cn } from "@/lib/utils";

/** Contenedor con figura de carpeta: pestaña con el título arriba a la izquierda,
 *  unida al cuerpo por una esquina invertida. Reemplaza a `Card` en los paneles
 *  de sección. Ver design/DESIGN.md §13. */
export function FolderPanel({
  title,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("folder", className)}>
      <h2 className="folder-tab text-base">{title}</h2>
      {actions && <div className="folder-actions">{actions}</div>}
      <div className={cn("folder-body p-5 md:p-6", bodyClassName)}>
        {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </section>
  );
}
