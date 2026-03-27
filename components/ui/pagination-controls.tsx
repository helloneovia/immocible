'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE_OPTIONS = [50, 100, 200, 500]

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

    const handleLimitChange = (newLimit: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('limit', newLimit.toString())
        params.set('page', '1')
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                    {totalPages > 0
                        ? `Affichage de ${(page - 1) * pageSize + 1} à ${Math.min(page * pageSize, totalCount)} sur ${totalCount} résultats`
                        : `0 résultats`}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">
                    Résultats par page :
                    <select
                        value={pageSize}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="ml-1 border border-gray-200 rounded-md text-sm px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </span>
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
