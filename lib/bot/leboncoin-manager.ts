


import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

// Use Stealth Plugin
puppeteer.use(StealthPlugin());

// Configuration
const SCREENSHOT_DIR = path.join(process.cwd(), 'public', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// User Agent Rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15'
];

type LogType = 'info' | 'error' | 'success';

interface LogCallback {
    (message: string, type?: LogType, screenshotTarget?: 'mail' | 'lbc', screenshotUrl?: string): void;
}

export class LeboncoinBot {
    private browser: any;
    private mailPage: any;
    private lbcPage: any;
    private log: LogCallback;

    constructor(logCallback: LogCallback) {
        this.log = logCallback;
    }

    private async randomDelay(min: number = 500, max: number = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(r => setTimeout(r, delay));
    }

    private async humanType(page: any, selector: string, text: string) {
        try {
            await page.waitForSelector(selector, { timeout: 5000 });

            // Randomly click 1-3 times to focus (simulate user selecting field)
            const clicks = Math.floor(Math.random() * 2) + 1;
            await page.click(selector, { clickCount: clicks });

            // Clear existing text if needed
            await page.keyboard.down('Meta'); // Ctrl/Cmd
            await page.keyboard.press('a');
            await page.keyboard.up('Meta');
            await page.keyboard.press('Backspace');

            for (const char of text) {
                await page.keyboard.type(char, { delay: Math.floor(Math.random() * 100) + 50 }); // 50-150ms delay per char
                if (Math.random() < 0.1) await this.randomDelay(100, 400); // Occasional pause
            }
            await this.randomDelay(300, 800); // Pause after typing
        } catch (e) {
            this.log(`⚠️ Could not human-type into ${selector}`, 'error');
        }
    }

    private async realisticInteraction(page: any) {
        // Random mouse movements
        try {
            const viewport = page.viewport();
            if (viewport) {
                const x = Math.floor(Math.random() * viewport.width);
                const y = Math.floor(Math.random() * viewport.height);
                await page.mouse.move(x, y, { steps: 10 });
            }
            // Occasional scroll
            if (Math.random() > 0.5) {
                await page.evaluate(() => window.scrollBy(0, Math.floor(Math.random() * 300)));
            }
            await this.randomDelay(500, 1500);
        } catch (e) { }
    }

    async start() {
        this.log('🚀 Starting browser with Stealth Mode...', 'info');

        // Randomize Window Size slightly
        const width = 1920 + Math.floor(Math.random() * 100) - 50; // 1870-1970
        const height = 1080 + Math.floor(Math.random() * 100) - 50; // 1030-1130

        // Launch puppeteer-extra
        this.browser = await puppeteer.launch({
            headless: false, // Run visible for local testing
            ignoreDefaultArgs: ['--enable-automation'], // Hide "Chrome is being controlled..."
            args: [
                '--start-maximized',
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--disable-blink-features=AutomationControlled', // Hide automation
                `--window-size=${width},${height}`,
                '--disable-infobars',
                '--disable-features=IsolateOrigins,site-per-process',
                '--enable-webgl',
                '--use-gl=swiftshader',
            ],
            defaultViewport: null,
        });

        const pages = await this.browser.pages();
        this.lbcPage = pages[0];

        // Spoof Navigator Properties (Plugins & Languages)
        await this.lbcPage.evaluateOnNewDocument(() => {
            // Emulate plugins presence
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            // Match our French locale
            Object.defineProperty(navigator, 'languages', {
                get: () => ['fr-FR', 'fr', 'en-US', 'en'],
            });
        });

        // Randomize User Agent
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        this.log(`🕵️ Using User-Agent: ${userAgent}`, 'info');
        await this.lbcPage.setUserAgent(userAgent);

        // Set Headers for realism
        await this.lbcPage.setExtraHTTPHeaders({
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        });

        // Load cookies if available to maintain session
        await this.loadCookies();

        this.mailPage = await this.browser.newPage();
        await this.mailPage.setUserAgent(userAgent);
        await this.mailPage.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['fr-FR', 'fr', 'en-US', 'en'],
            });
        });
    }

    private async saveCookies() {
        try {
            const cookies = await this.lbcPage.cookies();
            const cookiePath = path.join(process.cwd(), 'lbc_cookies.json');
            fs.writeFileSync(cookiePath, JSON.stringify(cookies, null, 2));
            this.log('🍪 Cookies saved.', 'info');
        } catch (e) {
            this.log('⚠️ Failed to save cookies', 'error');
        }
    }

    private async loadCookies() {
        try {
            const cookiePath = path.join(process.cwd(), 'lbc_cookies.json');
            if (fs.existsSync(cookiePath)) {
                const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
                await this.lbcPage.setCookie(...cookies);
                this.log('🍪 Previous session cookies loaded.', 'info');
            }
        } catch (e) {
            this.log('⚠️ Failed to load cookies', 'error');
        }
    }

    async createAccount() {
        let email = '';
        let password = '';
        let username = '';
        let verificationLink = '';

        try {
            // 1. Generate Identity
            username = faker.internet.username().replace(/[^a-zA-Z0-9]/g, '') + faker.number.int({ min: 10, max: 99 });
            password = faker.internet.password({ length: 12, pattern: /[A-Za-z0-9!@#$%^&*]/ }) + '!1Aa';
            this.log(`Generated identity: ${username}`, 'info');

            // 2. Get Temp Email from temp-mail.org
            this.log('💌 Fetching temporary email from temp-mail.org...', 'info');
            await this.mailPage.bringToFront();
            await this.mailPage.goto('https://temp-mail.org/en/', { waitUntil: 'domcontentloaded' });

            // Verify Temp Mail Load / Captcha
            await this.waitForHumanVerification(this.mailPage, 'input#mail', 'Temp Mail');

            this.log('Waiting for email to generate...', 'info');

            // Loop until we get a valid email
            let retries = 0;
            while (retries < 10) {
                try {
                    await this.mailPage.waitForSelector('input#mail', { timeout: 5000 });
                    email = await this.mailPage.$eval('input#mail', (el: any) => el.value);

                    this.log(`Fetched raw value: ${email}`, 'info');

                    if (email && email.includes('@') && !email.includes('Loading')) {
                        break;
                    }
                } catch (e) {
                    // Ignore and retry
                }

                this.log('Email not ready, waiting...', 'info');
                await new Promise(r => setTimeout(r, 3000));
                retries++;
            }

            if (!email || !email.includes('@')) throw new Error('Could not retrieve valid temp email');
            this.log(`Temp Email: ${email}`, 'success', 'mail', await this.takeScreenshot(this.mailPage, 'mail'));

            // 3. Navigate to Leboncoin Home (Human Flow)
            this.log('🌍 Navigating to Leboncoin home...', 'info');
            await this.lbcPage.bringToFront();
            await this.lbcPage.goto('https://www.leboncoin.fr', { waitUntil: 'domcontentloaded' });

            // Verify LBC Load / Captcha
            await this.waitForHumanVerification(this.lbcPage, 'footer, #didomi-notice-agree-button, header', 'Leboncoin');
            await this.realisticInteraction(this.lbcPage);

            this.log('LBC Home Loaded', 'info', 'lbc', await this.takeScreenshot(this.lbcPage, 'lbc'));

            // Handle Cookie Consent
            try {
                this.log('Checking for cookies...', 'info');
                const cookieBtn = await this.lbcPage.waitForSelector('#didomi-notice-agree-button', { timeout: 3000 });
                if (cookieBtn) {
                    await cookieBtn.click();
                    this.log('🍪 Accepted cookies', 'info');
                    await new Promise(r => setTimeout(r, 1000));
                }
            } catch (e) {
                // Ignore
            }

            // Click "Se connecter"
            this.log('👤 Clicking "Se connecter"...', 'info');
            try {
                // Try multiple selectors for "Se connecter"
                const loginBtn = await this.lbcPage.waitForSelector('button[aria-label="Se connecter"], a[href*="/login"], header a[title="Se connecter"]', { timeout: 5000 });
                if (loginBtn) await loginBtn.click();
            } catch (e) {
                this.log('⚠️ Could not find "Se connecter" button, trying direct navigation', 'error');
                await this.lbcPage.goto('https://auth.leboncoin.fr/login', { waitUntil: 'networkidle2' });
            }

            // Click "Créer un compte"
            this.log('➕ Clicking "Créer un compte"...', 'info');
            try {
                const signupBtn = await this.lbcPage.waitForSelector('a[href*="/compte/creer"], a[data-qa-id="login-signup-link"], button:contains("Créer un compte")', { timeout: 5000 });
                if (signupBtn) {
                    await signupBtn.click();
                    await this.lbcPage.waitForNavigation({ waitUntil: 'domcontentloaded' });
                }
            } catch (e) {
                this.log('⚠️ Could not find "Créer un compte", assuming we are on login/signup page or blocked.', 'error');
                // Fallback: Type email directly if input exists (sometimes login/signup is combined)
            }

            // 4. Fill Signup Form
            this.log('✍️ Filling signup form...', 'info');

            // Check for captcha on signup page
            await this.waitForHumanVerification(this.lbcPage, 'input[name="email"], input[data-qa-id="login-email-input"]', 'Leboncoin Signup');

            // Robust typing (Human-like)
            await this.realisticInteraction(this.lbcPage);
            await this.humanType(this.lbcPage, 'input[name="email"], input[data-qa-id="login-email-input"]', email);
            await this.randomDelay(500, 1500);
            await this.humanType(this.lbcPage, 'input[name="password"], input[data-qa-id="login-password-input"]', password);
            await this.realisticInteraction(this.lbcPage);

            this.log('Form filled', 'info', 'lbc', await this.takeScreenshot(this.lbcPage, 'lbc'));

            // Submit
            const submitBtn = await this.lbcPage.$('button[type="submit"], button[data-qa-id="login-submit-button"]');
            if (submitBtn) {
                await submitBtn.click();
                this.log('🚀 Submitted signup form', 'info');
            } else {
                this.log('❌ Could not find submit button, trying Enter', 'error');
                await this.lbcPage.keyboard.press('Enter');
            }

            this.log('Signup form submitted', 'info', 'lbc', await this.takeScreenshot(this.lbcPage, 'lbc'));

            // 5. Wait for Email Verification
            this.log('⏳ Waiting for verification email (up to 2 mins)...', 'info');
            await this.mailPage.bringToFront();

            // Polling for email on temp-mail.org
            // Structure: .inbox-dataList ul li
            for (let i = 0; i < 40; i++) {
                this.log(`Checking inbox... (${i + 1}/40)`, 'info');
                await new Promise(r => setTimeout(r, 3000));

                // Check for new email in list
                const newEmailHandle = await this.mailPage.$('.inbox-dataList ul li .user-data-subject h4 a');
                if (newEmailHandle) {
                    const subject = await this.mailPage.evaluate((el: any) => el.innerText, newEmailHandle);
                    this.log(`Found email subject: ${subject}`, 'info');

                    if (subject && (subject.includes('leboncoin') || subject.includes('Validez'))) {
                        this.log('📩 Email received! Opening...', 'success');
                        await newEmailHandle.click();
                        await new Promise(r => setTimeout(r, 2000)); // wait for load

                        // Extract link from content
                        // Content is usually in .inbox-data-content
                        await this.mailPage.waitForSelector('.inbox-data-content', { timeout: 10000 });
                        const htmlContent = await this.mailPage.$eval('.inbox-data-content', (el: any) => el.innerHTML);

                        const match = htmlContent.match(/href="(https:\/\/www\.leboncoin\.fr\/validation-compte.*?)"/);
                        if (match && match[1]) {
                            verificationLink = match[1];
                            this.log(`🔗 Found verification link: ${verificationLink}`, 'success');
                            break;
                        }
                    }
                }

                this.log('Checked mail', 'info', 'mail', await this.takeScreenshot(this.mailPage, 'mail'));
            }

            if (verificationLink) {
                // 6. Verify Account
                await this.lbcPage.bringToFront();

                // Check if captcha on verification link?
                // Usually direct link works, but good to know.

                await this.lbcPage.goto(verificationLink, { waitUntil: 'networkidle2' });
                this.log('✅ Account verified successfully!', 'success');
                this.log('Verified', 'success', 'lbc', await this.takeScreenshot(this.lbcPage, 'lbc'));

                // Save cookies for future sessions
                await this.saveCookies();

                // 7. Save to DB
                await prisma.botAccount.create({
                    data: {
                        username,
                        email,
                        password,
                    }
                });
                this.log('💾 Credentials saved to database', 'success');
            } else {
                this.log('❌ Verification email timed out or link not found.', 'error');
            }

        } catch (error: any) {
            this.log(`❌ Error: ${error.message}`, 'error');
        }
    }

    async close() {
        if (this.browser) {
            // Don't close immediately so user can see result, but typically we should.
            // this.browser.close();
            this.log('🛑 Browser session ended (window remains open)', 'info');
        }
    }



    private async takeScreenshot(page: any, target: 'mail' | 'lbc'): Promise<string> {
        const filename = `preview-${target}.jpg`;
        const filepath = path.join(SCREENSHOT_DIR, filename);
        try {
            await page.screenshot({ path: filepath, type: 'jpeg', quality: 50 });
            return `/screenshots/${filename}`;
        } catch (e) {
            return '';
        }
    }

    private async waitForHumanVerification(page: any, targetSelector: string, siteName: string) {
        let isCaptchaDetected = false;
        let retries = 0;
        const maxRetries = 60; // Approx 2-3 minutes

        while (retries < maxRetries) {
            try {
                if (await page.$(targetSelector)) {
                    if (isCaptchaDetected) {
                        this.log(`✅ ${siteName} loaded/verified!`, 'success');
                    }
                    return true;
                }

                const content = await page.content();
                const cleanContent = content.toLowerCase();
                const captchaIndicators = [
                    'challenge-platform',
                    'cloudflare',
                    'verify you are human',
                    'vérification de sécurité',
                    'just a moment',
                    'datadome',
                    'captcha'
                ];

                const hasCaptcha = captchaIndicators.some(i => cleanContent.includes(i));

                if (hasCaptcha) {
                    if (!isCaptchaDetected || retries % 5 === 0) { // Log every few seconds so user sees it
                        // For screenshot target, map 'Temp Mail' -> 'mail', 'Leboncoin' -> 'lbc'
                        const target: 'mail' | 'lbc' = siteName.includes('Temp') ? 'mail' : 'lbc';

                        this.log(`⚠️ CAPTCHA detected on ${siteName}. Please verify manually!`, 'error', target, await this.takeScreenshot(page, target));
                        isCaptchaDetected = true;
                    }
                } else {
                    if (retries % 5 === 0) this.log(`Waiting for ${siteName} to load...`, 'info');
                }
            } catch (e) {
                // Ignore transient errors
            }

            await new Promise(r => setTimeout(r, 2000));
            retries++;
        }

        throw new Error(`${siteName} failed to load or CAPTCHA not solved in time.`);
    }
}
