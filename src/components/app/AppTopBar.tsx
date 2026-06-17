import { LogOut, Lock, ShieldCheck } from "lucide-react";

interface AppTopBarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const VendaraLogo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="28" height="28" rx="6" fill="#FF5722" />
    <path
      d="M7 8L11.5 20L14 14.5L16.5 20L21 8"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AppTopBar = ({ isAuthenticated, onLogout }: AppTopBarProps) => {
  return (
    <header
      className="sticky top-4 z-50 mx-auto max-w-7xl w-[calc(100%-2rem)] bg-white/80 backdrop-blur-md border border-ia-outline-variant/60 rounded-xl shadow-card transition-all duration-300"
      style={{
        height: "56px",
      }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6">

        {/* Left — Brand */}
        <a
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30 rounded-lg p-1 transition-all"
          aria-label="Vendara home"
        >
          <VendaraLogo />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[-0.32px] text-ia-on-surface group-hover:text-ia-primary transition-colors leading-none">
              Vendara
            </span>
            {isAuthenticated && (
              <span className="text-[10px] font-semibold text-ia-secondary/70 leading-none mt-1 tracking-wide uppercase font-sans">
                Admin Console
              </span>
            )}
          </div>
        </a>

        {/* Right — Auth Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              id="topbar-signout-btn"
              onClick={onLogout}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ia-outline-variant bg-ia-surface-low px-3 text-xs font-semibold text-ia-secondary hover:bg-red-50 hover:text-ia-error hover:border-red-200 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 cursor-pointer"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span>Sign out</span>
            </button>
          ) : (
            <a
              id="topbar-admin-signin-link"
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff5722] to-[#b02f00] px-4 text-xs font-bold text-ia-on-primary hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30 cursor-pointer"
              style={{ boxShadow: "0 2px 4px rgba(255, 87, 34, 0.2)" }}
            >
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>Admin sign in</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
