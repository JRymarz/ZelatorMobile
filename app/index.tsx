import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {Link, useRouter} from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";


const HomePage = () => {
    const [isAuthentiacted, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            const userData = await AsyncStorage.getItem('userData');
            setIsAuthenticated(!!userData);

            if(userData) {
                console.log(userData)
                router.replace('/dashboard');
            }
        };

        checkAuthentication();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/images/rosaryIco.png')} style={styles.logo} />
                <Text style={styles.title}>Zelator</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.welcomeText}>Witamy w aplikacji Zelator!</Text>
                <Text style={styles.description}>
                    Nasza aplikacja pomaga zarządzać grupami modlitewnymi, planować zmiany tajemnic różańcowych i modlić się wspólnie.
                </Text>

                <Link replace href="/login" style={styles.button}>
                    <Text style={styles.buttonText}>Zaloguj się, aby zacząć</Text>
                </Link>

                <View style={styles.features}>
                    <Text style={styles.featuresTitle}>Dlaczego warto?</Text>
                    {[
                        'Automatyczne przypomnienia o modlitwach.',
                        'Łatwe przypisanie intencji do modlitw.',
                        'Planowanie zmian tajemnic w grupach.',
                    ].map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.featureIconText}>✔️</Text>
                            </View>
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.footerText}>&copy; 2025 Zelator. Wszystkie prawa zastrzeżone.</Text>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4c3',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#93e4c1',
        paddingVertical: 15,
    },
    logo: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    title: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#555',
    },
    button: {
        backgroundColor: '#93e4c1',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    features: {
        marginTop: 20,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#93e4c1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    featureIconText: {
        color: '#fff',
        fontSize: 16,
    },
    featureText: {
        fontSize: 16,
        color: '#555',
    },
    footer: {
        backgroundColor: '#93e4c1',
        paddingVertical: 10,
        alignItems: 'center',
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default HomePage;