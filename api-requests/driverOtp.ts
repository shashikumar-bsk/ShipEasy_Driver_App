
import axios from 'axios';
import { origin } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to send OTP
export const sendDriverOTP = async (data: any) => {
  // Retrieve the token from AsyncStorage
//   const token = await AsyncStorage.getItem('userCookie');
  console.log(origin);

  const newData = JSON.stringify(data);
  try {
    const response = await axios({
      method: 'post',
      url: `${origin}/api/v1/driverotp/send-otp`,
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${token}`, // Add Bearer token here
      },
      data: newData,
    });

    const responseData = await response.data;
    console.log(responseData);
    return responseData;
  } catch (error: any) {
    console.error(error);
    return error.response.data;
  }
};

export const verifyDriverOTP = async (data: { phone: string; otp: string; orderId: string }) => {
  try {
       
    const response = await axios.post(`${origin}/api/v1/driverotp/verify-otp`, data, {
      headers: {
        "Content-Type": "application/json",
      
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error verifying OTP:', error.response ? error.response.data : error.message);
    return error.response ? error.response.data : { message: 'An unexpected error occurred' };
  }
};

    
// Function to get driver details
export const getDriverDetails = async (phone: string) => {
  // Retrieve the JWT token from AsyncStorage
  const token = await AsyncStorage.getItem('userCookie');
  console.log('JWT Token:', token); // Log the token for debugging

  try {
    // Make the GET request to fetch driver details
    const response = await axios({
      method: 'get',
      url: `${origin}/api/v1/driverotp/check-driver`, // API endpoint
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Include Bearer token for authorization
      },
      params: { phone }, // Send phone as a query parameter
    });

    // Return the driver details from the response
    return response.data;
  } catch (error: any) {
    // Handle error response from API
    if (error.response) {
      return error.response.data; // Return the error data from the response
    }
    // Throw error if response is not available
    throw error;
  }
};



