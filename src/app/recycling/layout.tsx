import { type Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata("recycling");

export default function RecyclingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
