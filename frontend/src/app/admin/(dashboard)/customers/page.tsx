"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api, ApiCustomer } from "@/lib/api"
import { formatPrice } from "@/lib/currency"

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<ApiCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<ApiCustomer | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<ApiCustomer | null>(null)

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
      setCustomers(await api.getCustomers())
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

  useEffect(() => {
    if (!selected) {
      setSelectedDetail(null)
      return
    }
    api
      .getCustomer(selected.id)
      .then(setSelectedDetail)
      .catch(handleError)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      ),
    [customers, search]
  )

  async function toggleBlocked(customer: ApiCustomer) {
    try {
      const updated = await api.updateCustomer(customer.id, {
        status: customer.status === "active" ? "blocked" : "active",
      })
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, ...updated } : c))
      )
    } catch (err) {
      handleError(err)
    }
  }

  async function remove(id: number) {
    try {
      await api.deleteCustomer(id)
      setCustomers((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description="Everyone who has an account or has ordered from your store."
      />

      <div className="px-4 lg:px-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="relative mb-4 max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading customers...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <button
                        className="flex items-center gap-3 text-left"
                        onClick={() => setSelected(customer)}
                      >
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {initials(customer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {customer.email}
                          </div>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell>{customer.ordersCount ?? 0}</TableCell>
                    <TableCell>{formatPrice(customer.totalSpent ?? 0)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "active" ? "default" : "outline"
                        }
                      >
                        {customer.status}
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
                          <DropdownMenuItem onClick={() => setSelected(customer)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleBlocked(customer)}
                          >
                            {customer.status === "active"
                              ? "Block customer"
                              : "Unblock customer"}
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
                                  Delete {customer.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This can&apos;t be undone. Customers with
                                  existing orders can&apos;t be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => remove(customer.id)}
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
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No customers found.
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
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.email}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-6 px-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Orders</p>
                    <p className="font-medium">{selected.ordersCount ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total spent</p>
                    <p className="font-medium">
                      {formatPrice(selected.totalSpent ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-medium">{formatDate(selected.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">
                      {selected.status}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Order history</p>
                  <div className="flex flex-col gap-2">
                    {(!selectedDetail || selectedDetail.orders?.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        {selectedDetail ? "No orders on record." : "Loading..."}
                      </p>
                    )}
                    {selectedDetail?.orders?.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="font-medium">
                            {order.orderNumber}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            · {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{formatPrice(order.total)}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
