import { useState } from "react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminLoginProps = {
  onAuthenticated: () => Promise<void> | void;
};

export const AdminLogin = ({ onAuthenticated }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({
              email,
              password,
            })
          : await authClient.signUp.email({
              email,
              password,
              name: name.trim() || email,
            });

      if (result.error) {
        throw new Error(result.error.message ?? "Unable to sign in.");
      }

      setEmail("");
      setPassword("");
      setName("");
      await onAuthenticated();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md rounded-[1.75rem] border-border/70">
      <CardHeader>
        <CardTitle className="text-2xl">Vendara Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "sign-up" ? (
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 rounded-2xl"
            />
          ) : null}
          <Input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-2xl"
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder={mode === "sign-in" ? "Enter your password" : "Create a password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-2xl"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="h-12 w-full rounded-2xl" disabled={isSubmitting}>
            {isSubmitting
              ? mode === "sign-in"
                ? "Signing in..."
                : "Creating account..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create admin account"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-muted-foreground underline underline-offset-4"
            onClick={() => {
              setMode((currentMode) =>
                currentMode === "sign-in" ? "sign-up" : "sign-in",
              );
              setError("");
            }}
          >
            {mode === "sign-in"
              ? "Need your first admin account?"
              : "Already have an admin account?"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
};
