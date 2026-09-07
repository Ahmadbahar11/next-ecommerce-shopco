"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ShopPaginationProps = {
  totalPages: number;
  currentPage: number;
};

const ShopPagination = ({ totalPages, currentPage }: ShopPaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination className="justify-between">
      <PaginationPrevious
        href={hrefFor(Math.max(1, currentPage - 1))}
        className="border border-black/10"
      />
      <PaginationContent>
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={hrefFor(page)}
              isActive={page === currentPage}
              className="text-black/50 font-medium text-sm"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>
      <PaginationNext
        href={hrefFor(Math.min(totalPages, currentPage + 1))}
        className="border border-black/10"
      />
    </Pagination>
  );
};

export default ShopPagination;
