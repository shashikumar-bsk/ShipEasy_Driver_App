/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from './config';
import { origin } from './config';

export const postDriverRouter = async (data: any) => {
    console.log(data);
    const newData = JSON.stringify(data)
    try {
        const response = await axios(
            {
                method: 'post',
                url: `${origin}/api/v1/driver`,
                headers: {
                    "Content-Type": "application/json"
                },
                data: newData
            }
        )
        const responseData = await response.data
        return responseData
    } catch (error: any) {
        return error.response.data
    }
}

export const getDriverRouter = async (driverId: number) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${origin}/api/v1/driver/${driverId}`, // Correct URL
            headers: {
                "Content-Type": "application/json",
            },
        });

        // console.log("API Response:", response); // Debug entire response
        return response.data; // Correct way to return data
    } catch (error: any) {
        console.error("Error in getDriverRouter:", error);
        // Ensure error handling returns a meaningful response
        throw new Error(
            error.response?.data?.message || "Failed to fetch vehicle type."
        );
    }
};



export const patchDriverRouter = async (id: string, data: { latitude?: number, longitude?: number }) => {
    try {
      console.log(`Sending PATCH request to: ${origin}/api/v1/driver/${id}`);
      console.log("Data being sent:", data);
  
      const response = await axios({
        method: 'patch',
        url: `${origin}/api/v1/driver/${id}`,
        headers: {
          "Content-Type": "application/json"
        },
        data: data // axios automatically handles the data transformation
      });
  
      console.log("API response data:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error in patching driver:", error.message);
  
      if (error.response) {
        console.error("Server response error:", error.response.data);
      }
  
      return error.response?.data || { message: "An error occurred" };
    }
  };
  
  

export const deleteDriverRouter = async (id: string) => {
    try {
        const response = await axios({
            method: 'delete',
            url: `${origin}/api/v1/driver/${id}`,
            headers: {
                "Content-Type": "application/json"
            }
        });
        const responseData = await response.data;
        return responseData;
    } catch (error: any) {
        return error.response.data;
    }
};

export const checkDriverOtp = async (phone: string) => {
    try {
        // Make the GET request to the API
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/driverotp/check-driver${phone}`,
            headers: {
                "Content-Type": "application/json"
            },
            params: {
                phone: phone
            }

        });
         return response.data;

    } catch (error) {
    // Handle and throw error
    console.error('Error checking driver OTP:', error);
    throw error;
};



}
export const updateDriverStatus = async (driverId: number, newStatus: boolean) => {

  console.log("update status",newStatus);
  try {
      // Make the PATCH request to the API
      const response = await axios({
          method: 'patch',
          url: `${config.API_DOMAIN_URL}/api/v1/driver/${driverId}/upadate`,
          headers: {
              "Content-Type": "application/json"
          },
          data: {
              status: newStatus
          }
      });
      return response.data;
  } catch (error) {
      // Handle and throw error
      console.error('Error updating driver status:', error);
      throw error;
  }
};


// Function to get the driver's profile image
export const getDriverImage = async (driverId: number): Promise<any> => {
    try {
      // Make the GET request to the API
      const response = await axios({
        method: "get",
        url: `${config.API_DOMAIN_URL}/api/v1/driverimage/${driverId}/profile_image`,
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Return the response data containing the profile image
      return response.data;
    } catch (error) {
      // Handle and throw error
      console.error("Error fetching driver image:", error);
      throw error;
    }
  };
  
  
  
  // Function to update the driver's profile image
  export const updateDriverImage = async (driverId: number, formData: FormData): Promise<any> => {
    try {
      // Make the PATCH request to the API
      const response = await axios({
        method: "patch",
        url: `${config.API_DOMAIN_URL}/api/v1/driverimage/${driverId}/profile-image`, // Ensure this URL matches your backend route
        headers: {
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
        data: formData,
      });
  
      // Return the response data containing the updated driver information
      return response.data;
    } catch (error) {
      // Handle and throw error
      console.error("Error updating driver image:", error);
      throw error;
    }
  };
  