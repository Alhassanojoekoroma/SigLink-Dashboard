
"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { getNotificationEmails, addNotificationEmail } from "@/lib/data"
import { toast } from "sonner"

interface NotificationEmail {
    id: string
    email: string
    label: string
    active: boolean
}

export function NotificationSettings() {
    const [emails, setEmails] = useState<NotificationEmail[]>([])
    const [newEmail, setNewEmail] = useState("")
    const [newLabel, setNewLabel] = useState("")
    const [loading, setLoading] = useState(false)

    const fetchEmails = async () => {
        const data = await getNotificationEmails()
        if (data) setEmails(data)
    }

    useEffect(() => {
        fetchEmails()
    }, [])

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail || !newLabel) return

        setLoading(true)
        try {
            await addNotificationEmail(newEmail, newLabel)
            toast.success("Email added successfully")
            setNewEmail("")
            setNewLabel("")
            fetchEmails()
        } catch (error) {
            toast.error("Failed to add email")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notification Emails</CardTitle>
                <CardDescription>
                    Add email addresses that should receive alerts (e.g. Admin, Finance, Manager).
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleAddEmail} className="flex gap-4 items-end">
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="label">Role / Label</Label>
                        <Input
                            id="label"
                            placeholder="e.g. Finance Manager"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="manager@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </form>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium">Active Recipient List</h4>
                    {emails.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No emails configured.</p>
                    ) : (
                        <div className="border rounded-lg divide-y">
                            {emails.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-sm text-muted-foreground">{item.email}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/90"
                                        onClick={() => {
                                            // TODO: Implement delete logic in lib/data.ts then call it here
                                            toast.info("Delete functionality coming soon")
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
