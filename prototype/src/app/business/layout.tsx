import { BusinessShell } from "@/components/business/business-shell";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <BusinessShell>{children}</BusinessShell>;
}
