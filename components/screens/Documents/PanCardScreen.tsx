import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, ScrollView } from 'react-native';
import { getDriverDocumentData } from '../../../api-requests/driverDocument';

const PanCardScreen = () => {
  const driverId =18;
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [PanNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverDocuments = async () => {
      try {
        const driverDocs = await getDriverDocumentData(driverId);
        if (driverDocs && Array.isArray(driverDocs)) {
          const panDoc = driverDocs.find((doc) => doc.doc_type === 'Pan');
          if (panDoc) {
            setFrontImage(panDoc.front_image);
            setBackImage(panDoc.back_image);
            setPanNumber(panDoc.doc_number);
          }
        } else{
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
      <Text style={styles.label}>PAN Front Image</Text>
      {frontImage ? (
        <Image source={{ uri: frontImage }} style={styles.image} />
      ) : (
        <View style={styles.emptyImageContainer}>
          <Text style={styles.emptyImageText}>No Image Available</Text>
        </View>
      )}
      <Text style={styles.label}>PAN Back Image</Text>
      {backImage ? (
        <Image source={{ uri: backImage }} style={styles.image} />
      ) : (
        <View style={styles.emptyImageContainer}>
          <Text style={styles.emptyImageText}>No Image Available</Text>
        </View>
      )}
      <Text style={styles.label}>PAN Number</Text>
      <TextInput
        style={styles.input}
        value={PanNumber}
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
    color: '#000',  
    marginBottom: 20,                                                   
  },
});                                                             

export default PanCardScreen;
