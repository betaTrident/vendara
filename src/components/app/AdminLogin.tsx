import { useState } from "react";
import {
  Lock,
  Mail,
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Package,
  Users,
  TrendingUp,
  Circle,
} from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginProps = {
  onAuthenticated: () => Promise<void> | void;
};

// ── Geometric SVG background texture ─────────────────────────────────────────
const GridTexture = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// ── Feature item ──────────────────────────────────────────────────────────────
const FeatureItem = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/8 border border-white/12">
      <Icon className="size-4 text-white/75" />
    </div>
    <span className="text-sm text-white/65 leading-snug">{text}</span>
  </div>
);

export const AdminLogin = ({ onAuthenticated }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationMode, setIsVerificationMode] = useState(false);

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const openVerificationMode = (nextMessage: string) => {
    setIsVerificationMode(true);
    setMessage(nextMessage);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    resetFeedback();

    try {
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to sign in.");
      }

      setEmail("");
      setPassword("");
      setVerificationCode("");
      setIsVerificationMode(false);
      await onAuthenticated();
    } catch (nextError) {
      const nextMessage =
        nextError instanceof Error ? nextError.message : "Unable to sign in.";

      if (/verify|verification|email not verified/i.test(nextMessage)) {
        openVerificationMode(
          "Your account email isn't verified yet. Request a fresh code or enter the code already sent.",
        );
      } else {
        setError(nextMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendVerification = async () => {
    if (!email.trim()) {
      setError("Enter your admin email first.");
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      const result = await authClient.sendVerificationEmail({
        email: email.trim(),
        callbackURL: `${window.location.origin}/admin`,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to send verification email.");
      }

      openVerificationMode(
        "Verification sent. Check your inbox, then enter the code below.",
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to send verification email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email.trim() || !verificationCode.trim()) {
      setError("Enter your admin email and the verification code.");
      return;
    }

    setIsSubmitting(true);
    resetFeedback();

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp: verificationCode.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to verify email.");
      }

      setVerificationCode("");
      setIsVerificationMode(false);

      if (result.data && "token" in result.data && result.data.token) {
        await onAuthenticated();
        return;
      }

      setMessage("Email verified. Sign in again with your password.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to verify email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full ia-fade-in">

      {/* ── Left Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-between p-10 xl:p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #180700 0%, #290e00 60%, #3a1500 100%)",
        }}
      >
        {/* Geometric grid texture */}
        <GridTexture />

        {/* Diagonal decorative accent */}
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full opacity-[0.09]"
          style={{ background: "radial-gradient(circle, #FF5722 0%, transparent 70%)" }}
        />
        
        <div
          aria-hidden="true"
          className="absolute -top-16 -left-16 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #ff9e80 0%, transparent 70%)" }}
        />

        {/* Top: Brand mark + store status */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#FF5722" />
              <path d="M7 8L11.5 20L14 14.5L16.5 20L21 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-bold text-white/90 tracking-tight">Vendara</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400/90 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
            <Circle className="size-1.5 fill-emerald-400/90 text-emerald-400/90 animate-pulse" aria-hidden="true" />
            Store active
          </div>
        </div>

        {/* Center: headline + features */}
        <div className="relative z-10 space-y-8 my-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-orange-300">
              <Lock className="size-3" aria-hidden="true" />
              Secure Admin Portal
            </div>
            <h1 className="text-[2.25rem] font-bold leading-[1.15] tracking-tight text-white font-heading">
              Manage your store<br />with precision.
            </h1>
            <p className="text-sm leading-relaxed text-white/50">
              Inventory pricing, customer credit ledgers, and transaction logs — all in one unified dashboard.
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-white/10">
            <FeatureItem icon={Package} text="Product catalog with price history" />
            <FeatureItem icon={Users} text="Customer credit accounts and ledgers" />
            <FeatureItem icon={TrendingUp} text="Markup margins calculated automatically" />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-white/30 font-mono tracking-wider">
          © {new Date().getFullYear()} VENDARA · POWERED BY VENDARA v2
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ia-surface px-4 py-12 sm:px-10">
        <div className="w-full max-w-md space-y-6">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#FF5722" />
              <path d="M7 8L11.5 20L14 14.5L16.5 20L21 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-base font-bold text-ia-on-surface tracking-tight">Vendara</span>
          </div>

          {/* Feedback banners */}
          {message && (
            <div className="flex items-start gap-2.5 rounded-lg bg-orange-50 border border-orange-200 p-3.5 text-xs text-orange-850 font-semibold leading-relaxed ia-slide-up shadow-sm" role="alert">
              <ShieldCheck className="size-4 shrink-0 mt-0.5 text-orange-600" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-ia-error font-semibold leading-relaxed ia-slide-up shadow-sm" role="alert">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-ia-error" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Header */}
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-ia-on-surface">
              Sign in to console
            </h2>
            <p className="text-sm text-ia-secondary leading-relaxed">
              Restricted to approved store administrators.
            </p>
          </div>

          {/* Sign-in Double Bezel Wrapper */}
          <div className="ia-bezel-outer">
            <div className="ia-bezel-inner p-5 space-y-4 bg-white">
              <form onSubmit={handleSubmit} className="space-y-4" id="admin-login-form">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs font-semibold text-ia-secondary">
                    Admin email
                  </Label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 size-4 text-ia-secondary/50" aria-hidden="true" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@vendara.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-10 pl-10 rounded-lg border border-ia-outline-variant bg-ia-surface-card text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full transition-all ia-focus-ring"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-ia-secondary">
                    Password
                  </Label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 size-4 text-ia-secondary/50" aria-hidden="true" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-10 pl-10 rounded-lg border border-ia-outline-variant bg-ia-surface-card text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full transition-all ia-focus-ring"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>

                <Button
                  id="login-submit-btn"
                  type="submit"
                  className="h-10 w-full rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in to console"}
                </Button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-ia-outline-variant" />
            <span className="text-[10px] text-ia-secondary/70 font-semibold uppercase tracking-wider font-sans">Account verification</span>
            <div className="flex-1 h-px bg-ia-outline-variant" />
          </div>

          {/* Verification section */}
          <div className="ia-bezel-outer">
            <div className="ia-bezel-inner p-4 space-y-3 bg-white">
              <div className="flex gap-3">
                <ShieldAlert className="size-4.5 text-ia-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-ia-on-surface">Need to verify your email?</p>
                  <p className="text-[11px] leading-relaxed text-ia-secondary">
                    Neon Auth requires a verified email before granting admin write access.
                  </p>
                </div>
              </div>

              <Button
                id="send-verification-btn"
                type="button"
                className="w-full h-8.5 text-xs font-bold border border-ia-outline-variant bg-ia-surface-low hover:bg-ia-surface-high hover:text-ia-on-surface rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20"
                disabled={isSubmitting}
                onClick={() => void handleSendVerification()}
              >
                Request verification code
              </Button>
            </div>
          </div>

          {/* OTP input panel */}
          <div
            className={`rounded-xl border border-ia-outline-variant bg-ia-surface-card overflow-hidden transition-all duration-300 ${
              isVerificationMode ? "max-h-96 opacity-100 mt-4 shadow-sm" : "max-h-0 opacity-0 border-transparent pointer-events-none"
            }`}
            aria-hidden={!isVerificationMode}
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span className="text-xs font-bold text-ia-on-surface">Enter OTP code</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="otp-code" className="text-xs font-semibold text-ia-secondary">
                  Verification code
                </Label>
                <Input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="· · · · · ·"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="h-12 text-center font-mono tracking-[0.5em] text-lg font-bold rounded-lg border border-ia-outline-variant bg-ia-surface focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container transition-all ia-focus-ring"
                  autoComplete="one-time-code"
                />
              </div>
              <Button
                id="verify-otp-btn"
                type="button"
                className="h-10 w-full rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer"
                disabled={isSubmitting}
                onClick={() => void handleVerifyEmail()}
              >
                {isSubmitting ? "Verifying..." : "Verify and sign in"}
              </Button>
            </div>
          </div>

          {/* Back link */}
          <div className="flex items-center justify-center pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-ia-secondary font-semibold transition-colors hover:text-ia-primary active:scale-95"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              <span>Back to public price lookup</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
