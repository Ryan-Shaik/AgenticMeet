import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer;
}