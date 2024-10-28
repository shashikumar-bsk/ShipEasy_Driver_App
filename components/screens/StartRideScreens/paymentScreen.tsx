import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRoute, RouteProp, useNavigation, ParamListBase } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import navigation from "../../../Navigation/navigation";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { updatePaymentStatus } from "../../../api-requests/vehicleBookingApi";
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

type PaymentScreenProps = {
  route: RouteProp<ParamListBase, 'PaymentScreen'> & {
    params: {
      rideRequest: RideRequest;
    };
  };
};

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const { rideRequest } = route.params;

  const handleCashCollected = async () => {
    try {
      // Update the payment status and method
      const response = await updatePaymentStatus(rideRequest.bookingId, 'completed', 'cash');
      
      if (response) {
        console.log("Payment status updated successfully:", response);
        
        // Navigate to the success screen here
        navigation.navigate("TabsNavigator");
      } else {
        console.error("Failed to update payment status.");
      }
    } catch (error) {
      console.error("Error during payment status update:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Green Box showing the total amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>₹{rideRequest.totalPrice}</Text>
        <Text style={styles.paymentText}>
          {rideRequest.receiver_name} to Pay in Cash
        </Text>
      </View>

      {/* Cash Collected Button */}
      <TouchableOpacity
        style={styles.cashButton}
        onPress={handleCashCollected} // Call the new function here
      >
        <Text style={styles.cashButtonText}>CASH COLLECTED</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  amountContainer: {
    flex: 1,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  amountText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
  },
  paymentText: {
    fontSize: 20,
    color: "#fff",
    marginTop: 10,
  },
  cashButton: {
    backgroundColor: "#A487E7", // Dark blue button color
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 50,
    marginHorizontal: 16,
  },
  cashButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
