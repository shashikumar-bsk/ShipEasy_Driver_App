import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert, TextInput } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { RouteProp } from "@react-navigation/native";
import { ParamListBase } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import config from "../../../api-requests/config";

type RideRequest = {
  bookingId: string;
  userId: number;
  driverId: number;
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

type RideEndScreenProps = {
  navigation: DrawerNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, "RideEndScreen"> & {
    params: {
      rideRequest: RideRequest;
    };
  };
};

const GOOGLE_MAPS_API_KEY = config.GOOGLE_API_KEY; // Replace with your API key

const RideEndScreen: React.FC<RideEndScreenProps> = ({ route, navigation }) => {
  const { rideRequest } = route.params;
  const [driverLocation, setDriverLocation] = useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Function to get directions from Google Maps API
  const getDirections = async (startLoc: { latitude: number; longitude: number }, destinationLoc: { latitude: number; longitude: number }) => {
    const start = `${startLoc.latitude},${startLoc.longitude}`;
    const destination = `${destinationLoc.latitude},${destinationLoc.longitude}`;
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`
      );
      // console.log("Directions API response:", response.data);

      if (response.data.routes && response.data.routes.length > 0 && response.data.routes[0].overview_polyline) {
        const points = decodePolyline(response.data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      } else {
        console.error("No routes found or overview_polyline missing");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  // Decode polyline
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

  // Function to handle ending the ride
  const endRide = () => {
    try {
      // Show an alert for ride completion
      Alert.alert("Ride completed!", "You have completed the ride.");
  
      // Navigate to PaymentScreen and pass the rideRequest as a parameter
      navigation.navigate("PaymentScreen", { rideRequest });
  
    } catch (error) {
      console.error("Error completing ride:", error);
      Alert.alert("Error", "Could not complete ride.");
    }
  };
  

  // Watch for driver's location changes in real time
  useEffect(() => {
    const watchDriverLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (newLocation) => {
          setDriverLocation(newLocation);
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };

          // Fetch directions from driver's new location to drop-off location
          getDirections(newCoords, {
            latitude: rideRequest.dropoffAddress.latitude,
            longitude: rideRequest.dropoffAddress.longitude,
          });
        }
      );
    };

    watchDriverLocation();
  }, []);

  if (!driverLocation) {
    return (
      <View>
        <Text>Loading driver location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: driverLocation.coords.latitude,
          longitude: driverLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Driver's Location Marker */}
        <Marker
          coordinate={{
            latitude: driverLocation.coords.latitude,
            longitude: driverLocation.coords.longitude,
          }}
          title="Your Location"
        />

        {/* Dropoff Location Marker */}
        <Marker
          coordinate={{
            latitude: rideRequest.dropoffAddress.latitude,
            longitude: rideRequest.dropoffAddress.longitude,
          }}
          title="Dropoff Location"
          description={rideRequest.dropoffAddress.name}
        />

        {/* Polyline showing the route between driver and drop-off location */}
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF0000"
          strokeWidth={3}
        />
      </MapView>

        <TouchableOpacity style={styles.buttonEnd} onPress={endRide}>
          <Text style={styles.buttonText}>End Ride</Text>
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
  otpInput: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonEnd: {
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
    color: "#fff",
    fontSize: 18,
  },
});

export default RideEndScreen;
