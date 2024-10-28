/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from './config';

// // Create a new receiver detail
// export const postReceiverDetail = async (data: any) => {
//     const newData = JSON.stringify(data);
//     try {
//         const response = await axios({
//             method: 'post',
//             url: `${config.API_DOMAIN_URL}/api/v1/reciever/`,
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             data: newData
//         });
//         const responseData = await response.data;
//         return responseData;
//     } catch (error: any) {
//         return error.response.data;
//     }
// };

// // Get all receiver details
// export const getReceiverDetails = async () => {
//     try {
//         const response = await axios({
//             method: 'get',
//             url: `${config.API_DOMAIN_URL}/api/v1/reciever/`,
//             headers: {
//                 "Content-Type": "application/json"
//             },
//         });
//         const responseData = await response.data;
//         return responseData;
//     } catch (error: any) {
//         return error.response.data;
//     }
// };

// Get a receiver detail by ID
export const getReceiverDetailById = async (id: number) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/reciever/${id}`,
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

// // Update a receiver detail
// export const updateReceiverDetail = async (id: number, data: any) => {
//     const newData = JSON.stringify(data);
//     try {
//         const response = await axios({
//             method: 'put',
//             url: `${config.API_DOMAIN_URL}/api/v1/reciever/${id}`,
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             data: newData
//         });
//         const responseData = await response.data;
//         return responseData;
//     } catch (error: any) {
//         return error.response.data;
//     }
// };

// // Delete (soft delete) a receiver detail
// export const deleteReceiverDetail = async (id: number) => {
//     try {
//         const response = await axios({
//             method: 'delete',
//             url: `${config.API_DOMAIN_URL}/api/v1/reciever/${id}`,
//             headers: {
//                 "Content-Type": "application/json"
//             }
//         });
//         const responseData = await response.data;
//         return responseData;
//     } catch (error: any) {
//         return error.response.data;
//     }
// };
