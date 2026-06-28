import type { Metadata } from "next";

import { authConfigured } from "@/app/lib/auth/config";
import { Logo } from "@/app/ui/brand";
import { LoginForm } from "@/app/ui/auth/login-form";
import { LoginAside } from "@/app/ui/auth/login-aside";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <LoginAside />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo size={30} />
            <span className="text-lg font-semibold tracking-tight">Nexus</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Sign in to your Nexus control center.
            </p>
          </div>

          <LoginForm configured={authConfigured} />

          <p className="text-muted-foreground mt-6 text-center text-xs">
            Protected by Better Auth · sessions rotate every 7 days
          </p>
        </div>
      </div>
    </main>
  );
}
