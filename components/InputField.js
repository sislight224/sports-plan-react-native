import React, { useContext } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { colors } from "../config/theme";
import { ThemeContext } from "../context/ThemeContext";

export default function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  onChangeText,
  value
}) {
  const { theme } = useContext(ThemeContext);
  let activeColors = colors[theme.mode];

  console.log(activeColors.primary, theme.mode);

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
      }}
    >
      {icon}
      {inputType == "password" ? (
        <TextInput
          placeholderTextColor={activeColors.text}
          placeholder={label}
          keyboardAppearance={activeColors.primary}
          keyboardType={keyboardType}
          style={{ flex: 1, paddingVertical: 0, color: activeColors.tint }}
          secureTextEntry={true}
          onChangeText={onChangeText}
          value={value}
        />
      ) : (
        <TextInput
          placeholderTextColor={activeColors.text}
          placeholder={label}
          keyboardAppearance={activeColors.primary}
          keyboardType={keyboardType}
          style={{ flex: 1, paddingVertical: 0, color: activeColors.tint }}
          onChangeText={onChangeText}
          value={value}
        />
      )}
      <TouchableOpacity onPress={fieldButtonFunction}>
        <Text style={{ color: activeColors.accent, fontWeight: "700" }}>
          {fieldButtonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
