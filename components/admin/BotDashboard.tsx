'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function BotDashboard({ initialAccounts }: { initialAccounts: any[] }) {
    const [accounts, setAccounts] = useState(initialAccounts)
    const [logs, setLogs] = useState<string[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [urls, setUrls] = useState<{ mail: string, lbc: string }>({ mail: '', lbc: '' })
    const eventSourceRef = useRef<EventSource | null>(null)

    const startBot = () => {
        if (isRunning) return;
        setIsRunning(true);
        setLogs([]);
        setUrls({ mail: '', lbc: '' });

        const eventSource = new EventSource('/api/admin/bot/create-account-stream');
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                // Remove "data: " prefix if standard SSE format, but EventSource usually handles it IF the server sends `data: ...`
                // BUT EventSource.onmessage receives the payload in `event.data`.
                // My server sends: `data: JSON\n\n`.
                // Chrome EventSource splits this correctly.
                const data = JSON.parse(event.data);

                if (data.type === 'log') {
                    setLogs(prev => [...prev, data.message]);

                    if (data.screenshotUrl && data.screenshotTarget) {
                        setUrls(prev => ({
                            ...prev,
                            [data.screenshotTarget]: `${data.screenshotUrl}?t=${Date.now()}`
                        }));
                    }
                } else if (data.type === 'complete') {
                    setLogs(prev => [...prev, "✅ Process Completed."]);
                    setIsRunning(false);
                    eventSource.close();
                    window.location.reload(); // Refresh to see new account
                } else if (data.type === 'error') {
                    setLogs(prev => [...prev, `❌ Error: ${data.message}`]);
                    setIsRunning(false);
                    eventSource.close();
                }
            } catch (e: any) {
                console.error("Parse error", e);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE Error", err);
            // setLogs(prev => [...prev, "⚠️ Connection closed."]);
            setIsRunning(false);
            eventSource.close();
        };
    };

    const stopBot = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        setIsRunning(false);
    };

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
        }
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Users & Ads Creation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <Button onClick={startBot} disabled={isRunning}>
                            {isRunning ? 'Running...' : 'Create Account & Ad'}
                        </Button>
                        {isRunning && <Button variant="destructive" onClick={stopBot}>Stop</Button>}
                    </div>

                    <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm mb-6">
                        {logs.length === 0 ? <p className="text-gray-500">Ready...</p> : logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                        {/* Auto-scroll anchor could be added here */}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Temp Mail Preview</CardTitle></CardHeader>
                <CardContent>
                    {urls.mail ? (
                        <img src={urls.mail} alt="Mail Preview" className="w-full border rounded shadow" />
                    ) : (
                        <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">No Preview</div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Leboncoin Preview</CardTitle></CardHeader>
                <CardContent>
                    {urls.lbc ? (
                        <img src={urls.lbc} alt="LBC Preview" className="w-full border rounded shadow" />
                    ) : (
                        <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">No Preview</div>
                    )}
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
                <CardHeader><CardTitle>Existing Accounts</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Username</th>
                                    <th className="text-left py-2">Email</th>
                                    <th className="text-left py-2">Password</th>
                                    <th className="text-left py-2">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((acc: any) => (
                                    <tr key={acc.id} className="border-b">
                                        <td className="py-2">{acc.username}</td>
                                        <td className="py-2">{acc.email}</td>
                                        <td className="py-2 font-mono text-xs">{acc.password}</td>
                                        <td className="py-2">{new Date(acc.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {accounts.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-500">No accounts yet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
