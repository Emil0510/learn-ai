import { NextResponse } from "next/server";
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

export async function POST() {
  // TODO: Implement Stripe checkout session creation
  //
  // 1. Get the authenticated user from Supabase
  // 2. Create or retrieve a Stripe customer for this user
  // 3. Create a Stripe Checkout Session:
  //    const session = await stripe.checkout.sessions.create({
  //      customer: stripeCustomerId,
  //      payment_method_types: ["card"],
  //      line_items: [{ price: "price_xxx", quantity: 1 }],
  //      mode: "subscription",
  //      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
  //      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
  //      subscription_data: { trial_period_days: 14 },
  //    });
  // 4. Return the session URL: return NextResponse.json({ url: session.url })

  return NextResponse.json(
    { error: "Stripe checkout not yet configured. Add your STRIPE_SECRET_KEY to .env.local." },
    { status: 501 }
  );
}
