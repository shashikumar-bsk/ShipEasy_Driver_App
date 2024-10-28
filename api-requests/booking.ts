/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import config from './config';

// export const createBooking = async (data: any) => {
//     console.log(data);
//     const newData = JSON.stringify(data);
//     try {
//         const response = await axios({
//             method: 'post',
//             url: `${config.API_DOMAIN_URL}/api/v1/booking`,
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

// export const getAllBookings = async () => {
//     try {
//         const response = await axios({
//             method: 'get',
//             url: `${config.API_DOMAIN_URL}/api/v1/booking`,
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

export const getBookingsById = async (id: string) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${config.API_DOMAIN_URL}/api/v1/booking/${id}`,
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

// Uncomment and update the following functions if you want to add update and delete functionality for bookings

// export const updateBooking = async (bookingId: string, data: any) => {
//     console.log(data);
//     const newData = JSON.stringify(data);
//     try {
//         const response = await axios({
//             method: 'patch',
//             url: `${config.API_DOMAIN_URL}/api/v1/booking/${bookingId}`,
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

// export const deleteBooking = async (bookingId: string) => {
//     try {
//         const response = await axios({
//             method: 'delete',
//             url: `${config.API_DOMAIN_URL}/api/v1/booking/${bookingId}`,
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

