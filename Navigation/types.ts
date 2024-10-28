export type RootStackParamList = {
  SplashScreen:undefined;
  LoginScreen: { phone: string };
  VerifyOtp: { phone: string;orderId: string };
  HomeScreen: {phone: string , driverId: any};
  RideInProgressScreen:{phone: string , driverId: any}
  Register:{ phone: string };
  DriverTermsAndConditions:{status: string}
  DriverRegistration: { phone: string };
  // HomeScreen: { phone: string, driverId: any };
  Home: { phone: string, driverId: any }
  Profile: { driverId: any };
  DriverEarningScreen: {status: string}
  EarningsScreen:{status: number}
  DriverDocuments:{driverId: any}
  DrivingLicenseScreen:{driverId:any}                                                                                                              
  AadharScreen:undefined
  PanCardScreen:undefined
  Pancard:{driverId:any} 
  DrivingLicense:{driverId:any} 
  Aadhar_document:{driverId:any}
  Rc_document:{driverId:any}
  Review_screen: { driverId: any }
  Driver_documents: { driverId: any; phone: string };
  Insurance:{driverId:any}
  TabsNavigator:undefined;
  DriverDashboard:{ driverId: any}
  GoToUserLocationScreen:{request:any}
  RideStartScreen:{rideRequest:any}
  RideEndScreen:{rideRequest:any}
  VerifyOtpScreen:{rideRequest:any}
  PaymentScreen:{rideRequest:any}
};