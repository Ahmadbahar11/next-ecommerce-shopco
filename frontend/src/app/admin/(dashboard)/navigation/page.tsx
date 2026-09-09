"use client"

import { useId, useState } from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  GripVerticalIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"

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
import { mockNavLinks } from "@/lib/admin/mock-data"
import { NavLink, NavLinkChild } from "@/lib/admin/types"

const emptyLink: Omit<NavLink, "id"> = {
  label: "",
  url: "",
  children: [],
}

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 cursor-grab text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function SortableRow({
  link,
  onEdit,
  onDelete,
}: {
  link: NavLink
  onEdit: () => void
  onDelete: () => void
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: link.id,
  })

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <TableCell className="w-10">
        <DragHandle id={link.id} />
      </TableCell>
      <TableCell className="font-medium">{link.label}</TableCell>
      <TableCell className="text-muted-foreground">{link.url}</TableCell>
      <TableCell>
        {link.children.length > 0 ? (
          <Badge variant="outline">{link.children.length} sub-links</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
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
                    Remove &quot;{link.label}&quot; from the navbar?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This link and its sub-links will no longer appear in the
                    storefront navigation.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default function NavigationPage() {
  const id = useId()
  const [links, setLinks] = useState<NavLink[]>(mockNavLinks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<NavLink, "id">>(emptyLink)

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((prev) => {
        const oldIndex = prev.findIndex((l) => l.id === active.id)
        const newIndex = prev.findIndex((l) => l.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyLink)
    setDialogOpen(true)
  }

  function openEdit(link: NavLink) {
    setEditingId(link.id)
    setForm({ label: link.label, url: link.url, children: link.children })
    setDialogOpen(true)
  }

  function save() {
    if (editingId === null) {
      const nextId = Math.max(0, ...links.map((l) => l.id)) + 1
      setLinks((prev) => [...prev, { id: nextId, ...form }])
    } else {
      setLinks((prev) =>
        prev.map((l) => (l.id === editingId ? { id: editingId, ...form } : l))
      )
    }
    setDialogOpen(false)
    toast.success(editingId === null ? "Navigation link added" : "Navigation link updated")
  }

  function remove(linkId: number) {
    setLinks((prev) => prev.filter((l) => l.id !== linkId))
    toast.success("Navigation link removed")
  }

  function addChild() {
    const nextId =
      Math.max(0, ...form.children.map((c) => c.id), ...links.flatMap((l) => l.children.map((c) => c.id))) + 1
    setForm((f) => ({
      ...f,
      children: [...f.children, { id: nextId, label: "", url: "" }],
    }))
  }

  function updateChild(childId: number, patch: Partial<NavLinkChild>) {
    setForm((f) => ({
      ...f,
      children: f.children.map((c) =>
        c.id === childId ? { ...c, ...patch } : c
      ),
    }))
  }

  function removeChild(childId: number) {
    setForm((f) => ({
      ...f,
      children: f.children.filter((c) => c.id !== childId),
    }))
  }

  return (
    <>
      <AdminPageHeader
        title="Navigation Menu"
        description="Manage the links shown in the storefront navbar. Drag to reorder."
        action={
          <Button onClick={openCreate}>
            <PlusIcon />
            Add Link
          </Button>
        }
      />

      <div className="px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={id}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Label</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Sub-links</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={links.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {links.map((link) => (
                    <SortableRow
                      key={link.id}
                      link={link}
                      onEdit={() => openEdit(link)}
                      onDelete={() => remove(link.id)}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId === null ? "Add Link" : "Edit Link"}
            </DialogTitle>
            <DialogDescription>
              Top-level navbar link, with optional dropdown sub-links.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={form.label}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, label: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Sub-links</Label>
                <Button variant="outline" size="sm" onClick={addChild}>
                  <PlusIcon />
                  Add sub-link
                </Button>
              </div>
              {form.children.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No sub-links. This will render as a plain link.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {form.children.map((child) => (
                  <div key={child.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Label"
                      value={child.label}
                      onChange={(e) =>
                        updateChild(child.id, { label: e.target.value })
                      }
                    />
                    <Input
                      placeholder="URL"
                      value={child.url}
                      onChange={(e) =>
                        updateChild(child.id, { url: e.target.value })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeChild(child.id)}
                    >
                      <TrashIcon className="size-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!form.label.trim()}>
              {editingId === null ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
