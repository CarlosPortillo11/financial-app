import { toast } from "sonner";

/** Callbacks estándar para useAction: toast de éxito/error y cierre del modal. */
export function feedback(message: string, onDone?: () => void) {
  return {
    onSuccess: () => {
      toast.success(message);
      onDone?.();
    },
    onError: ({ error }: { error: { serverError?: string } }) => {
      toast.error(error.serverError ?? "Revisa los campos");
    },
  };
}
