import { GitBranch, Mail, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 p-2 shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">DevSync</h3>
                <p className="text-sm text-gray-400">Code rhythm, visible.</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-400">
              Track your LeetCode submissions, monitor coding activity,
              and compete with your squad — all in one place.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-300">
                Contact
              </h4>
              <a
                href="mailto:seelammohith2222@gmail.com"
                className="mt-3 flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-blue-300"
              >
                <Mail className="h-4 w-4" />
                <span>seelammohith2222@gmail.com</span>
              </a>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-300">
                Creator
              </h4>
              <a
                href="https://github.com/Seelam-Mohith"
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-blue-300"
              >
                <GitBranch className="h-4 w-4" />
                <span>github.com/Seelam-Mohith</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-xs text-gray-500">
          Built by Seelam Mohith for developer activity tracking.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
