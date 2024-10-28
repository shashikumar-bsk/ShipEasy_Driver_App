

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../Navigation/types";
import { sendDriverOTP, verifyDriverOTP, getDriverDetails } from "../../../api-requests/driverOtp";
import { userCookie } from "../../../api-requests/config";
import Icon from "react-native-vector-icons/MaterialIcons";

type VerifyOtpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "VerifyOtp"
>;

type VerifyOtpScreenRouteProp = RouteProp<RootStackParamList, "VerifyOtp">;

type Props = {
  navigation: VerifyOtpScreenNavigationProp;
  route: VerifyOtpScreenRouteProp;
};
const VerifyOtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const params = route.params || {};
  const phone = (params.phone || "").toString();
  const orderId = (params.orderId || "").toString();
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading
  const [isResending, setIsResending] = useState(false); // Separate state for resend OTP


  console.log("Params:", params);
  console.log("Phone (type):", phone, typeof phone);
  console.log("OrderId (type):", orderId, typeof orderId);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));

  const inputRefs = useRef<TextInput[]>([]);

const handleVerifyOtp = async () => {
  const otpCode = otp.join("");
  if (otpCode.length !== 4) {
    Alert.alert("Error", "Please enter the complete OTP");
    return;
  }

  setIsLoading(true);
  try {
    const response = await verifyDriverOTP({ phone, otp: otpCode, orderId });
    console.log("Full response from verifyDriverOTP:", response);

    if (response.message === "OTP Verified Successfully!" && response.token) {
      await AsyncStorage.setItem(userCookie, response.token);
      console.log("Response token ID:", response.token);

      const driverDetails = await getDriverDetails(phone);
      console.log("Driver Details fetched successfully:", driverDetails);

      const driverId = driverDetails?.driverId || driverDetails?.id;
      console.log("Driver ID fetched from API:", driverId);

      switch (driverDetails.document_status) {
        case "pending":
          navigation.navigate("Driver_documents", { driverId, phone });
          break;
        case "under_verification":
          navigation.navigate("Review_screen", { driverId });
          break;
        case "approved":
          navigation.navigate("TabsNavigator");
          break;
        default:
          Alert.alert("Error", "Unexpected document status.");
          break;
      }
    } else if (response.error === "Driver not found") {
      navigation.navigate("DriverRegistration", { phone });
    } else if (response.message.includes("pending")) {
      navigation.navigate("Driver_documents", {
        driverId: response.driverId,
        phone,
      });
    } else if (response.message === "Documents are under verification.") {
      navigation.navigate("Review_screen", { driverId: response.driverId });
    } else {
      Alert.alert("Error", response.message || "Invalid OTP");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    Alert.alert("Error", "Failed to verify OTP");
  } finally {
    setIsLoading(false);
  }
};

  const handleResendOtp = async () => {
    setIsResending(true); // Start loading indicator
    try {
      const response = await sendDriverOTP({ phone });
      if (response.message === "OTP sent successfully") {
        Alert.alert("Success", "OTP Resent Successfully!");
      } else {
        Alert.alert("Error", response.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
      setIsResending(false); // Stop loading indicator
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#d5d8dc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification </Text>
      </View>
      <View style={styles.otpContainer}>
        <StatusBar
          backgroundColor="#37474F" // Same color as the header
          barStyle="dark-content" // You can use 'light-content' if needed for white text/icons
        />
        <Text style={styles.otpLabel}>Enter the OTP sent to {phone}:</Text>
        <View style={styles.otpInputsContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref!)}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(index, nativeEvent.key)
              }
              keyboardType="numeric"
              maxLength={1}                     
              blurOnSubmit={false}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleVerifyOtp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Verify</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resendButton, isResending && styles.disabledButton]}
          onPress={handleResendOtp}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator size="small" color="#37474F" />
          ) : (
            <Text style={styles.resendButtonText}>Resend OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  otpContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
    alignItems: "center",
  },
  otpLabel: {
    fontSize: width * 0.04, // 4% of screen width for label size
    marginBottom: height * 0.03, // 1% of screen height for spacing
  },
  otpInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: height * 0.05, // 2% of screen height for spacing
    width: "90%", // Relative to screen width
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: height * 0.015, // 1.5% of screen height for input padding
    width: width * 0.12, // 12% of screen width for input box size
    height: width * 0.12, // Square box based on width percentage
    textAlign: "center",
    marginRight: width * 0.02, // 2% of screen width for spacing
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    // elevation: 2,
  },
  resendButton: {
    backgroundColor: "#FFA500",
    paddingVertical: height * 0.02, // 2% of screen height for button padding
    borderRadius: 5,
    width: "90%", // Relative to screen width
    alignItems: "center",
  },
  resendButtonText: {
    color: "#fff",
    fontSize: width * 0.045, // 4.5% of screen width for font size
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: height * 0.02, // 2% of screen height for button padding
    borderRadius: 5,
    width: "90%", // Relative to screen width
    alignItems: "center",
    marginBottom: height * 0.015, // 1.5% of screen height for spacing
  },
  submitButtonText: {
    color: "#fff",
    fontSize: width * 0.045, // 4.5% of screen width for font size
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.03, // 3% of screen width
    backgroundColor: "#37474F",
  },
  headerTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "bold",
    color: "#d5d8dc",
    marginLeft: width * 0.03, // 3% of screen width
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#B0BEC5", // Lighter color to indicate disabled state
  },
});


export default VerifyOtpScreen;

