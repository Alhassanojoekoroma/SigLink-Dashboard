
import { NotificationSettings } from "@/components/notification-settings"

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
                <p className="text-muted-foreground">
                    Manage system configurations and notifications.
                </p>
            </div>

            <NotificationSettings />
        </div>
    )
}
