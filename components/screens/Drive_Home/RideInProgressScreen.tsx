import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

type RideInProgressProps = {
  navigation: any;
  route: any;
};

const RideInProgressScreen: React.FC<RideInProgressProps> = ({ route, navigation }) => {
  const { pickupLocation, clientName, clientAddress } = route.params;
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      setLoading(false);
    };

    fetchCurrentLocation();
  }, []);

  if (loading || !currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={currentLocation.coords} title="Your Location" />
        <Marker coordinate={pickupLocation} title="Pickup Location" />

        <Polyline
          coordinates={[
            { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude },
            { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude }
          ]}
          strokeColor="#000" // Polyline color
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.clientAddress}>{clientAddress}</Text>

        <TouchableOpacity
          style={styles.arrivedButton}
          onPress={() => navigation.navigate('ArrivedScreen')} // Adjust this navigation to your desired flow
        >
          <Text style={styles.arrivedButtonText}>Arrived</Text>
        </TouchableOpacity>
      </View>
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
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clientAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  arrivedButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RideInProgressScreen;
