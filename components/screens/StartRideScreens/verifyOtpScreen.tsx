import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, StatusBar, Alert } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { updateDriverId } from "../../../api-requests/vehicleBookingApi";
import { io, Socket } from 'socket.io-client'; // Importing io and Socket
import config from '../../../api-requests/config';

type RideRequest = {
  sender_name: string;
  otp: string;
  pickupAddress: {
    name: string;
  };
  bookingId: string;
  driver_id: number;
};

type VerifyOtpScreenProps = {
  route: RouteProp<ParamListBase, 'VerifyOtpScreen'> & {
    params: {
      rideRequest: RideRequest;
    };
  };
};

const VerifyOtpScreen: React.FC<VerifyOtpScreenProps> = ({ route }) => {
  const { rideRequest } = route.params;
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [rideStarted, setRideStarted] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null); // Type the socket state

  useEffect(() => {
    // Initialize the socket connection
    const socketInstance: Socket = io(config.SOCKET_URL);
    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const handleOtpChange = (text: string) => {
    setEnteredOtp(text);
  };

  const verifyOtpAndNavigate = async () => {
    Keyboard.dismiss();
    try {
      if (enteredOtp === rideRequest.otp) {
        // Call the API to update the driver_id
        const updatedBooking = await updateDriverId(rideRequest.bookingId, rideRequest.driver_id);
        console.log("DriverId update", updatedBooking);

        if (updatedBooking) {
          setRideStarted(true);
          Alert.alert('Success', 'Ride started successfully!');

          // Notify user and backend that the ride has started via WebSocket
          if (socket) {
            socket.emit('ride_started', {
              driver_id: rideRequest.driver_id,
              bookingId: rideRequest.bookingId,
            });
            console.log("Message sent to backend via socket");
          }

          // Navigate to the RideEndScreen with updated booking details
          navigation.navigate('RideEndScreen', { rideRequest });
        } else {
          Alert.alert('Error', 'Failed to start the ride. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not start the ride. Please try again.');
    }
  };


  return (
    
    <View style={styles.container}>
    {/* Set Status Bar color */}
    <StatusBar backgroundColor="#A487E7" barStyle="light-content" />

    {/* Header */}
    

    {/* OTP Prompt */}
    <Text style={styles.askOtpText}>
      Ask <Text style={styles.boldText}>{rideRequest.sender_name}</Text> for OTP to start trip
    </Text>

    {/* OTP Input Boxes */}
    <View style={styles.otpContainer}>
      <TextInput
        style={styles.otpInput}
        maxLength={4}
        keyboardType="numeric"
        value={enteredOtp}
        onChangeText={handleOtpChange}
        placeholder="----"
        textAlign="center"
      />
    </View>

    {/* Filler space to push payment info and button to the bottom */}
    <View style={{ flex: 1 }} />

    {/* Payment Info */}
    <View style={styles.paymentInfoContainer}>
      <View style={styles.infoRow}>
        <Text style={styles.icon}>ⓘ</Text>
        <Text style={styles.paymentInfoText}>
          If payment status at the end of the ride is "paid Online", then
        </Text>
      </View>
      <Text style={styles.noCashText}>No cash to be collected from the customer</Text>
      <Text style={styles.noMoneyText}>
        No money to be collected via your UPI Apps from the customer
      </Text>
    </View>

    {/* Verify & Start Trip Button */}
    <TouchableOpacity style={styles.verifyButton} onPress={verifyOtpAndNavigate}>
      <Text style={styles.verifyButtonText}>VERIFY & START TRIP</Text>
    </TouchableOpacity>
  </View>
);
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#A487E7',
  },
  backButton: {
    fontSize: 24,
    color: '#001F76',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001F76',
  },
  helpIcon: {
    fontSize: 24,
    color: '#001F76',
  },
  askOtpText: {
    fontSize: 16,
    color: '#001F76',
    marginVertical: 20,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 24,
    backgroundColor: '#E5E5E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '60%',
    textAlign: 'center',
  },
  paymentInfoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 5,
    marginBottom: 15, // Adjusted margin
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 18,
    color: '#001F76',
    marginRight: 10,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#001F76',
  },
  noCashText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 10,
  },
  noMoneyText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  verifyButton: {
    backgroundColor: '#A487E7',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15, // Positioned 15px from the bottom
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifyOtpScreen;
