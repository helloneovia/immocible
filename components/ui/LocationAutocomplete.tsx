'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LocationAutocompleteProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

interface CityResult {
    properties: {
        label: string
        city: string
        postcode: string
        context: string
    }
}

export function LocationAutocomplete({
    value,
    onChange,
    placeholder = "Rechercher une ville..."
}: LocationAutocompleteProps) {
    const [query, setQuery] = React.useState(value)
    const [results, setResults] = React.useState<CityResult[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query.length > 2 && query !== value) {
                searchCities(query)
            } else if (!query) {
                setResults([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, value])

    // Sync internal state if external value changes (e.g. initial load)
    React.useEffect(() => {
        if (value !== query) {
            setQuery(value)
        }
    }, [value])

    const searchCities = async (search: string) => {
        setLoading(true)
        try {
            const response = await fetch(
                `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(search)}&type=municipality&limit=5`
            )
            const data = await response.json()
            setResults(data.features || [])
            setIsOpen(true)
        } catch (error) {
            console.error('Error fetching cities:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (city: CityResult) => {
        // Format: "CityName (Postcode)" or just "CityName"
        // Using label provided by API is usually best: "Paris" or "Paris 1er Arrondissement"
        const newValue = city.properties.label
        setQuery(newValue)
        onChange(newValue)
        setIsOpen(false)
    }

    return (
        <div className="relative w-full">
            <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        // If user clears input, treat as empty
                        if (e.target.value === '') {
                            onChange('')
                        }
                    }}
                    placeholder={placeholder}
                    className="pl-10 h-12"
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true)
                    }}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {results.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-0"
                            onClick={() => handleSelect(item)}
                        >
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-900">
                                    {item.properties.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {item.properties.context}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    )
}
