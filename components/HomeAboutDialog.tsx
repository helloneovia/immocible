'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRight } from "lucide-react"

interface HomeAboutDialogProps {
    content: string
}

export function HomeAboutDialog({ content }: HomeAboutDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center text-left">
                    {/* This span makes the parent clickable if parent has relative class */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    En savoir plus <ArrowRight className="inline h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent pb-2 border-b">
                        À propos d&apos;IMMOCIBLE
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {content}
                </div>
            </DialogContent>
        </Dialog>
    )
}
