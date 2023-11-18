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

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../components/CustomButton";
import InputField from "../components/InputField";
import CustomHeader from "../components/UI/CustomHeader";

import { BASEURL, TYPE } from "../config/constants";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";


const PlayBoardScreen = ({ navigation, route }) => {

  const isShare = route.params.isShare;
  console.log("---isShare: ", isShare, route.params)

  const [userId, setUserId] = useState(-1)
  const { theme } = useContext(ThemeContext);
  const [playBoardData, setPlayBoardData] = useState([])

  const [tab, setTab] = useState(TYPE.BOARD);

  let activeColors = colors[theme.mode];

  const loadBoards = (type, id) => {
    setPlayBoardData([]);
    let searchType = {
      boardType: type,
      userId: !!id? id : userId
    }
    if(isShare) {
      searchType['isShare'] = isShare;
      delete searchType['userId'];
    }

    axios
    .post(`${BASEURL}/api/getBoards`, searchType)
    .then((response) => {
      ToastAndroid.show('Load Board successfully!', ToastAndroid.SHORT);
      // const {_id} = response.data.board;
      console.log("baord-----------", response.data);
      setPlayBoardData(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  useEffect(() => {
    AsyncStorage.getItem("user").then((user) => {
      const {id, name, email} = JSON.parse(user);
      setUserId(id);
      loadBoards(TYPE.BOARD, id)
    });
  }, []);

  const onTabClick = (newTab) => {
    if(newTab != tab) {
      setTab(newTab);
      loadBoards(newTab)
    }
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
        <Image style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height, resizeMode: 'stretch'}} source={require('../images/board-bg.png')}></Image>
      </View>

      <ScrollView>
        <CustomHeader onBackPress={() => navigation.goBack()} title={"PlayBoard"}/>

        <View style={{ paddingHorizontal: 10, flex: 1 }}>
          <View style={{flexDirection: 'row', marginTop: 10}}></View>
          <View style={{flexDirection: 'row', marginTop: 10, flex: 1, height: 80, justifyContent: "space-between", alignItems: 'center'}}>
            <TouchableOpacity style={{...styles.tab, backgroundColor: `${tab == TYPE.ANIM? "#F2F4F7" : "#BBF246"}`}} onPress={onTabClick.bind(this, TYPE.BOARD)}>
              <Text>Board</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.tab, backgroundColor: `${tab == TYPE.ANIM? "#BBF246" : "#F2F4F7"}`}} onPress={onTabClick.bind(this, TYPE.ANIM)}>
              <Text>Animation</Text>
            </TouchableOpacity>
          </View>

          {playBoardData.map((data, key) => 
            <TouchableOpacity key={key} style={styles.menuItem} onPress={() => {
                navigation.navigate(data.boardType == TYPE.BOARD? "BoardScreen" : "BoardAnimScreen", {id: data._id, isShare: isShare})
              }}>
                <Image style={{ position: 'absolute', left: 20, width: 50, height: 50, borderRadius: 10}} source={require('../images/stadium/stadium.png')} />
                <Text style={{left: 80, top: 15, position: 'absolute',  letterSpacing: 2}}>{data.name}</Text>
                <Text style={{left: 80, top: 45, position: 'absolute', fontSize: 10, letterSpacing: 2}}>{data.date}</Text>
                <Image style={{ position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
            </TouchableOpacity>
          
          )}
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
    height: 80,
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
  tab: {
    flexDirection: 'column', 
    width: 200, 
    height: 60, 
    borderRadius: 10, 
    backgroundColor: '#BBF246', //#F2F4F7
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default PlayBoardScreen;
