import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, FlatList} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter, Link} from "expo-router";
import axios from "axios";
import {Badge} from "@react-navigation/bottom-tabs/src/views/Badge";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const router = useRouter();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [intention, setIntention] = useState(null);
    const [mystery, setMystery] = useState(null);

    const [areUnread, setAreUnread] = useState(false);
    const [nextEvent, setNextEvent] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);



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


    useEffect(() => {
        const fetchNoti = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get(
                        'http://192.168.101.3:9002/mob/chat/notifications',
                        {
                            headers: {
                                'User-ID': userId,
                            },
                        });

                    setNotifications(response.data);

                    const unread = response.data.some(notification => !notification.isRead);
                    setHasUnreadNotifications(unread);
                }
            } catch (error) {
                console.error("Blad wczytywania notyfikacji");
            }
        };

        fetchNoti();

        const intervalId = setInterval(fetchNoti, 5000);

        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        const fetchNextEvent = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get(
                        'http://192.168.101.3:9002/mob/calendar-events/next',
                        {
                            headers: {
                                'User-ID': userId,
                            },
                        });

                    setNextEvent(response.data);
                }
            } catch (error) {
                console.error("Błąd: ", error.message);
            }
        };

        fetchNextEvent();

        const intervalId = setInterval(fetchNextEvent, 60000);

        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        const fetchAreUnread = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get(
                        'http://192.168.101.3:9002/mob/chat/are-unread',
                        {
                            headers: {
                                'User-ID': userId,
                            },
                        });

                    setAreUnread(response.data);
                }
            } catch (error) {
                console.error("Nie udało się pobrać nieprzeczytanych");
            }
        };

        const intervalId = setInterval(fetchAreUnread, 3000);

        return () => clearInterval(intervalId);
    })


    const handleNotificationClick = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if(storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.post(
                    'http://192.168.101.3:9002/mob/chat/read-notifications',
                    {},
                    {
                        headers: {
                            'User-ID': userId,
                        },
                    });

                setHasUnreadNotifications(false);
                setOpenDialog(true);
            }
        } catch (error) {
            console.error("Błąd podczas oznaczania powiadomień jako przeczytane" + error.message);
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

            {/* Ikona powiadomień z kropką */}
            <TouchableOpacity onPress={() => handleNotificationClick()} style={styles.notificationWrapper}>
                <View style={styles.notificationIcon}>
                    <MaterialIcons name="notifications-active" size={40} color="black" />
                    {hasUnreadNotifications && <View style={styles.badge} />}
                </View>
            </TouchableOpacity>

            {/* Okno modalne z powiadomieniami */}
            <Modal visible={openDialog} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Powiadomienia</Text>
                        <FlatList
                            data={notifications}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => <Text style={styles.notificationText}>{item.message}</Text>}
                        />
                        <TouchableOpacity onPress={() => setOpenDialog(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Zamknij</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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

                {nextEvent ? (
                    <>
                        <Text style={styles.sectionTitle}>Najbliższe wydarzenie:</Text>
                        <Text style={styles.intentionMysteryText}>{nextEvent.title}</Text>
                        <Text style={styles.intentionMysteryText}>
                            {new Date(nextEvent.eventDate).toISOString().replace("T", " ").slice(0, 16)}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.intentionMysteryText}>Brak nadchodzących wydarzeń</Text>
                )}

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
                    <TouchableOpacity
                        style={[styles.card, areUnread && styles.cardUnread]}
                        onPress={() => router.push('/dashboard/chat')}
                    >
                        {/* Kropka powiadomień */}
                        {areUnread && <View style={styles.badge} />}

                        <Text style={styles.cardTitle}>Chat</Text>
                        <Text style={styles.cardButton}>Wyświetl konwersacje</Text>
                    </TouchableOpacity>

                    // <TouchableOpacity style={styles.card} onPress={() => router.push('/dashboard/chat')}>
                    //     <Text style={styles.cardTitle}>Chat</Text>
                    //     <Text style={styles.cardButton}>Wyświetl konwersacje</Text>
                    // </TouchableOpacity>
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
    cardUnread: {
        backgroundColor: "#dcedc8", // Jaśniejszy kolor, jeśli są nowe wiadomości
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
    notificationWrapper: {
        width: 50,  // Dopasowanie szerokości do ikonki
        height: 50, // Dopasowanie wysokości do ikonki
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    notificationIcon: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -2,  // Delikatnie nad ikoną
        right: -2, // Blisko prawej krawędzi
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "red",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    notificationText: {
        fontSize: 16,
        paddingVertical: 5,
    },
    closeButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#007BFF",
        borderRadius: 5,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});