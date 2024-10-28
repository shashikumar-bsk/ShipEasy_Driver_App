import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { RouteProp } from "@react-navigation/native";
import { ParamListBase } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import axios from "axios";
import config from "../../../api-requests/config";
import { io, Socket } from "socket.io-client";

type RideRequest = {
  bookingId: string;
  userId: number;
  driver_id: number;
  pickupAddress: {
    name: string;
    latitude: number;
    longitude: number;
  };
  dropoffAddress: {
    name: string;
    latitude: number;
    longitude: number;
  };
  totalPrice: number;
  vehicleName: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  otp: string;
};


type GoToUserLocationScreenProps = {
  navigation: DrawerNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, "GoToUserLocationScreen"> & {
    params: {
      request: RideRequest; 
    };
  };
};

const GOOGLE_MAPS_API_KEY = config.GOOGLE_API_KEY; // Replace with your API key

const GoToUserLocationScreen: React.FC<GoToUserLocationScreenProps> = ({ route, navigation }) => {
  const { request } = route.params;
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [driverCoords, setDriverCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  
  useEffect(() => {
    const socketInstance: Socket = io(config.SOCKET_URL); // Initialize Socket.IO instance
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server with ID:", socketInstance.id);
      socketInstance.emit("associateSocketWithDriver", {
        driver_id: request.driver_id,
        socketId: socketInstance.id
      });
    });

    // Listen for trip cancellation
    socketInstance.on("TRIP_CANCELLED_BY_USER", (data) => {
      const { bookingId, message } = data;

      // Show alert popup for cancellation
      Alert.alert(
        "Ride Cancelled",
        message,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to the home screen when the user clicks OK
              navigation.navigate("TabsNavigator"); // Adjust the route name as needed
            },
          },
        ],
        { cancelable: false }
      );
    });

    // Handle other events as needed
    socketInstance.on("rideStatusUpdate", (data: any) => {
      if (data.status === "ride_started") {
        Alert.alert(
          "Ride Started",
          `Your ride with driver ${data.driver_name} (Vehicle: ${data.vehicle_type} - ${data.vehicle_number}) has started.`
        );
        navigation.navigate("RideStartScreen", { rideRequest: request });
      }
    });

    socketInstance.on("error", (error: any) => {
      console.error("Socket error:", error);
    });

    return () => {
      socketInstance.disconnect(); // Clean up on unmount
    };
  }, [navigation, request.driver_id]);
  // Function to get directions from Google Maps API
  const getDirections = async (startLoc: { latitude: number; longitude: number }, destinationLoc: { latitude: number; longitude: number }) => {
    const start = `${startLoc.latitude},${startLoc.longitude}`;
    const destination = `${destinationLoc.latitude},${destinationLoc.longitude}`;
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`
      );
  
      // Log the response for debugging
      // console.log('Directions API response:', response.data);
  
      if (response.data.routes && response.data.routes.length > 0) {
        const points = decodePolyline(response.data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      } else {
        console.error('No routes found in the response');
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };
  

  // Decode polyline (Google Directions API returns encoded points)
  const decodePolyline = (t: string) => {
    let points: Array<{ latitude: number; longitude: number }> = [];
    let index = 0,
      len = t.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b, shift = 0,
        result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  // Watch for driver's location changes in real time
  useEffect(() => {
    const watchDriverLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Watch position for live updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 5, // Update after every 5 meters
        },
        (newLocation) => {
          setDriverLocation(newLocation);
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };
          setDriverCoords(newCoords);

          // Fetch directions from driver's new location to pickup location
          getDirections(newCoords, {
            latitude: request.pickupAddress.latitude,
            longitude: request.pickupAddress.longitude,
          });
        }
      );
    };

    watchDriverLocation();
  }, []);

  const handleStartRide = () => {
    navigation.navigate("RideStartScreen", { rideRequest: request });
  };

  if (!driverCoords) {
    return (
      <View>
        <Text>Loading driver location...</Text>
      </View>
    );
  }

  const pickupLocation = {
    latitude: request.pickupAddress.latitude,
    longitude: request.pickupAddress.longitude,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: driverCoords.latitude,
          longitude: driverCoords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Driver's Location Marker */}
        <Marker
          coordinate={driverCoords}
          title="Your Location"
          description="Driver's current location"
        />

        {/* User's Pickup Location Marker */}
        <Marker
          coordinate={pickupLocation}
          title="Pickup Location"
          description={request.pickupAddress.name}
        />

        {/* Polyline showing the route between driver and user */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#0000FF"
          strokeWidth={3}
        />
      </MapView>

      <TouchableOpacity style={styles.button} onPress={handleStartRide}>
        <Text style={styles.buttonText}>Arrived at Pickup</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#A487E7",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default GoToUserLocationScreen;
