"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/hooks/redux";
import { clearCart } from "@/lib/features/carts/cartsSlice";
import { api, ApiOrder } from "@/lib/api";
import { TbBasketExclamation } from "react-icons/tb";
import { FaArrowRight } from "react-icons/fa6";

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const { cart, adjustedTotalPrice } = useAppSelector((state: RootState) => state.carts);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const order = await api.createOrder({
        customer: { name, email, phone: phone || undefined },
        shipping: { address, city, phone: phone || undefined },
        items: cart.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
      dispatch(clearCart());
      setPlacedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0 flex flex-col items-center text-center mt-20">
          <h1
            className={cn([integralCF.className, "text-3xl md:text-4xl mb-4"])}
          >
            Order placed!
          </h1>
          <p className="text-black/60 mb-2">
            Thanks, {placedOrder.customer.name}. Your order{" "}
            <span className="font-bold text-black">{placedOrder.orderNumber}</span>{" "}
            has been received.
          </p>
          <p className="text-black/60 mb-8">
            Total: <span className="font-bold text-black">{formatPrice(placedOrder.total)}</span>
          </p>
          <Button asChild className="rounded-full">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0 flex items-center flex-col text-gray-300 mt-32">
          <TbBasketExclamation strokeWidth={1} className="text-6xl" />
          <span className="block mb-4 text-gray-500">Your cart is empty.</span>
          <Button className="rounded-full w-24" asChild>
            <Link href="/shop">Shop</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <Breadcrumb className="mb-5 sm:mb-9">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/cart">Cart</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h2
          className={cn([
            integralCF.className,
            "font-bold text-[32px] md:text-[40px] text-black uppercase mb-5 md:mb-6",
          ])}
        >
          checkout
        </h2>

        <form
          onSubmit={onSubmit}
          className="flex flex-col lg:flex-row space-y-5 lg:space-y-0 lg:space-x-5 items-start"
        >
          <div className="w-full p-5 md:px-6 flex-col space-y-4 rounded-[20px] border border-black/10">
            <h3 className="text-xl font-bold text-black">Shipping details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="w-full lg:max-w-[505px] p-5 md:px-6 flex-col space-y-4 md:space-y-6 rounded-[20px] border border-black/10">
            <h3 className="text-xl md:text-2xl font-bold text-black">Order Summary</h3>
            <div className="flex flex-col space-y-3">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>
                    {item.name} <span className="text-black/50">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="border-t-black/10" />
            <div className="flex items-center justify-between">
              <span className="md:text-xl text-black">Total</span>
              <span className="text-xl md:text-2xl font-bold">
                {formatPrice(adjustedTotalPrice)}
              </span>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="text-sm md:text-base font-medium bg-black rounded-full w-full py-4 h-[54px] md:h-[60px] group"
            >
              {submitting ? "Placing order..." : "Place Order"}{" "}
              {!submitting && (
                <FaArrowRight className="text-xl ml-2 group-hover:translate-x-1 transition-all" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
