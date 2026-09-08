"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/page-header"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api, ApiLookupOption } from "@/lib/api"

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

type MetadataKind = "brand" | "condition" | "status"

const labels: Record<MetadataKind, string> = {
    brand: "Brands",
    condition: "Conditions",
    status: "Statuses",
}

export default function ProductMetadataPage() {
    const router = useRouter()
    const [kind, setKind] = useState<MetadataKind>("brand")
    const [options, setOptions] = useState<ApiLookupOption[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState({ name: "", slug: "" })

    function handleError(err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong"
        if (message.includes("401")) {
            router.push("/admin/login")
            return
        }
        setError(message)
    }

    async function load(selectedKind = kind) {
        setLoading(true)
        setError(null)
        try {
            const values = selectedKind === "brand"
                ? await api.getProductBrands()
                : selectedKind === "condition"
                    ? await api.getProductConditions()
                    : await api.getProductStatuses()
            setOptions(values)
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kind])

    function openCreate() {
        setEditingId(null)
        setForm({ name: "", slug: "" })
        setDialogOpen(true)
    }

    function openEdit(option: ApiLookupOption) {
        setEditingId(option.id)
        setForm({ name: option.name, slug: option.slug })
        setDialogOpen(true)
    }

    async function save() {
        setSaving(true)
        setError(null)
        try {
            const data = { name: form.name.trim(), slug: form.slug.trim() || slugify(form.name) }
            if (kind === "brand") {
                editingId === null ? await api.createProductBrand(data) : await api.updateProductBrand(editingId, data)
            } else if (kind === "condition") {
                editingId === null ? await api.createProductCondition(data) : await api.updateProductCondition(editingId, data)
            } else {
                editingId === null ? await api.createProductStatus(data) : await api.updateProductStatus(editingId, data)
            }
            setDialogOpen(false)
            await load()
        } catch (err) {
            handleError(err)
        } finally {
            setSaving(false)
        }
    }

    async function remove(id: number) {
        setError(null)
        try {
            if (kind === "brand") await api.deleteProductBrand(id)
            else if (kind === "condition") await api.deleteProductCondition(id)
            else await api.deleteProductStatus(id)
            await load()
        } catch (err) {
            handleError(err)
        }
    }

    return (
        <>
            <AdminPageHeader
                title="Product Metadata"
                description="Manage the brand, condition, and status options used by products."
                action={
                    <Button onClick={openCreate}>
                        <PlusIcon />
                        Add {kind}
                    </Button>
                }
            />

            <div className="px-4 lg:px-6">
                {error && (
                    <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                    </p>
                )}

                <Tabs value={kind} onValueChange={(value) => setKind(value as MetadataKind)}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="brand">Brands</TabsTrigger>
                        <TabsTrigger value="condition">Conditions</TabsTrigger>
                        <TabsTrigger value="status">Statuses</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products using option</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Loading {labels[kind].toLowerCase()}...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && options.map((option) => (
                                <TableRow key={option.id}>
                                    <TableCell className="font-medium">{option.name}</TableCell>
                                    <TableCell className="text-muted-foreground">/{option.slug}</TableCell>
                                    <TableCell><Badge variant="outline">{option.productCount ?? 0}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontalIcon />
                                                    <span className="sr-only">Open menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(option)}>Edit</DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            onSelect={(event) => event.preventDefault()}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete &quot;{option.name}&quot;?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {option.productCount
                                                                    ? `${option.productCount} product(s) still use this option. Reassign them before deleting.`
                                                                    : "This cannot be undone."}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => remove(option.id)} disabled={Boolean(option.productCount)}>
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
                            {!loading && options.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No {labels[kind].toLowerCase()} yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId === null ? `Add ${kind}` : `Edit ${kind}`}</DialogTitle>
                        <DialogDescription>
                            This option will appear in the product editor dropdown.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="metadata-name">Name</Label>
                            <Input
                                id="metadata-name"
                                value={form.name}
                                onChange={(event) => {
                                    const name = event.target.value
                                    setForm((current) => ({ ...current, name, slug: slugify(name) }))
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="metadata-slug">Slug</Label>
                            <Input
                                id="metadata-slug"
                                value={form.slug}
                                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={save} disabled={!form.name.trim() || saving}>
                            {saving ? "Saving..." : editingId === null ? "Create" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
