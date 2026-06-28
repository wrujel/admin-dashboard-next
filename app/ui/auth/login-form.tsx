"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signIn, signUp } from "@/app/lib/auth/client";
import { Button } from "@/app/ui/primitives/button";
import { Input } from "@/app/ui/primitives/input";
import { Label } from "@/app/ui/primitives/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/ui/primitives/tabs";

function Field({
  id,
  label,
  icon: Icon,
  trailing,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  icon: typeof MailIcon;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input id={id} className={cn("pl-9", className)} {...props} />
        {trailing}
      </div>
    </div>
  );
}

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);

  function go() {
    router.push("/dashboard");
    router.refresh();
  }

  async function onSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    const { error } = await signIn.email({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setPending(false);
    if (error) return toast.error(error.message ?? "Could not sign in");
    toast.success("Welcome back");
    go();
  }

  async function onSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    const { error } = await signUp.email({
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setPending(false);
    if (error) return toast.error(error.message ?? "Could not create account");
    toast.success("Account created");
    go();
  }

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw((s) => !s)}
      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
      aria-label={showPw ? "Hide password" : "Show password"}
    >
      {showPw ? (
        <EyeOffIcon className="size-4" />
      ) : (
        <EyeIcon className="size-4" />
      )}
    </button>
  );

  if (!configured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="border-border/60 bg-muted/30 rounded-lg border p-4 text-sm">
          <p className="font-medium">Demo mode</p>
          <p className="text-muted-foreground mt-1">
            Auth isn&apos;t configured (no{" "}
            <code className="font-mono">MONGO_URI</code> /{" "}
            <code className="font-mono">BETTER_AUTH_SECRET</code>). Explore the
            dashboard freely, or add those env vars to enable real Better Auth
            sessions.
          </p>
        </div>
        <Button className="w-full" size="lg" onClick={go}>
          Enter dashboard
          <ArrowRightIcon />
        </Button>
      </motion.div>
    );
  }

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign in</TabsTrigger>
        <TabsTrigger value="signup">Create account</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <form onSubmit={onSignIn} className="space-y-4 pt-2">
          <Field
            id="email"
            name="email"
            type="email"
            label="Email"
            icon={MailIcon}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
          <Field
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            label="Password"
            icon={LockIcon}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pr-9"
            required
            trailing={pwToggle}
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            Sign in
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={onSignUp} className="space-y-4 pt-2">
          <Field
            id="name"
            name="name"
            label="Name"
            icon={UserIcon}
            placeholder="Ada Lovelace"
            autoComplete="name"
            required
          />
          <Field
            id="email-up"
            name="email"
            type="email"
            label="Email"
            icon={MailIcon}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
          <Field
            id="password-up"
            name="password"
            type={showPw ? "text" : "password"}
            label="Password"
            icon={LockIcon}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="pr-9"
            minLength={8}
            required
            trailing={pwToggle}
          />
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" /> : null}
            Create account
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
