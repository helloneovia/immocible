import { NextRequest, NextResponse } from 'next/server';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ⚠️ IMPORTANT : on force l'import dynamique avec un chemin string brut
// pour empêcher Next de l'analyser au build
const getLeboncoinBot = async () => {
    const mod = await import('../../../../../lib/bot/leboncoin-manager');
    return mod.LeboncoinBot;
};

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    const customReadable = new ReadableStream({
        async start(controller) {
            const sendEvent = (data: any) => {
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                );
            };

            try {
                // Import dynamique ICI (au runtime uniquement)
                const LeboncoinBot = await getLeboncoinBot();

                const bot = new LeboncoinBot(
                    (message: string, type: string = "info", screenshotTarget?: string, screenshotUrl?: string) => {
                        sendEvent({
                            type: "log",
                            message: `[${type?.toUpperCase() || "INFO"}] ${message}`,
                            screenshotTarget,
                            screenshotUrl,
                        });
                    }
                );

                await bot.start();
                await bot.createAccount();
                // await bot.close(); // si besoin plus tard

                sendEvent({ type: "complete", message: "Process finished" });
                controller.close();

            } catch (error: any) {
                sendEvent({ type: "error", message: error?.message || "Unknown error" });
                try { controller.close(); } catch (_) { }
            }
        },
    });

    return new NextResponse(customReadable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}