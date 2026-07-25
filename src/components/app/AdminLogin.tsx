import { useState } from "react";
import {
  Lock,
  Mail,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Tag,
  Users,
  Receipt,
} from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { VendaraLogo } from "@/components/app/branding/VendaraLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginProps = {
  onAuthenticated: () => Promise<void> | void;
};

const BENEFITS = [
  {
    icon: Tag,
    title: "Manage prices",
    description: "Set and update selling prices with a clear change history.",
  },
  {
    icon: Users,
    title: "Track customer balances",
    description: "See who owes, how much, and keep ledgers auditable.",
  },
  {
    icon: Receipt,
    title: "Record purchases and payments",
    description: "Log credit purchases and payments with idempotent writes.",
  },
] as const;

export const AdminLogin = ({ onAuthenticated }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerificationMode, setIsVerificationMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        throw new Error(
          result.error.message ?? "Unable to send verification email.",
        );
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
      setError(
        nextError instanceof Error ? nextError.message : "Unable to verify email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-ink">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid min-h-dvh max-w-6xl lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between px-10 py-12 xl:px-14">
          <div className="space-y-8">
            <div className="space-y-3">
              <VendaraLogo variant="horizontal" priority className="h-9 max-w-[168px]" />
              <p className="text-sm font-medium text-muted-text">
                Private sari-sari store admin
              </p>
            </div>

            <div className="space-y-3 max-w-md">
              <h1 className="text-3xl font-semibold tracking-tight text-ink font-heading text-balance">
                Your all-in-one system to manage your store with clarity and
                confidence.
              </h1>
            </div>

            <ul className="space-y-4 max-w-md">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <li key={benefit.title} className="flex gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-ink">
                        {benefit.title}
                      </p>
                      <p className="text-sm text-muted-text leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="inline-flex items-center gap-2 rounded-md border border-hairline bg-card/80 px-3 py-2 text-xs font-medium text-muted-text">
            <Lock className="size-3.5 text-emerald-600" aria-hidden="true" />
            Secure private access — owner sessions only.
          </p>
        </section>

        <section className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[420px] space-y-5">
            <div className="flex flex-col items-center text-center space-y-3 lg:hidden">
              <VendaraLogo
                variant="horizontal"
                priority
                className="h-9 max-w-[160px]"
              />
              <p className="text-sm text-muted-text">
                Private sari-sari store admin
              </p>
            </div>

            <div className="vn-card space-y-6 p-6 sm:p-7">
              <div className="space-y-2 text-center sm:text-left">
                <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink font-heading">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-text">
                  Sign in to access your Vendara store admin.
                </p>
              </div>

              {message ? (
                <div
                  className="flex items-start gap-2.5 rounded-md bg-primary/10 border border-primary/20 p-3.5 text-xs text-ink font-medium leading-relaxed"
                  role="alert"
                >
                  <ShieldCheck
                    className="size-4 shrink-0 mt-0.5 text-primary"
                    aria-hidden="true"
                  />
                  <span>{message}</span>
                </div>
              ) : null}

              {error ? (
                <div
                  className="flex items-start gap-2.5 rounded-md bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive font-medium leading-relaxed"
                  role="alert"
                >
                  <AlertCircle
                    className="size-4 shrink-0 mt-0.5 text-destructive"
                    aria-hidden="true"
                  />
                  <span>{error}</span>
                </div>
              ) : null}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                id="admin-login-form"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-email"
                    className="text-xs font-semibold text-ink"
                  >
                    Email address
                  </Label>
                  <div className="relative flex items-center">
                    <Mail
                      className="absolute left-3 size-4 text-muted-text"
                      aria-hidden="true"
                    />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@store.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 pl-9 rounded-md border border-hairline bg-card text-sm text-ink placeholder:text-muted-text focus-visible:border-ink transition-all"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-password"
                    className="text-xs font-semibold text-ink"
                  >
                    Password
                  </Label>
                  <div className="relative flex items-center">
                    <Lock
                      className="absolute left-3 size-4 text-muted-text"
                      aria-hidden="true"
                    />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 pl-9 pr-11 rounded-md border border-hairline bg-card text-sm text-ink placeholder:text-muted-text focus-visible:border-ink transition-all"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 inline-flex size-8 items-center justify-center rounded-md text-muted-text hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  id="login-submit-btn"
                  type="submit"
                  className="h-11 w-full rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-95 transition-all duration-200 mt-1 cursor-pointer focus-visible:outline-none"
                  disabled={isSubmitting}
                >
                  <Lock className="size-3.5 mr-1.5" aria-hidden="true" />
                  {isSubmitting ? "Signing in…" : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-hairline" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-card px-2 text-muted-text">or</span>
                </div>
              </div>

              <Button
                id="send-verification-btn"
                type="button"
                variant="outline"
                className="w-full h-10 text-xs font-semibold border border-hairline bg-card hover:bg-surface-soft text-ink rounded-md transition-colors cursor-pointer"
                disabled={isSubmitting}
                onClick={() => void handleSendVerification()}
              >
                <Mail className="size-3.5 mr-1.5" aria-hidden="true" />
                Send verification link
              </Button>

              <p className="flex items-start gap-2 rounded-md bg-surface-soft px-3 py-2.5 text-[11px] leading-relaxed text-muted-text">
                <ShieldAlert
                  className="size-3.5 shrink-0 mt-0.5 text-primary"
                  aria-hidden="true"
                />
                This system is for approved store administrators only.
              </p>
            </div>

            <div
              className={`vn-card overflow-hidden transition-all duration-300 ${
                isVerificationMode
                  ? "max-h-96 opacity-100 p-5"
                  : "max-h-0 opacity-0 border-transparent p-0 pointer-events-none"
              }`}
              aria-hidden={!isVerificationMode}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="size-4.5 text-emerald-600 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-bold text-ink">
                    Enter verification code
                  </span>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="otp-code"
                    className="text-xs font-semibold text-ink"
                  >
                    Verification code
                  </Label>
                  <Input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="· · · · · ·"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value)}
                    className="h-12 text-center font-mono tracking-[0.5em] text-lg font-bold rounded-md border border-hairline bg-card focus-visible:border-ink transition-all"
                    autoComplete="one-time-code"
                  />
                </div>
                <Button
                  id="verify-otp-btn"
                  type="button"
                  className="h-10 w-full rounded-md bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
                  disabled={isSubmitting}
                  onClick={() => void handleVerifyEmail()}
                >
                  {isSubmitting ? "Verifying…" : "Verify and Sign In"}
                </Button>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-text">
              © {new Date().getFullYear()} Vendara. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
