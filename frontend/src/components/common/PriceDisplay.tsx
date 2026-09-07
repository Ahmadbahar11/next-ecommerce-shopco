import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { Discount } from "@/types/product.types";

export default function PriceDisplay({
  price,
  discount,
  size = "card",
}: {
  price: number;
  discount: Discount;
  size?: "card" | "detail";
}) {
  const priceClass =
    size === "detail" ? "text-2xl sm:text-[32px]" : "text-xl xl:text-2xl";
  const badgeClass = size === "detail" ? "text-[10px] sm:text-xs" : "text-[10px] xl:text-xs";

  const finalPrice =
    discount.percentage > 0
      ? Math.round(price - (price * discount.percentage) / 100)
      : discount.amount > 0
        ? price - discount.amount
        : price;

  const hasDiscount = discount.percentage > 0 || discount.amount > 0;

  return (
    <div className="flex items-center space-x-[5px] xl:space-x-2.5">
      <span className={cn("font-bold text-black", priceClass)}>
        {formatPrice(finalPrice)}
      </span>
      {hasDiscount && (
        <span className={cn("font-bold text-black/40 line-through", priceClass)}>
          {formatPrice(price)}
        </span>
      )}
      {discount.percentage > 0 ? (
        <span
          className={cn(
            "font-medium py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]",
            badgeClass
          )}
        >
          -{discount.percentage}%
        </span>
      ) : (
        discount.amount > 0 && (
          <span
            className={cn(
              "font-medium py-1.5 px-3.5 rounded-full bg-[#FF3333]/10 text-[#FF3333]",
              badgeClass
            )}
          >
            -{formatPrice(discount.amount)}
          </span>
        )
      )}
    </div>
  );
}
