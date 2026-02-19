const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const CONFIG = {
    // Account details
    username: 'MonPseudo123',
    email: 'monemail@example.com',
    password: 'Password123!',

    // Ad details
    ad: {
        title: 'Vends Canapé Rouge',
        category: 'Ameublement', // You'll need to map this to actual selectors or handling
        description: 'Canapé rouge en très bon état, à venir chercher sur place.',
        price: '150',
        location: 'Paris (75001)'
    }
};

(async () => {
    console.log('🚀 Starting Leboncoin Bot...');

    const browser = await puppeteer.launch({
        headless: false, // Important: Run in non-headless mode to see what's happening and handle CAPTCHAs
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // 1. Navigation to Home
    console.log('🌐 Navigating to Leboncoin...');
    await page.goto('https://www.leboncoin.fr/', { waitUntil: 'networkidle2' });

    // Handle Cookie Consent (Tout accepter)
    try {
        const cookieBtn = await page.waitForSelector('#didomi-notice-agree-button', { timeout: 5000 });
        if (cookieBtn) {
            await cookieBtn.click();
            console.log('🍪 Cookies accepted.');
            await new Promise(r => setTimeout(r, 1000)); // plain wait
        }
    } catch (e) {
        console.log('ℹ️ No cookie banner found or already accepted.');
    }

    // 2. Create Account
    console.log('👤 Navigating to Create Account...');
    // Note: Selectors on Leboncoin change frequently. These are approximations.
    // Click "Se connecter"
    // Usually an icon or text.
    // We can try navigating directly to the signup page if known, but flows change.
    // Let's try direct URL for signup if possible, or find the button.

    // Navigate directly to signup to save time/complexity
    await page.goto('https://www.leboncoin.fr/compte/creer', { waitUntil: 'networkidle2' });

    console.log('✍️ Filling account details...');

    // Need to identify selectors. As I cannot see the page, I will use common attributes used by LBC or generic strategies.
    // IMPORTANT: The user might need to inspect elements and update selectors if they have changed.

    try {
        // Select "Particulier" usually default
        // Email
        await page.waitForSelector('input[name="email"], input[type="email"]');
        await page.type('input[name="email"], input[type="email"]', CONFIG.email, { delay: 100 });

        // Password
        await page.type('input[name="password"], input[type="password"]', CONFIG.password, { delay: 100 });

        // Submit button (initially just email/password often)
        // There might be a "Continuer" or "S'inscrire" button.
        // Looking for a button with type="submit"
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
        }

        console.log('⏳ Waiting for manual verification or next steps...');
        console.log('👉 ACTION REQUIRED: Please manually complete the captcha or email verification in the browser window.');
        console.log('   Once you are logged in and ready to post, press "Enter" in this terminal to continue.');

        // Resume after manual intervention
        await new Promise(resolve => process.stdin.once('data', resolve));

    } catch (error) {
        console.error('❌ Error during account creation step:', error.message);
    }

    // 3. Post Ad
    console.log('📢 Navigating to Post Ad...');
    await page.goto('https://www.leboncoin.fr/deposer-une-annonce', { waitUntil: 'networkidle2' });

    try {
        // Title
        await page.waitForSelector('input[name="subject"]', { timeout: 10000 });
        await page.type('input[name="subject"]', CONFIG.ad.title, { delay: 50 });

        // Category - This is complex as it's often a modal or dropdown
        console.log('👉 ACTION REQUIRED: Please manually select the Category if the script fails to find it.');
        // Attempting to simply click the category input if it exists
        // await page.click('...'); 

        // Description
        await page.waitForSelector('textarea[name="body"]');
        await page.type('textarea[name="body"]', CONFIG.ad.description, { delay: 50 });

        // Price
        await page.waitForSelector('input[name="price"]');
        await page.type('input[name="price"]', CONFIG.ad.price, { delay: 50 });

        // Location
        // Address input needs typing and selecting from dropdown
        await page.waitForSelector('input[name="location_input"]'); // hypothesized selector
        await page.type('input[name="location_input"]', CONFIG.ad.location, { delay: 100 });
        await new Promise(r => setTimeout(r, 2000)); // wait for autocomplete
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        console.log('✅ Ad details filled (partial). Please review and submit manually.');

    } catch (error) {
        console.error('❌ Error filling ad details. Selectors might have changed.', error.message);
    }

    console.log('🎉 Script finished. Browser will remain open for you to verify.');
    // browser.close(); // Don't close so user can see/finish
})();
