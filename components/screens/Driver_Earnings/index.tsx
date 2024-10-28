import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const driverEarningsData = [
  {
    id: 1,
    driver_id: 123,
    request_id: 456,
    date: '2023-10-26',
    earnings: 150.00,
    daily_earnings: 150.00,
    monthly_earnings: 150.00,
  },
  {
    id: 2,
    driver_id: 123,
    request_id: 789,
    date: '2023-10-26',
    earnings: 200.00,
    daily_earnings: 350.00,
    monthly_earnings: 350.00,
  },
  {
    id: 3,
    driver_id: 123,
    request_id: 1011,
    date: '2023-10-25',
    earnings: 100.00,
    daily_earnings: 100.00,
    monthly_earnings: 100.00,
  },
  {
    id: 4,
    driver_id: 123,
    request_id: 1213,
    date: '2023-10-24',
    earnings: 175.00,
    daily_earnings: 175.00,
    monthly_earnings: 175.00,
  },
];

const DriverEarningsScreen = () => {
  const [driverEarnings, setDriverEarnings] = useState(driverEarningsData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const renderItem = ({ item }:any) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>Request ID: {item.request_id}</Text>
          <Text style={styles.itemDescription}>Date: {item.date}</Text>
          <Text style={styles.itemDescription}>Earnings: ₹ {item.earnings.toFixed(2)}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.itemButton} onPress={() => {}}>
            <Text style={styles.itemButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Earnings</Text>
        <TouchableOpacity style={styles.helpButton}>
          <MaterialIcons name="help-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.earningsSummary}>
          <Text style={styles.earningsTitle}>Earnings Summary</Text>
          <View style={styles.earningsValues}>
            <View style={styles.earningsValue}>
              <Text style={styles.earningsValueTitle}>Today's Earnings:</Text>
              <Text style={styles.earningsValueAmount}>
                ₹ {driverEarnings.reduce((sum, item) => sum + item.daily_earnings, 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.earningsValue}>
              <Text style={styles.earningsValueTitle}>Monthly Earnings:</Text>
              <Text style={styles.earningsValueAmount}>
                ₹ {driverEarnings.reduce((sum, item) => sum + item.monthly_earnings, 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.earningsDetails}>
          <Text style={styles.earningsTitle}>Earnings Details</Text>
          <FlatList
            data={driverEarnings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 25,
    marginBottom: 50,
    marginTop: 50,
    backgroundColor: "#cdd1d0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  helpButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  earningsSummary: {
    marginBottom: 16,
  },
  earningsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  earningsValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsValue: {
    alignItems: 'center',
  },
  earningsValueTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  earningsValueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  earningsDetails: {
    marginBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#777',
  },
  itemActions: {
    padding: 8,
  },
  itemButton: {
    backgroundColor: '#6168c9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  itemButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DriverEarningsScreen;
