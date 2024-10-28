/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from './config';

export const updateDriverId = async (bookingId: string, driverId: number) => {
    console.log("update driver", bookingId, driverId);
    
    try {
        const response = await axios({
            method: 'patch',
            url: `${config.API_DOMAIN_URL}/api/v1/vehicle-booking/${bookingId}`,
            headers: {
                "Content-Type": "application/json"
            },
            data: { driver_id: driverId } // Send the driver_id in the request body
        });
        
        return response.data;
    } catch (error: any) {
        console.error("Error:", error);
        return error.response?.data || { message: "An error occurred" };
    }
};

export const updatePaymentStatus = async (bookingId: string, status: string, paymentMethod: string) => {
    try {
      const response = await axios({
        method: 'patch',
        url: `${config.API_DOMAIN_URL}/api/v1/vehicle-booking/${bookingId}`,
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          status: status, // new status, e.g., 'completed'
          payment_method: paymentMethod // e.g., 'cash'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      return error.response?.data || { message: "An error occurred" };
    }
  };