'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationControlsProps {
    totalCount: number
    pageSize: number
}

export function PaginationControls({ totalCount, pageSize }: PaginationControlsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page') ?? '1')
    const totalPages = Math.ceil(totalCount / pageSize)

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between py-4">
            <div className="text-sm text-gray-500">
                Affichage de {(page - 1) * pageSize + 1} à {Math.min(page * pageSize, totalCount)} sur {totalCount} résultats
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
