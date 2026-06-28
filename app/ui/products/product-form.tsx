"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/app/ui/primitives/button";
import { Input } from "@/app/ui/primitives/input";
import { Label } from "@/app/ui/primitives/label";
import { Textarea } from "@/app/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/primitives/select";
import {
  initialActionState,
  type ActionState,
} from "@/app/actions/action-state";
import type { ProductRow } from "@/app/lib/types";

const CATEGORIES = [
  "Phones",
  "Computers",
  "Audio",
  "Wearables",
  "TVs",
  "Accessories",
];

export function ProductForm({
  action,
  product,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  product?: ProductRow | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(
    action,
    initialActionState,
  );

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      router.push("/dashboard/products");
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message ?? "Something went wrong");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Aurora Phone X"
            defaultValue={product?.name}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            defaultValue={product?.category ?? CATEGORIES[0]}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={product?.price}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            placeholder="0"
            defaultValue={product?.stock}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" placeholder="Graphite" />
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Short product description…"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" asChild>
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
