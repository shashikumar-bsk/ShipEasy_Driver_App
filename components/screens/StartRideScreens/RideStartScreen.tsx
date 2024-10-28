import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking,StatusBar , Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome';


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

type RideStartScreenProps = {
  route: RouteProp<ParamListBase, 'RideStartScreen'> & {
    params: {
      rideRequest: RideRequest; 
    };
  };
};

const RideStartScreen: React.FC<RideStartScreenProps> = ({ route }) => {
  const { rideRequest } = route.params;
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const [timeLeft, setTimeLeft] = useState(300); // Time in seconds (5 minutes)
  const pickupLocation = rideRequest.pickupAddress;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleCallSender = () => {
    Linking.openURL(`tel:${rideRequest.sender_phone}`);
  };

  const handleStartRide = () => {
    // Navigate to the next screen or start trip functionality
    navigation.navigate('VerifyOtpScreen', { rideRequest });
  };

  return (
    <View style={styles.container}>
      {/* Set Status Bar color */}
      <StatusBar backgroundColor="#A487E7" barStyle="light-content" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <Text style={styles.waitText}>WAIT FOR</Text>
        <Text style={styles.senderName}>{rideRequest.sender_name}</Text>
        <TouchableOpacity onPress={handleCallSender}>
          <Icon name="phone" size={24} color="#000" style={styles.callIcon} />
        </TouchableOpacity>
      </View>

      {/* Location Details */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>{pickupLocation.name}</Text>
        <TouchableOpacity>
          <Text style={styles.navigateText}>NAVIGATE</Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker
          coordinate={{ latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }}
          title="Pickup Location"
          description={pickupLocation.name}
        />
      </MapView>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <Text style={styles.arrivalText}>CUSTOMER TO ARRIVE IN</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        <TouchableOpacity style={styles.startTripButton} onPress={handleStartRide}>
          <Text style={styles.startTripText}>START TRIP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#A487E7',
    padding: 10,
    paddingHorizontal: 25,
  },
  waitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  senderName: {
    color: 'white',
    fontSize: 16,
  },
  callIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  navigateText: {
    fontSize: 16,
    color: '#001F76',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  arrivalText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  timer: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  startTripButton: {
    backgroundColor: '#A487E7',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  startTripText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideStartScreen;