import { GitBranch } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl mt-12">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <p className="text-sm text-slate-500">
          Built by <span className="text-slate-300 font-medium">Mohith</span>
        </p>
        <a
          href="https://github.com/seelammohith2222"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <GitBranch size={14} />
          seelammohith2222
        </a>
      </div>
    </footer>
  );
};

export default Footer;
