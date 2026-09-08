"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { MoreHorizontalIcon, PlusIcon, SearchIcon, UploadCloudIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { api, ApiCategory, ApiLookupOption, ApiProduct, ProductInput } from "@/lib/api"
import { formatPrice } from "@/lib/currency"
import {
  UK_SIZE_OPTIONS,
  formatUkSizeInput,
  getUkSizeMetadata,
  getUkSizeValue,
} from "@/lib/size"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const emptyProduct: ProductInput = {
  title: "",
  slug: "",
  description: "",
  srcUrl: "/images/football/boot.svg",
  gallery: [],
  categoryId: 0,
  subCategoryId: null,
  brand: "",
  condition: "new",
  size: "",
  price: 0,
  discountPercentage: 0,
  stock: 0,
  status: "draft",
  rating: 0,
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [brandOptions, setBrandOptions] = useState<ApiLookupOption[]>([])
  const [conditionOptions, setConditionOptions] = useState<ApiLookupOption[]>([])
  const [statusOptions, setStatusOptions] = useState<ApiLookupOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)
  const sizeMeta = useMemo(() => getUkSizeMetadata(form.size), [form.size])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [productList, categoryList, brandList, conditionList, statusList] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getProductBrands(),
        api.getProductConditions(),
        api.getProductStatuses(),
      ])
      setProducts(productList)
      setCategories(categoryList)
      setBrandOptions(brandList)
      setConditionOptions(conditionList)
      setStatusOptions(statusList)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  function handleError(err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    if (message.includes("401")) {
      router.push("/admin/login")
      return
    }
    setError(message)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  )

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyProduct, categoryId: categories[0]?.id ?? 0 })
    setDialogOpen(true)
  }

  function openEdit(product: ApiProduct) {
    setEditingId(product.id)
    setForm({
      title: product.title,
      slug: product.slug,
      description: product.description ?? "",
      srcUrl: product.srcUrl,
      gallery: product.gallery,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      brand: product.brand,
      condition: product.condition,
      size: product.size,
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      status: product.status,
      rating: product.rating,
    })
    setDialogOpen(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      if (!payload.srcUrl && (payload.gallery ?? []).length > 0) {
        payload.srcUrl = payload.gallery[0]
      }

      if (editingId === null) {
        await api.createProduct(payload)
      } else {
        await api.updateProduct(editingId, payload)
      }
      setDialogOpen(false)
      await load()
    } catch (err) {
      handleError(err)
    } finally {
      setSaving(false)
    }
  }

  async function compressImage(file: File) {
    if (file.type === "image/webp" && file.size < 700 * 1024) return file

    return new Promise<File>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const img = new window.Image()

      img.onload = () => {
        const maxDimension = 1400
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
        const canvas = document.createElement("canvas")
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          URL.revokeObjectURL(objectUrl)
          reject(new Error("Canvas is not supported in this browser."))
          return
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl)
            if (!blob) {
              reject(new Error("Could not compress image."))
              return
            }

            resolve(
              new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now(),
              })
            )
          },
          "image/webp",
          0.82
        )
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Could not read the selected image."))
      }

      img.src = objectUrl
    })
  }

  async function uploadProductGallery(files: FileList | null) {
    if (!files || files.length === 0) return

    setGalleryUploading(true)
    setError(null)

    try {
      const compressedFiles = await Promise.all(
        Array.from(files).map(async (file) => compressImage(file))
      )

      const formData = new FormData()
      compressedFiles.forEach((file) => formData.append("files", file))

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
      const res = await fetch(`${apiBase}/api/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error ?? "Gallery upload failed")
      }

      const uploadedUrls = Array.isArray(data.urls) ? data.urls : [data.url].filter(Boolean)
      setForm((f) => ({
        ...f,
        gallery: [...(f.gallery ?? []), ...uploadedUrls],
        srcUrl: f.srcUrl || uploadedUrls[0] || f.srcUrl,
      }))
    } catch (err) {
      handleError(err)
    } finally {
      setGalleryUploading(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ""
    }
  }

  function removeGalleryImage(index: number) {
    setForm((f) => ({
      ...f,
      gallery: (f.gallery ?? []).filter((_, i) => i !== index),
    }))
  }

  async function remove(id: number) {
    try {
      await api.deleteProduct(id)
      await load()
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog."
        action={
          <Button onClick={openCreate} disabled={categories.length === 0}>
            <PlusIcon />
            Add Product
          </Button>
        }
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
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading products...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={product.gallery?.[0] ?? product.srcUrl}
                            alt={product.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.condition === "new" ? "Brand New" : "Pre-Owned"}
                            {product.size && ` · ${product.size}`}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.brand}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category?.name}
                      {product.subCategory && (
                        <span className="block text-xs">{product.subCategory.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatPrice(product.price)}
                      {product.discountPercentage > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (-{product.discountPercentage}%)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        product.stock
                      ) : (
                        <span className="text-destructive">Out of stock</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active" ? "default" : "outline"
                        }
                      >
                        {product.status}
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
                          <DropdownMenuItem onClick={() => openEdit(product)}>
                            Edit
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
                                  Delete &quot;{product.title}&quot;?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This can&apos;t be undone. This product will
                                  be permanently removed from the catalog.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => remove(product.id)}
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
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId === null ? "Add Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              {editingId === null
                ? "Create a new product in your catalog."
                : "Update this product's details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Name</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((f) => ({ ...f, title, slug: slugify(title) }))
                }}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={String(form.categoryId)}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      categoryId: Number(value),
                      subCategoryId: null,
                    }))
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subcategory">Subcategory (optional)</Label>
                <Select
                  value={form.subCategoryId ? String(form.subCategoryId) : "none"}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      subCategoryId: value === "none" ? null : Number(value),
                    }))
                  }
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories
                      .find((c) => c.id === form.categoryId)
                      ?.subCategories.map((sub) => (
                        <SelectItem key={sub.id} value={String(sub.id)}>
                          {sub.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      status: value as ProductInput["status"],
                    }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.id} value={option.slug}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={form.brand || ""}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, brand: value }))
                  }
                >
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={form.condition}
                  onValueChange={(value) =>
                    setForm((f) => ({
                      ...f,
                      condition: value as ProductInput["condition"],
                    }))
                  }
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.id} value={option.slug}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="size">Size</Label>
                <Select
                  value={getUkSizeValue(form.size)}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, size: formatUkSizeInput(value) }))
                  }
                >
                  <SelectTrigger id="size">
                    <SelectValue placeholder="Select UK size" />
                  </SelectTrigger>
                  <SelectContent>
                    {UK_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size}>
                        {`UK ${size}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sizeMeta.uk && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border px-2 py-1">{sizeMeta.uk}</span>
                    <span className="rounded-full border px-2 py-1">{sizeMeta.us}</span>
                    <span className="rounded-full border px-2 py-1">{sizeMeta.eu}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={form.discountPercentage}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountPercentage: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Gallery images</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryUploading}
                    className="w-fit"
                  >
                    <UploadCloudIcon className="mr-2 size-4" />
                    {galleryUploading ? "Uploading..." : "Upload gallery"}
                  </Button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => uploadProductGallery(e.target.files)}
                  />
                </div>

                {form.gallery?.length ? (
                  <div className="grid grid-cols-4 gap-2">
                    {form.gallery.map((image, index) => (
                      <div key={`${image}-${index}`} className="group relative h-20 w-full overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`Remove gallery image ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No gallery images added yet.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.title.trim() || saving}>
              {saving ? "Saving..." : editingId === null ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
