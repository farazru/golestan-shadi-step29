import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BackLink } from "@/components/back-link";
import { PreForm } from "./form";

export default function PreRegister() {
  return (
    <div className="flex min-h-full flex-col school-hero-bg">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <BackLink />
        <h1 className="text-2xl font-semibold text-[var(--school-teal-dark)]">درخواست ثبت‌نام</h1>
        <p className="mt-2 text-sm">فرم را پر کنید. دفتر تماس می‌گیرد. حساب کاربری از اینجا ساخته نمی‌شود.</p>
        <PreForm />
      </main>
      <SiteFooter />
    </div>
  );
}
