/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from './config';
import { origin } from './config';

export const postDriverDocumentData = async (data: FormData) => {
  try {
    const response = await axios.post(
      `${config.API_DOMAIN_URL}/api/v1/driverdoc/driverdocs`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error uploading document:', error.response?.data || error.message);
    return error.response?.data || { message: 'An error occurred' };
  }
};

export const getDriverDocument = async (id: number) => {
  try {
    const response = await axios(
      {
        method: 'get',
        url: `${config.API_DOMAIN_URL}/api/v1/driverdoc/${id}`,
        headers: {
          "Content-Type": "application/json"
        },
      }
    )
    const responseData = await response.data
    return responseData
  } catch (error: any) {
    return error.response.data
  }
}

export const getDriverDocumentData = async (id: any) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${config.API_DOMAIN_URL}/api/v1/driverdoc/driver/${id}`,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Handle server-side errors
      return error.response.data;
    } else {
      // Handle client-side errors
      return { message: error.message };
    }
  }
};
export const updateDriverDocumentData = async (id: number, data: any) => {
  const newData = JSON.stringify(data);
  try {
    const response = await axios({
      method: 'put',
      url: `${config.API_DOMAIN_URL}/api/v1/driverdoc/${id}`,
      headers: {
        "Content-Type": "application/json"
      },
      data: newData
    });
    const responseData = await response.data;
    return responseData;
  } catch (error: any) {
    return error.response.data;
  }
};

export const deleteDriverDocumentData = async (id: number) => {
  try {
    const response = await axios({
      method: 'delete',
      url: `${config.API_DOMAIN_URL}/api/v1/driverdoc/${id}`,
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

export const updateDriverDocumentDatawithstaus = async (
  driverId: any,
  data: {
    doc_type?: string; // Make this optional
    front_image?: string;
    back_image?: string;
    doc_number?: string;
    status?: string;
  }
) => {
  const newData = JSON.stringify(data);
  try {
    const response = await axios.patch(
      `${origin}/api/v1/driverdoc/driver/${driverId}`,
      newData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    return error.response?.data || { message: 'An error occurred.' };
  }
};