// StripeComponent.js
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import BASEURL, {SUBSCRIBE_MONTH, SUBSCRIBE_3MONTH, SUBSCRIBE_YEAR} from '../config/constants';

const StripeScreen = () => {
    const selectedPlan = SUBSCRIBE_MONTH;
    const { confirmPayment, handleCardAction } = useStripe();
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
        setLoading(true);

        // Collect card details
        const cardDetails = await confirmPayment({
            type: 'CardField',
            billingDetails: {
            email: 'test@example.com',
            },
        });

        if (cardDetails.error) {
            console.error(cardDetails.error);
            setLoading(false);
            return;
        }

        // Send token to your backend
        const { paymentMethodId } = cardDetails;

        // Replace 'your_backend_url' with your actual backend URL
        const response = await fetch(`${BASEURL}/create-subscription`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentMethodId, selectedPlan }),
        });

        const responseData = await response.json();

        // Handle the response from your backend
        console.log(responseData);

        setLoading(false);
        } catch (error) {
        console.error(error);
        setLoading(false);
        }
    };

    return (
        <View>
        <CardField
            postalCodeEnabled={false}
            placeholder={{
            number: '4242 4242 4242 4242',
            }}
            cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            }}
            style={{
            width: '100%',
            height: 50,
            marginVertical: 30,
            }}
        />
        <Button title="Subscribe" onPress={handlePayment} disabled={loading} />
        </View>
    );
};

export default StripeScreen;