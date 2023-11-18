import React, { useContext } from "react";
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
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";
import CustomHeader from "../components/UI/CustomHeader";

const StrategeScreen = ({ navigation }) => {
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
        <Image style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height, resizeMode: 'stretch'}} source={require('../images/board-bg.png')}></Image>
      </View>

      <ScrollView>
        <CustomHeader onBackPress={() => navigation.goBack()} title={"Strategies"}/>

        <View style={{ paddingHorizontal: 10, flex: 1 }}>
          <View style={{flexDirection: 'row', marginTop: 10}}></View>

          <TouchableOpacity style={styles.menuItem} onPress={() => {
              navigation.navigate("BoardScreen", {id : -1, isShare: false})
            }}>
            <Image style={{width : 60, height: 60, position: 'absolute', left: 30, top: 30}} source={require('../images/icons/clipboard.png')} />
            <View style={{width: '100%', height: 50, position: 'absolute', bottom: 0}}>
              <Text style={{left: 30, position: 'absolute'}}>Create on Clipboard</Text>
              <Image style={{ position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
            </View>

          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {
              navigation.navigate("BoardAnimScreen", {id : -1, isShare: false})
            }}>
            <Image style={{width : 100, height: 100, position: 'absolute', left: 30, top: 30}} source={require('../images/icons/animation.png')} />
            <View style={{width: '100%', height: 50, position: 'absolute', bottom: 0}}>
              <Text style={{left: 30, position: 'absolute'}}>Create live animation</Text>
              <Image style={{ position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
            </View>

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
  menuItem: {
    height: 250,
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    flex: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 0.24,
  },
  boardIcon: {
    position: 'absolute',
    left: 20
  },
  shadowBox: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default StrategeScreen;
