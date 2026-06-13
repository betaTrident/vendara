import { LogOut, Lock } from "lucide-react";

interface AppTopBarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const AppTopBar = ({ isAuthenticated, onLogout }: AppTopBarProps) => {
  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-ia-surface-card/85 backdrop-blur-md border-b border-ia-outline-variant">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left Side: Blank Logo Placeholder / Brand Name */}
        <div className="flex items-center gap-3">
          {/* Logo is left blank per user request */}
          <a href="/" className="text-sm font-semibold tracking-[-0.28px] text-ia-on-surface hover:text-ia-primary transition-colors">
            Vendara
          </a>
        </div>

        {/* Right Side: Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ia-outline px-3 text-xs font-semibold text-ia-secondary bg-ia-surface hover:bg-ia-surface-high hover:text-ia-on-surface transition-colors cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <a
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ia-primary-container px-3 text-xs font-semibold text-ia-on-primary hover:bg-ia-primary transition-colors cursor-pointer shadow-sm"
            >
              <Lock className="size-3" />
              <span>Admin Sign In</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
