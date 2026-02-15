"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Mail, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface NotificationEmail {
    email: string
    label: string
}

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [emails, setEmails] = useState<NotificationEmail[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newEmail, setNewEmail] = useState("")
    const [newLabel, setNewLabel] = useState("")

    const fetchEmails = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/settings/notifications")
            const data = await res.json()
            setEmails(data)
        } catch (err) {
            toast.error("Failed to load notification emails")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchEmails()
        }
    }, [open])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail || !newLabel) return

        setIsAdding(true)
        try {
            const res = await fetch("/api/settings/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail, label: newLabel }),
            })
            if (res.ok) {
                toast.success("Recipient added successfully")
                setNewEmail("")
                setNewLabel("")
                fetchEmails()
            } else {
                toast.error("Failed to add recipient")
            }
        } catch (err) {
            toast.error("Error adding recipient")
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (email: string) => {
        try {
            const res = await fetch(`/api/settings/notifications?email=${encodeURIComponent(email)}`, {
                method: "DELETE",
            })
            if (res.ok) {
                toast.success("Recipient removed")
                fetchEmails()
            } else {
                toast.error("Failed to remove recipient")
            }
        } catch (err) {
            toast.error("Error removing recipient")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md gap-6 rounded-[28px] border-none bg-card p-8 shadow-2xl backdrop-blur-xl">
                <DialogHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">System Settings</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Manage who receives payment confirmations and system alerts.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="label" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role / Label</Label>
                                <Input
                                    id="label"
                                    placeholder="e.g. Finance Lead"
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    className="h-11 rounded-xl border-border bg-muted/30 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="manager@siglink.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="h-11 rounded-xl border-border bg-muted/30 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={isAdding || !newEmail || !newLabel}
                            className="w-full h-11 gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90"
                        >
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Add Admin Recipient
                        </Button>
                    </form>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Recipients</h4>
                        <div className="max-h-[240px] space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
                                </div>
                            ) : emails.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                                    <Mail className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
                                    <p className="text-xs text-muted-foreground">No recipients configured yet.</p>
                                </div>
                            ) : (
                                emails.map((item) => (
                                    <div key={item.email} className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-card-foreground">{item.label}</p>
                                            <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(item.email)}
                                            className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
