import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import SortSelect from "@/components/shop-page/SortSelect";
import ShopPagination from "@/components/shop-page/ShopPagination";
import { FiSliders } from "react-icons/fi";
import ProductCard from "@/components/common/ProductCard";
import { api, toProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categorySlug = first(searchParams.category);
  const brand = first(searchParams.brand);
  const condition = first(searchParams.condition);
  const minPrice = first(searchParams.minPrice);
  const maxPrice = first(searchParams.maxPrice);
  const search = first(searchParams.search);
  const sort = first(searchParams.sort) ?? "most-popular";
  const requestedPage = Math.max(1, Number(first(searchParams.page)) || 1);

  const [categories, allActiveProducts] = await Promise.all([
    api.getCategories().catch(() => []),
    api.getProducts({ status: "active" }).catch(() => []),
  ]);

  const category = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  const apiProducts = await api
    .getProducts({
      status: "active",
      categoryId: category?.id,
      brand,
      condition,
      minPrice,
      maxPrice,
      search,
    })
    .catch(() => []);

  let products = apiProducts.map(toProduct);

  if (sort === "low-price") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "high-price") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else {
    products = [...products].sort((a, b) => b.rating - a.rating);
  }

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const brands = Array.from(
    new Set(allActiveProducts.map((p) => p.brand).filter(Boolean))
  ).sort();

  const filterCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbShop />
        <div className="flex md:space-x-5 items-start">
          <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black text-xl">Filters</span>
              <FiSliders className="text-2xl text-black/40" />
            </div>
            <Filters categories={filterCategories} brands={brands} />
          </div>
          <div className="flex flex-col w-full space-y-5">
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl md:text-[32px] capitalize">
                  {category?.name ?? "Football Gear"}
                </h1>
                <MobileFilters categories={filterCategories} brands={brands} />
              </div>
              <div className="flex flex-col sm:items-center sm:flex-row">
                <span className="text-sm md:text-base text-black/60 mr-3">
                  {total === 0
                    ? "No products found"
                    : `Showing ${rangeStart}-${rangeEnd} of ${total} Products`}
                </span>
                <div className="flex items-center">
                  Sort by: <SortSelect />
                </div>
              </div>
            </div>
            {pageProducts.length > 0 ? (
              <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {pageProducts.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))}
              </div>
            ) : (
              <div className="w-full py-20 text-center text-black/50">
                No products match these filters yet.
              </div>
            )}
            <hr className="border-t-black/10" />
            <ShopPagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        </div>
      </div>
    </main>
  );
}
