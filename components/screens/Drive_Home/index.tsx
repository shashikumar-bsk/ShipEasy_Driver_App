import React, { useState, useEffect, useCallback, useRef } from "react";
import { StyleSheet, Text, View, Switch, StatusBar, Alert, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase, useFocusEffect } from "@react-navigation/native";
import { updateDriverStatus, getDriverRouter } from "../../../api-requests/driver";
import { io, Socket } from "socket.io-client";
import config, { userCookie } from "../../../api-requests/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { jwtDecode } from "jwt-decode";

// RideRequest type
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

type HomeScreenProps = {
  navigation: DrawerNavigationProp<ParamListBase>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [driverId, setDriverId] = useState<number | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [isOnDuty, setIsOnDuty] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [drivername, setDriverName] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeSocket = () => {
      const newSocket = io(config.SOCKET_URL);
      setSocket(newSocket);
      return () => newSocket.disconnect();
    };

    initializeSocket();
  }, []);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/Ringtone/shashi.mp3")
    );
    setSound(sound);
    await sound.playAsync();
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem(userCookie);
        if (!token) throw new Error("Token not found in AsyncStorage");

        const decodedToken: any = jwtDecode(token);
        const { id: driverId, phone } = decodedToken;

        if (driverId) setDriverId(parseInt(driverId));
        if (phone) setPhone(phone);
      } catch (error) {
        Alert.alert("Error", "Failed to retrieve user information.");
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchVehicleType();
    }
  }, [driverId]);

  const fetchVehicleType = async () => {
    try {
      if (!driverId) return;
      const numericDriverId = driverId;
      const response = await getDriverRouter(numericDriverId);
      if (response) {
        if (response.vehicle_type) setVehicleType(response.vehicle_type);
        if (response.driver_name) setDriverName(response.driver_name);
        if (response.vehicle_number) setVehicleNumber(response.vehicle_number);
      }
    } catch (error: any) {
      Alert.alert("Error", "Vehicle type not found.");
    }
  };

  useEffect(() => {
    const getOnDutyStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem("isOnDuty");
        if (storedStatus !== null) {
          setIsOnDuty(JSON.parse(storedStatus));
        }
      } catch (error) {
        console.error("Error retrieving on-duty status from AsyncStorage", error);
      }
    };

    getOnDutyStatus();
  }, []);

  useEffect(() => {
    getLocation();

    if (socket) {
      socket.on("BOOKING_REQUEST", (request: RideRequest) => {
        if (isOnDuty) {
          setRideRequest(request);
          setModalVisible(true);
          playSound();
        } else {
          console.log("Booking request received, but driver is off duty. Ignoring request.");
        }
      });

      return () => {
        socket.off("BOOKING_REQUEST");
      };
    }
  }, [socket, isOnDuty]);

  const handleAcceptRequest = (request: RideRequest) => {
    if (socket) {
      socket.emit("DRIVER_RESPONSE", {
        bookingId: request.bookingId,
        driver_id: request.driver_id,
        status: "accepted",
      });
      setRideRequest(null);
      setModalVisible(false);
      stopSound();
      navigation.navigate("GoToUserLocationScreen", {
        request: request,
        isOnDuty: isOnDuty,
      });
    }
  };

  const handleRejectRequest = () => {
    if (rideRequest && socket) {
      socket.emit("DRIVER_RESPONSE", {
        bookingId: rideRequest.bookingId,
        driver_id: rideRequest.driver_id,
        status: "rejected",
      });
      setRideRequest(null);
      setModalVisible(false);
      stopSound();
      Alert.alert("Ride Rejected", "You have rejected the ride.");
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location.");
    }
  };

  const emitDriverLocation = useCallback(() => {
    if (socket && isOnDuty && location && vehicleType) {
      locationInterval.current = setInterval(() => {
        socket.emit("REGISTER_DRIVER", {
          driver_id: driverId,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          driver_name: drivername,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        // console.log("Emitting REGISTER_DRIVER");
        socket.emit("driverLocation", {
          driver_id: driverId,
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
          driver_name: drivername,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        // console.log("emitting driver location");
      }, 1000);
    }
  }, [socket, isOnDuty, location, driverId, vehicleType, vehicleNumber, drivername]);


  useFocusEffect(
    useCallback(() => {
      if (isOnDuty) {
        emitDriverLocation();
      }

      return () => {
        if (locationInterval.current) clearInterval(locationInterval.current);
      };
    }, [emitDriverLocation, isOnDuty])
  );

  const toggleSwitch = async () => {
    const newStatus = !isOnDuty;
    setIsOnDuty(newStatus);
    setShowMap(newStatus);
  
    await AsyncStorage.setItem("isOnDuty", JSON.stringify(newStatus));
  
    try {
      // Check if driverId is not null before updating the status
      if (driverId !== null) {
        const response = await updateDriverStatus(driverId, newStatus);
        
  
        if (newStatus) {
          // Driver is going on-duty; start emitting location
          emitDriverLocation();
        } else {
          // Driver is going off-duty; stop location interval and emit off-duty status
          if (locationInterval.current) clearInterval(locationInterval.current);
          socket?.emit("driverStatus", { driverId, status: "offDuty" });
        }
      } else {
        console.warn("Driver ID is null; cannot update status.");
      }
    } catch (error) {
      console.error("Error updating driver status:", error);
      Alert.alert("Error", "Failed to update the driver status.");
    }
  };
  
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

       {/* Modal for New Ride Request */}
       {rideRequest && (
  <Modal
    visible={modalVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalCard}>

        {/* Payment Section */}
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentMethod}>CASH PAYMENT</Text>
          <Text style={styles.price}>₹{rideRequest.totalPrice}</Text>
          <View style={styles.rideDetails}>
            <Text style={styles.rideDetailText}>{rideRequest.vehicleName}</Text>
            {/* <Text style={styles.rideDetailText}>• {rideRequest.distance} Km</Text> */}
            {/* <Text style={styles.rideDetailText}>• {rideRequest.rideDuration} Min</Text> */}
          </View>
        </View>

        {/* Ride Locations */}
        <View style={styles.locationsContainer}>
          {/* Pickup */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color="green" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationTitle}>{rideRequest.pickupAddress.name}</Text>
              {/* <Text style={styles.locationSubtitle}>{rideRequest.pickupAddress.details}</Text> */}
            </View>
          </View>

          {/* Dropoff */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color="red" />
            <View style={styles.locationDetails}>
              <Text style={styles.locationTitle}>{rideRequest.dropoffAddress.name}</Text>
              {/* <Text style={styles.locationSubtitle}>{rideRequest.dropoffAddress.details}</Text> */}
            </View>
          </View>
        </View>

        {/* Button Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAcceptRequest(rideRequest)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={handleRejectRequest}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}

      {/* Header with toggle and notification */}
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          <Text style={styles.switchText}>
            {isOnDuty ? "ON DUTY" : "OFF DUTY"}
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isOnDuty ? "#f59bea" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isOnDuty}
          />
        </View>

        {/* Notification Icon */}
        <Ionicons
          name="notifications-outline"
          size={30}
          color="black"
          style={styles.notificationIcon}
        />
      </View>

      {/* Earnings Section */}
      <View style={styles.earningsContainer}>
        <Text style={styles.earningsText}>Today's Earnings</Text>
        <View style={styles.earningsValue}>
          <Text style={styles.earningsValueText}>₹0</Text>
          <Ionicons name="caret-down-outline" size={18} color="black" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {showMap && isOnDuty && location ? (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="Driver's Location"
              />
            </MapView>
          </View>
        ) : (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Good Afternoon, Captain</Text>
            <Ionicons
              name="sunny-outline"
              size={30}
              color="#f5dd4b"
              style={styles.sunIcon}
            />
            <Text style={styles.messageText}>Go ON DUTY to start earning</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    position: "relative",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d8f9ef",
    padding: 3,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: "50%",
  },
  switchText: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  notificationIcon: {
    position: "absolute",
    right: 20,
  },
  earningsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  earningsText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  earningsValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  earningsValueText: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  messageContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  messageText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sunIcon: {
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#e7defc',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 0,
  },
  
  paymentContainer: {
    backgroundColor: '#e7defc',
    padding: 15,
    alignItems: 'center',
  },
  paymentMethod: {
    color: '#3951b4', // Dark blue
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  rideDetailText: {
    fontSize: 14,
    color: '#555',
  },
  locationsContainer: {
    borderTopRightRadius: 35,
    borderTopLeftRadius:35,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  locationDetails: {
    marginLeft: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#a487e7',
  },
  rejectButton: {
    backgroundColor: 'rgb(122, 115, 150)', 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
