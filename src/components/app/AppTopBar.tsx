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
      className="sticky top-0 z-50 w-full bg-white/88 backdrop-blur-lg border-b border-ia-outline-variant"
      style={{
        height: "60px",
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)",
      }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Left — Brand */}
        <a
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container rounded-md"
          aria-label="Vendara home"
        >
          <VendaraLogo />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[-0.32px] text-ia-on-surface group-hover:text-ia-primary transition-colors leading-none">
              Vendara
            </span>
            {isAuthenticated && (
              <span className="text-[10px] font-medium text-ia-secondary/70 leading-none mt-0.5 tracking-wide">
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
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ia-outline-variant bg-ia-surface px-3 text-xs font-medium text-ia-secondary hover:bg-red-50 hover:text-ia-error hover:border-red-200 transition-all duration-150 cursor-pointer"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span>Sign out</span>
            </button>
          ) : (
            <a
              id="topbar-admin-signin-link"
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ia-primary-container px-3.5 text-xs font-semibold text-ia-on-primary hover:bg-ia-primary active:scale-[0.97] transition-all duration-150 cursor-pointer"
              style={{ boxShadow: "var(--shadow-card)" }}
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
