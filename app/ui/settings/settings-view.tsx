"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  BellIcon,
  CheckIcon,
  LaptopIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/ui/primitives/tabs";
import { Panel } from "@/app/ui/widgets/panel";
import { Avatar, AvatarFallback } from "@/app/ui/primitives/avatar";
import { Button } from "@/app/ui/primitives/button";
import { Input } from "@/app/ui/primitives/input";
import { Label } from "@/app/ui/primitives/label";
import { Switch } from "@/app/ui/primitives/switch";
import { Separator } from "@/app/ui/primitives/separator";
import { useMounted } from "@/app/lib/use-mounted";
import type { SessionUser } from "@/app/lib/auth/dal";

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: LaptopIcon },
];

function ThemeCards() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {THEMES.map((t) => {
        const active = mounted && theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "hover:border-foreground/20 relative flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
              active && "border-primary ring-primary/30 ring-2",
            )}
          >
            <t.icon className="size-5" />
            <span className="text-sm font-medium">{t.label}</span>
            {active && (
              <CheckIcon className="text-primary absolute top-3 right-3 size-4" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export function SettingsView({ user }: { user: SessionUser }) {
  function onSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Profile saved");
  }

  return (
    <Tabs defaultValue="profile" className="gap-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <div className="max-w-3xl">
          <Panel title="Profile" description="Update your account details">
            <form onSubmit={onSave} className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 text-lg">
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline" size="sm">
                    Change avatar
                  </Button>
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    PNG or JPG, up to 2MB.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="s-name">Name</Label>
                  <Input id="s-name" defaultValue={user.name} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" type="email" defaultValue={user.email} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </Panel>
        </div>
      </TabsContent>

      <TabsContent value="appearance">
        <div className="max-w-3xl">
          <Panel title="Appearance" description="Customize how Nexus looks">
            <ThemeCards />
          </Panel>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <div className="max-w-3xl space-y-4">
          <Panel
            title="Notifications"
            description="Choose what you want to hear about"
          >
            <div className="divide-y">
              <ToggleRow
                label="Product updates"
                description="New features and improvements"
                defaultChecked
              />
              <ToggleRow
                label="Weekly digest"
                description="A summary of your store every Monday"
                defaultChecked
              />
              <ToggleRow
                label="Security alerts"
                description="Sign-ins from new devices"
                defaultChecked
              />
              <ToggleRow
                label="Marketing"
                description="Tips, offers and announcements"
              />
            </div>
          </Panel>
          <Panel title="Security" description="Account protection">
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheckIcon className="text-positive size-5" />
              Two-factor authentication is{" "}
              <span className="font-medium">available</span> via Better Auth.
            </div>
          </Panel>
        </div>
      </TabsContent>
    </Tabs>
  );
}
