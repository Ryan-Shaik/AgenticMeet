import db from '@/db';
import { plan } from '@/db/schema';

const plans = [
  {
    id: 'free',
    name: 'free',
    stripePriceId: null,
    price: '0',
    interval: 'month',
    meetingLimit: '5',
    minuteLimit: '10',
    features: '["basic_transcription","email_support"]',
    isActive: true,
  },
  {
    id: 'pro',
    name: 'pro',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    price: '19',
    interval: 'month',
    meetingLimit: '-1',
    minuteLimit: '60',
    features: '["live_transcription","meeting_summaries","priority_support"]',
    isActive: true,
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    price: '99',
    interval: 'month',
    meetingLimit: '-1',
    minuteLimit: '-1',
    features: '["everything_in_pro","team_management","usage_analytics","dedicated_support","custom_integrations"]',
    isActive: true,
  },
];

async function seed() {
  console.log('Seeding plans...');
  
  for (const p of plans) {
    await db
      .insert(plan)
      .values(p)
      .onConflictDoUpdate({
        target: plan.id,
        set: p,
      });
    console.log(`Created/updated plan: ${p.name}`);
  }
  
  console.log('Done!');
}

seed().catch(console.error);