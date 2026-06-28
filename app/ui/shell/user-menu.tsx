"use client";

import Link from "next/link";
import { LogOutIcon, SettingsIcon, SparklesIcon, UserIcon } from "lucide-react";

import { logout } from "@/app/actions/auth.actions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/ui/primitives/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/ui/primitives/dropdown-menu";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({
  user,
}: {
  user: { name: string; email: string; image?: string | null; role: string };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="group focus-visible:ring-ring/50 focus-visible:ring-offset-background rounded-full outline-none transition-transform focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95"
        >
          <Avatar className="ring-offset-background size-8 ring-2 ring-transparent ring-offset-2 transition-all duration-200 group-hover:ring-primary/50 group-data-[state=open]:ring-primary">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="transition-colors group-hover:bg-primary/15 group-hover:text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <UserIcon />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <SettingsIcon />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <SparklesIcon />
          Upgrade plan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button
            type="submit"
            className="focus:bg-accent text-destructive flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none [&_svg]:size-4"
          >
            <LogOutIcon />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
