/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from './config';

export const createRideRequest = async (data: any) => {
    console.log(data);
    const newData = JSON.stringify(data);
    try {
        const response = await axios({
            method: 'post',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest`,
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

export const getRideRequestById = async (id: string) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest/${id}`,
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

export const getRideRequestsByUser = async (userId: string) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest/user/${userId}`,
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

export const updateRideRequest = async (id: string, data: any) => {
    console.log(data);
    const newData = JSON.stringify(data);
    try {
        const response = await axios({
            method: 'patch',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest/${id}`,
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

export const deleteRideRequest = async (id: string) => {
    try {
        const response = await axios({
            method: 'delete',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest/${id}`,
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

export const getCompletedOrderByDriverId = async (driver_id: any) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest/driver/${driver_id}/completed-orders`,
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

export const getMissedOrderByDriverId= async (driver_id: number) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/riderequest/driver/${driver_id}/missed-orders`,
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