import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ScrollView } from 'react-native';
import { getDriverDocumentData } from '../../../api-requests/driverDocument'; 

const AadharScreen = () => {
  const driverId = 18;
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [AadharNumber, setAadharNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverDocuments = async () => {
      try {
        const driverDocs = await getDriverDocumentData(driverId);
        if (driverDocs && Array.isArray(driverDocs)) {
          const aadharDoc = driverDocs.find((doc) => doc.doc_type === 'Adhar card ');
          if (aadharDoc) {
            setFrontImage(aadharDoc.front_image);
            setBackImage(aadharDoc.back_image);
            setAadharNumber(aadharDoc.doc_number);
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
      <Text style={styles.label}>Aadhar Front Image</Text>
      {frontImage ? (
        <Image source={{ uri: frontImage }} style={styles.image} />
      ) : (
        <View style={styles.emptyImageContainer}>
          <Text style={styles.emptyImageText}>No Image Available</Text>
        </View>
      )}
      <Text style={styles.label}>Aadhar Back Image</Text>
      {backImage ? (
        <Image source={{ uri: backImage }} style={styles.image} />
      ) : (
        <View style={styles.emptyImageContainer}>
          <Text style={styles.emptyImageText}>No Image Available</Text>
        </View>
      )}
      <Text style={styles.label}>Aadhar Number</Text>
      <TextInput
        style={styles.input}
        value={AadharNumber}
        editable={false}
      />
      <Button title="Next" onPress={() => { /* handle submit */ }} />
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
    color: '#000',
    marginBottom: 20,
  },
});

export default AadharScreen;
