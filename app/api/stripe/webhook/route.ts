import { NextResponse } from "next/server";
// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

export async function POST() {
  // TODO: Implement Stripe webhook handler
  //
  // 1. Verify webhook signature:
  //    const sig = request.headers.get("stripe-signature")!;
  //    const body = await request.text();
  //    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  //
  // 2. Handle relevant events:
  //    switch (event.type) {
  //      case "customer.subscription.created":
  //        // Mark user as subscribed in Supabase profiles table
  //        break;
  //      case "customer.subscription.deleted":
  //        // Mark user as unsubscribed
  //        break;
  //      case "invoice.payment_failed":
  //        // Notify user of failed payment
  //        break;
  //    }
  //
  // 3. Return 200 to acknowledge receipt: return NextResponse.json({ received: true });

  return NextResponse.json({ received: true });
}
