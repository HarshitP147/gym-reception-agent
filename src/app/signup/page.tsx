"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setCheckEmail(true);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  if (checkEmail) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5 py-16">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-accent">
          ← Back to IronPulse
        </Link>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Check your inbox</CardTitle>
            <CardDescription>
              We sent a confirmation link to {email}. Follow it to activate your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Wrong email or used a test address?{" "}
            <Link href="/signup" className="ml-1 font-medium text-accent hover:underline">
              Try again
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-5 py-16">
      <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-accent">
        ← Back to IronPulse
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Create your account</CardTitle>
          <CardDescription>Join IronPulse Fitness.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="ml-1 font-medium text-accent hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
