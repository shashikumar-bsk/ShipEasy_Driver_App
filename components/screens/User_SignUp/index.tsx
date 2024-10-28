import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,

} from "react-native";
import CheckBox from "react-native-check-box";
import DateTimePicker from "@react-native-community/datetimepicker";
import { postDriverRouter } from "../../../api-requests/driver";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  DriverRegistration: { phone: string };
  HomeScreen: undefined;
  LoginScreen: { phone: string };
  Driver_documents: { driverId: any,driverName: string};
};

export type DriverRegistrationNavigationProp = StackNavigationProp<
  RootStackParamList,
  "DriverRegistration"
>;

export type DriverRegistrationRouteProp = RouteProp<
  RootStackParamList,
  "DriverRegistration"
>;

export type DriverRegistrationProps = {
  navigation: DriverRegistrationNavigationProp;
  route: DriverRegistrationRouteProp;
};

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender?: string;
  dob?: Date;
  password: string;
  vehicle_type: string;
  vehicle_number?: string;
}

interface Errors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  password?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  backend?: string;
}

const DriverRegistration: React.FC<DriverRegistrationProps> = ({
  navigation,
  route,
}) => {
  const { phone } = route.params;

  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: phone,
    gender: "",
    dob: new Date(),
    password: "",
    vehicle_type: "",
    vehicle_number: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown logic for vehicle type
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const vehicleTypes = [ "Bike", "3-wheeler", "4-wheeler", "Truck"];
  const [selectedVehicleType, setSelectedVehicleType] = useState(formData.vehicle_type || "");

  useEffect(() => {
    setFormData((prev) => ({ ...prev, vehicle_type: selectedVehicleType }));
  }, [selectedVehicleType]);

  // Handle input change
  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value });
    setSuccessMessage(null); // Reset success message on input change

    // Trigger validation for vehicle number when it is updated
    if (name === 'vehicle_number') {
      validateVehicleNumber(value);
    }
  };

  const validateVehicleNumber = (number: string) => {
    // Updated regex to match the format TS09SZ9876
    const vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
    if (number && !vehicleNumberPattern.test(number)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        vehicle_number: "Please enter a valid vehicle number",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        vehicle_number: '',
      }));
    }
  };
  

  // Handle date change for date of birth picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dob: selectedDate });
    }
  };

  // Validate all form fields
  const validate = (): boolean => {
    const newErrors: any = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.password || formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.vehicle_type) newErrors.vehicle_type = "Vehicle type is required";

    // Keep existing vehicle number error if it's set
    if (!formData.vehicle_number) {
      newErrors.vehicle_number = "Vehicle number is required";
    } else if (errors.vehicle_number) {
      newErrors.vehicle_number = errors.vehicle_number;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (validate()) {
      try {
        const response = await postDriverRouter(formData);

        const driverId = response.data.driver_id;
        const driverName = response.data.driver_name;
        console.log(driverId);
        console.log("Registration successful:", response.data);

        setSuccessMessage("Successfully Registered");
        setErrors({});

        navigation.navigate("Driver_documents", { driverId: driverId, driverName: driverName });
      } catch (error: any) {
        console.error("Error submitting the form", error.response?.data?.message || error.message);
        setErrors({ backend: error.response?.data?.message || "An error occurred" });
      }
    }
  };

 
   return (
     <>
       <StatusBar backgroundColor="#b396d6" barStyle="light-content" />
       <View style={styles.header}>
         <Image source={require('../../../assets/images/Elemove.png')} style={styles.logoElemove} />
         <Text style={styles.headerTitle}>Shipease</Text>
       </View>
 
       <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        
      
       <View style={styles.DriverContainer}>
         <View style={styles.driverPhoneContainer}>
           <Image
             source={{ uri: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" }}
             style={styles.driverFlag}
           />
           <Text style={styles.driverPhoneNumber}>{phone}</Text>
         </View>
 
         <View style={styles.driverRow}>
           <View style={styles.driverHalfInputContainer}>
             <TextInput
               style={styles.driverInput}
               placeholder="First Name"
               value={formData.first_name}
               onChangeText={(value) => handleInputChange("first_name", value)}
             />
             {errors.first_name && <Text style={styles.driverError}>{errors.first_name}</Text>}
           </View>
           <View style={styles.driverHalfInputContainer}>
             <TextInput
               style={styles.driverInput}
               placeholder="Last Name"
               value={formData.last_name}
               onChangeText={(value) => handleInputChange("last_name", value)}
             />
             {errors.last_name && <Text style={styles.driverError}>{errors.last_name}</Text>}
           </View>
         </View>
 
         <TextInput
           style={styles.driverInput}
           placeholder="Email Id"
           value={formData.email}
           onChangeText={(value) => handleInputChange("email", value)}
         />
         {errors.email && <Text style={styles.driverError}>{errors.email}</Text>}
 
         <View style={styles.driverGenderContainer}>
           <Text>Gender:</Text>
           <View style={styles.driverCheckboxContainer}>
             <CheckBox isChecked={formData.gender === "M"} onClick={() => handleInputChange("gender", "M")} />
             <Text style={styles.driverGenderText}>Male</Text>
           </View>
           <View style={styles.driverCheckboxContainer}>
             <CheckBox isChecked={formData.gender === "F"} onClick={() => handleInputChange("gender", "F")} />
             <Text style={styles.driverGenderText}>Female</Text>
           </View>
         </View>
         {errors.gender && <Text style={styles.driverError}>{errors.gender}</Text>}
 
         <View>
           <Text>Date Of Birth</Text>
           <TouchableOpacity onPress={() => setShowDatePicker(true)}>
             <TextInput
               style={styles.driverDateofbirth}
               placeholder="Date of Birth"
               value={formData.dob ? formData.dob.toISOString().split("T")[0] : ""}
               editable={false}
             />
           </TouchableOpacity>
           {errors.dob && <Text style={styles.driverError}>{errors.dob}</Text>}
           {showDatePicker && (
             <DateTimePicker
               value={formData.dob || new Date()}
               mode="date"
               display="default"
               onChange={handleDateChange}
               maximumDate={new Date()}
             />
           )}
         </View>
 
         <TextInput
           style={styles.driverInput}
           placeholder="Password"
           value={formData.password}
           secureTextEntry
           onChangeText={(value) => handleInputChange("password", value)}
         />
         {errors.password && <Text style={styles.driverError}>{errors.password}</Text>}
 
         {/* Custom Dropdown for Vehicle Type */}
         <View>
           <Text>Vehicle Type</Text>
           <TouchableOpacity onPress={() => setIsDropdownOpen(!isDropdownOpen)} style={styles.dropdownButton}>
             <Text style={styles.dropdownText}>{selectedVehicleType || "Select Vehicle Type"}</Text>
           </TouchableOpacity>
           {isDropdownOpen && (
             <View style={styles.dropdownList}>
               {vehicleTypes.map((type) => (
                 <TouchableOpacity
                   key={type}
                   onPress={() => {
                     setSelectedVehicleType(type);
                     setIsDropdownOpen(false);
                   }}
                   style={styles.dropdownItem}
                 >
                   <Text>{type}</Text>
                 </TouchableOpacity>
               ))}
             </View>
           )}
           {errors.vehicle_type && <Text style={styles.driverError}>{errors.vehicle_type}</Text>}
         </View>
 
         <TextInput
           style={styles.driverInput}
           placeholder="Vehicle Number"
           value={formData.vehicle_number}
           onChangeText={(value) => handleInputChange("vehicle_number", value)}
         />
         {errors.vehicle_number && <Text style={styles.driverError}>{errors.vehicle_number}</Text>}
 
         <TouchableOpacity style={styles.Driverbutton} onPress={handleSubmit}>
           <Text style={styles.DriverbuttonText}>Register</Text>
         </TouchableOpacity>
 
         {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
         {errors.backend && <Text style={styles.driverError}>{errors.backend}</Text>}
       </View>
       </ScrollView>
     </>
   );
 };

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#b396d6',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 20,
    
    
  },
  logoElemove: {
    width: 40,
    height: 40,
    marginRight: 20, // Space between logo and title
    marginLeft: 65,
  },

  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 28,
  },
  container: {
    padding: 1,
    // marginBottom:20,
  },

  text: {
    color: '#000',
  },
  placeholder: {
    color: '#666',
  },
  DriverContainer: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },

  driverPhoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    
  },
  driverFlag: {
    width: 27,
    height: 20,
    marginRight: 10,
  },
  driverPhoneNumber: {
    fontSize: 16,
  },
  driverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginBottom: 20,
  },
  driverHalfInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  driverInput: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 25,
    // marginTop: 20,
    paddingLeft: 15,
    borderRadius: 8,
  },
  driverDateofbirth: {
    height: 50,
    borderColor: "#ccc",
    color:"#000000",
    borderWidth: 1,
    marginBottom: 25,
    marginTop: 5,
    paddingLeft: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0", // Light gray background to indicate it's not editable
  },
  driverError: {
    color: "red",
    marginBottom: 10,
  },
  Driverbutton: {
    backgroundColor: "#d9befa",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  DriverbuttonText: {
    color: "black",
    fontSize: 18,
  },
  successMessage: {
    color: "green",
    marginTop: 10,
    textAlign: "center",
  },
  driverGenderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  driverCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  driverGenderText: {
    marginLeft: 5,
  },
  dropdownButton: {
    backgroundColor: "#f0f0f0", // Light grey background
    borderColor: "#ccc", // Purple border
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    marginBottom: 25,
  
    height: 50, // Dropdown height
  },
  
  // Dropdown text style
  dropdownText: {
    fontSize: 16, // Text size
    color: "#333", // Dark grey color
    fontWeight: "normal",
  },

  // Dropdown list style
  dropdownList: {
    backgroundColor: "#fff", // White background for the dropdown
    borderColor: "#b396d6", // Same purple border
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -10, // Adjust the position
    zIndex: 1000, // Ensure dropdown appears on top
  },

  // Dropdown item style
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey", // Light grey separator

  },
});

export default DriverRegistration;
