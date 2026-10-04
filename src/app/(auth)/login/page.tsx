import { SignInForm } from "@/components/forms/auth-forms";
import { FolderPanel } from "@/components/shared/folder-panel";

export const metadata = { title: "Iniciar sesión · Finanzas" };

export default function LoginPage() {
  return (
    <FolderPanel title="Iniciar sesión">
      <SignInForm />
    </FolderPanel>
  );
}
