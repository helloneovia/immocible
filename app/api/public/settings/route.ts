import { getAppSettings } from '@/lib/settings'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const settings = await getAppSettings()

        // Only return safe public strings (exclude API keys, secrets)
        const publicSettings = {
            text_buyer_dashboard_popup_title: settings.text_buyer_dashboard_popup_title,
            text_buyer_dashboard_popup_description: settings.text_buyer_dashboard_popup_description,
            text_hero_title: settings.text_hero_title,
            text_home_hero_title_1: settings.text_home_hero_title_1,
            text_home_hero_title_highlight: settings.text_home_hero_title_highlight,
            text_home_hero_title_2: settings.text_home_hero_title_2,
            text_home_hero_subtitle: settings.text_home_hero_subtitle,
            text_home_features_title: settings.text_home_features_title,
            text_home_features_subtitle: settings.text_home_features_subtitle,
            text_home_cta_title: settings.text_home_cta_title,
            text_home_cta_subtitle: settings.text_home_cta_subtitle,
            text_home_about_content: settings.text_home_about_content,
            text_footer_copyright: settings.text_footer_copyright,
            text_signup_agency_title: settings.text_signup_agency_title,
            text_signup_agency_subtitle: settings.text_signup_agency_subtitle,
            text_signup_buyer_title: settings.text_signup_buyer_title,
            text_signup_buyer_subtitle: settings.text_signup_buyer_subtitle,
            text_trust_payment: settings.text_trust_payment,
            text_trust_trial: settings.text_trust_trial,
            text_trust_free: settings.text_trust_free,
            text_trust_secure: settings.text_trust_secure,
            stripe_public_key: settings.stripe_public_key,
            price_monthly: settings.price_monthly,
            price_yearly: settings.price_yearly,
            feature_list_monthly: settings.feature_list_monthly,
            feature_list_yearly: settings.feature_list_yearly
        }

        return NextResponse.json(publicSettings)
    } catch (error) {
        console.error('Failed to fetch public settings:', error)
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}
