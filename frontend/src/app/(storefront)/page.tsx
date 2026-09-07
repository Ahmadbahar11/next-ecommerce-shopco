import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { reviewsData } from "@/lib/reviews-data";
import { api, toProduct } from "@/lib/api";

export default async function Home() {
  const apiProducts = await api
    .getProducts({ status: "active" })
    .catch(() => []);
  const products = apiProducts.map(toProduct);

  const newArrivalsData = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);
  const topSellingData = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        <Reviews data={reviewsData} />
      </main>
    </>
  );
}
