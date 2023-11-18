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
import AsyncStorage from "@react-native-async-storage/async-storage";

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";
import CustomHeader from "../components/UI/CustomHeader";
import { BASEURL } from "../config/constants";
import axios from 'axios';


const PasswordScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  let activeColors = colors[theme.mode];
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");


  const [password, setPassword] = useState("");
  const [verifyPassword, setverifyPassword] = useState("");


  AsyncStorage.getItem("user").then((user) => {
    const {id, name, email} = JSON.parse(user);
    setUsername(name);
    setEmail(email);
    setId(id);
  });

  const handleConfirmPassword = () => {
    if(password == '') {
      ToastAndroid.show('Please input email or username' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(verifyPassword == '') {
      ToastAndroid.show('Please input password' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    if(password != verifyPassword) {
      ToastAndroid.show('Please input correct password' + BASEURL, ToastAndroid.SHORT);
      return;
    }

    axios
    .post(`${BASEURL}/users/change_password`, {
      email: email,
      password: password,
      verifyPassword: verifyPassword,
    })
    .then((response) => {
      ToastAndroid.show('Change password in successfully!', ToastAndroid.SHORT);

      navigation.goBack();

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
            Change Password
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#5e6467",
              marginBottom: 30,
            }}
          >
            Create new password to login
          </Text>
        </View>

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
          fieldButtonFunction={() => {}}
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
          onChangeText={(e) => {setverifyPassword(e)}}
          inputType="password"
          fieldButtonFunction={() => {}}
        />
        <View style={{flexDirection: 'row', marginTop: 50}}></View>

        <CustomButton
          label={"Create Password"}
          onPress={() => {
            handleConfirmPassword()
          }}
          color={"rgba(25, 33, 38, 1)"}
        />

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

export default PasswordScreen;
