
import axios from 'axios';
import { origin } from './config';
export const getDriverEarningsRouter = async () => {
    try {
      const response = await axios({
        method: 'get',
        url: `${origin}/api/v1/driverearinings/`, // Update URL to include driverId
        headers: {
          "Content-Type": "application/json"
        },
      });
  
      const responseData = await response.data;
      return responseData;
    } catch (error: any) {
      return error.response.data;
    }
  };