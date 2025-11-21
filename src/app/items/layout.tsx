import { type Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata("items");

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
