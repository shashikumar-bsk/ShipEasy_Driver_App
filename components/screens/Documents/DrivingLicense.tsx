import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ScrollView } from 'react-native';
import { getDriverDocumentData } from '../../../api-requests/driverDocument'; 

const DrivingLicenseScreen = () => {
  const driverId = 18;
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverDocuments = async () => {
      try {
        const driverDocs = await getDriverDocumentData(driverId);
        if (driverDocs && Array.isArray(driverDocs)) {
          const licenseDoc = driverDocs.find((doc) => doc.doc_type === 'License');
          if (licenseDoc) {
            setFrontImage(licenseDoc.front_image);
            setBackImage(licenseDoc.back_image);
            setLicenseNumber(licenseDoc.doc_number);
          }
        } else {
          
          // setError('No documents found or error fetching documents.');
        }
      } catch (error:any) {
        setError(error.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDocuments();
  }, [driverId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Driving License Front</Text>
      {frontImage ? (
        <Image source={{ uri: frontImage }} style={styles.image} />
      ) : (
        <View style={styles.emptyImageContainer}>
          <Text style={styles.emptyImageText}>No Image Available</Text>
        </View>
      )}
      <Text style={styles.label}>Driving License Back</Text>
      {backImage ? (
        <Image source={{ uri: backImage }} style={styles.image} />
      ) : (
        <View style={styles.emptyImageContainer}>
          <Text style={styles.emptyImageText}>No Image Available</Text>
        </View>
      )}
      <Text style={styles.label}>License Number</Text>
      <TextInput
        style={styles.input}
        value={licenseNumber}
        editable={false}
      />
      <Button title="Next" onPress={() => { / handle submit / }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  emptyImageContainer: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    borderStyle: 'dotted',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImageText: {
    color: '#ccc',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color:'#000'
  },
});

export default DrivingLicenseScreen;
