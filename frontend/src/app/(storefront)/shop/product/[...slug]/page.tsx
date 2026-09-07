import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { api, toProduct } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const id = Number(params.slug[0]);
  if (!id) notFound();

  const apiProduct = await api.getProduct(id).catch(() => null);
  if (!apiProduct) notFound();

  const productData = toProduct(apiProduct);

  const relatedApiProducts = await api
    .getProducts({ status: "active", categoryId: productData.categoryId })
    .catch(() => []);
  const relatedProductData = relatedApiProducts
    .map(toProduct)
    .filter((p) => p.id !== productData.id)
    .slice(0, 4);

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={productData.title} />
        <section className="mb-11">
          <Header data={productData} />
        </section>
        <Tabs />
      </div>
      {relatedProductData.length > 0 && (
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec title="You might also like" data={relatedProductData} />
        </div>
      )}
    </main>
  );
}
