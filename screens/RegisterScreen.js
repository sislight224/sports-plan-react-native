import React, { useState, useContext } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  ToastAndroid
} from "react-native";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";

import InputField from "../components/InputField";

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../components/CustomButton";
import CustomHeader from "../components/UI/CustomHeader";
import { BASEURL } from "../config/constants";
import axios from 'axios';
import { hRate, wRate } from "../config/constants";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    if(username == '') {
      ToastAndroid.show('Please input username' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(email == '') {
      ToastAndroid.show('Please input email' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(password == '') {
      ToastAndroid.show('Please input password' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(confirmPassword == '') {
      ToastAndroid.show('Please input password' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(password != confirmPassword) {
      ToastAndroid.show('Confirm password is not correct.' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    axios
    .post(`${BASEURL}/users/signin`, {
      fullname: username,
      email: email,
      password: password,
      verifyPassword: confirmPassword,
    })
    .then((response) => {
      ToastAndroid.show(response.data.message, ToastAndroid.SHORT);

      console.log(response.data);
      navigation.navigate("MenuScreen");

    })
    .catch((error) => {
      console.error(error);
    });

  }

  const { theme } = useContext(ThemeContext);
  let activeColors = colors[theme.mode];
  return (
    <SafeAreaView
      style={{
        backgroundColor: activeColors.primary,
        flex: 1,
        justifyContent: "center",
      }}
    >
      <View style={styles.bg}>
        <Image style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height, top: 0, resizeMode: "stretch"}} source={require('../images/login-bg.png')}></Image>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 25,}}
      >

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
            SignUp
          </Text>
        </View>



        <InputField
          label={"Full Name"}
          icon={
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          onChangeText={(e) => {setUsername(e)}}
        />

        <InputField
          label={"Email ID"}
          icon={
            <MaterialIcons
              name="alternate-email"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          onChangeText={(e) => {setEmail(e)}}
          keyboardType="email-address"
        />

        <InputField
          label={"Password"}
          icon={
            <Ionicons
              name="ios-lock-closed-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          onChangeText={(e) => {setPassword(e)}}
          inputType="password"
        />

        <InputField
          label={"Confirm Password"}
          icon={
            <Ionicons
              name="ios-lock-closed-outline"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          onChangeText={(e) => {setConfirmPassword(e)}}
          inputType="password"
        />



        <CustomButton 
          label={"Register"} 
          onPress={handleSignUp} 
          color={"rgba(25, 33, 38, 1)"}
          />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ color: activeColors.tint }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
              {" "}
              Login
            </Text>
          </TouchableOpacity>
        </View>
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
})

export default RegisterScreen;
