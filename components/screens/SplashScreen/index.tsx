import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import Swiper from "react-native-swiper";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { RootStackParamList } from "../../../Navigation/types"; // Adjust import path as needed
import { userCookie } from "../../../api-requests/config";
import {jwtDecode} from 'jwt-decode';
 // Adjust import path as needed

// Type for navigation prop
type NavigationProp = StackNavigationProp<RootStackParamList, "SplashScreen">;

const checkAuthentication = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(userCookie);
    return token !== null;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

const LogoAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    setTimeout(() => {
      onComplete();
    }, 3000);
  }, [onComplete]);
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animatable.View
        animation="fadeIn"
        duration={1500}
        style={styles.container}
      >
        <Image
          source={require("../../../assets/images/Eblue.png")}
          style={styles.logo}
        />
        <View style={styles.logoContainer}>
          {["S", "h", "i", "p", "e", "a", "s","e"].map((letter, index) => (
            <Animatable.Text
              key={index}
              animation="bounceIn"
              duration={1500}
              delay={index * 300}
              style={styles.logoLetter}
            >
              {letter}
            </Animatable.Text>
          ))}
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
};

const ScreenContent = ({
  title,
  subtitle,
  description,
  image,
}: {
  title: string;
  subtitle: string;
  description: string;
  image: any;
}) => (
  <Animatable.View animation="fadeIn" duration={1500} style={styles.container}>
    <Image
      source={require("../../../assets/images/Eblue.png")}
      style={styles.logo}
    />
    <Text style={styles.title}>{title}</Text>
    <Animatable.Image
      animation="bounceIn"
      duration={1500}
      source={image}
      style={styles.image}
    />
    <Text style={styles.subtitle}>{subtitle}</Text>
    <Text style={styles.description}>{description}</Text>
  </Animatable.View>
);

const PermissionsPrompt = ({ onComplete }: { onComplete: () => void }) => {
  const requestLocationPermission = async (type: "precise" | "approximate") => {
    try {
      let permission;
      if (type === "precise") {
        permission = await Location.requestForegroundPermissionsAsync();
      } else {
        permission = await Permissions.askAsync(Permissions.LOCATION);
      }

      if (permission.status === "granted") {
        Alert.alert(
          "Permission granted",
          `You have granted ${type} location access.`
        );
      } else {
        Alert.alert(
          "Permission denied",
          `You have denied ${type} location access.`
        );
      }
      onComplete();
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.permissionsContainer}>
        <Text style={styles.permissionsTitle}>
          Allow Shipease to access this device's location?
        </Text>
        <View style={styles.permissionsOptions}>
          <TouchableOpacity
            onPress={() => requestLocationPermission("precise")}
          >
            <View style={styles.permissionOption}>
              <Image
                source={require("../../../assets/images/Precise.png")}
                style={styles.permissionImage}
              />
              <Text style={styles.permissionText}>Precise</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => requestLocationPermission("approximate")}
          >
            <View style={styles.permissionOption}>
              <Image
                source={require("../../../assets/images/Approximate.png")}
                style={styles.permissionImage}
              />
              <Text style={styles.permissionText}>Approximate</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => requestLocationPermission("precise")}
        >
          <Text style={styles.permissionButtonText}>While using the app</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => requestLocationPermission("approximate")}
        >
          <Text style={styles.permissionButtonText}>Only this time</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionButton} onPress={onComplete}>
          <Text style={styles.permissionButtonText}>Don't allow</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const SwiperScreens = () => {
  const navigation = useNavigation<NavigationProp>(); // Get the navigation object

  return (
    <SafeAreaView style={styles.safeArea}>
      <Swiper
        loop={false}
        autoplay={true}
        autoplayTimeout={3}
        showsPagination={true}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
      >
        <View style={styles.slide}>
          <ScreenContent
            title="Introducing"
            subtitle="Food"
            description="Delivering your favorite meals hot and fresh right to your doorstep."
            image={require("../../../assets/images/Food.png")}
          />
        </View>
        <View style={styles.slide}>
          <ScreenContent
            title="Introducing"
            subtitle="Pickup & Drop"
            description="Efficient pickup and drop services to meet your personal and business needs."
            image={require("../../../assets/images/pickup&drop.png")}
          />
        </View>
        <View style={styles.slide}>
          <ScreenContent
            title="Introducing"
            subtitle="Ecommerce"
            description="Fast and reliable ecommerce deliveries to ensure your customers are always satisfied."
            image={require("../../../assets/images/ecommerce.png")}
          />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() =>
              navigation.navigate("LoginScreen", { phone: ""})
            } // Navigate to LoginScreen
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </Swiper>
    </SafeAreaView>
  );
};

const SplashScreen = () => {
  const [showLogoAnimation, setShowLogoAnimation] = useState(true);
  const [showPermissionsPrompt, setShowPermissionsPrompt] = useState(false);
  const navigation = useNavigation<NavigationProp>(); // Get the navigation object

  const handleLogoAnimationComplete = () => {
    setShowLogoAnimation(false);
    setShowPermissionsPrompt(true);
  };

  const handlePermissionsComplete = () => {
    setShowPermissionsPrompt(false);
  };


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
            const driver_id = decodedToken.id; // Adjust according to your JWT structure

            console.log("User ID from token:",driver_id);

            navigation.navigate("TabsNavigator", {
              
              driverId: driver_id,
            });
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

  return showLogoAnimation ? (
    <LogoAnimation onComplete={handleLogoAnimationComplete} />
  ) : showPermissionsPrompt ? (
    <PermissionsPrompt onComplete={handlePermissionsComplete} />
  ) : (
    <SwiperScreens />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoLetter: {
    fontSize: 48,
    fontWeight: "bold",
    color: "skyblue",
    textShadowColor: "skyblue",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  dot: {
    backgroundColor: "rgba(0,0,0,.2)",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#000",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#000",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  skipButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  permissionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  permissionsOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  permissionOption: {
    justifyContent: "center",
    alignItems: "center",
  },
  permissionImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
    marginTop: 30,
  },
  permissionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  permissionButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#1E90FF",
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default SplashScreen;

