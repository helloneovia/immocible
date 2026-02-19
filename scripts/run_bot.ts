
import { LeboncoinBot } from '../lib/bot/leboncoin-manager';

const AD_DETAILS = {
    title: 'Vends Canapé Rouge',
    description: 'Canapé rouge en très bon état, à venir chercher sur place.',
    price: '150',
    category: 'Ameublement',
    location: 'Paris (75001)'
};

(async () => {
    console.log('🚀 Launching Leboncoin Bot Script...');

    const bot = new LeboncoinBot((msg, type, screenshotTarget, screenshotUrl) => {
        const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${icon} [BOT] ${msg}`);
        if (screenshotUrl) console.log(`   📸 Screenshot: ${screenshotUrl}`);
    });

    try {
        await bot.start();

        // Step 1: Create Account
        // Note: Creating an account every time is suspicious. Maybe valid for 'execute this script'.
        console.log('\n--- Creating Account ---');
        await bot.createAccount();

        // Step 2: Post Ad
        console.log('\n--- Posting Ad ---');
        await bot.postAd(AD_DETAILS);

    } catch (error) {
        console.error('🔥 Fatal Error:', error);
    } finally {
        // Keep open for debugging
        console.log('\n🛑 specific script execution finished. Browser remains open.');
    }
})();
