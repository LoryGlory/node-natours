/* eslint-disable */
import { showAlert } from './alerts';
import { Stripe } from 'stripe';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51MkCTeJ4LDEkJ919MdG35pCAaSEX6ERRh52bwz70MEDeE2D7EqUqnHN9L7DIfvoCOpnGrDsFoYyKnPRlkYWtjD5Y00NpxwkCEV'
  );

  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}/`
    );
    console.log(session);

    //await stripe.redirectToCheckout({
    //  sessionId: session.data.session.id,
    //});

    //works as expected
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
