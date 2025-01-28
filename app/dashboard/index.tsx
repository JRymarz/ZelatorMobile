import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter, Link} from "expo-router";
import axios from "axios";

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const router = useRouter();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [intention, setIntention] = useState(null);
    const [mystery, setMystery] = useState(null);


    // Aktualizacja czasu
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);


    // Pobieranie danych intencji i tajemnicy
    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get(
                        'http://192.168.101.3:9002/mob/intention-mystery',
                            {
                                headers: {
                                    'User-ID': userId,
                                },
                            });

                    if(response.status === 200) {
                        const data = await response.data;
                        setIntention(data.intention?.title || "Brak przypisania do róży");
                        setMystery(data.mystery?.name || "Brak przypisanej tajemnicy");
                    } else {
                        console.error("Błąd podczas pobierania danych.");
                    }
                }
            } catch (error) {
                console.error("Nieoczekiwany błąd:", error.message);
            }
        };

        fetchData();
    }, []);


    const formatDateTime = () => {
        const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
        const months = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
        const day = days[currentTime.getDay()];
        const date = currentTime.getDate();
        const month = months[currentTime.getMonth()];
        const year = currentTime.getFullYear();
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');

        return `${day}, ${date} ${month} ${year} - ${hours}:${minutes}`;
    };


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    setUserData(JSON.parse(storedUserData));
                }
            } catch (error) {
                console.error("Błąd podczas pobierania danych usera:", error.message);
            }
        };

        fetchUserData();
    }, []);


    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userData');
            console.log("Wylogowano usera.");
            router.replace('/login');
        } catch (error) {
            console.error("Bład podczas wylogowywania:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Nagłówek */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Image
                        source={require('../../assets/images/rosaryIco.png')}
                        style={styles.logo}
                    />
                </TouchableOpacity>
                <Text style={styles.title}>Zelator</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Wyloguj się</Text>
                </TouchableOpacity>
            </View>

            {/* Treść */}
            <ScrollView contentContainerStyle={styles.content}>

                {/* Data i godzina */}
                <Text style={styles.dateTime}>{formatDateTime()}</Text>

                {/* Intencja */}
                <Text style={styles.sectionTitle}>Dzisiejsza intencja:</Text>
                <Text style={styles.intentionMysteryText}>{intention || "Wczytywanie intencji..."}</Text>

                {/* Tajemnica */}
                <Text style={styles.sectionTitle}>Twoja tajemnica:</Text>
                <Text style={styles.intentionMysteryText}>{mystery || "Wczytywanie tajemnicy..."}</Text>

                {/* Dane użytkownika */}
                {userData ? (
                    <View style={styles.userInfo}>
                        <Text style={styles.userInfoText}>Zalogowano jako:</Text>
                        <Text style={styles.userInfoName}>{userData.firstName} {userData.lastName}</Text>
                        <Text style={styles.userInfoEmail}>{userData.email}</Text>
                    </View>
                ) : (
                    <Text style={styles.loadingText}>Ładowanie danych użytkownika...</Text>
                )}

                {/*Modlitwa i tajemnica*/}
                <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard/prayer')}>
                    <Text style={styles.cardTitle}>Modlitwa i Tajemnica</Text>
                    <Text style={styles.cardButton}>Odmów modlitwę</Text>
                </TouchableOpacity>

                {/* Moja Róża */}
                {intention && intention !== "Brak przypisania do róży" && (
                    <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard/rose')}>
                        <Text style={styles.cardTitle}>Moja Róża</Text>
                        <Text style={styles.cardButton}>Szczegóły</Text>
                    </TouchableOpacity>
                )}

                {/*Prośba o Mszę*/}
                {intention && intention !== "Brak przypisania do róży" && (
                    <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard/mass')}>
                        <Text style={styles.cardTitle}>Msze Święte</Text>
                        <Text style={styles.cardButton}>Przeglądaj i zamów</Text>
                    </TouchableOpacity>
                )}

                {/*Kalendarz*/}
                {intention && intention !== "Brak przypisania do róży" && (
                    <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard/calendar')}>
                        <Text style={styles.cardTitle}>Kalendarz</Text>
                        <Text style={styles.cardButton}>Zobacz wydarzenia</Text>
                    </TouchableOpacity>
                )}

                {/*Chat*/}
                {intention && intention !== "Brak przypisania do róży" && (
                    <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard/chat')}>
                        <Text style={styles.cardTitle}>Chat</Text>
                        <Text style={styles.cardButton}>Wyświetl konwersacje</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Stopka */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    &copy; 2025 Zelator. Wszystkie prawa zastrzeżone.
                </Text>
            </View>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4c3',
    },
    header: {
        backgroundColor: '#93e4c1',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        width: 50,
        height: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    logoutText: {
        color: '#93e4c1',
        fontWeight: 'bold',
    },
    content: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    userInfo: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    userInfoText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userInfoName: {
        fontSize: 18,
        color: '#93e4c1',
        fontWeight: 'bold',
    },
    userInfoEmail: {
        fontSize: 14,
        color: '#666',
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cardButton: {
        color: '#93e4c1',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footer: {
        backgroundColor: '#93e4c1',
        padding: 10,
        alignItems: 'center',
    },
    footerText: {
        color: '#fff',
    },
    intentionMysterySection: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    intentionMysteryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    intentionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    mysteryText: {
        fontSize: 14,
        color: '#666',
    },
    dateTime: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionContent: {
        fontSize: 14,
        marginTop: 5,
        color: '#555',
    },
    intentionMysteryText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
});