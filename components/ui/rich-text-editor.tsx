'use client'

import React, { useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { Button } from '@/components/ui/button'

// Dynamic import to avoid SSR issues with Quills
// Dynamic import to avoid SSR issues with Quills
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false }) as any;

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null)

    const insertTemplate = (placeholder: string) => {
        // Access standard Quill API
        const editor = quillRef.current?.getEditor()
        if (editor) {
            const range = editor.getSelection(true) // focus = true
            if (range) {
                editor.insertText(range.index, placeholder)
                editor.setSelection(range.index + placeholder.length)
            } else {
                // If no selection, append to end
                const length = editor.getLength()
                editor.insertText(length - 1, placeholder)
            }
        }
    }

    const modules = useMemo(() => ({
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean']
        ]
    }), [])

    return (
        <div className="space-y-2 rich-text-container">
            <style jsx global>{`
                .rich-text-container .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    border-color: #E2E8F0;
                    min-height: 200px;
                    font-size: 1rem;
                }
                .rich-text-container .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    border-color: #E2E8F0;
                    background-color: #F8FAFC;
                }
            `}</style>

            <div className="flex flex-wrap gap-2 pb-2 items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Insérer :</span>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => insertTemplate('{{name}}')} type="button">Nom</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => insertTemplate('{{agency_name}}')} type="button">Nom Agence</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => insertTemplate('{{email}}')} type="button">Email</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => insertTemplate('{{plan}}')} type="button">Plan</Button>
            </div>

            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                modules={modules}
            />
        </div>
    )
}
