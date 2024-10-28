
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../Navigation/types'; // Import type from the correct location
import { sendDriverOTP } from '../../../api-requests/driverOtp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userCookie } from '../../../api-requests/config';
import { jwtDecode } from "jwt-decode";

const checkAuthentication = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(userCookie);
    return token !== null;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [phone, setPhone] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthentication();
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");

        console.log("isAuthenticated:", isAuthenticated);
        console.log("isLoggedIn:", isLoggedIn);

        if (isAuthenticated || isLoggedIn === "true") {
          const token = await AsyncStorage.getItem(userCookie);
          if (token) {
            console.log("Token retrieved from AsyncStorage:", token); // Debug log
            const decodedToken: any = jwtDecode(token);
            const driverId = decodedToken.id; // Adjust according to your JWT structure

            console.log("User ID from token:", driverId);

            navigation.navigate("TabsNavigator" as never);
          } else {
            console.error("Token not found in AsyncStorage");
          }
        } else {
          console.log("User is not authenticated or not logged in");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [navigation]);

  const handlePress = () => {
    Linking.openURL("https://www.example.com");
  };

  const validatePhoneNumber = (number: string) => {
    // Regex to allow exactly 10 digits
    const phoneRegex = /^[6-9]\d{9}$/; // Ensures the number starts with 6, 7, 8, or 9 and has 10 digits

    // Reject repeated sequences like "7777777777", "0000000000", etc.
    const repeatedNumberRegex = /^(\d)\1{9}$/; // Checks if all digits are the same

    // First, check if the number matches the valid phone number pattern
    if (!phoneRegex.test(number)) {
      return false;
    }

    // Then, reject numbers with repeated digits
    if (repeatedNumberRegex.test(number)) {
      return false;
    }

    return true; // Number is valid if both checks pass
  };
  const handleSendOtp = async () => {
    if (!phone) {
      setError("Phone number is required");
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    setIsLoading(true); // Start loading indicator

    try {
      const response = await sendDriverOTP({ phone });
      if (response.orderId) {
        // OTP sent successfully
        console.log("OTP sent successfully");
        await AsyncStorage.setItem("isLoggedIn", "true");
        navigation.navigate("VerifyOtp", { phone, orderId: response.orderId }); // Pass phone as parameter
      } else {
        console.error(response.error);
        setError(response.error);
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.maindrivercontainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.logonamebox}>
        <Text style={styles.headerTex}>Shipease Partner</Text>
      </View>

      <Image
        source={require("../../../assets/images/IMG_20240625_223804__1_-removebg.png")}
        style={styles.logoElemove}
      />

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.textbox}>Welcome</Text>
            <Text style={styles.textboxpara}>
              With a valid number, you can access deliveries and our other
              services.
            </Text>
          </View>
          <View style={styles.mobilenumbercontainer}>
            <TextInput
              label="Phone Number"
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.mobileTextInput}
              outlineColor={error ? "red" : "gray"} // border color when inactive
              activeOutlineColor={error ? "red" : "#017ce8"} // border color when focused
              error={!!error}
              maxLength={10}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#37474F" /> // Loader
        ) : (
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.disabledButton, // Disable styling
            ]}
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  maindrivercontainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    height: "95%",
  },
  logonamebox: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    height: "55%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoElemove: {
    width: "100%",
    height: "35%",
    resizeMode: "cover",
    borderRadius: 15,
  },
  headerTex: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  formContainer: {
    marginTop: 40,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  welcomeContainer: {
    height: "50%",
    alignItems: "flex-start",
    justifyContent: "flex-end",
  },
  textbox: {
    fontSize: 24,
    color: "#000",
    marginLeft: 20,
    fontWeight: "bold",
  },
  textboxpara: {
    marginLeft: 20,
    marginRight: 10,
  },
  inputContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: "auto",
    width: "100%",
  },
  mobileTextInput: {
    height: 50,
    width: "100%",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "white",
  },
  submitButton: {
    backgroundColor: "#37474F",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: "center",
    width:"100%"
  },
  mobilenumbercontainer: {
    flexDirection: "column",
    width: "89%",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "red",
    marginTop: 5,
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

export default LoginScreen;


