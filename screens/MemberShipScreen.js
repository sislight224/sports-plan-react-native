import React, { useContext, useEffect, useState } from "react";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  ToastAndroid
} from "react-native";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storeData, getData, getJsonData } from "../config/asyncStorage";
import { BASEURL } from "../config/constants";

import CustomHeader from "../components/UI/CustomHeader";

const MemberShipScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  let activeColors = colors[theme.mode];
  const [YOUR_PAYMENT_INTENT_CLIENT_SECRET, set_YOUR_PAYMENT_INTENT_CLIENT_SECRET] = useState('');

  AsyncStorage.getItem("user").then((user) => {
    if(!!user) {
      const {id, name, email} = JSON.parse(user);
    }
  });

  useEffect(() => {
    axios
    .post(`${BASEURL}/api/payment_intent`)
    .then((response) => {
      console.log(response.data)
      set_YOUR_PAYMENT_INTENT_CLIENT_SECRET(response.data)
    })
    .catch((error) => {
      console.error(error);
    });
  }, []);

  const handleStripePayment = (type = "month") => {
    navigation.navigate("SubscriptionScreen", {secret_key: YOUR_PAYMENT_INTENT_CLIENT_SECRET});
  }


  return (
    <SafeAreaView
      style={{
        backgroundColor: activeColors.primary,
        flex: 1,
        justifyContent: "center",
      }}
    >

      <View style={styles.bg}>
        <Image style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height, resizeMode: 'stretch'}} source={require('../images/login-bg.png')}></Image>
      </View>

      <ScrollView style={{ paddingHorizontal: 25 }}>
        <CustomHeader onBackPress={() => navigation.goBack()}/>

        <View style={{alignItems: 'center'}}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: activeColors.tint,
              marginBottom: 30,
            }}
          >
            MemberShip
          </Text>
        </View>

        <TouchableOpacity style={styles.member_card} onPress={handleStripePayment.bind(this, 'month')}>
          <Text style={styles.title}>500$ / month</Text>
          <Text style={styles.content}>Share Clipboard</Text>
          <Text style={styles.content}>Share Animation</Text>
          <Text style={styles.content}>View shared data</Text>
        </TouchableOpacity>

        

        
        <View style={{flexDirection: 'row', marginTop: 50}}></View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    top: 0,
    left: 0,
  },
  member_card: {
    width: Dimensions.get("window").width * 0.8,
    height: 400,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 3.24,
  },
  title: {
    fontSize: 26
  },
  content: {
    margin: 10,
    fontSize: 16
  },
})

export default MemberShipScreen;
