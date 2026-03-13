require('dotenv').config({ path: '.env.local' });
const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_SECRET_KEY || ''
});

async function testStats() {
    console.log("Testing Mailjet API stats...");
    
    try {
        // Fetch all campaigns to see what is returned
        console.log("Fetching campaigns...");
        const campaignReq = await mailjet.get('campaign', { version: 'v3' }).request();
        const campaigns = campaignReq.body.Data || [];
        
        console.log(`Found ${campaigns.length} campaigns. Top 3:`);
        console.log(JSON.stringify(campaigns.slice(0, 3), null, 2));

        if (campaigns.length > 0) {
            const campaignId = campaigns[0].ID;
            console.log(`\nFetching stats for campaign ID: ${campaignId}`);
            
            const statsReq = await mailjet.get(`statcounters/campaign`, { version: 'v3' }).id(campaignId).request();
            console.log("Stats Data:");
            console.log(JSON.stringify(statsReq.body.Data, null, 2));
        }
        
    } catch (e) {
        console.error("Error:", e.statusCode || e);
        if (e.response && e.response.body) {
            console.error("Response:", JSON.stringify(e.response.body, null, 2));
        }
    }
}

testStats();
