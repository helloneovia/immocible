import { NextRequest, NextResponse } from 'next/server';
import { LeboncoinBot } from '@/lib/bot/leboncoin-manager';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                const bot = new LeboncoinBot((message, type = 'info', screenshotTarget, screenshotUrl) => {
                    sendEvent({
                        type: 'log',
                        message: `[${type?.toUpperCase() || 'INFO'}] ${message}`,
                        screenshotTarget: screenshotTarget,
                        screenshotUrl: screenshotUrl
                    });
                });

                await bot.start();
                await bot.createAccount();
                // await bot.close(); // Keeping open as requested

                sendEvent({ type: 'complete', message: 'Process finished' });
                controller.close();
            } catch (error: any) {
                sendEvent({ type: 'error', message: error.message });
                try { controller.close(); } catch (e) { }
            }
        },
    });

    return new NextResponse(customReadable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
