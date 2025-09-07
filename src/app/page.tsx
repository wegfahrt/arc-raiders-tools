import Link from "next/link";
import { getAllItems } from "~/server/db/queries/select";
import Image from "next/image";

export default async function HomePage() {
  const items = await getAllItems();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
        </h1>
        {items.map((item) => (
          <div key={item.id}>
          <Image src={item.imageUrl ?? "/placeholder.png"} alt={item.name} width={32} height={32} />
          </div>
        ))}
        
      </div>
    </main>
  );
}
