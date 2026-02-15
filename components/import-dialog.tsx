
"use client"

import { useState, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import type { Subscription } from "@/lib/data"

interface ImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImported: () => void
}

export function ImportDialog({ open, onOpenChange, onImported }: ImportDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const processData = async (results: any[]) => {
        setLoading(true)
        setProgress({ current: 0, total: results.length })

        let successCount = 0
        let failCount = 0

        for (let i = 0; i < results.length; i++) {
            const row = results[i]

            // Map common column names to our schema
            const mappedData = {
                organization_name: row.Organization || row.organization_name || row.Company || "",
                station_nickname: row.Station || row.station_nickname || "",
                service_location: row.Location || row.service_location || row.Address || "",
                customer_name: row.Customer || row.customer_name || row.Contact || "",
                email: row.Email || row.email || "",
                phone_number: row.Phone || row.phone_number || "",
                package_name: row.Package || row.package_name || "Residential",
                amount_paid: Number(row.Amount || row.amount_paid || 0),
                start_date: row.StartDate || row.start_date || new Date().toISOString(),
                end_date: row.EndDate || row.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: row.Status || row.status || "Active",
                customer_type: (row.Type || row.customer_type || "individual").toString().toLowerCase(),
            }

            if (!mappedData.organization_name || !mappedData.service_location) {
                failCount++
                continue
            }

            try {
                const res = await fetch("/api/subscriptions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(mappedData),
                })
                if (!res.ok) throw new Error("Failed to insert")
                successCount++
            } catch (err) {
                failCount++
            }

            setProgress({ current: i + 1, total: results.length })
        }

        setLoading(false)
        setProgress(null)
        setFile(null)
        toast.success(`Import complete: ${successCount} successful, ${failCount} failed.`)
        onImported()
        onOpenChange(false)
    }

    const handleImport = () => {
        if (!file) return

        const reader = new FileReader()
        const extension = file.name.split('.').pop()?.toLowerCase()

        if (extension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results: Papa.ParseResult<any>) => {
                    processData(results.data)
                },
            })
        } else if (extension === 'xlsx' || extension === 'xls') {
            reader.onload = (e) => {
                const data = e.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const json = XLSX.utils.sheet_to_json(worksheet)
                processData(json)
            }
            reader.readAsBinaryString(file)
        } else {
            toast.error("Unsupported file format. Use CSV or Excel.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        Import Subscriptions
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors border-muted-foreground/20"
                    >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileUp className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold">{file ? file.name : "Click to upload file"}</p>
                            <p className="text-xs text-muted-foreground mt-1">Excel (.xlsx) or CSV supported</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv, .xlsx, .xls"
                        />
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-3 border">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" />
                            Formatting Requirements
                        </h4>
                        <ul className="text-xs space-y-1.5 text-muted-foreground list-disc pl-4">
                            <li>Headers should include: <code className="text-primary font-bold">Organization, Location, Contact, Email, Phone, Amount, Status</code></li>
                            <li>Dates should be in YYYY-MM-DD format (optional)</li>
                            <li>Missing fields will use defaults.</li>
                        </ul>
                    </div>

                    {loading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Importing data...</span>
                                <span>{progress ? `${Math.round((progress.current / progress.total) * 100)}%` : ""}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: progress ? `${(progress.current / progress.total) * 100}%` : "0%" }}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">Please do not close this dialog</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {loading ? "Processing..." : "Start Import"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
