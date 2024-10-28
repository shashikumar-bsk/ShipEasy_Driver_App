import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { postDriverDocumentData } from '../../../api-requests/driverDocument';

type RootStackParamList = {
  Home: undefined;
  HelpScreen: undefined;
  Rc_document: { driverId: number };
  Aadhar_document: {driverId: number};
  RegistrationCertificate: undefined;
};

type Rc_documentScreenNavigationProp = NavigationProp<RootStackParamList, 'Rc_document'>;
type Rc_documentScreenRouteProp = RouteProp<RootStackParamList, 'Rc_document'>;

const Rc_document: React.FC = () => {
  const navigation = useNavigation<Rc_documentScreenNavigationProp>();
  const route = useRoute<Rc_documentScreenRouteProp>();

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [docType] = useState<string>("Registration certificate"); // Set default value
  const [docNumber, setDocNumber] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // For error message

  const driverId = route.params.driverId; // Get the driver ID from route params

  // Validation function for the RC number
  const validateRcNumber = (rcNumber: string) => {
    // Example regex for a vehicle registration number (modify as needed)
    const rcNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
    return rcNumberRegex.test(rcNumber);
  };

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

  const uploadImages = async () => {
    setErrorMessage(null); // Reset error message

    // Validate the RC number
    if (!validateRcNumber(docNumber)) {
      setErrorMessage(
        "Please enter a valid Registration number (e.g., MH12AB1234)."
      );
      return;
    }

    if (!frontImage || !backImage) {
      console.error('Both front and back images are required');
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
    formData.append('doc_type', docType); // Default value is used
    formData.append('doc_number', docNumber);
    formData.append('status', JSON.stringify(status));
    formData.append('driver_id', driverId.toString()); // Add driver_id to the form data
    console.log(formData);

    try {
      const response = await postDriverDocumentData(formData); // Use the API call
      console.log('Upload successful:', response);

      // Set success message
      setSuccessMessage("Document submitted successfully");
       navigation.goBack();

    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <FontAwesome name="arrow-left" size={24} color="white" onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Registration Certificate</Text>
        </View>
      <StatusBar backgroundColor={"#b396d6"} barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <View style={styles.content}>
          {/* Removed the Document Type input field */}
          
          <Text style={styles.label}>RC Number</Text>
          <TextInput
            value={docNumber}
            onChangeText={setDocNumber}
            style={styles.input}
            placeholder='Enter RC number.....'
          />
          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text> // Error message displayed here
          )}

          <Text style={styles.label}>Front Image</Text>
          <View style={styles.imageContainer}>
            {frontImage ? (
              <Image source={{ uri: frontImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Front side of your Document</Text>
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setFrontImage)}>
              <MaterialIcons name="add-photo-alternate" size={24} color="black" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Back Image</Text>
          <View style={styles.imageContainer}>
            {backImage ? (
              <Image source={{ uri: backImage }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Back side of your Document</Text>
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setBackImage)}>
              <MaterialIcons name="add-photo-alternate" size={24} color="black" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={uploadImages}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          {successMessage && (
            <View style={styles.successMessageContainer}>
              <Text style={styles.successMessage}>{successMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 5,
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

export default Rc_document;
