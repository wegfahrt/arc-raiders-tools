import { type Metadata } from "next";
import { generateMetadata as generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata("quests");

export default function QuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
