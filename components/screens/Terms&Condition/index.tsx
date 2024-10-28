import React, { useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { CheckBox } from 'react-native-elements';

const DriverTermsAndConditionsScreen = () => {
    const [isChecked, setIsChecked] = useState(false);

    const handleAccept = () => {
        Alert.alert('Accepted', 'You have accepted the terms and conditions.');
        // navigation.navigate('NextScreen'); // Uncomment to navigate to the next screen
    };

    const handleDecline = () => {
        Alert.alert('Declined', 'You have declined the terms and conditions.');
        // navigation.goBack(); // Uncomment to navigate back
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <Text style={styles.header}>Terms and Conditions</Text>
                    <Text style={styles.sectionHeader}>Introduction</Text>
                    <Text style={styles.content}>
                        These Terms and Conditions ("Terms") govern your use of our service as a driver for EleMove. By accepting these terms, you agree to comply with them fully.
                    </Text>
                    <Text style={styles.sectionHeader}>Driver Responsibilities</Text>
                    <Text style={styles.content}>
                        As a driver, you are responsible for ensuring the safety and satisfaction of your passengers. You must comply with all traffic laws and regulations, maintain your vehicle in a safe condition, and provide excellent customer service.
                    </Text>
                    <Text style={styles.sectionHeader}>Payment and Fees</Text>
                    <Text style={styles.content}>
                        You will receive payment for completed rides based on the fare rates provided by EleMove. EleMove reserves the right to change fare rates at any time. You are responsible for any taxes applicable to your earnings.
                    </Text>
                    <Text style={styles.sectionHeader}>Termination</Text>
                    <Text style={styles.content}>
                        EleMove reserves the right to terminate your access to our service if you violate these Terms or engage in any conduct that we deem harmful to our business or users.
                    </Text>
                    <Text style={styles.sectionHeader}>Limitation of Liability</Text>
                    <Text style={styles.content}>
                        EleMove is not liable for any damages or losses incurred by you or your passengers during the use of our service. You acknowledge and accept that your use of the service is at your own risk.
                    </Text>
                    <Text style={styles.sectionHeader}>Amendments</Text>
                    <Text style={styles.content}>
                        We may amend these Terms at any time by posting the amended terms on our website or app. Your continued use of the service after such changes constitutes your acceptance of the new Terms.
                    </Text>
                    <Text style={styles.content}>
                        Thank you for being a part of EleMove. We look forward to working with you.
                    </Text>
                </ScrollView>
                <CheckBox
                    title="I agree to the Terms and Conditions"
                    checked={isChecked}
                    onPress={() => setIsChecked(!isChecked)}
                />
                <View style={styles.buttonContainer}>
                    <View style={styles.button}>
                        <Button title="Decline" onPress={handleDecline} color="red" />
                    </View>
                    <View style={styles.button}>
                        <Button title="Accept" onPress={handleAccept} disabled={!isChecked} />
                    </View>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    scrollView: {
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    },
});

export default DriverTermsAndConditionsScreen;
