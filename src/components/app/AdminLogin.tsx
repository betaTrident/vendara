import { useState } from "react";
import {
  Lock,
  Mail,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginProps = {
  onAuthenticated: () => Promise<void> | void;
};

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] space-y-6">

        {/* Brand Mark Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 8L11.5 20L14 14.5L16.5 20L21 8"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink font-heading">
              Sign in to Vendara
            </h1>
            <p className="text-sm text-muted-text">
              Restricted to approved store administrators.
            </p>
          </div>
        </div>

        {/* Feedback Banners */}
        {message && (
          <div className="flex items-start gap-2.5 rounded-sm bg-[#fff1f2] border border-[#ffe4e6] p-3.5 text-xs text-destructive font-medium leading-relaxed" role="alert">
            <ShieldCheck className="size-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-sm bg-[#fff1f2] border border-[#ffe4e6] p-3.5 text-xs text-destructive font-medium leading-relaxed" role="alert">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-destructive" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign-in Form Card */}
        <div className="vn-card p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4" id="admin-login-form">
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-xs font-semibold text-ink">
                Admin email
              </Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 size-4 text-muted-text" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@vendara.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11 pl-9 rounded-sm border border-hairline bg-white text-sm text-ink placeholder:text-muted-text focus-visible:border-ink transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-xs font-semibold text-ink">
                Password
              </Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 size-4 text-muted-text" aria-hidden="true" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 pl-9 rounded-sm border border-hairline bg-white text-sm text-ink placeholder:text-muted-text focus-visible:border-ink transition-all"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              className="h-11 w-full rounded-sm bg-primary text-white font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all duration-200 mt-2 cursor-pointer focus-visible:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Access Console"}
            </Button>
          </form>
        </div>

        {/* Verification Card */}
        <div className="vn-card p-5 space-y-3">
          <div className="flex gap-3">
            <ShieldAlert className="size-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-ink">Need to verify your email?</p>
              <p className="text-[11px] leading-relaxed text-muted-text">
                Your email must be verified before database write privileges are granted.
              </p>
            </div>
          </div>

          <Button
            id="send-verification-btn"
            type="button"
            className="w-full h-9 text-xs font-semibold border border-hairline bg-white hover:bg-surface-soft text-ink rounded-sm transition-colors cursor-pointer"
            disabled={isSubmitting}
            onClick={() => void handleSendVerification()}
          >
            Request Verification Link
          </Button>
        </div>

        {/* OTP Input Card */}
        <div
          className={`vn-card overflow-hidden transition-all duration-300 ${
            isVerificationMode ? "max-h-96 opacity-100 p-5 shadow-hover" : "max-h-0 opacity-0 border-transparent p-0 pointer-events-none"
          }`}
          aria-hidden={!isVerificationMode}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="text-xs font-bold text-ink">Enter OTP Code</span>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="otp-code" className="text-xs font-semibold text-ink">
                Verification code
              </Label>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                placeholder="· · · · · ·"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                className="h-12 text-center font-mono tracking-[0.5em] text-lg font-bold rounded-sm border border-hairline bg-white focus-visible:border-ink transition-all"
                autoComplete="one-time-code"
              />
            </div>
            <Button
              id="verify-otp-btn"
              type="button"
              className="h-10 w-full rounded-sm bg-primary text-white font-semibold text-xs hover:bg-primary-hover active:scale-95 transition-all duration-200 cursor-pointer"
              disabled={isSubmitting}
              onClick={() => void handleVerifyEmail()}
            >
              {isSubmitting ? "Verifying..." : "Verify and Sign In"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
