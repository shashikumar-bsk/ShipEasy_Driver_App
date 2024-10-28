import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Button,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { patchDriverRouter, getDriverRouter, updateDriverImage, getDriverImage } from "../../../api-requests/driver";
import { userCookie } from "../../../api-requests/config";
import { jwtDecode } from "jwt-decode";
import * as ImagePicker from 'expo-image-picker';

// Type definitions for navigation props and parameters
type RootStackParamList = {
  Profile: { driverId: number };
  // other screens...
};

type DriverDetailsScreenRouteProp = RouteProp<RootStackParamList, "Profile">;
type DriverDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

// Type definition for the component props
type DriverDetailsScreenProps = {
  route: DriverDetailsScreenRouteProp;
  navigation: DriverDetailsScreenNavigationProp;
};

// Type guard for AxiosError
const isAxiosError = (error: unknown): error is { response?: { status: number; data?: any } } => {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.status === "number"
  );
};

// Functional component for the DriverDetailsScreen
const DriverDetailsScreen: React.FC<DriverDetailsScreenProps> = ({
  route,
  navigation,
}) => {

  const [driverId, setDriverId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [fieldToEdit, setFieldToEdit] = useState<string | null>(null);
  const [newFirstName, setNewFirstName] = useState<string>("");
  const [newLastName, setNewLastName] = useState<string>("");
  const [newFieldValue, setNewFieldValue] = useState<string>("");
  const [driverImage, setDriverImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);


   useEffect(() => {
     const initialize = async () => {
       try {
         const token = await AsyncStorage.getItem(userCookie);
         if (!token) throw new Error("Token not found in AsyncStorage");

         const decodedToken: any = jwtDecode(token);
         console.log("Decoded Token:", decodedToken);

         const { id: driverId, phone } = decodedToken;

         if (driverId) {
           setDriverId(String(driverId)); // Convert to string to avoid type issues
           console.log("Driver ID:", driverId);
         }

         if (phone) {
           setPhone(phone);
           console.log("Phone:", phone);
         } else {
           console.error("Phone number not found in token");
           Alert.alert("Error", "Phone number not found in token.");
         }
       } catch (error) {
         console.error("Failed to decode token or retrieve data:", error);
         Alert.alert("Error", "Failed to retrieve user information.");
       }
     };

     initialize();
     
   }, []);

  useEffect(() => {
    if (driverId) {
      fetchDriverDetails();
      fetchDriverImage();
    }
  }, [driverId]);

  const fetchDriverImage = async () => {
    if (!driverId) {
      Alert.alert("Error", "Driver ID is not set.");
      return;
    }
  
    try {
      const response = await getDriverImage(parseInt(driverId, 10)); // Convert driverId to number
      setDriverImage(response.profile_image); 
      setLoading(false); 
    } catch (error) {
      handleError(error, "Failed to fetch driver image.");
    }
  };
  

 const fetchDriverDetails = async () => {
   if (!driverId) {
     Alert.alert("Error", "Driver ID is not set.");
     return; // Early return if driverId is null
   }

   try {
     const response = await getDriverRouter(parseInt(driverId, 10)); // Convert driverId to a number
     setDriverDetails(response);
     setLoading(false);
   } catch (error) {
     if (isAxiosError(error)) {
       console.error("API Error:", error.response?.data);
       if (error.response?.status === 401) {
         // Token expired
         handleTokenExpiry();
       } else {
         Alert.alert("Error", "Failed to fetch driver details.");
       }
     } else {
       console.error("Unexpected Error:", error);
       Alert.alert("Error", "Failed to fetch driver details.");
     }
     setLoading(false);
   }
 };

 
  // Add handleError function
  const handleError = (error: unknown, message: string) => {
    console.error(message, error);
    Alert.alert("Error", message);
  };


  // Function to handle image tap
  const handleImagePress = () => {
    setImageUri(driverImage); // Set the current image URI to display in modal
    setIsModalVisible(true); // Show the modal
  };
 


  // Function to open the image picker with cropping
  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission denied", "You need to allow access to the gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Enables cropping
      aspect: [1, 1],
      quality: 1,
    });

  

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const { uri } = result.assets[0];
    
    setImageUri(uri); 
    setDriverImage(uri); 
    handleImageUpload(uri); 
  }
};


const handleImageUpload = async (uri: string) => {
  if (!driverId) {
    Alert.alert("Error", "Driver ID is not set.");
    return;
  }

  const formData = new FormData();
  formData.append("profile_image", {
    uri,
    name: `driver_${driverId}.jpg`,
    type: "image/jpeg",
  } as any);

  try {
    const response = await updateDriverImage(parseInt(driverId, 10), formData); // Convert driverId to number
    setDriverImage(response.profile_image); // Update the driver image state
    Alert.alert("Success", "Profile image updated successfully.");
    
    // Fetch the updated driver image
    fetchDriverImage(); // Reload the image after successful upload
  } catch (error) {
    handleError(error, "Failed to upload image.");
  }
};

  const handleEditPress = (field: string, currentValue: string) => {
    if (field === "driver_name") {
      const [firstName, lastName] = currentValue.split(" ");
      setNewFirstName(firstName);
      setNewLastName(lastName);
    } else {
      setNewFieldValue(currentValue);
    }
    setFieldToEdit(field);
    setIsModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (fieldToEdit && driverId) {
      // Ensure driverId is not null
      try {
        let updatedDetails: any;

        if (fieldToEdit === "driver_name") {
          updatedDetails = {
            ...driverDetails,
            first_name: newFirstName,
            last_name: newLastName,
            driver_name: `${newFirstName} ${newLastName}`,
          };
        } else {
          updatedDetails = {
            ...driverDetails,
            [fieldToEdit]: newFieldValue,
          };
        }

        await patchDriverRouter(driverId.toString(), updatedDetails); // driverId is guaranteed to be a string now

        setDriverDetails(updatedDetails);
        setIsModalVisible(false);
        setFieldToEdit(null);
        setNewFirstName("");
        setNewLastName("");
        setNewFieldValue("");
      } catch (error) {
        if (isAxiosError(error)) {
          console.error("API Error:", error.response?.data);
          if (error.response?.status === 401) {
            // Token expired
            handleTokenExpiry();
          } else {
            Alert.alert("Error", "Failed to update driver details.");
          }
        } else {
          console.error("Unexpected Error:", error);
          Alert.alert("Error", "Failed to update driver details.");
        }
      }
    } else {
      Alert.alert(
        "Error",
        "No field selected for editing or Driver ID is null."
      );
    }
  };

  const handleTokenExpiry = async () => {
    console.warn("Token has expired."); // Log token expiry warning
    Alert.alert(
      "Session Expired",
      "Your session has expired. Please log in again.",
      [
        {
          text: "OK",
          onPress: async () => {
            try {
              // Clear the token from AsyncStorage
              await AsyncStorage.removeItem('authToken'); // Adjust the key based on your implementation
              console.log("Token Expired");
              // Navigate to the login screen
              navigation.navigate("LoginScreen" as never);
            } catch (error) {
              console.error("Error logging out due to token expiry:", error);
              Alert.alert("Error", "Failed to logout.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Clear the token from AsyncStorage
              await AsyncStorage.removeItem(userCookie); // Adjust the key based on your implementation
              console.log("Token Expired");
              // Navigate to the login screen
              navigation.navigate("LoginScreen" as never);
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to logout.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  if (loading) {
    return (
      <View style={styles.driverProfileloadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!driverDetails) {
    return (
      <View style={styles.driverProfileloadingContainer}>
        <Text>No driver details available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.driverprofilecontainer}>
      <View style={styles.DriverProfileheader}>
      <View style={styles.imageContainer}>
 
    {driverImage ? (
            <TouchableOpacity onPress={handleImagePress}>
              <Image
                source={{ uri: driverImage }}
                style={styles.DriverProfileheaderImage}
                onError={() => setDriverImage(null)} // Handle invalid image URI
              />
            </TouchableOpacity>
  ) : (
    <Text>No profile image available.</Text>
  )}
  <TouchableOpacity style={styles.editIcon} onPress={openImagePicker}>
    <Ionicons name="pencil" size={24} color="white" />
  </TouchableOpacity>
</View></View>
      <TouchableOpacity
        style={styles.DriverProfiledetailRow}
        onPress={() =>
          handleEditPress("driver_name", driverDetails.driver_name)
        }
      >
        <Ionicons
          name="person"
          size={24}
          color="black"
          style={styles.DriverProfileicon}
        />
        <View style={styles.DriverProfiledetailTextContainer}>
          <Text style={styles.DriverProfiledetailTitle}>Name</Text>
          <Text style={styles.DriverProfiledetailText}>
            {driverDetails.driver_name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.DriverProfiledetailRow}
        onPress={() => handleEditPress("phone", driverDetails.phone)}
      >
        <Ionicons
          name="call"
          size={24}
          color="black"
          style={styles.DriverProfileicon}
        />
        <View style={styles.DriverProfiledetailTextContainer}>
          <Text style={styles.DriverProfiledetailTitle}>Phone Number</Text>
          <Text style={styles.DriverProfiledetailText}>
            {driverDetails.phone}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.DriverProfiledetailRow}
        onPress={() => handleEditPress("email", driverDetails.email)}
      >
        <Ionicons
          name="mail"
          size={24}
          color="black"
          style={styles.DriverProfileicon}
        />
        <View style={styles.DriverProfiledetailTextContainer}>
          <Text style={styles.DriverProfiledetailTitle}>Email</Text>
          <Text style={styles.DriverProfiledetailText}>
            {driverDetails.email}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.DriverProfiledetailRow}
        onPress={() => handleEditPress("gender", driverDetails.gender)}
      >
        <Ionicons
          name="transgender"
          size={24}
          color="black"
          style={styles.DriverProfileicon}
        />
        <View style={styles.DriverProfiledetailTextContainer}>
          <Text style={styles.DriverProfiledetailTitle}>Gender</Text>
          <Text style={styles.DriverProfiledetailText}>
            {driverDetails.gender}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.DriverProfiledetailRow}
        onPress={() => handleEditPress("dob", driverDetails.dob)}
      >
        <Ionicons
          name="calendar"
          size={24}
          color="black"
          style={styles.DriverProfileicon}
        />
        <View style={styles.DriverProfiledetailTextContainer}>
          <Text style={styles.DriverProfiledetailTitle}>Date of Birth</Text>
          <Text style={styles.DriverProfiledetailText}>
            {driverDetails.dob}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.DriverProfiledetailRow}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out"
          size={24}
          color="black"
          style={styles.DriverProfileicon}
        />
        <View style={styles.DriverProfiledetailTextContainer}>
          <Text style={styles.DriverProfiledetailTitle}>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.DriverProfilemodalContainer}>
          <View style={styles.DriverProfilemodalContent}>
            <Text style={styles.DriverProfilemodalTitle}>
              Edit {fieldToEdit}
            </Text>
            {fieldToEdit === "driver_name" && (
              <>
                <TextInput
                  style={styles.DriverProfilemodalInput}
                  value={newFirstName}
                  onChangeText={(text) => setNewFirstName(text)}
                  placeholder="First Name"
                />
                <TextInput
                  style={styles.DriverProfilemodalInput}
                  value={newLastName}
                  onChangeText={(text) => setNewLastName(text)}
                  placeholder="Last Name"
                />
              </>
            )}
            {fieldToEdit !== "driver_name" && (
              <TextInput
                style={styles.DriverProfilemodalInput}
                value={newFieldValue}
                onChangeText={(text) => setNewFieldValue(text)}
              />
            )}
            <View style={styles.DriverProfilemodalButtonContainer}>
              <Button title="Save" onPress={handleSaveChanges} />
              <Button
                title="Cancel"
                onPress={() => setIsModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: imageUri ?? undefined }} style={styles.modalImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Styles for the screen
const styles = StyleSheet.create({
  driverProfileloadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  driverprofilecontainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  DriverProfileheader: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  DriverProfiledetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  DriverProfileicon: {
    marginRight: 15,
  },
  DriverProfiledetailTextContainer: {
    flex: 1,
  },
  DriverProfiledetailTitle: {
    fontSize: 16,
    color: "#333",
  },
  DriverProfiledetailText: {
    fontSize: 14,
    color: "#666",
  },
  DriverProfilemodalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  DriverProfilemodalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 5,
  },
  DriverProfilemodalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  DriverProfilemodalInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  DriverProfilemodalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalContent: {
    width: '90%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  DriverProfileheaderImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: 'absolute', 
    top: 120, 
    right: -15, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    borderRadius: 50, 
    padding: 5, 
  },
  imageContainer: {
    position: 'relative', 
    width: 120,  
    height: 120, 
  },
});

export default DriverDetailsScreen;
