import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  NavigationProp,
  useNavigation,
  RouteProp,
  useRoute,
} from "@react-navigation/native";
import { getDriverDocumentData } from "../../../api-requests/driverDocument";

// Define the parameter types for the navigation stack
type RootStackParamList = {
  HomeScreen: { driverId: number };
  Review_screen: { driverId: number };
  Driver_documents: { driverId: number };
};

type DocumentReview_screenNavigationProp = NavigationProp<
  RootStackParamList,
  "Review_screen"
>;
type DocumentReview_screenRouteProp = RouteProp<
  RootStackParamList,
  "Review_screen"
>;

const Review_screen: React.FC = () => {
  const navigation = useNavigation<DocumentReview_screenNavigationProp>();
  const route = useRoute<DocumentReview_screenRouteProp>();
  const [documentStatus, setDocumentStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const driverId = route.params.driverId;

  // Fetch document data on component mount
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const data = await getDriverDocumentData(driverId);
        setDocumentStatus(data);
      } catch (error) {
        console.error("Error fetching document data:", error);
        Alert.alert("Error", "Failed to fetch document data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [driverId]);

  const handleNavigation = async () => {
    setLoading(true);
    try {
      const data = await getDriverDocumentData(driverId);
      setDocumentStatus(data);
      console.log(data);

      // Check if all documents are approved
      const allDocumentsApproved = data.every((doc: any) => doc.status);

      if (allDocumentsApproved) {
        navigation.navigate("HomeScreen", { driverId });
      } else {
        Alert.alert(
          "Document Verification",
          "Documents are still under verification.",
          [
            {
              text: "OK",
              onPress: () => console.log("Verification in progress"),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking document status:", error);
      Alert.alert("Error", "Failed to check document status.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#b396d6" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Icon name="thumb-up" size={50} color="#b396d6" />
      <Text style={styles.title}>We're reviewing your documents</Text>
      <Text style={styles.subtitle}>
        It usually takes less than a day for us to complete the process.
      </Text>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNavigation}>
          <Text style={styles.buttonText}>Ok</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  footer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: "#b396d6",
    padding: 10,
    borderRadius: 5,
    width: 300,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Review_screen;
