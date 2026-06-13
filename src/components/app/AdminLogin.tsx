import { useState } from "react";
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
          "Your Neon Auth account exists, but the email is not verified yet. Request a fresh code or enter the code Neon already sent.",
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
        "Verification sent. Check your inbox for Neon's email or code, then complete the verification step below.",
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
    <div className="flex w-full items-center justify-center py-6 sm:py-12">
      <Card className="w-full max-w-md bg-ia-surface-card border border-ia-outline-variant rounded-[8px] overflow-hidden p-6 sm:p-8 shadow-sm">
        <CardHeader className="p-0 pb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="rounded-[4px] border border-ia-outline-variant bg-ia-surface px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-ia-secondary uppercase flex items-center gap-1.5 hover:bg-ia-surface">
                <Lock className="size-3 text-ia-primary" />
                <span>Secure Admin Portal</span>
              </Badge>
            </div>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.6px] text-ia-on-surface">
              Sign in to admin console.
            </h2>
            <p className="text-xs leading-5 text-ia-secondary">
              This space is restricted to approved store administrators. Use the public pricelist search for catalog checks.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 space-y-6">
          {message ? (
            <div className="flex items-start gap-2.5 rounded-[4px] bg-orange-50 border border-ia-primary-container/20 p-3 text-xs text-ia-primary font-medium leading-relaxed">
              <ShieldCheck className="size-4 shrink-0 mt-0.5 text-ia-primary-container" />
              <span>{message}</span>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-start gap-2.5 rounded-[4px] bg-ia-error-container/40 border border-ia-error/20 p-3 text-xs text-ia-error font-medium leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-ia-error" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-ia-secondary">Admin Email</Label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 size-4 text-ia-secondary/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@vendara.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 pl-9 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-ia-secondary">Password</Label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 size-4 text-ia-secondary/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 pl-9 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="h-10 w-full rounded-[4px] bg-ia-primary-container text-ia-on-primary font-semibold text-sm transition-all hover:bg-ia-primary active:scale-[0.98] shadow-sm mt-2 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in to console"}
            </Button>
          </form>

          {/* Email Verification Component */}
          <div className="rounded-[4px] border border-ia-outline bg-ia-surface p-4 space-y-3">
            <div className="flex gap-2">
              <ShieldAlert className="size-4.5 text-ia-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-ia-on-surface">Need to verify email credentials?</p>
                <p className="text-[11px] leading-4 text-ia-secondary">
                  Neon Auth requires verified administration emails before granting write-access to products and ledgers.
                </p>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-8.5 text-xs font-medium border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface rounded-[4px] transition-colors cursor-pointer"
              disabled={isSubmitting}
              onClick={() => void handleSendVerification()}
            >
              Request email verification link or code
            </Button>
          </div>

          {/* Verification Code Box (OTP) */}
          {isVerificationMode ? (
            <div className="rounded-[8px] border border-ia-outline bg-ia-surface-card p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code" className="text-xs font-semibold text-ia-secondary">
                  Enter OTP Verification Code
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Neon code"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="h-10 text-center font-mono tracking-widest text-base font-bold rounded-[4px] border border-ia-outline bg-ia-surface focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container"
                  autoComplete="one-time-code"
                />
              </div>
              <Button
                type="button"
                className="h-9.5 w-full rounded-[4px] bg-ia-primary-container text-ia-on-primary font-semibold text-sm transition-colors hover:bg-ia-primary cursor-pointer"
                disabled={isSubmitting}
                onClick={() => void handleVerifyEmail()}
              >
                {isSubmitting ? "Verifying..." : "Verify code and login"}
              </Button>
            </div>
          ) : null}

          {/* Secondary Footer Actions */}
          <div className="flex items-center justify-center border-t border-ia-outline-variant pt-4 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-xs text-ia-secondary font-medium transition-colors hover:text-ia-primary"
            >
              <ArrowLeft className="size-3" />
              <span>Back to public price lookup</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
