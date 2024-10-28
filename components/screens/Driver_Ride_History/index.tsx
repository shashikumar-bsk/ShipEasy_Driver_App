import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getCompletedOrderByDriverId, getMissedOrderByDriverId } from '../../../api-requests/rideRequest';

const EarningsScreen: React.FC = () => {
  const driver_id = 27;
  
  // Update state variables to hold counts
  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(0);
  const [missedOrdersCount, setMissedOrdersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [completedOrdersData, missedOrdersData] = await Promise.all([
          getCompletedOrderByDriverId(driver_id),
          getMissedOrderByDriverId(driver_id),
        ]);
        
        console.log("completedOrders", completedOrdersData);
        setCompletedOrdersCount(completedOrdersData.completedOrdersCount);

        console.log("missedOrders", missedOrdersData);
        setMissedOrdersCount(missedOrdersData.MissedOrdersCount);
      } catch (err: any) {
        console.log("error", err);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [driver_id]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerText}>₹ 0.0</Text>
          <Text style={styles.headerText}>Today's Earnings</Text>
          <TouchableOpacity>
            <Text style={styles.headerText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.orderSection}>
          <View style={styles.orderCompleted}>
            {/* Dynamically render completed orders count */}
            <Text style={[styles.orderCompletedNumber, styles.greenText]}>
              {completedOrdersCount}
            </Text>
            <Text style={[styles.orderCompletedTitle, styles.greenText]}>
              Completed orders
            </Text>
          </View>
          <View style={styles.orderCompletedValues}>
            <Text style={[styles.orderCompletedValue, styles.greenText]}>
              0.0
            </Text>
            <Text style={[styles.orderCompletedValue, styles.greenText]}>
              ₹ 0.0
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailTitle}>Total KM</Text>
            <Text style={styles.orderDetailValue}>0.0 km</Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailTitle}>Order + Extra earnings</Text>
            <Text style={styles.orderDetailValue}>₹ 0.00</Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailTitle}>Penalty</Text>
            <Text style={styles.orderDetailValue}>-</Text>
          </View>
          <TouchableOpacity style={styles.orderDetailAction}>
            <Text style={styles.orderDetailActionText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.orderSection}>
          <View style={styles.orderCompleted}>
            {/* Dynamically render missed orders count */}
            <Text style={[styles.orderCompletedNumber, styles.redText]}>
              {missedOrdersCount}
            </Text>
            <Text style={[styles.orderCompletedTitle, styles.redText]}>
              Missed orders
            </Text>
          </View>
          <View style={styles.orderCompletedValues}>
            <Text style={[styles.orderCompletedValue, styles.redText]}>₹ 0.0</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailTitle}>Adjustment</Text>
            <Text style={styles.orderDetailValue}>₹ 0.0</Text>
          </View>
          <View style={styles.orderDetail}>
            <Text style={styles.orderDetailTitle}>Penalty</Text>
            <Text style={styles.orderDetailValue}>₹ 0.0</Text>
          </View>
          <TouchableOpacity style={styles.orderDetailAction}>
            <Text style={styles.orderDetailActionText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {  
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#008000',
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionValue: {
    fontSize: 16,
    color: '#333',
  },
  orderSection: {
    marginTop: 16,
  },
  orderItem: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 14,
    color: '#333',
  },
  orderValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  orderCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCompletedNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  orderCompletedTitle: {
    fontSize: 14,
  },
  orderCompletedValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCompletedValue: {
    fontSize: 14,
    marginRight: 16,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderDetail: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  orderDetailTitle: {
    fontSize: 12,
    color: '#333',
  },
  orderDetailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  orderDetailAction: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f2f2f2',
  },
  orderDetailActionText: {
    fontSize: 16,
    color: '#333',
  },
  redText: {
    color: 'red',
  },
  greenText: {
    color: 'green',
  },
});

export default EarningsScreen;
