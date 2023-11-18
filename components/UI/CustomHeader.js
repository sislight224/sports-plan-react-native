import { Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function CustomHeader({onBackPress, title, color}) {
    return (
        <View style={{
            height: 80,
            zIndex: 10000,
            flex: 1, 
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color
        }}>
            <TouchableOpacity 
                style={{
                    position: 'absolute',
                    left: 10,
                    flexDirection: 'column'
                }}
                onPress={onBackPress}
            >
                <Ionicons name="arrow-back-outline" size={24} ></Ionicons>
            </TouchableOpacity>
            <Text style={{
                fontSize: 27,
                fontWeight: '800',
                flexDirection: 'column'
            }}>{title}</Text>

        </View>

    )
}