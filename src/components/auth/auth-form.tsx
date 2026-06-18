"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { login, signup, type AuthState } from "@/app/(auth)/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "h-11 w-full rounded-full bg-brand font-medium text-[#04130d]",
        "transition-all duration-300 hover:bg-brand-bright",
        "shadow-[0_8px_30px_-8px_var(--color-brand)] disabled:opacity-60",
      )}
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction] = useActionState<AuthState, FormData>(action, null);

  return (
    <Card className="w-full max-w-sm animate-rise p-7">
      <h1 className="text-xl font-semibold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        {mode === "login"
          ? "Sign in to track your recycling impact."
          : "Start earning coins for every bottle you recycle."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />

        {mode === "signup" && (
          <Field label="Full name" htmlFor="fullName">
            <Input id="fullName" name="fullName" placeholder="Alex Rivera" autoComplete="name" required />
          </Field>
        )}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@city.gov"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </Field>

        {state?.error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <SubmitButton label={mode === "login" ? "Sign in" : "Create account"} />
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-brand-bright hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-bright hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
