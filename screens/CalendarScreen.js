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

import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/UI/CustomHeader";
// import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { startOfWeek, addDays, format } from 'date-fns';

import { BASEURL, TYPE } from "../config/constants";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

let TAB = {
  LOAD : 1,
  SAVE : 2
}

const CalendarScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  const [date, setDate] = useState(new Date());
  const [topCalendarStr, setTopCalendarStr] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tab, setTab] = useState(TAB.LOAD);
  const [dayItems, setDayItems] = useState([]);
  const [userId, setUserId] = useState(-1)

  const [playBoardData, setPlayBoardData] = useState([])
  let activeColors = colors[theme.mode];

  const monthNames = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER"
  ];
  
  const loadBoards = (type, id) => {
    setPlayBoardData([]);
    let searchType = {
      userId: !!id? id : userId,
      date: getDateByStr()
    }

    if(type == TAB.SAVE) {
      searchType.date = "";
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

  const loadBoardsByDate = (_date) => {
    setPlayBoardData([]);
    let searchType = {
      userId: userId,
      date: getDateByStr(_date)
    }

    if(tab == TAB.SAVE) {
      searchType.date = "";
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

  const getDateByStr = (_date = date) => {
    const year = _date.getFullYear();
    const month = String(_date.getMonth() + 1).padStart(2, '0');
    const day = String(_date.getDate()).padStart(2, '0');
    
    const dateString = `${year}-${month}-${day}`;
    
    console.log(dateString);

    return dateString;
  }

  const saveBoard = (id) => {
    axios
    .post(`${BASEURL}/api/createBoardByDate`, {id: id, date: getDateByStr()})
    .then((response) => {
      ToastAndroid.show('Save Board successfully!', ToastAndroid.SHORT);
      // const {_id} = response.data.board;
      console.log("baord-----------", response.data);
      // setPlayBoardData(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  const getPresentData = (date) => {
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const formattedString = `${month} ${year}`;
    console.log(formattedString); // Output: SEPTEMBER 2023

    return formattedString;
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
    setTopCalendarStr( getPresentData(selectedDate) )
    setDayItems(getWeekArray(selectedDate));
    loadBoardsByDate(selectedDate);

  };

  const handleDayItemClick = (date) => {
    setDate(date);

    loadBoardsByDate(date);
  }



  const getWeekArray = (date) => {
    const startOfTheWeek = startOfWeek(date);
    const weekArray = [];
  
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startOfTheWeek, i);
      const formattedDate = format(currentDate, 'd');
      const dayAbbreviation = format(currentDate, 'EEE');
      weekArray.push({ date: parseInt(formattedDate), day: dayAbbreviation, dateObj: currentDate });
    }
  
    return weekArray;
  };
  
  const onTabClick = (newTab) => {
    if(newTab != tab) {
      setTab(newTab);
      loadBoards(newTab, userId)
    }
  }

  const handleSave = (id) => {
    console.log(id, '------save board--------')
    saveBoard(id)
  }

  useEffect(() => {
    setDate(new Date());
    setTopCalendarStr(getPresentData(new Date()));
    setDayItems(getWeekArray(date));

    AsyncStorage.getItem("user").then((user) => {
      const {id, name, email} = JSON.parse(user);
      setUserId(id);
      loadBoards(TAB.LOAD, id)
    });

  }, [])

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
        <CustomHeader onBackPress={() => navigation.goBack()} title={"Select Date"}/>
        <View style={{ paddingHorizontal: 10, flex: 1, }}>
          <TouchableOpacity style={{flexDirection: 'row', borderColor: 'black', paddingHorizontal: 50, justifyContent: 'flex-start', alignItems: 'center', height: 70}} onPress={showDatePicker}>
            <Ionicons style={{position: 'absolute', left: 10}} name="calendar-outline" size={24}></Ionicons>
            <Text>{topCalendarStr}</Text>
            {/* <Calendar /> */}

          </TouchableOpacity>
          <View style={{flex: 1, justifyContent: 'space-between', flexDirection: 'row', paddingHorizontal: 30 }}>
            {dayItems.map((item, key) => 
              <TouchableOpacity key={key} style={{justifyContent: 'center', flex: 1, flexDirection: 'column', alignItems: 'center'}} onPress={handleDayItemClick.bind(this, item.dateObj)}>
                <View style={item.date == date.getDate()? {...styles.dayItem, backgroundColor: '#BBF246'} : styles.dayItem}>
                  <Text>{item.date}</Text>
                </View>
                <Text style={{fontSize: 10}}>{item.day}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={{flexDirection: 'row', marginTop: 10, flex: 1, height: 80, justifyContent: "space-between", alignItems: 'center'}}>
            <TouchableOpacity style={{...styles.tab, backgroundColor: `${tab == TAB.SAVE? "#F2F4F7" : "#BBF246"}`}} onPress={onTabClick.bind(this, TAB.LOAD)}>
              <Text>LOAD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{...styles.tab, backgroundColor: `${tab == TAB.SAVE? "#BBF246" : "#F2F4F7"}`}} onPress={onTabClick.bind(this, TAB.SAVE)}>
              <Text>SAVE</Text>
            </TouchableOpacity>
          </View>

          {playBoardData.map((data, key) => 
            <View key={key}>
              {tab == TAB.LOAD && <TouchableOpacity style={styles.menuItem} onPress={() => {
                  navigation.navigate(data.baordType == 1? "BoardScreen" : "BoardAnimScreen", {id: data._id, isShare: false})
                }}>
                  <Image style={{ position: 'absolute', left: 20, width: 50, height: 50, borderRadius: 10}} source={require('../images/stadium/stadium.png')} />
                  <Text style={{left: 80, top: 15, position: 'absolute',  letterSpacing: 2}}>{data.name}</Text>
                  <Text style={{left: 80, top: 45, position: 'absolute', fontSize: 10, letterSpacing: 2}}>{data.date}</Text>
                  <Image style={{ position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
              </TouchableOpacity>}

              {tab == TAB.SAVE && <TouchableOpacity style={styles.menuItem} onPress={handleSave.bind(this, data._id)}>
                  <Image style={{ position: 'absolute', left: 20, width: 50, height: 50, borderRadius: 10}} source={require('../images/stadium/stadium.png')} />
                  <Text style={{left: 80, top: 15, position: 'absolute',  letterSpacing: 2}}>{data.name}</Text>
                  <Text style={{left: 80, top: 45, position: 'absolute', fontSize: 10, letterSpacing: 2}}>{data.date}</Text>
                  <Image style={{ position: 'absolute', right: 20}} source={require('../images/icons/icon.png')} />
              </TouchableOpacity>}

            </View>
          )}
        </View>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={date}
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
  dayItem: {
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 40, 
    height: 80,
    borderRadius: 20,
    borderWidth: 1, 
    borderColor: '#F2F4F7',
    marginBottom: 10
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

export default CalendarScreen;
