import {
    Dimensions,
  } from "react-native";
export const BASEURL = "http://192.168.144.97:3000";
export const YOUR_PUBLISHABLE_KEY = "pk_test_51OFqZlKNQd6FEMJUAMIpWx4cGLUswxFG90uckIG1Vjxt9sLakZNa8z543h8hQSXPykcFOLn0ZO7OA7w2qOwsERcr00beB0LPqg";

export const hRate = Dimensions.get("window").height / 1280;
export const wRate = Dimensions.get("window").width / 720;

export const TYPE = {
    BOARD : 1,
    ANIM : 2
}

export const BALL = [
    'ball1',
    'ball2',
    'ball3',
    'ball4',
    'ball5',
];

export const PLAYER = [
    'p1',
    'p2',
    'p3',
    'p4',
    'p5',
]

export const ITEM_TYPE = [
    'DISK1',
    'DISK2',
    'DISK3',
    'FO',
    'M',
    'NET1',
    'NET2',
    'NET3',
    'NET4',
    'QB',
    'RING1',
    'RING2',
    'TRI1',
    'TRI2',
    'TRI3',
    'UZ',
    'Y8',
]