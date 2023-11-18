import React, { useContext, useState } from "react";
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

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";
import CustomHeader from "../components/UI/CustomHeader";

const LoginScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  let activeColors = colors[theme.mode];

  AsyncStorage.getItem("user").then((user) => {
    if(!!user) {
      const {id, name, email} = JSON.parse(user);
    }
  });

  const handleLogin = () => {
    if(username == '') {
      ToastAndroid.show('Please input email or username' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(password == '') {
      ToastAndroid.show('Please input password' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    console.log(username)
    axios
    .post(`${BASEURL}/users/login`, {
      email: username,
      password: password,
    })
    .then((response) => {
      ToastAndroid.show('Login in successfully!', ToastAndroid.SHORT);

      const {user_id, user_name, token} = response.data.user_token;



      storeData("user", {
        id: user_id,
        name: user_name,
        token: token,
        email: username
      });

      AsyncStorage.getItem("user").then((user) => {
        console.log("--save user: ", user)
      });
    

      console.log(response.data);
      navigation.navigate("MenuScreen");

    })
    .catch((error) => {
      console.error(error);
    });

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
            Login
          </Text>
        </View>

        <InputField
          selectionColor={activeColors.tint}
          label={"Email ID"}
          icon={
            <MaterialIcons
              name="alternate-email"
              size={20}
              color="#666"
              style={{ marginRight: 5 }}
            />
          }
          keyboardType="email-address"
          onChangeText={(e) => { console.log(e); setUserName(e) }}
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
          inputType="password"
          onChangeText={(e) => { setPassword(e) }}
          fieldButtonLabel={"Forgot?"}
          fieldButtonFunction={() => {}}
        />
        <View style={{flexDirection: 'row', marginTop: 50}}></View>

        <CustomButton
          label={"Login"}
          onPress={() => {
            handleLogin();
          }}
          color={"rgba(25, 33, 38, 1)"}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ color: activeColors.tint }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
              {" "}
              SignUp
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

export default LoginScreen;
