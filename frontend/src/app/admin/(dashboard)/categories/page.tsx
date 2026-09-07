"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  api,
  ApiCategory,
  ApiSubCategory,
  CategoryInput,
  SubCategoryInput,
} from "@/lib/api"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const emptyCategoryForm: CategoryInput = { name: "", slug: "", description: "" }
const emptySubCategoryForm: SubCategoryInput = {
  name: "",
  slug: "",
  description: "",
  categoryId: 0,
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"category" | "subcategory">("category")

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryInput>(emptyCategoryForm)

  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [editingSubId, setEditingSubId] = useState<number | null>(null)
  const [subForm, setSubForm] = useState<SubCategoryInput>(emptySubCategoryForm)

  const [saving, setSaving] = useState(false)

  const subCategories = useMemo(
    () =>
      categories.flatMap((c) =>
        c.subCategories.map((s) => ({ ...s, category: { id: c.id, name: c.name, slug: c.slug } }))
      ),
    [categories]
  )

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
      setCategories(await api.getCategories())
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

  // --- Category CRUD ---

  function openCreateCategory() {
    setEditingCategoryId(null)
    setCategoryForm(emptyCategoryForm)
    setCategoryDialogOpen(true)
  }

  function openEditCategory(category: ApiCategory) {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    })
    setCategoryDialogOpen(true)
  }

  async function saveCategory() {
    setSaving(true)
    setError(null)
    try {
      if (editingCategoryId === null) {
        await api.createCategory(categoryForm)
      } else {
        await api.updateCategory(editingCategoryId, categoryForm)
      }
      setCategoryDialogOpen(false)
      await load()
    } catch (err) {
      handleError(err)
    } finally {
      setSaving(false)
    }
  }

  async function removeCategory(id: number) {
    try {
      await api.deleteCategory(id)
      await load()
    } catch (err) {
      handleError(err)
    }
  }

  // --- Subcategory CRUD ---

  function openCreateSubCategory() {
    setEditingSubId(null)
    setSubForm({ ...emptySubCategoryForm, categoryId: categories[0]?.id ?? 0 })
    setSubDialogOpen(true)
  }

  function openEditSubCategory(sub: ApiSubCategory) {
    setEditingSubId(sub.id)
    setSubForm({
      name: sub.name,
      slug: sub.slug,
      description: sub.description ?? "",
      categoryId: sub.categoryId,
    })
    setSubDialogOpen(true)
  }

  async function saveSubCategory() {
    setSaving(true)
    setError(null)
    try {
      if (editingSubId === null) {
        await api.createSubCategory(subForm)
      } else {
        await api.updateSubCategory(editingSubId, subForm)
      }
      setSubDialogOpen(false)
      await load()
    } catch (err) {
      handleError(err)
    } finally {
      setSaving(false)
    }
  }

  async function removeSubCategory(id: number) {
    try {
      await api.deleteSubCategory(id)
      await load()
    } catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Organize products into categories, with optional subcategories."
        action={
          tab === "category" ? (
            <Button onClick={openCreateCategory}>
              <PlusIcon />
              Add Category
            </Button>
          ) : (
            <Button onClick={openCreateSubCategory} disabled={categories.length === 0}>
              <PlusIcon />
              Add Subcategory
            </Button>
          )
        }
      />

      <div className="px-4 lg:px-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as "category" | "subcategory")}>
          <TabsList className="mb-4">
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="subcategory">Sub-category</TabsTrigger>
          </TabsList>
        </Tabs>

        {tab === "category" ? (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">/{category.slug}</TableCell>
                      <TableCell className="max-w-sm truncate text-muted-foreground">
                        {category.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.subCategories.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.productCount}</Badge>
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
                            <DropdownMenuItem onClick={() => openEditCategory(category)}>
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
                                    Delete &quot;{category.name}&quot;?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {category.subCategories.length > 0 || category.productCount > 0
                                      ? "This category still has subcategories or products — move or delete those first."
                                      : "This can't be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeCategory(category.id)}>
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
                {!loading && categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No categories yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Loading subcategories...
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  subCategories.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.name}</TableCell>
                      <TableCell className="text-muted-foreground">/{sub.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{sub.category.name}</TableCell>
                      <TableCell className="max-w-sm truncate text-muted-foreground">
                        {sub.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.productCount ?? 0}</Badge>
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
                            <DropdownMenuItem onClick={() => openEditSubCategory(sub)}>
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
                                    Delete &quot;{sub.name}&quot;?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {(sub.productCount ?? 0) > 0
                                      ? "Products still reference this subcategory — move or delete those first."
                                      : "This can't be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeSubCategory(sub.id)}>
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
                {!loading && subCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No subcategories yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Category dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId === null ? "Add Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategoryId === null
                ? "Create a new top-level category."
                : "Update this category's details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => {
                  const name = e.target.value
                  setCategoryForm((f) => ({ ...f, name, slug: slugify(name) }))
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={categoryForm.slug}
                onChange={(e) =>
                  setCategoryForm((f) => ({ ...f, slug: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                rows={3}
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory} disabled={!categoryForm.name.trim() || saving}>
              {saving ? "Saving..." : editingCategoryId === null ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory dialog */}
      <Dialog open={subDialogOpen} onOpenChange={setSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubId === null ? "Add Subcategory" : "Edit Subcategory"}
            </DialogTitle>
            <DialogDescription>
              {editingSubId === null
                ? "Create a new subcategory under a category."
                : "Update this subcategory's details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="sub-category">Category</Label>
              <Select
                value={String(subForm.categoryId)}
                onValueChange={(value) =>
                  setSubForm((f) => ({ ...f, categoryId: Number(value) }))
                }
              >
                <SelectTrigger id="sub-category">
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
              <Label htmlFor="sub-name">Name</Label>
              <Input
                id="sub-name"
                value={subForm.name}
                onChange={(e) => {
                  const name = e.target.value
                  setSubForm((f) => ({ ...f, name, slug: slugify(name) }))
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-slug">Slug</Label>
              <Input
                id="sub-slug"
                value={subForm.slug}
                onChange={(e) => setSubForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sub-description">Description</Label>
              <Textarea
                id="sub-description"
                rows={3}
                value={subForm.description}
                onChange={(e) =>
                  setSubForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSubCategory} disabled={!subForm.name.trim() || saving}>
              {saving ? "Saving..." : editingSubId === null ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
