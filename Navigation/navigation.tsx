
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TouchableOpacity, Text } from "react-native";
import { useNavigation } from '@react-navigation/native';
import LoginScreen from "../components/screens/Driver_Login/index";
import Otp_form from "../components/screens/Otp/index";
import HomeScreen from "../components/screens/Drive_Home";
import DriverTermsAndConditionsScreen from "../components/screens/Terms&Condition/index"
import { RootStackParamList } from "./types";
import DriverDetailsScreen from "../components/screens/Driver_Profile";
import DriverEarningScreen from "../components/screens/Driver_Earnings/index"
import SplashScreen from "../components/screens/SplashScreen";
import DriverRegistration from "../components/screens/User_SignUp";
import DriverDocuments from "../components/screens/Driver_Documents";
import AadharScreen from "../components/screens/Documents/Aadhar";
import DrivingLicenseScreen from "../components/screens/Documents/DrivingLicense";
import PanCardScreen from "../components/screens/Documents/PanCardScreen";
import EarningsScreen from "../components/screens/Driver_Ride_History";
import RideInProgressScreen from "../components/screens/Drive_Home/RideInProgressScreen";
import Pancard from "../components/screens/Driver_Documents/Pancard";
import DrivingLicense from "../components/screens/Documents/DrivingLicense";
import Rc_document from "../components/screens/Driver_Documents/Rc_document";
import Review_screen from "../components/screens/Driver_Documents/Review_screen";
import Aadhar_document from "../components/screens/Driver_Documents/Aadhar_document";
import Driver_documents from "../components/screens/Driver_Documents/Driver_documents";
import Insurance from "../components/screens/Driver_Documents/Insurance";
// import MainApp from "../components/screens/Drive_Home/AppTabs";
import TabsNavigator from "../components/screens/Drive_Home/AppTabs";
import GoToUserLocationScreen from "../components/screens/StartRideScreens/go_to_userLocationScreen";
import VerifyOtpScreen from "../components/screens/StartRideScreens/verifyOtpScreen";
import PaymentScreen from "../components/screens/StartRideScreens/paymentScreen";
import RideStartScreen from "../components/screens/StartRideScreens/RideStartScreen";
import RideEndScreen from "../components/screens/StartRideScreens/RideEndScreen";


const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyOtp"
        component={Otp_form}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverRegistration"
        component={DriverRegistration}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TabsNavigator"
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
     
      <Stack.Screen
        name="DriverTermsAndConditions"
        component={DriverTermsAndConditionsScreen}
        options={{}}
      />
      <Stack.Screen
        name="Profile"
        component={DriverDetailsScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DriverEarningScreen"
        component={DriverEarningScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="EarningsScreen" component={EarningsScreen} />
      <Stack.Screen
        name="DriverDocuments"
        component={DriverDocuments}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AadharScreen"
        component={AadharScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="DrivingLicenseScreen"
        component={DrivingLicenseScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="PanCardScreen"
        component={PanCardScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="RideInProgressScreen"
        component={RideInProgressScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Pancard"
        component={Pancard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrivingLicense"
        component={DrivingLicense}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Aadhar_document"
        component={Aadhar_document}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Rc_document"
        component={Rc_document}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Review_screen"
        component={Review_screen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Driver_documents"
        component={Driver_documents}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Insurance"
        component={Insurance}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GoToUserLocationScreen"
        component={GoToUserLocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VerifyOtpScreen"
        component={VerifyOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RideStartScreen"
        component={RideStartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RideEndScreen"
        component={RideEndScreen}
        options={{ headerShown: false }}
      />
      
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Drawer.Navigator
      // drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

export default AppNavigator;
