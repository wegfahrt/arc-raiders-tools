import { type Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata("guides");

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
