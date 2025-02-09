import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ScrollView,
    Image,
} from "react-native";
import axios from "axios";
import {useRouter, Link} from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

export default function MyRose() {
    const [roseDetails, setRoseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loggedUser, setLoggedUser] = useState(null);

    const router = useRouter();
    const apiUrl = Constants.expoConfig.extra.API_URL;

    useEffect(() => {
        const fetchRoseDetails = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get(`http://${apiUrl}:9002/mob/my-rose`, {
                        headers: {
                            'User-ID': userId,
                        },
                    });
                    setRoseDetails(response.data);
                    setLoggedUser(user);
                }
            } catch (error) {
                setError("Nie udało się pobrać informacji o róży.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoseDetails();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Ładowanie...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text>{error}</Text>
            </View>
        );
    }

    const renderMember = ({ item }) => (
        <View
            style={[
                styles.memberCard,
                item.id === loggedUser?.id && styles.highlightedMember,
            ]}
        >
            <Text>{`${item.firstName} ${item.lastName}`}</Text>
            <Text>
                Tajemnica: {item.mystery?.name || "Nie przypisano tajemnicy"}
            </Text>
        </View>
    );

    return (
        <FlatList
            style={styles.container}
            data={roseDetails.members}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMember}
            ListHeaderComponent={() => (
                <View>
                    {/* Pasek nagłówka */}
                    <View style={styles.header}>
                        {/*<TouchableOpacity onPress={() => router.dismissTo('/dashboard')} styles={styles.header} >*/}
                        {/*    */}
                        {/* </TouchableOpacity>*/}
                        <Link dismissTo href="/dashboard" style={styles.logo}>
                            <Image
                                source={require('../../assets/images/rosaryIco.png')}
                                style={styles.logo}
                            />
                        </Link>
                        <Link dismissTo href="/dashboard" style={styles.title}>
                            <Text style={styles.title}>Moja róża</Text>
                        </Link>

                    </View>

                    {/* Informacje o róży */}
                    <View style={styles.roseDetails}>
                        <Text style={styles.subHeader}>{roseDetails.name}</Text>
                        <Text style={styles.intentionTitle}>Obecna intencja:</Text>
                        <Text style={styles.intentionText}>
                            {roseDetails.intention.title}
                        </Text>
                        <Text style={styles.intentionText}>
                            {roseDetails.intention.description}
                        </Text>
                        <Text style={styles.memberHeader}>Członkowie róży:</Text>
                    </View>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4c3',
    },
    header: {
        backgroundColor: '#93e4c1', // Zielony pasek
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Wyśrodkowanie treści
    },
    logo: {
        width: 50,
        height: 50,
        position: 'absolute',
        left: 15, // Ikona po lewej stronie
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    roseDetails: {
        padding: 16,
    },
    subHeader: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 16,
    },
    intentionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    intentionText: {
        fontSize: 16,
        marginBottom: 8,
    },
    memberHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    memberCard: {
            padding: 16,
            marginBottom: 8,
            backgroundColor: "#ffffff",
            borderRadius: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
    },
    highlightedMember: {
            backgroundColor: "#93e4c1",
    },
});
