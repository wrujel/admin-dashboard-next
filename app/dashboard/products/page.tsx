import type { Metadata } from "next";

import { getProductsData } from "@/app/lib/data";
import { ProductsTable } from "@/app/ui/products/products-table";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await getProductsData();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description={`${products.length} products in your catalog`}
      />
      <ProductsTable data={products} />
    </div>
  );
}
