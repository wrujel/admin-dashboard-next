import type { Metadata } from "next";

import { createProduct } from "@/app/actions/product.actions";
import { ProductForm } from "@/app/ui/products/product-form";
import { Panel } from "@/app/ui/widgets/panel";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Add product" };

export default function AddProductPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Add product"
        description="Create a new product in your catalog"
      />
      <div className="max-w-3xl">
        <Panel title="Product details">
          <ProductForm action={createProduct} />
        </Panel>
      </div>
    </div>
  );
}
