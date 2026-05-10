const Mailjet = require('node-mailjet');
require('dotenv').config();

const mailjet = new Mailjet({
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_SECRET_KEY
});

async function run() {
    try {
        console.log("Fetching campaigns...");
        const campaignReq = await mailjet.get('campaign', { version: 'v3' }).request({
            Limit: 10
        });
        const campaigns = campaignReq.body.Data || [];
        console.log("Found campaigns:", campaigns.map(c => ({ ID: c.ID, CustomCampaign: c.CustomCampaign })));

        if (campaigns.length > 0) {
            const campId = campaigns[0].ID;
            console.log(`Fetching messages for campaign ${campId}...`);
            const msgReq = await mailjet.get('message', { version: 'v3' }).request({
                Campaign: campId,
                Limit: 5
            });
            console.log("Messages:", msgReq.body.Data.map(m => ({ ID: m.ID, Status: m.Status })));
        }

    } catch (e) {
        console.error(e);
    }
}

run();
