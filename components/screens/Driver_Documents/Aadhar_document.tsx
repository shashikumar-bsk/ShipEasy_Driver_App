import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, StatusBar, ScrollView, StyleSheet, Modal } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { postDriverDocumentData } from '../../../api-requests/driverDocument';

type RootStackParamList = {
  Home: undefined;
  HelpScreen: undefined;
  Aadhar_document: { driverId: number };
  HomeScreen: { driverId: number };
  Review_screen: { driverId: number };
};

type Aadhar_documentScreenNavigationProp = NavigationProp<RootStackParamList, 'Aadhar_document'>;
type Aadhar_documentScreenRouteProp = RouteProp<RootStackParamList, 'Aadhar_document'>;

const Aadhar_document: React.FC = () => {
  const navigation = useNavigation<Aadhar_documentScreenNavigationProp>();
  const route = useRoute<Aadhar_documentScreenRouteProp>();

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [docType] = useState<string>("Aadhar card");
  const [docNumber, setDocNumber] = useState<string>("");
  const [docNumberError, setDocNumberError] = useState<string | null>(null); // State for error message
  const [status] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  

  const driverId = route.params.driverId;

  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateAadharNumber = (): boolean => {
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(docNumber)) {
     setDocNumberError(
       "Please enter a valid 12-digit Aadhaar number.(e.g., 123412341234)."
     );
      return false;
    }
    setDocNumberError(null);
    return true;
  };

  const uploadImages = async () => {
    // Reset success message and start showing the loader
    setSuccessMessage(null);
    setLoading(true);  // Show loader

    // Ensure images and document number are provided
    if (!frontImage || !backImage) {
      console.error('Both front and back images are required');
      setLoading(false);
      return;
    }

    if (!validateAadharNumber()) {
      setLoading(false);
      return;
    }

    let formData = new FormData();
    formData.append('front_image', {
      uri: frontImage,
      name: frontImage.split('/').pop() || 'frontImage.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('back_image', {
      uri: backImage,
      name: backImage.split('/').pop() || 'backImage.jpg',
      type: 'image/jpeg',
    } as any);
    formData.append('doc_type', docType);
    formData.append('doc_number', docNumber);
    formData.append('status', JSON.stringify(status));
    formData.append('driver_id', driverId.toString());

    try {
      const response = await postDriverDocumentData(formData);
      console.log('Upload successful:', response);

      // Show success message and hide loader
      setSuccessMessage("Document submitted successfully");
      setShowSuccessModal(true);  // Show success modal
       navigation.goBack();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      // Hide loader once the process is complete
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome
          name="arrow-left"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Aadhar Document</Text>
      </View>
      <StatusBar backgroundColor={"#b396d6"} barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.label}>Aadhar Number</Text>
          <TextInput
            value={docNumber}
            onChangeText={setDocNumber}
            style={styles.input}
            placeholder="Enter Aadhar number....."
            keyboardType="numeric"
            maxLength={12}
          />
          {docNumberError && (
            <Text style={styles.errorText}>{docNumberError}</Text>
          )}

          <Text style={styles.label}>Front Image</Text>
          <View style={styles.imageContainer}>
            {frontImage ? (
              <Image source={{ uri: frontImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                  Front side of your Document
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage(setFrontImage)}
            >
              <MaterialIcons
                name="add-photo-alternate"
                size={24}
                color="black"
              />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Back Image</Text>
          <View style={styles.imageContainer}>
            {backImage ? (
              <Image source={{ uri: backImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>
                  Back side of your Document
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage(setBackImage)}
            >
              <MaterialIcons
                name="add-photo-alternate"
                size={24}
                color="black"
              />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={uploadImages}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Submitting..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Your existing styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  successText: {
    color: 'green',
    fontSize: 18,
    marginBottom: 10,
  },
  closeButtonText: {
    color: '#b396d6',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#b396d6',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
 
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 10,
    
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  placeholder: {
    height: 200,
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: 'black',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#e4cfff',
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  statusButton: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b396d6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successMessageContainer: {
    marginTop: 20,
    padding: 10,
  },
  successMessage: {
    color: 'darkgreen',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Aadhar_document;
