export function Footer() {
  return (
    <footer className="hidden lg:block bg-slate-900/95 backdrop-blur-sm border-t border-cyan-500/20 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 max-h-[72px] flex items-center">
        <div className="flex flex-col gap-2 text-sm text-slate-400 text-center w-full">
          <p>
            Special thanks to the creators and contributors of{" "}
            <a
              href="https://github.com/RaidTheory/arcraiders-data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 hover:decoration-cyan-400/50 underline-offset-2"
            >
              RaidTheory
            </a>
            {" "}for providing the game data that powers this tool.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            All game content, including but not limited to game mechanics, items, names, and imagery, 
            is copyright © Embark Studios AB. This companion app is an independent project and is not
            affiliated with or endorsed by Embark Studios AB.
          </p>
        </div>
      </div>
    </footer>
  );
}
