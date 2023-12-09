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
} from "react-native";
import { hRate, wRate } from "../config/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";


const MenuScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  let activeColors = colors[theme.mode];
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  AsyncStorage.getItem("user").then((user) => {
    const {id, name, email} = JSON.parse(user);
    console.log("store---user---", name, email, id)

    setUsername(name);
    setEmail(email);
  });

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

        <View style={{
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#E2F0FF', 
          height: 200 * wRate,
          borderBottomLeftRadius: 20 * wRate,
          borderBottomRightRadius: 20 * wRate,
          flex: 1
        }}>
          <TouchableOpacity onPress={() => {
              navigation.navigate("Settings")
            }}>
            <Image style={{width: 100 * wRate, height: 100 * wRate, borderRadius: 60 * wRate}} source={require('../images/sample_image_1.jpg')}></Image>
          </TouchableOpacity>
          <View style={{alignItems: "center"}}>
            <Text style={{marginTop: 10 * hRate, fontSize: 25 * wRate, fontWeight: '700'}}>{username}</Text>
          </View>
          <View style={{alignItems: "center"}}>
            <Text style={{marginTop: 0, fontSize: 16 * wRate}}>{email}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 10 * wRate, flex: 1 }}>
          <View style={{flexDirection: 'row', marginTop: 50 * hRate}}></View>

          <TouchableOpacity style={styles.menuItem} onPress={() => {
              navigation.navigate("PlayBoardScreen", {isShare: false})
            }}>
            <Image style={styles.boardIcon} source={require('../images/icons/playbook.png')} />
            <Text style={{left: 80 * wRate, position: 'absolute'}}>PlayBook</Text>
            <Image style={{ position: 'absolute', right: 20 * wRate}} source={require('../images/icons/icon.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {navigation.navigate("StrategeScreen")}}>
            <Image style={styles.boardIcon} source={require('../images/icons/strategy.png')} />
            <Text style={{left: 80 * wRate, position: 'absolute'}}>Strategise</Text>
            <Image style={{ position: 'absolute', right: 20 * wRate}} source={require('../images/icons/icon.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {navigation.navigate("CalendarScreen")}}>
            <Image style={styles.boardIcon} source={require('../images/icons/calendar.png')} />
            <Text style={{left: 80 * wRate, position: 'absolute'}}>Calendar</Text>
            <Image style={{ position: 'absolute', right: 20 * wRate}} source={require('../images/icons/icon.png')} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {navigation.navigate("PlayBoardScreen", {isShare: true})}}>
            <Image style={styles.boardIcon} source={require('../images/icons/share1.png')} />
            <Text style={{left: 80 * wRate, position: 'absolute'}}>Share</Text>
            <Image style={{ position: 'absolute', right: 20 * wRate}} source={require('../images/icons/icon.png')} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => {navigation.navigate("MemberShipScreen", {isShare: true})}}>
            <Image style={styles.boardIcon} source={require('../images/icons/share1.png')} />
            <Text style={{left: 80 * wRate, position: 'absolute'}}>Membership</Text>
            <Image style={{ position: 'absolute', right: 20 * wRate}} source={require('../images/icons/icon.png')} />
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
    height: 100 * wRate,
    margin: 10 * wRate,
    borderRadius: 10 * wRate,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 0.24,
  },
  boardIcon: {
    position: 'absolute',
    left: 20 * wRate
  },
  shadowBox: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default MenuScreen;
