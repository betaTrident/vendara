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
    <rect width="28" height="28" rx="6" fill="#ff385c" />
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
      className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-hairline-soft transition-all duration-300"
      style={{
        height: "56px",
      }}
    >
      <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-4 sm:px-6">

        {/* Left — Brand */}
        <a
          href="/admin"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg p-1 transition-all"
          aria-label="Vendara home"
        >
          <VendaraLogo />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[-0.32px] text-ink group-hover:text-primary transition-colors leading-none">
              Vendara
            </span>
            {isAuthenticated && (
              <span className="text-[10px] font-semibold text-muted-text leading-none mt-1 tracking-wide uppercase font-sans">
                Admin Console
              </span>
            )}
          </div>
        </a>

        {/* Right — Auth Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-xs font-medium text-muted-text">
                Store Manager
              </span>
              <button
                id="topbar-signout-btn"
                onClick={onLogout}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-hairline bg-white px-3 text-xs font-medium text-ink hover:bg-surface-soft hover:border-ink transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
              >
                <LogOut className="size-3.5 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <a
              id="topbar-admin-signin-link"
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-4 text-xs font-semibold text-white hover:bg-primary-hover active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
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
