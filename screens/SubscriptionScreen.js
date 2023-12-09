import React, { useEffect, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { useStripe, usePaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import { BASEURL, YOUR_PUBLISHABLE_KEY } from '../config/constants';

const SubscriptionScreen = ({navigation, route}) => {

  const YOUR_PAYMENT_INTENT_CLIENT_SECRET = route.params.secret_key;

  const { initPaymentSheet, presentPaymentSheet, loading, confirmPaymentSheetPayment } = usePaymentSheet();
  // const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);


  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {

    const {paymentIntent, ephemeralKey, customer} = await fetchPaymentSheetPaymentParams();
    // return;
    const {error} = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      merchantDisplayName: 'Example Inc.',
      allowsDelayedPaymentMethods: true,
      returnURL: 'stripe-example://stripe-redirect'
    })

    // console.log(YOUR_PAYMENT_INTENT_CLIENT_SECRET)
    // const { error } = await initPaymentSheet({
    //   paymentIntentClientSecret: YOUR_PAYMENT_INTENT_CLIENT_SECRET,
    //   merchantDisplayName: 'Conard X', // Add your merchant display name here
    // });

    if (error) {
      console.log("Error initializing payment sheet:", error);
      Alert.alert(`Error code ${error.code}`, error.message)
    } else {
      setReady(true);
    }
  };

  const fetchPaymentSheetPaymentParams = async () => {
    const response = await fetch(BASEURL + '/payment-sheet', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      }
    });

    const {paymentIntent, ephemeralKey, customer} = await response.json();
    console.log(paymentIntent, ephemeralKey, customer);
    return {
      paymentIntent,
      ephemeralKey,
      customer
    };

  }

  const handleSubscribe = async () => {
    // setLoading(true);

    const { error } = await presentPaymentSheet({
      confirmPaymentSheetPayment: async (paymentOption) => {
        // Handle the confirmed payment option (e.g., save it on your backend)
        console.log('Confirmed Payment Option:', paymentOption);
        return {};
      },
    });

    if (error) {
      console.log("Error presenting payment sheet:", error);
    }

    // setLoading(false);
  };

  return (
    <View style={{display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: 30}}>
    <StripeProvider 
      publishableKey={YOUR_PUBLISHABLE_KEY}
      merchantIdentifier='Foord50conrad@gmail.com  '
    >
      <Button
        title={loading ? "Subscribing..." : "Subscribe"}
        onPress={handleSubscribe}
        disabled={loading}
      />
    </StripeProvider>

    </View>
  );
};

// export default SubscriptionScreen;

// import React, { useState } from 'react';
// import { View, TextInput, Button } from 'react-native';
// import { CardField, useStripe } from '@stripe/stripe-react-native';

// const SubscriptionScreen = ({navigation, route}) => {

//   const YOUR_PAYMENT_INTENT_CLIENT_SECRET = route.params.secret_key;

//   const [email, setEmail] = useState('');
//   const { confirmPayment } = useStripe();

//   const handleSubscribe = async () => {
//     try {
//       // Collect card details using CardField
//       const { setupIntent, error } = await confirmPayment(YOUR_PAYMENT_INTENT_CLIENT_SECRET, {
//         type: 'Card',
//         billingDetails: {
//           email: email,
//         },
//       });

//       if (error) {
//         console.error(error);
//       } else if (setupIntent) {
//         console.log('Subscription confirmed:', setupIntent);
//         // Handle successful subscription
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <View style={{marginTop: 100, paddingHorizontal: 30}}>
//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />
//       <CardField
//         postalCodeEnabled={false}
//         placeholder={{
//           number: '4242 4242 4242 4242',
//         }}
//         cardStyle={{
//           backgroundColor: '#FFFFFF',
//           textColor: '#000000',
//         }}
//         style={{
//           width: '100%',
//           height: 50,
//           marginVertical: 30,
//         }}
//       />
//       <Button title="Subscribe" onPress={handleSubscribe} />
//     </View>
//   );
// };

export default SubscriptionScreen;
