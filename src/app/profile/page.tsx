import { Suspense } from "react";
import { ProfileForm } from "./profile-form";

export default function ProfilePage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-4 py-10">در حال بارگذاری پرونده…</main>}>
      <ProfileForm />
    </Suspense>
  );
}
