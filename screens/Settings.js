import {
  View,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Appearance,
  Text,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";
import StyledText from "../components/texts/StyledText";
import SettingsItem from "../components/settings/SettingsItem";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/UI/CustomHeader";
// import DocumentPicker from 'react-native-document-picker';
// import ImagePicker from 'react-native-image-picker';

const SettingsScreen = ({ navigation }) => {
  const { theme, updateTheme } = useContext(ThemeContext);
  let activeColors = colors[theme.mode];
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  AsyncStorage.getItem("user").then((user) => {
    const {id, name, email} = JSON.parse(user);
    setUsername(name);
    setEmail(email);
  });


  //here we set the state of the switch to the current theme
  //theme.mode is the current theme which we get from the context
  const [isDarkTheme, setIsDarkTheme] = useState(theme.mode === "dark");

  //here we toggle the theme and update the state of the switch
  const toggleTheme = () => {
    updateTheme();
    setIsDarkTheme((prev) => !prev);
  };

  const handleOpenAvatar = () => {
    // openFilePicker()
  }

  const openFilePicker = async () => {
    // try {
    //   const res = await DocumentPicker.pick({
    //     type: [DocumentPicker.types.allFiles],
    //   });
  
    //   console.log('Selected file:', res); 
    //   // Process the selected file as needed
    // } catch (err) {
    //   if (DocumentPicker.isCancel(err)) {
    //     console.log('File selection cancelled');
    //   } else {
    //     console.log('Error selecting file:', err);
    //   }
    // }
  };

  useEffect(() => {
    //here we listen for the color scheme change and update the state of the switch
    //this is necessary so that the switch automatically updates
    //when the user changes the theme from the settings
    Appearance.addChangeListener(({ colorScheme }) => {
      colorScheme === "dark" ? setIsDarkTheme(true) : setIsDarkTheme(false);
    });
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
      }}
      style={[{ backgroundColor: "#F9FAFB" }, styles.Container]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={{height: 50}}>
        <CustomHeader onBackPress={() => {navigation.goBack()}} title={'Setting'} color={'#fff'}></CustomHeader>
      </View>

      <View style={{height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB'}}>
        <TouchableOpacity onPress={() => {
            handleOpenAvatar()
          }}>
          <Image style={{width: 80, height: 80, borderRadius: 40}} source={require('../images/sample_image_1.jpg')}></Image>
        </TouchableOpacity>
        <View style={{alignItems: "center"}}>
          <Text style={{marginTop: 10, fontSize: 25, fontWeight: '700'}}>{username}</Text>
        </View>
        <View style={{alignItems: "center"}}>
          <Text style={{marginTop: 0, fontSize: 16}}>{email}</Text>
        </View>
      </View>

      <View style={{flexDirection: 'column', backgroundColor: '#fff'}}>
        <Text style={{color: '#9EA3AE', left: 20,  top: 20}}>Device</Text>
        <TouchableOpacity style={{padding: 25, justifyContent: 'center', height: 80, alignItems: 'center', marginTop: 20}} onPress={() => {navigation.navigate("PasswordScreen")}}>
          <Text style={{left: 20, position: 'absolute'}}>Change Password</Text>
          <Image style={{position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
        </TouchableOpacity>
      </View>

      <View style={{backgroundColor: '#F9FAFB', height: 20}}></View>

      <View style={{flexDirection: 'column', backgroundColor: '#fff'}}>
        <Text style={{color: '#9EA3AE', left: 20,  top: 20}}>General</Text>

        <TouchableOpacity style={{padding: 25, justifyContent: 'center', height: 60, alignItems: 'center', marginTop: 40}}>
          <Text style={{left: 20, position: 'absolute'}}>Notifications</Text>
          <Switch
            style={{position: 'absolute', right: 30}}
            value={isDarkTheme}
            onValueChange={toggleTheme}
            thumbColor={isDarkTheme ? "#fff" : activeColors.tertiary}
            ios_backgroundColor={activeColors.primary}
            trackColor={{
              false: activeColors.primary,
              true: activeColors.accent,
            }}
          ></Switch>
        </TouchableOpacity>

        <TouchableOpacity style={{padding: 25, justifyContent: 'center', height: 60, alignItems: 'center'}}>
          <Text style={{left: 20, position: 'absolute'}}>FAQ</Text>
          <Image style={{position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={{padding: 25, justifyContent: 'center', height: 60, alignItems: 'center',}}>
          <Text style={{left: 20, position: 'absolute'}}>Help</Text>
          <Image style={{position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
        </TouchableOpacity>
        
      </View>

      <View style={{backgroundColor: '#F9FAFB', height: 20}}></View>

      <TouchableOpacity style={{justifyContent: 'center', height: 60, alignItems: 'center', backgroundColor: '#fff'}} onPress={() => {navigation.navigate("Login")}}>
          <Text style={{color: 'red'}}>Logout</Text>
      </TouchableOpacity>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  section: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 25,
    marginBottom: 25,
  },
  logout: {
    bottom: 0,
    position: "absolute",
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 25,
    alignSelf: "center",
    marginBottom: 25,
    justifyContent: "center",
    alignItems: "center",
  },

});

export default SettingsScreen;
