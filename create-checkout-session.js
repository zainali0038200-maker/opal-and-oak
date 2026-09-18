const Stripe = require('stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Online payment is not configured yet. Add STRIPE_SECRET_KEY in Vercel Environment Variables.' });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { order } = req.body || {};
    if (!order || !Array.isArray(order.items) || !order.items.length) return res.status(400).json({ error: 'Cart is empty.' });
    const line_items = order.items.map(item => ({
      price_data: {
        currency: 'cad',
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100)
      },
      quantity: Number(item.qty)
    }));
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: order.customer_email,
      billing_address_collection: 'auto',
      shipping_address_collection: { allowed_countries: ['CA'] },
      success_url: `${req.headers.origin || 'https://opal-and-oak.vercel.app'}/?payment=success`,
      cancel_url: `${req.headers.origin || 'https://opal-and-oak.vercel.app'}/?payment=cancelled`,
      metadata: { customer_name: String(order.customer_name || '').slice(0, 500), phone: String(order.phone || '').slice(0, 500) }
    });
    return res.status(200).json({ url: session.url });
  } catch (e) { return res.status(500).json({ error: e.message || 'Stripe error' }); }
};
