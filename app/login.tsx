import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Link, useRouter} from "expo-router";

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    // const navigation = useNavigation();
    // const { setUser } = useUser();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://192.168.101.3:9002/mob/login', {
                email,
                password,
            });

            if(response.status === 200) {
                await AsyncStorage.setItem('userData', JSON.stringify(response.data));
                console.log('Zalogowano pomyslnie.');
                router.replace('/dashboard');
            }
        } catch (error) {
            if(error.response) {
                setError(error.response.data);
            } else {
                setError('Niespodziewany błąd');
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header section */}
            <View style={styles.header}>
                <Link replace href="/" style={styles.logo}>
                    <Image source={require('../assets/images/rosaryIco.png')} style={styles.logo} />
                </Link>
                <Text style={styles.title}>Zelator</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
                <Text style={styles.heading}>Logowanie</Text>
                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    required
                />
                <TextInput
                    style={styles.input}
                    placeholder="Hasło"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                    required
                />
                <Button title="Zaloguj" onPress={handleLogin} color="#93e4c1" />

                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Zelator. Wszystkie prawa zastrzeżone.</Text>
            </View>
        </View>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4c3',
        justifyContent: 'space-between',
    },
    header: {
        backgroundColor: '#93e4c1',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '300',
        letterSpacing: 2,
        fontFamily: 'monospace',
    },
    formContainer: {
        padding: 20,
        backgroundColor: '#f9fbe7',
        borderRadius: 10,
        marginHorizontal: 20,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    heading: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    footer: {
        backgroundColor: '#93e4c1',
        padding: 10,
        alignItems: 'center',
    },
    footerText: {
        color: '#fff',
        fontSize: 14,
    },
});