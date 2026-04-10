-- Seed default subscription plans
-- Run this in your Neon database SQL editor

-- Insert Free plan
INSERT INTO plan (id, name, stripe_price_id, price, interval, meeting_limit, minute_limit, features, is_active, created_at, updated_at)
VALUES ('free', 'free', NULL, '0', 'month', '5', '10', '["basic_transcription","email_support"]', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = 'free',
  price = '0',
  meeting_limit = '5',
  minute_limit = '10';

-- Insert Pro plan
INSERT INTO plan (id, name, stripe_price_id, price, interval, meeting_limit, minute_limit, features, is_active, created_at, updated_at)
VALUES ('pro', 'pro', 'price_pro_monthly', '19', 'month', '-1', '60', '["live_transcription","meeting_summaries","priority_support"]', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = 'pro',
  price = '19',
  meeting_limit = '-1',
  minute_limit = '60';

-- Insert Enterprise plan
INSERT INTO plan (id, name, stripe_price_id, price, interval, meeting_limit, minute_limit, features, is_active, created_at, updated_at)
VALUES ('enterprise', 'enterprise', 'price_enterprise_monthly', '99', 'month', '-1', '-1', '["everything_in_pro","team_management","usage_analytics","dedicated_support","custom_integrations"]', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = 'enterprise',
  price = '99',
  meeting_limit = '-1',
  minute_limit = '-1';