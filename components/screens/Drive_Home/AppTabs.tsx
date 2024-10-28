import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "."; // Import your HomeScreen component
import DriverDetailsScreen from "../Driver_Profile";
import { ParamListBase, RouteProp } from "@react-navigation/native";
import { View, Text, StyleSheet, Alert } from "react-native";
import { RootStackParamList } from "../../../Navigation/types";
import DriverDashboard from "../DriverDashboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userCookie } from "../../../api-requests/config";
import { jwtDecode } from "jwt-decode";


// Define your Tab navigator
const Tab = createBottomTabNavigator<RootStackParamList>();

type TabsNavigatorProps = {};

// Placeholder screens for tabs (if needed)
const EarningsScreenPlaceholder = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Earnings Screen</Text>
  </View>
);
const DriverDashboardScreenPlaceholder = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Driver Dashboard Screen</Text>
  </View>
);

const TabsNavigator: React.FC<TabsNavigatorProps> = () => {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);


  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem(userCookie);
        if (!token) throw new Error("Token not found in AsyncStorage");

        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // Log the entire decoded token

        const { id: driverId, phone } = decodedToken;

        if (driverId) {
          setDriverId(driverId);
          console.log("Driver ID:", driverId); // Log driverId
        }

        if (phone) {
          setPhone(phone); // Set phone in state
          console.log("Phone:", phone); // Log phone
        } else {
          console.error("Phone number not found in token");
          Alert.alert("Error", "Phone number not found in token.");
        }
      } catch (error) {
        console.error("Failed to decode token or retrieve data:", error);
        Alert.alert("Error", "Failed to retrieve user information.");
      }
    };
    initialize();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap | undefined;

          if (route.name === "HomeScreen") {
            iconName = "home-outline";
          } else if (route.name === "Profile") {
            iconName = "person-outline";
          } else if (route.name === "DriverDashboard") {
            iconName = "speedometer-outline";
          } else if (route.name === "EarningsScreen") {
            iconName = "cash-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#42a5f5",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          height: 60, // Standard tab bar height
          backgroundColor: "#fff",
          borderTopWidth: 0.5,
          borderTopColor: "#ddd", // To match the subtle line seen in your image
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={DriverDetailsScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="DriverDashboard"
        component={DriverDashboard}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="EarningsScreen"
        component={EarningsScreenPlaceholder}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});

export default TabsNavigator;
