import Stripe from 'stripe';

export const customerToId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) => {
  if (!customer) return null;

  if (typeof customer === 'string') {
    return customer;
  } else if (customer.deleted) {
    return null;
  } else {
    return customer.id;
  }
};

export const subscriptionToId = (subscription: string | Stripe.Subscription | undefined) => {
  if (!subscription) return null;

  if (typeof subscription === 'string') {
    return subscription;
  } else {
    return subscription.id;
  }
};
