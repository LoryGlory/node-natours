/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51MkCTeJ4LDEkJ919MdG35pCAaSEX6ERRh52bwz70MEDeE2D7EqUqnHN9L7DIfvoCOpnGrDsFoYyKnPRlkYWtjD5Y00NpxwkCEV'
  );

  try {
    // 1. Get checkout session from the API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}/`
    );
    console.log(session);

    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
