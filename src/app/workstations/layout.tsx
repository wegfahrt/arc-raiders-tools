import { type Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata("workstations");

export default function WorkstationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
