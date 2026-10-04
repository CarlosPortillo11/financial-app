import { SignUpForm } from "@/components/forms/auth-forms";
import { FolderPanel } from "@/components/shared/folder-panel";

export const metadata = { title: "Crear cuenta · Finanzas" };

export default function SignUpPage() {
  return (
    <FolderPanel title="Crear cuenta" description="Te dejamos categorías listas para empezar; puedes cambiarlas después.">
      <SignUpForm />
    </FolderPanel>
  );
}
