"use client"

import { useMemo, useState } from "react"
import { MoreHorizontalIcon, StarIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockReviews } from "@/lib/admin/mock-data"
import { AdminReview } from "@/lib/admin/types"
import { cn } from "@/lib/utils"

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>(mockReviews)

  const stats = useMemo(() => {
    const total = reviews.length
    const average = total
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }))
    return { total, average, breakdown }
  }, [reviews])

  function toggleStatus(id: number) {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "published" ? "hidden" : "published" }
          : r
      )
    )
  }

  function remove(id: number) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Moderate customer reviews shown on product pages."
      />

      <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        <Card>
          <CardHeader>
            <CardDescription>Average rating</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.average.toFixed(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Stars rating={Math.round(stats.average)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total reviews</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {stats.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {reviews.filter((r) => r.status === "published").length}{" "}
              published,{" "}
              {reviews.filter((r) => r.status === "hidden").length} hidden
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardDescription>Rating breakdown</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-1.5">
            {stats.breakdown.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{star}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{
                      width: stats.total
                        ? `${(count / stats.total) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="w-4 text-muted-foreground">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.user}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {review.product}
                  </TableCell>
                  <TableCell>
                    <Stars rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {review.content}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {review.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        review.status === "published" ? "default" : "outline"
                      }
                    >
                      {review.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toggleStatus(review.id)}
                        >
                          {review.status === "published" ? "Hide" : "Publish"}
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete this review?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This can&apos;t be undone. The review by{" "}
                                {review.user} will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => remove(review.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
