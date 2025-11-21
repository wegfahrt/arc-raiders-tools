import { type Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata("maps");

export default function MapsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
