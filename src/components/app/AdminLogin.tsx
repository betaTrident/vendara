import { useState } from "react";
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert, ShieldCheck, CheckCircle2, Package, Users, TrendingUp } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginProps = {
  onAuthenticated: () => Promise<void> | void;
};

const FeatureItem = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-3 text-sm text-white/70">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10 border border-white/10">
      <Icon className="size-3.5 text-white/80" />
    </div>
    <span>{text}</span>
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
      const result = await authClient.signIn.email({
        email,
        password,
      });

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
      {/* ── Left Brand Panel (hidden on mobile) ── */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between p-10 xl:p-12"
        style={{
          background: "linear-gradient(150deg, #1c0800 0%, #2d1000 50%, #3d1800 100%)",
        }}
      >
        {/* Brand mark */}
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="28" height="28" rx="6" fill="#FF5722" />
            <path d="M7 8L11.5 20L14 14.5L16.5 20L21 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-semibold text-white/90 tracking-[-0.28px]">Vendara</span>
        </div>

        {/* Center content */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-orange-300/80">
              <Lock className="size-3" />
              Secure Admin Portal
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-[-0.8px] text-white">
              Manage your store<br />with precision.
            </h1>
            <p className="text-sm leading-relaxed text-white/50">
              Inventory pricing, customer credit ledgers, and transaction logs — all in one workspace.
            </p>
          </div>

          <div className="space-y-3">
            <FeatureItem icon={Package} text="Product catalog with price history" />
            <FeatureItem icon={Users} text="Customer credit accounts and ledgers" />
            <FeatureItem icon={TrendingUp} text="Markup margins calculated automatically" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/25 font-mono">
          &copy; {new Date().getFullYear()} Vendara
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ia-surface px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm space-y-8">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#FF5722" />
              <path d="M7 8L11.5 20L14 14.5L16.5 20L21 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-ia-on-surface tracking-[-0.28px]">Vendara</span>
          </div>

          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-[-0.56px] text-ia-on-surface">
              Sign in to console
            </h2>
            <p className="text-sm text-ia-secondary leading-relaxed">
              Restricted to approved store administrators.
            </p>
          </div>

          {/* Feedback banners */}
          {message && (
            <div className="flex items-start gap-2.5 rounded-md bg-orange-50 border border-orange-200/60 p-3 text-xs text-orange-800 font-medium leading-relaxed ia-slide-up">
              <ShieldCheck className="size-4 shrink-0 mt-0.5 text-orange-500" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-md bg-red-50 border border-red-200/60 p-3 text-xs text-ia-error font-medium leading-relaxed ia-slide-up">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-ia-error" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign-in form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="admin-login-form">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs font-semibold text-ia-secondary">
                Admin email
              </Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 size-4 text-ia-outline" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@vendara.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 pl-9 rounded-md border border-ia-outline-variant bg-ia-surface-card text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
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
                <Lock className="absolute left-3 size-4 text-ia-outline" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 pl-9 rounded-md border border-ia-outline-variant bg-ia-surface-card text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              className="h-10 w-full rounded-md bg-ia-primary-container text-ia-on-primary font-semibold text-sm transition-all hover:bg-ia-primary active:scale-[0.98] shadow-sm mt-2 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in to console"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-ia-outline-variant" />
            <span className="text-[11px] text-ia-secondary/60 font-medium">Account verification</span>
            <div className="flex-1 h-px bg-ia-outline-variant" />
          </div>

          {/* Verification section */}
          <div className="rounded-md border border-ia-outline-variant bg-ia-surface-card p-4 space-y-3">
            <div className="flex gap-2.5">
              <ShieldAlert className="size-4.5 text-ia-secondary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-ia-on-surface">Need to verify your email?</p>
                <p className="text-[11px] leading-4 text-ia-secondary">
                  Neon Auth requires a verified email before granting admin write access.
                </p>
              </div>
            </div>

            <Button
              id="send-verification-btn"
              type="button"
              variant="outline"
              className="w-full h-8.5 text-xs font-medium border border-ia-outline-variant bg-ia-surface hover:bg-ia-surface-high hover:text-ia-on-surface rounded-md transition-colors cursor-pointer"
              disabled={isSubmitting}
              onClick={() => void handleSendVerification()}
            >
              Request verification code
            </Button>
          </div>

          {/* OTP input panel */}
          {isVerificationMode && (
            <div className="rounded-md border border-ia-outline-variant bg-ia-surface-card p-4 space-y-4 ia-slide-up">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-ia-primary-container shrink-0" />
                <span className="text-xs font-semibold text-ia-on-surface">Enter OTP code</span>
              </div>
              <div className="space-y-2">
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
                  className="h-11 text-center font-mono tracking-[0.3em] text-base font-bold rounded-md border border-ia-outline-variant bg-ia-surface focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container transition-colors"
                  autoComplete="one-time-code"
                />
              </div>
              <Button
                id="verify-otp-btn"
                type="button"
                className="h-9.5 w-full rounded-md bg-ia-primary-container text-ia-on-primary font-semibold text-sm transition-all hover:bg-ia-primary active:scale-[0.98] cursor-pointer"
                disabled={isSubmitting}
                onClick={() => void handleVerifyEmail()}
              >
                {isSubmitting ? "Verifying..." : "Verify and sign in"}
              </Button>
            </div>
          )}

          {/* Back link */}
          <div className="flex items-center justify-center pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-ia-secondary font-medium transition-colors hover:text-ia-primary"
            >
              <ArrowLeft className="size-3" />
              <span>Back to public price lookup</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
