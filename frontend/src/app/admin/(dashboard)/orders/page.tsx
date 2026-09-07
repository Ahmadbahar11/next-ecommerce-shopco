"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api, ApiOrder, OrderStatus } from "@/lib/api"
import { formatPrice } from "@/lib/currency"

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [selected, setSelected] = useState<ApiOrder | null>(null)

  function handleError(err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    if (message.includes("401")) {
      router.push("/admin/login")
      return
    }
    setError(message)
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setOrders(await api.getOrders())
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter
        const q = search.toLowerCase()
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(q) ||
          order.customer.name.toLowerCase().includes(q) ||
          order.customer.email.toLowerCase().includes(q)
        return matchesStatus && matchesSearch
      }),
    [orders, search, statusFilter]
  )

  async function updateStatus(id: number, status: OrderStatus) {
    try {
      const updated = await api.updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
      setSelected((prev) => (prev && prev.id === id ? updated : prev))
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Track and manage customer orders."
      />

      <div className="px-4 lg:px-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}
          >
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative max-w-sm sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search order # or customer..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading orders...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.items.reduce((n, i) => n + i.quantity, 0)}
                    </TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(order)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.orderNumber}</SheetTitle>
                <SheetDescription>
                  Placed on {formatDate(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-6 px-4">
                <div>
                  <p className="mb-1 text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.customer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selected.customer.email}
                  </p>
                  {selected.customer.phone && (
                    <p className="text-sm text-muted-foreground">
                      {selected.customer.phone}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium">Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    {selected.shippingAddress}, {selected.shippingCity}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Items</p>
                  <div className="flex flex-col gap-2">
                    {selected.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {item.productTitle}{" "}
                          <span className="text-muted-foreground">
                            x{item.quantity}
                          </span>
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm font-medium">
                    <span>Total</span>
                    <span>{formatPrice(selected.total)}</span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Status</p>
                  <Select
                    value={selected.status}
                    onValueChange={(value) =>
                      updateStatus(selected.id, value as OrderStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
