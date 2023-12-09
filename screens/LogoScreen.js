import React, { useContext } from "react";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";
import { Asset } from 'expo-asset';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";
import { hRate, wRate } from "../config/constants";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const LogoScreen = ({ navigation }) => {
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
        <Image style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height, resizeMode: 'stretch'}} source={require('../images/logo-bg.png')}></Image>
      </View>

      <View style={{ paddingHorizontal: 25 }}>
        <View style={{ alignItems: "center" }}>
          <Text 
            style={styles.headerTopText}
          >
            WELCOME TO THE
          </Text>
          <Text 
            style={{...styles.headerText, fontSize: 55, marginBottom: -25}}
          >
            COACH'S
          </Text>
          <Text 
            style={styles.headerText}
          >
            PLAYBOOK
          </Text>
        </View>

          <View style={{flexDirection: 'row', marginTop: 450 * hRate}}></View>
          <CustomButton
            color={"rgba(25, 33, 38, 1)"}
            label={"SignUp"}
            onPress={() => {
              navigation.navigate("Register");
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 30 * hRate,
            }}
          >
            <Text style={{ color: activeColors.tint }}>Join us before? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={{ color: activeColors.accent, fontWeight: "" + 700 * screenWidth * wRate }}>
                {" "}
                Login
              </Text>
            </TouchableOpacity>
          </View>


        {/* <Text
          style={{
            textAlign: "center",
            color: activeColors.tint,
            marginBottom: 30,
          }}
        >
          Or, login with ...
        </Text> */}



      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  header: {
      flex: 1,
      width: Dimensions.get('window').width,
      position: 'absolute',
      backgroundColor: 'white',
      height: 56,
      paddingLeft: 20,
      paddingRight: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  bg: {
    position: 'absolute',
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    top: 0,
    left: 0,
  },
  headerText: {
    textAlign: "center",
    color: 'black',
    fontSize: 45,

    fontWeight: '900'
  },
  headerTopText: {
    textAlign: "center",
    textAlign: "center",
    color: '#F5F5F5',
    shadowColor: 'black',
    fontSize: 25,
    fontWeight: '900',

    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    width: screenWidth,
    height: 400 * hRate,
    position: 'absolute',
    bottom: 150 * hRate
  }
})

export default LogoScreen;
