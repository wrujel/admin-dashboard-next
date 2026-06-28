import { notFound } from "next/navigation";

import { getProductById } from "@/app/lib/data";
import { updateProduct } from "@/app/actions/product.actions";
import { ProductForm } from "@/app/ui/products/product-form";
import { Panel } from "@/app/ui/widgets/panel";
import { PageHeader } from "@/app/ui/widgets/page-header";

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="space-y-5">
      <PageHeader
        title={product.name}
        description={`${product.category} · ID ${product.id}`}
      />
      <div className="max-w-3xl">
        <Panel title="Edit product">
          <ProductForm action={updateProduct} product={product} />
        </Panel>
      </div>
    </div>
  );
}
