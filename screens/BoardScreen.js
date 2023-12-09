import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Dimensions, StyleSheet, Image, View, PanResponder, TouchableOpacity, ToastAndroid, Text, Modal  } from 'react-native';
import Canvas , {Image as CanvasImage, Path2D}from 'react-native-canvas';
import { Asset } from 'expo-asset';
import Item from '../components/game/Item';
import images from '../components/Images';
import { Ionicons } from '@expo/vector-icons';
import { BASEURL, ITEM_TYPE, BALL, PLAYER } from "../config/constants";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import InputField from "../components/InputField";
import { hRate, wRate } from "../config/constants";

let setting = {
    drawLine: 'none'
};
let paths = [];
let drawCanvas = null;
let onAddItem1 = null;
let items = [];
let startPos = {x : 0, y : 0}
let bezierPoints = [];
let game = {
    pathIdx : 0,
    playerNum1: 1,
    playerNum2: 1,
    stageIdx: 0,
    stages: [
        /**
         * items, paths, ...
         */
    ],
    stadium: 'a-football',
    camera: {
        x : 0,
        y : 0,
        scale: 1,
        angle: 0,
        startPos : {
            x : 0,
            y : 0
        }
    }
}


const init = () => {
    setting.drawLine = 'none';
    paths = [];
    items = [];
    startPos = {x : 0, y : 0}
    bezierPoints = [];
    game.pathIdx = 0;
    game.stageIdx = 0;
    game.playerNum1 = 1;
    game.playerNum2 = 1;
    game.stages = [];
    game.stadium = 'a-football';
    game.camera.x = 0;
    game.camera.y = 0;
    game.camera.scale = 1;
    game.camera.startPos = {x : 0, y : 0};
}
init();
let scaleItem = 1;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function BoardScreen({navigation, route}) {

    console.log(route.params)

    let boardId = route.params.id;
    let userId = -1;
    let isShare = route.params.isShare;

    const ref = useRef(null);
    const [isPanVisible, setPanIsVisible] = useState(false);
    const [isItemVisible, setItemIsVisible] = useState(0);

    const [date, setDate] = useState(new Date());
    const [boardName, setBoardName] = useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    // const [scaleItem, setScaleItem] = useState(1);

    const handleScaleItem = (type = 'M') => {
        console.log("-----setting ---", scaleItem)
        if(type == 'S') {
            scaleItem = 0.8
        } else if (type == "M") {
            scaleItem = 1

        } else if (type == 'L') {
            scaleItem = 1.2
        }

        closeModal('setting');
        drawCanvas();
    }

    const getDateByStr = (_date = date) => {
        const year = _date.getFullYear();
        const month = String(_date.getMonth() + 1).padStart(2, '0');
        const day = String(_date.getDate()).padStart(2, '0');
        
        const dateString = `${year}-${month}-${day}`;
        
        console.log(dateString);
    
        return dateString;
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
        // setTopCalendarStr( getPresentData(selectedDate) )
        // setDayItems(getWeekArray(selectedDate));
    };

    const [modalVisible, setModalVisible] = useState(false);
    const [modalSettingVisible, setModalSettingVisible] = useState(false);

    const openModal = (type = 'save') => {
        console.log("show modal")

        if(type == 'save') {
            setModalVisible(true);
        } else {
            setModalSettingVisible(true);
        }
    };
  
    const closeModal = (type = 'save') => {
        console.log("close modal", modalVisible, type)
        if(type == 'save') {
            setModalVisible(false);
        } else {
            setModalSettingVisible(false);
        }
    };


    AsyncStorage.getItem("user").then((user) => {
        const {id, name, email} = JSON.parse(user);
        userId = id;
    });

    const panResponder = useRef(
        PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            // Handle mouse move event
            // console.log('Mouse move event:', gestureState);
            const { pageX, pageY } = event.nativeEvent;

            let delta = {
                x : Math.round(pageX - startPos.x),
                y : Math.round(pageY - startPos.y),
            }
            let isItemSeleted = false;

            if(!isShare) {
                items.forEach(item => {
                    if(item.selected) {
                        item.x = item.firstPoint.x + delta.x;
                        item.y = item.firstPoint.y + delta.y;
                        isItemSeleted = true;
                    }
                })
    
                let realX = Math.round((pageX) / game.camera.scale + game.camera.x);
                let realY = Math.round((pageY) / game.camera.scale + game.camera.y);
    
                bezierPoints.push({x : Math.round(realX), y : Math.round(realY)});
    
                if(bezierPoints.length > 2 && !checkPointOver({x : realX, y : realY}, bezierPoints[bezierPoints.length - 1])) {
                    bezierPoints.splice(bezierPoints.length - 1, 1)
                }
            }

            if(setting['drawLine'] == 'none' && !isItemSeleted) {
                game.camera.x = game.camera.startPos.x + delta.x;
                game.camera.y = game.camera.startPos.y + delta.y;
            }

            if(drawCanvas != null) {
                // drawCanvas();
            }
        },
        onPanResponderGrant: (event, gestureState) => {
            // Handle mouse down event
            // console.log('Mouse down event:', gestureState);

            const { pageX, pageY } = event.nativeEvent;
            startPos.x = pageX;
            startPos.y = pageY;

            game.camera.startPos.x = game.camera.x;
            game.camera.startPos.y = game.camera.y;

            if(setting['drawLine'] == 'none') {
                let isSelect = false;
                items.forEach(item => {
                    if(mouseCheckItem(item, {x : pageX, y : pageY}) && !isSelect) {
                        item.selected = true;
                        item.firstPoint = {
                            x : item.x,
                            y : item.y
                        }
                        isSelect = true;
                        // setting['drawLine'] = 'none'
                    }
                })
            }

            if(drawCanvas != null) {
                drawCanvas();
            }
        },
        onPanResponderRelease: (event, gestureState) => {
            // Handle mouse up event
            // console.log('Mouse up event:', gestureState);
            const { pageX, pageY } = event.nativeEvent;

            items.forEach(item => {
                item.selected = false;
            })
            if(setting['drawLine'] != 'none') {
                let points = [];
                let num = 1 + Math.round(bezierPoints.length / 16);
                console.log("number: ", num)
        
                for(let i = 0; i < bezierPoints.length; i+= num) {
                    points.push(bezierPoints[i]);
                }
                points.push(bezierPoints[bezierPoints.length - 1]);
                

                let newPaths = [
                    ...paths.slice(0, game.pathIdx), 
                    {
                        points: points,
                        end : {x : Math.round((pageX) / game.camera.scale + game.camera.x), y : Math.round((pageY) / game.camera.scale + game.camera.y)},
                        type: setting['drawLine']
                    }, 
                    ...paths.slice(game.pathIdx)];

                paths = [...newPaths];
                game.pathIdx++;
            }


            bezierPoints = [];

            drawCanvas();
        },
        })
    ).current;

    const checkPointOver = (point1, point2) => {
        return point1.x == point2.x && point1.y == point2.y
    }

    const mouseCheckItem = (item, mouse) => {
        let realX = (mouse.x) / game.camera.scale;
        let realY = (mouse.y) / game.camera.scale;

        return realX > item.x + game.camera.x && realX < item.x + item.w * item.scale / game.camera.scale + game.camera.x &&
            realY > item.y + game.camera.y && realY < item.y + item.h * item.scale / game.camera.scale + game.camera.y
    }

    const onVideoControlBtn = (key) => {
        console.log(key)


        if(key == 'stadium') {
            let randomSt = [
                "a-football",
                "bg-football",
                "bascket",
                "cricket",
                "Hokey",
                "Rugby",
                "stadium",
            ]
            let idx = (randomSt.indexOf(game.stadium) + 1) % randomSt.length;
            console.log(randomSt[idx], idx)
            let str = randomSt[idx];
            game.stadium = str
        } else if(key == 'zoomIn') {
            game.camera.scale += 0.1;
        } else if(key == 'zoomOut') {
            game.camera.scale -= 0.1;
        } else if(key == 'angle') {
            game.camera.angle += 15;
            console.log(game.camera.angle)
        } else if(key == 'ball') {
            let itemVisible = isItemVisible == 2? 0 : 2;
            setItemIsVisible(itemVisible);
        } else if(key == 'player') {
            let itemVisible = isItemVisible == 3? 0 : 3;
            setItemIsVisible(itemVisible);
        }


        drawCanvas()
    }
    
    const onSettingPanBoard = (key, value) => {
        setSetting(key, value)
    }

    const setSetting = (key, value) => {
        setting[key] = value;
        console.log(key, setting[key])

    }

    const onClickSetting = () => {
        if(isPanVisible) {
            setting['drawLine'] = 'none'
        }
        setPanIsVisible(!isPanVisible);
    }

    const getItemsJSON = () => {
        let json = [];
        items.forEach(item => {
            json.push(item.getJSON())
        })
        return json;
    }

    const generateDrawItems = () => {
        if(game.stages.length == 0) return;
        game.playerNum1 = 1;
        game.playerNum2 = 1;
        const pathArray = [];
        game.stages[game.stageIdx].paths.forEach(path => {
            pathArray.push(path);
        })
        paths = [...pathArray];
        const obj = [];
        game.stages[game.stageIdx].items.forEach(item => {
            obj.push(onGenerateItem(item));
        })
        items = [...obj]
        // items = [...game.stages[game.stageIdx].items]
        game.pathIdx = paths.length - 1;
    }

    const onItemShowBtn = () => {
        let itemVisible = isItemVisible == 1? 0 : 1;
        setItemIsVisible(itemVisible);
    }

    const onDeleteItem = () => {
        game.pathIdx--;
        paths.splice(game.pathIdx, 1);
        game.pathIdx = game.pathIdx < 0? 0 : game.pathIdx;
        drawCanvas()
    }

    const onPathsDirectionBtn = (dir) => {
        if(paths.length == 0) {
            return;
        }
        if(dir == 'next') {
            game.pathIdx++;
            game.pathIdx = game.pathIdx > paths.length? paths.length : game.pathIdx;
        }
        if(dir == 'before') {
            game.pathIdx--;
            game.pathIdx = game.pathIdx < 0? 0 : game.pathIdx;
        }
        drawCanvas()
    }

    const onAddItem = (key) => {
        console.log(key)
        onAddItem1(key)
    }

    const handleTopMenu = (type) => {
        if(type == 'save') {
            // showDatePicker();
            openModal()
        } else if(type == 'share') {
            game.stages = [];
            game.stages.push({paths: paths, items: getItemsJSON()});
            console.log("share board----",boardId);
            if(boardId == -1) {
                ToastAndroid.show('Please save board.', ToastAndroid.SHORT);
            } else {
                axios
                .post(`${BASEURL}/api/saveBoard`, {
                  data: JSON.stringify(game),
                  userId: userId,
                  boardType: 1,
                  isShare: true,
                  boardId: boardId,
                  boardName: boardName,
                  date: date
                })
                .then((response) => {
                  ToastAndroid.show('Share Board successfully!', ToastAndroid.SHORT);
            
                  console.log("share baord-----------", response.data);
            
                })
                .catch((error) => {
                  console.error(error);
                });
            }
        } else if(type == 'load') {
            navigation.navigate("PlayBoardScreen", {isShare: isShare});
        } else if(type == 'setting') {
            openModal('setting')
        }
    }

    const saveBoard = () => {
        game.stages = [];
        game.stages.push({paths: paths, items: getItemsJSON()});
        console.log("save board----",boardId);

        if(boardId == -1) {
            axios
            .post(`${BASEURL}/api/createBoard`, {
              data: JSON.stringify(game),
              userId: userId,
              boardType: 1,
              isShare: false,
              boardId: boardId,
              boardName: boardName,
              date: getDateByStr()
            })
            .then((response) => {
              ToastAndroid.show('Create Board successfully!', ToastAndroid.SHORT);
        
              const {_id} = response.data.board;
              console.log("baord-----------", _id);

              boardId = _id;
              route.params.id = boardId;
            //   navigation.navigate("MenuScreen");
        
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
            console.log("---------------update board-------------")
            axios
            .post(`${BASEURL}/api/saveBoard`, {
              data: JSON.stringify(game),
              userId: userId,
              boardType: 1,
              isShare: false,
              boardId: boardId,
              boardName: boardName,
              date: getDateByStr()
            })
            .then((response) => {
              ToastAndroid.show('Save Board successfully!', ToastAndroid.SHORT);
        
              console.log("baord-----------", response.data);
            //   const {_id} = response.data;
            //   boardId = _id;
            //   navigation.navigate("MenuScreen");
        
            })
            .catch((error) => {
              console.error(error);
            });
        }

        closeModal();
    }

    const loadBoard = () => {    
        if(boardId == -1) return;
        axios
        .post(`${BASEURL}/api/getBoardById`, {id: boardId})
        .then((response) => {
          ToastAndroid.show('Load Board successfully!', ToastAndroid.SHORT);
          // const {_id} = response.data.board;
          
          console.log(response.data)

          const {data, name, date} = response.data;

          setBoardName(name);
          setDate(new Date(date));

          const dataObj = JSON.parse(data);
          game.stages = dataObj.stages;
          game.stadium = dataObj.stadium;
          game.playerNum1 = dataObj.playerNum1;
          game.playerNum2 = dataObj.playerNum2;

          console.log("baord-----------", game);

          generateDrawItems();
          drawCanvas();
        //   setPlayBoardData(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    useEffect(() => {
        loadBoard();
        init();
        if (ref.current) {

            const mW = windowWidth / 2;
            const mH = windowHeight / 2;

            const canvas = ref.current
            canvas.width = windowWidth;
            canvas.height = windowHeight

            const ctx = ref.current.getContext('2d');
            
            let imgAsset = {};

            const preLoad = () => {

                const imageAsset = Asset.fromModule(require('../images/stadium/Football.png'));
                const image = imageAsset.uri;
                let img = [];
                img[0] = new CanvasImage(canvas);
                img[0].src = image;
                img[0].addEventListener('load', function() {
                    imgAsset['bg-football'] = img[0];
                    draw()
                })

                img[1] = new CanvasImage(canvas);
                img[1].src = Asset.fromModule(require('../images/stadium/bg.png')).uri;
                img[1].addEventListener('load', function() {
                    imgAsset['bg'] = img[1];
                    draw()
                })

                img[2] = new CanvasImage(canvas);
                img[2].src = Asset.fromModule(require('../images/stadium/bg-bottom.png')).uri;
                img[2].addEventListener('load', function() {
                    imgAsset['bg-bottom'] = img[2];
                    draw()
                })

                img[3] = new CanvasImage(canvas);
                img[3].src = Asset.fromModule(require('../images/gameIcons/player1.png')).uri;
                img[3].addEventListener('load', function() {
                    imgAsset['player1'] = img[3];
                    draw()
                })

                img[4] = new CanvasImage(canvas);
                img[4].src = Asset.fromModule(require('../images/gameIcons/player2.png')).uri;
                img[4].addEventListener('load', function() {
                    imgAsset['player2'] = img[4];
                    draw()
                })
                
                img[5] = new CanvasImage(canvas);
                img[5].src = Asset.fromModule(require('../images/gameIcons/football.png')).uri;
                img[5].addEventListener('load', function() {
                    imgAsset['b-football'] = img[5];
                    draw()
                })

                Object.keys(images).forEach(key => {
                    const img = new CanvasImage(canvas);
                    img.src = Asset.fromModule(images[key]).uri;
                    img.addEventListener('load', function() {
                        imgAsset[key] = img;
                        draw()
                    })
                })

                initData();
                draw()

            }
            
            const initData = () => {
                // for(let i = 0; i < 1; i++) {
                //     let x = 0;
                //     let y = 160 + i * 40;
                //     const item = new Item({
                //         x : x,
                //         y : y,
                //         name : i + 10,
                //         imgs : imgAsset,
                //         ctx: ctx,
                //         h : 35,
                //         w : 35,
                //         type : 'player1'
                //     })
                //     items.push(item);
                // }
                // for(let i = 0; i < 1; i++) {
                //     let x = windowWidth - 40;
                //     let y = 160 + i * 40;
                //     const item = new Item({
                //         x : x,
                //         y : y,
                //         name : i + 10,
                //         imgs : imgAsset,
                //         ctx: ctx,
                //         h : 35,
                //         w : 35,
                //         type : 'player2'
                //     })
                //     items.push(item);
                // }
                // // BALL
                // let x = windowWidth / 2 - 10;
                // let y = 150;
                // const item = new Item({
                //     x : x,
                //     y : y,
                //     imgs : imgAsset,
                //     ctx: ctx,
                //     h : 20,
                //     w : 20,
                //     type : 'b-football'
                // })
                // items.push(item);


            }

            const draw = () => {
                ctx.clearRect(0, 0, windowWidth, windowHeight);
                ctx.save();
                ctx.rotate(game.camera.angle / 180 * Math.PI);
                ctx.scale(game.camera.scale, game.camera.scale);
                backgroundPart()
                
                drawLines();
                
                items.forEach((item, i) => {
                    item.scale = scaleItem;
                    item.draw();
                })

                ctx.setTransform(1.5, 0, 0, 1.5, 0, 0);
                ctx.restore();

                // setTimeout(draw, 500);
            }

            const drawLines = () => {
                for(let i = 0; i < game.pathIdx; i++) {
                    const {points, end, type} = paths[i];
                    let sPos = {...points[0]};
                    // Draw the Bezier curve
                    ctx.beginPath()

                    if(type.indexOf('dash') != -1) {
                        ctx.setLineDash([5, 5]);
                    }

                    for (let i = 0; i < points.length; i += 2) {
                        if(!!points[i + 2]) {
                            ctx.moveTo(sPos.x + game.camera.x, sPos.y + game.camera.y);
                            // ctx.lineTo(points[i + 1].x, points[i + 1].y)
                            ctx.bezierCurveTo(
                                points[i].x + game.camera.x,
                                points[i].y + game.camera.y,
                                points[i + 1].x + game.camera.x,
                                points[i + 1].y + game.camera.y,
                                points[i + 2].x + game.camera.x,
                                points[i + 2].y + game.camera.y,
                            );
                            sPos = {
                                x : points[i + 2].x,
                                y : points[i + 2].y,
                            }
                        }

                    }
                    // ctx.moveTo(sPos.x, sPos.y);
                    // ctx.lineTo(end.x, end.y)

                    // ctx.lineTo(end.x, end.y);
                    // ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.setLineDash([]);
                    ctx.closePath()

                    if(!(type == 'line' || type == 'dash')) {
                        if(points.length > 3) {
                            endPointDraw(points[points.length - 3], points[points.length - 1], type)

                        }else {
                            endPointDraw(sPos, end, type)
                        }
                    }
                }
            }

            const endPointDraw = (point1, point2, type) => {
                const angleRadians = Math.atan2(point2.y - point1.y, point2.x - point1.x);
                const radius = 15;
                ctx.save();
                ctx.translate(point2.x + game.camera.x, point2.y + game.camera.y);
                ctx.rotate(angleRadians)
                ctx.beginPath()
                if(type.indexOf('cross') != -1) {
                    let p1 = {
                        x : radius * Math.cos(60 / 180 * Math.PI),
                        y : radius * Math.sin(60 / 180 * Math.PI),
                    }

                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(-p1.x, -p1.y);
                    ctx.moveTo(-p1.x, p1.y);
                    ctx.lineTo(p1.x, -p1.y);

                } else if(type.indexOf('arrow') != -1) {
                    let p1 = {
                        x : radius * Math.cos(30 / 180 * Math.PI),
                        y : radius * Math.sin(30 / 180 * Math.PI),
                    }

                    ctx.moveTo(0, 0);
                    ctx.lineTo(-p1.x, -p1.y);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-p1.x, p1.y);

                } else if(type.indexOf('end') != -1) {
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -radius);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, radius);
                }
                // ctx.setLineDash([]);

                ctx.closePath()
                ctx.lineWidth = 2;
                ctx.stroke();

                ctx.restore();
            }

            const backgroundPart = () => {
                const w = windowWidth * 0.8;
                const h = windowHeight * 0.7;

                ctx.save()
                ctx.rotate(-game.camera.angle / 180 * Math.PI)
                if(!!imgAsset['bg']) {
                    ctx.drawImage(imgAsset['bg'], 0, 0, windowWidth / game.camera.scale, windowHeight / game.camera.scale);
                }
                if(!!imgAsset['bg-bottom']) {
                    ctx.drawImage(imgAsset['bg-bottom'], 0, windowHeight * 0.4 / game.camera.scale, windowWidth / game.camera.scale, windowHeight * 0.6 / game.camera.scale);
                }
                ctx.restore();
                if(!!imgAsset[game.stadium]) {
                    ctx.drawImage(imgAsset[game.stadium], mW - w / 2 + game.camera.x, mH - h / 2 + game.camera.y + 20, w, h);
                }
            }

            preLoad();

            window.onGenerateItem = (data) => {
                const {type} = data;
                let w = 30;
                let h = 30;
                console.log(type)
                if(BALL.indexOf(type) != -1) {
                    w=h=20
                }
                if(type == 'p1' || type == 'p2') {
                    w=h=40
                    game.playerNum1++;
                }
                if(type == 'p3' || type == 'p4' || type == 'p5') {
                    w=h=40
                    game.playerNum2++;
                }
                const item = new Item({
                    ...data,
                    imgs : imgAsset,
                    ctx: ctx,
                    h : h,
                    w : w,
                    game : game
                })

                return item;
            }

            const onAddItemRef = (key) => {
                let x = windowWidth / 2 - 100;
                let y = 130;
                let w = 30;
                let h = 30;
                let data = {};
                if(BALL.indexOf(key) != -1) {
                    w=h=20
                }
                if(key == 'p1' || key == 'p2') {
                    w=h=40
                    data.name = game.playerNum1;
                    game.playerNum1++;
                }
                if(key == 'p3' || key == 'p4' || key == 'p5') {
                    w=h=40
                    data.name = game.playerNum2;
                    game.playerNum2++;
                }
                const item = new Item({
                    ...data,
                    x : x,
                    y : y,
                    imgs : imgAsset,
                    ctx: ctx,
                    h : h,
                    w : w,
                    game: game,
                    type : key
                })
        
                items.push(item);
                draw();
            }

            drawCanvas = draw;
            onAddItem1 = onAddItemRef;
        }

    }, [ref]);



  return (
    <SafeAreaView style={{ flex: 1 }}>

        <View {...panResponder.panHandlers}>

            <Canvas style={{ width: '100%', height: '100%', backgroundColor: 'black' }} ref={ref} />
        </View>
        <View style={styles.header}>
            <View style={styles.top_left}>
                <TouchableOpacity style={styles.image} onPress={handleTopMenu.bind(this, 'load')}>
                    <Image source={require('../images/icons/load.png')} />
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.image}>
                    <Image source={require('../images/icons/user.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.image}>
                    <Image source={require('../images/icons/reply.png')} />
                </TouchableOpacity> */}
                {!isShare && <TouchableOpacity style={styles.image} onPress={onItemShowBtn}>
                    <Image source={require('../images/icons/triangle.png')} />
                </TouchableOpacity>}
            </View>

            <View style={styles.top_right}>
                <TouchableOpacity style={styles.image} onPress={handleTopMenu.bind(this, 'setting')}>
                    <Image source={require('../images/icons/setting.png')} />
                </TouchableOpacity>
                {!isShare && <TouchableOpacity style={styles.image}onPress={handleTopMenu.bind(this, 'share')}>
                    <Image source={require('../images/icons/share.png')} />
                </TouchableOpacity>}
                {!isShare && <TouchableOpacity style={styles.image} onPress={handleTopMenu.bind(this, 'save')}>
                    <Image source={require('../images/icons/save.png')} />
                </TouchableOpacity>}
            </View>
        </View>
        <View style={styles.header_down}>
            <TouchableOpacity>
                <Image style={styles.image} source={require('../images/icons/delete.png')} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image style={styles.image} source={require('../images/icons/add.png')} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image style={styles.image} source={require('../images/icons/before.png')} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image style={styles.image} source={require('../images/icons/next.png')} />
            </TouchableOpacity>

            <TouchableOpacity>
                <Image style={styles.image} source={require('../images/icons/stop.png')} />
            </TouchableOpacity>
            <TouchableOpacity>
                <Image style={styles.image} source={require('../images/icons/video.png')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onVideoControlBtn.bind(this, 'stadium')}>
                <Image style={styles.image} source={require('../images/icons/opponent.png')} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onVideoControlBtn.bind(this, 'ball')}>
                <Image style={styles.image} source={require('../images/icons/football.png')}  />
            </TouchableOpacity>
            <TouchableOpacity onPress={onVideoControlBtn.bind(this, 'player')}>
                <Image style={styles.image} source={require('../images/icons/player.png')}  />
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
            <View style={styles.top_left}>
                <TouchableOpacity style={styles.image} onPress={onPathsDirectionBtn.bind(this, 'before')}>
                    <Image source={require('../images/icons/undo.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.image} onPress={onPathsDirectionBtn.bind(this, 'next')}>
                    <Image source={require('../images/icons/do.png')} />
                </TouchableOpacity>
            </View>

            <View style={styles.top_right}>

                <TouchableOpacity onPress={onVideoControlBtn.bind(this, 'angle')}>
                    <Ionicons name='reload-circle-outline' size={24}></Ionicons>
                </TouchableOpacity>
                <TouchableOpacity onPress={onVideoControlBtn.bind(this, 'zoomIn')}>
                    <Image style={styles.image} source={require('../images/icons/zoomIn.png')}  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onVideoControlBtn.bind(this, 'zoomOut')}>
                    <Image style={styles.image} source={require('../images/icons/zoomOut.png')}  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.image} onPress={onClickSetting}>
                    <Image source={require('../images/icons/edit.png')} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.image} onPress={onDeleteItem}>
                    <Image source={require('../images/icons/item_delete.png')} />
                </TouchableOpacity>
            </View>
        </View>

        {isPanVisible && <View style={styles.penBoard}>
            <View style={{...styles.row}}>
                <TouchableOpacity onPress={onSettingPanBoard.bind(this, 'drawLine', 'dash')}>
                    <Image  style={styles.penItem} source={require('../images/icons/pen/6h.png')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onSettingPanBoard.bind(this, 'drawLine', 'line')}>
                    <Image  style={styles.penItem} source={require('../images/icons/pen/65.png')} />
                </TouchableOpacity>
                <TouchableOpacity  onPress={onSettingPanBoard.bind(this, 'drawLine', 'dash-arrow')}>
                    <Image style={styles.penItem} source={require('../images/icons/pen/cR.png')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onSettingPanBoard.bind(this, 'drawLine', 'line-arrow')}>
                    <Image style={styles.penItem} source={require('../images/icons/pen/J3.png')} />
                </TouchableOpacity>
            </View>

            <View style={{...styles.row}}>
                <TouchableOpacity onPress={onSettingPanBoard.bind(this, 'drawLine', 'dash-cross')}>
                    <Image style={styles.penItem} source={require('../images/icons/pen/FW.png')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onSettingPanBoard.bind(this, 'drawLine', 'line-cross')}>
                    <Image style={styles.penItem} source={require('../images/icons/pen/qI.png')} />
                </TouchableOpacity>
                <TouchableOpacity  onPress={onSettingPanBoard.bind(this, 'drawLine', 'dash-end')}>
                    <Image style={styles.penItem} source={require('../images/icons/pen/NS.png')} />
                </TouchableOpacity>
                <TouchableOpacity  onPress={onSettingPanBoard.bind(this, 'drawLine', 'line-end')}>
                    <Image style={styles.penItem} source={require('../images/icons/pen/kA.png')} />
                </TouchableOpacity>
            </View>
        </View>}

        {isItemVisible == 1 && <View style={{...styles.itemColumn, left: 0}}>
            {ITEM_TYPE.map((key, i) => 
                (i < 9 && <TouchableOpacity
                    key={i} 
                    onPress={onAddItem.bind(this, key)}>
                    <Image style={styles.imageSel}  source={images[key]} />
                </TouchableOpacity>)
            )}

        </View>}
        {isItemVisible == 1 && <View style={{...styles.itemColumn, right: 0}}>
            {ITEM_TYPE.map((key, i) => 
                (i >= 9 && <TouchableOpacity
                    key={i} 
                    onPress={onAddItem.bind(this, key)}>
                    <Image style={styles.imageSel}  source={images[key]} />
                </TouchableOpacity>)
            )}

        </View>}

        {isItemVisible == 2 && <View style={{...styles.itemColumn, left: 0}}>
            {BALL.map((key, i) => 
                (<TouchableOpacity
                    key={i} 
                    onPress={onAddItem.bind(this, key)}>
                    <Image style={styles.imageSel}  source={images[key]} />
                </TouchableOpacity>)
            )}

        </View>}

        {isItemVisible == 3 && <View style={{...styles.itemColumn, left: 0}}>
            {PLAYER.map((key, i) => 
                (<TouchableOpacity
                    key={i} 
                    onPress={onAddItem.bind(this, key)}>
                    <Image style={styles.imageSel}  source={images[key]} />
                </TouchableOpacity>)
            )}

        </View>}

        <View style={{justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 150, display: 'none'}}>
            <TouchableOpacity style={styles.modal_item}>
                <Text style={{justifyContent: 'center', fontWeight: '700', fontSize: 20}}>S</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modal_item}>
                <Text style={{justifyContent: 'center', fontWeight: '700', fontSize: 20}}>M</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modal_item}>
                <Text style={{justifyContent: 'center', fontWeight: '700', fontSize: 20}}>L</Text>
            </TouchableOpacity>
        </View>

        {/* <View style={styles.modal}>
            <TouchableOpacity>
                <Image style={styles.modal_item} source={require('../images/stadium/a-football.png')}></Image>
            </TouchableOpacity>
            <TouchableOpacity>
                <Image style={styles.modal_item} source={require('../images/stadium/a-football.png')}></Image>
            </TouchableOpacity>
        </View> */}

        <Modal visible={modalVisible} animationType="fade" onRequestClose={closeModal.bind(this, 'save')}>
            <View style={styles.modal}>
                <InputField 
                    label={"Board Name"}
                    icon={
                        <Ionicons
                        name="person-outline"
                        size={20}
                        color="#666"
                        style={{ marginRight: 5 }}
                        />
                    }
                    value={boardName}
                    onChangeText={(e) => {setBoardName(e)}}
                />

                <TouchableOpacity style={{flexDirection: 'row', borderColor: 'black', paddingHorizontal: 50, justifyContent: 'flex-start', alignItems: 'center', height: 70}} onPress={showDatePicker}>
                    <Ionicons style={{position: 'absolute', left: 10}} name="calendar-outline" size={24}></Ionicons>
                    <Text>{getDateByStr()}</Text>
                    {/* <Calendar /> */}
                </TouchableOpacity>
                <TouchableOpacity style={styles.modal_btn} title="Close Modal" onPress={saveBoard} >
                    <Text>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{...styles.modal_btn, backgroundColor: '#aaa'}} title="Close Modal" onPress={closeModal.bind(this, 'save')} >
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>

        <Modal visible={modalSettingVisible} animationType='fade' onRequestClose={closeModal.bind(this, 'setting')}>
            <View style={styles.modal}>
                <TouchableOpacity style={styles.modal_item} onPress={handleScaleItem.bind(this, 'S')}>
                    <Image style={styles.image_S} source={require('../images/gameIcons/p1.png')}></Image>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modal_item} onPress={handleScaleItem.bind(this, 'M')}>
                    <Image style={styles.image_M} source={require('../images/gameIcons/p1.png')}></Image>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modal_item} onPress={handleScaleItem.bind(this, 'L')}>
                    <Image style={styles.image_L} source={require('../images/gameIcons/p1.png')}></Image>
                </TouchableOpacity>
            </View>
        </Modal>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          date={date}
        />
    </SafeAreaView>
  );
}

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
    header_down: {
        flex: 1,
        width: Dimensions.get('window').width,
        position: 'absolute',
        backgroundColor: "rgba(36, 51, 58, 0.56)",
        top: 56,
        height: 56,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footer: {
        flex: 1,
        width: Dimensions.get('window').width,
        position: 'absolute',
        backgroundColor: 'white',
        height: 56,
        bottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    penBoard: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: 'rgba(36, 51, 58, 0.56)',
        height: 65,
        width: 140,
        bottom: 56,
        right: 0,
    },
    penItem: {
        margin: 2,
        height: 30,
        width: 30
    },

    itemColumn: {
        position: 'absolute',
        width: 50,
        height: Dimensions.get('window').height,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      },
      row: {
        flexDirection: 'row',
      },
      item: {
        width: 100,
        height: 100,
        backgroundColor: 'gray',
        margin: 5,
      },

    top_left: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 100,
        left: 0
    },
    top_right: {
        flexDirection: 'row-reverse',
        justifyContent: "flex-start",
        alignItems: 'center',
        right: 0,
        width: 200
    },
    image: {
        resizeMode: 'stretch',
        margin: 10,
        width: 20,
        height: 20,
    },
    imageSel: {
        resizeMode: 'contain',
        margin: 4,
        width: 40,
        height: 40,
    },
    modal: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 100
    },
    modal_btn: {
        flexDirection: 'column', 
        width: 200, 
        height: 60, 
        borderRadius: 10, 
        backgroundColor: '#BBF246', //#F2F4F7
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal_item: {
        width: 200 * hRate,
        height: 200 * hRate,
        margin: 30 * hRate,
        borderRadius: 50 * hRate,
        backgroundColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image_S: {
        width: 80 * hRate,
        height: 80 * hRate,
        resizeMode: 'contain'
    },
    image_M: {
        width: 120 * hRate,
        height: 120 * hRate,
        resizeMode: 'contain'
    },
    image_L: {
        width: 160 * hRate,
        height: 160 * hRate,
        resizeMode: 'contain'
    },
})