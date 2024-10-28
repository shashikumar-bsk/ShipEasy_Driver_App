import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Dimensions, ScrollView, StyleSheet, Animated, Image, RefreshControl } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode'; 
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import config, { userCookie } from '../../../api-requests/config';

const socket = io(`${config.SOCKET_URL}`); 

type JwtPayload = {
  id: string;
};

const DriverDashboard: React.FC = () => {
  const [driverId, setDriverId] = useState<string | null>(null);
  const [ridesCompleted, setRidesCompleted] = useState(0);
  const [ridesCancelled, setRidesCancelled] = useState(0);
  const [ridesInProgress, setRidesInProgress] = useState(0);
  const [ongoingRides, setOngoingRides] = useState(0);
  const [performance, setPerformance] = useState({});
  const [headerAnim] = useState(new Animated.Value(-500));
  const [rotateAnim1] = useState(new Animated.Value(0));
  const [rotateAnim2] = useState(new Animated.Value(0));
  const [rotateAnim3] = useState(new Animated.Value(0));
  const [rotateAnim4] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false); // For refresh functionality

  useEffect(() => {
    const fetchDriverIdFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem(userCookie);
        if (token) {
          const decoded: JwtPayload = jwtDecode(token);
          setDriverId(decoded.id);
          socket.emit('fetchDriverData', decoded.id);
        } else {
          Alert.alert('Error', 'Token is not available');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch or decode token');
      }
    };

    fetchDriverIdFromToken();

    socket.on('rideData', (data) => {
      setRidesCompleted(data.completed || 0);
      setRidesCancelled(data.cancelled || 0);
      setRidesInProgress(data.inProgress || 0);
      setOngoingRides(data.ongoing || 0);
      setPerformance(data.performance || {});
      triggerRotationAnimation();
    });

    Animated.spring(headerAnim, {
      toValue: 0,
      friction: 3,
      useNativeDriver: true,
    }).start();

    return () => {
      socket.off('rideData');
      socket.disconnect();
    };
  }, []);

  const triggerRotationAnimation = () => {
    rotateAnim1.setValue(0);
    rotateAnim2.setValue(0);
    rotateAnim3.setValue(0);
    rotateAnim4.setValue(0);

    Animated.stagger(100, [
      Animated.timing(rotateAnim1, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(rotateAnim2, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(rotateAnim3, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(rotateAnim4, { toValue: 1, duration: 1000, useNativeDriver: true })
    ]).start();
  };

  const rotateInterpolation = (anim: Animated.Value) => anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const chartData = {
    labels: ['Completed', 'Cancelled', 'In Progress', 'Ongoing'],
    datasets: [{ data: [ridesCompleted, ridesCancelled, ridesInProgress, ongoingRides], color: () => '#007AFF' }],
  };

  const screenWidth = Dimensions.get('window').width;

  const onRefresh = async () => {
    setRefreshing(true);
    if (driverId) {
      socket.emit('fetchDriverData', driverId);
      triggerRotationAnimation();
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.headerContainer}>
        <Icon name="motorcycle" size={40} color="#007AFF" style={styles.bikeIcon} />
        <Animated.Text style={[styles.header, { transform: [{ translateX: headerAnim }] }]}>
          Driver Dashboard
        </Animated.Text>
        <Image source={{ uri: 'https://example.com/car.png' }} style={styles.carImage} />
      </View>

      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        style={styles.chartStyle}
      />

      <View style={styles.metricsContainer}>
        <Animated.View style={[styles.metricCard, { transform: [{ rotate: rotateInterpolation(rotateAnim1) }] }]}>
          <Text style={styles.metricTitle}>Completed Rides</Text>
          <Text style={styles.metricValue}>{ridesCompleted}</Text>
        </Animated.View>
        <Animated.View style={[styles.metricCard, { transform: [{ rotate: rotateInterpolation(rotateAnim2) }] }]}>
          <Text style={styles.metricTitle}>Cancelled Rides</Text>
          <Text style={styles.metricValue}>{ridesCancelled}</Text>
        </Animated.View>
        <Animated.View style={[styles.metricCard, { transform: [{ rotate: rotateInterpolation(rotateAnim3) }] }]}>
          <Text style={styles.metricTitle}>Rides In Progress</Text>
          <Text style={styles.metricValue}>{ridesInProgress}</Text>
        </Animated.View>
        <Animated.View style={[styles.metricCard, { transform: [{ rotate: rotateInterpolation(rotateAnim4) }] }]}>
          <Text style={styles.metricTitle}>Ongoing Rides</Text>
          <Text style={styles.metricValue}>{ongoingRides}</Text>
        </Animated.View>
      </View>

      <View style={styles.performanceContainer}>
        <Text style={styles.performanceTitle}>Performance Metrics</Text>
        {Object.keys(performance).length > 0 ? (
          Object.entries(performance).map(([key, value]) => (
            <View key={key} style={styles.performanceCard}>
              <Text style={styles.performanceMetric}>{key}</Text>
              <Text style={styles.performanceValue}>{value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No performance data available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#007AFF',
  backgroundGradientFrom: '#007AFF',
  backgroundGradientTo: '#34C759',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#34C759',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  bikeIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  carImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  performanceContainer: {
    marginBottom: 30,
  },
  performanceTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  performanceMetric: {
    fontSize: 18,
    color: '#333',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
});

export default DriverDashboard;
