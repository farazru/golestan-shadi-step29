import { privateMeta } from "@/lib/seo";

export const metadata = privateMeta;

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
