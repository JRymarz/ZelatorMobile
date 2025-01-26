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
    Button, Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Link} from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MassRequests() {
    const [massRequests, setMassRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [newIntention, setNewIntention] = useState("");
    const [newMassDate, setNewMassDate] = useState("");
    const [userHasGroup, setUserHasGroup] = useState(false);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Funkcja do pobierania próśb o Msze
    const fetchMassRequests = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("userData");
            if (storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.get(
                    "http://192.168.101.3:9002/mob/mass-requests",
                    { headers: { "User-ID": userId } }
                );

                console.log(response.data.hasGroup);

                setMassRequests(response.data.requests);
                setUserHasGroup(response.data.hasGroup);
            }
        } catch (error) {
            setError("Nie udało się pobrać próśb o Msze Święte.");
        } finally {
            setLoading(false);
        }
    };

    // Użycie fetchMassRequests w useEffect
    useEffect(() => {
        fetchMassRequests();
    }, []);

    const createMassRequest = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem("userData");
            if (storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const combinedDateTime = new Date(date);
                combinedDateTime.setHours(time.getHours(), time.getMinutes());

                const massDate = new Date(
                    combinedDateTime.getTime() - combinedDateTime.getTimezoneOffset() * 60000
                ).toISOString();

                console.log(newIntention + massDate);

                await axios.post(
                    "http://192.168.101.3:9002/mob/mass-request",
                    {
                        intention: newIntention,
                        massDate: massDate,
                    },
                    { headers: { "User-ID": userId } }
                );

                Alert.alert("Sukces", "Prośba o Mszę została utworzona.");
                setModalVisible(false);
                setNewIntention("");
                setNewMassDate("");
                // Ponowne załadowanie danych
                setLoading(true);
                fetchMassRequests();
            }
        } catch (error) {
            Alert.alert("Błąd", "Nie udało się utworzyć prośby o Mszę.");
        }
    };


    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
    }

    const onTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(false);
        setTime(currentTime);
    }


    const formatDateTime = (isoDate) => {
        const date = new Date(isoDate);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${day}.${month}.${year} ${hours}:${minutes}`;
    };


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

    return (
        <View style={styles.nav}>
            <View style={styles.header}>
                <Link dismissTo href="/dashboard" style={styles.logo}>
                    <Image
                        source={require("../../assets/images/rosaryIco.png")}
                        style={styles.logo}
                    />
                </Link>
                <Link dismissTo href="/dashboard" style={styles.title}>
                    <Text style={styles.title}>Msze Święte</Text>
                </Link>
            </View>

            {userHasGroup ? (
                <>
                    <FlatList
                        data={massRequests}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => {
                            // Dynamiczny styl na podstawie statusu
                            const backgroundColor =
                                item.status === "APPROVED"
                                    ? "#93e4c1"
                                    : item.status === "REJECTED"
                                        ? "#ff5252"
                                        : "#ffffff";

                            return (
                                <View style={[styles.massCard, { backgroundColor }]}>
                                    <Text>{item.intention}</Text>
                                    <Text>{formatDateTime(item.massDate)}</Text>
                                </View>
                            );
                        }}
                        ListHeaderComponent={
                            <Text style={styles.head}>
                                Twoje prośby o Msze Święte
                            </Text>
                        }
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>Dodaj prośbę</Text>
                    </TouchableOpacity>

                    {/* Modal do tworzenia nowej prośby */}
                    <Modal
                        visible={modalVisible}
                        animationType="slide"
                        transparent={true}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    Utwórz nową prośbę
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Intencja"
                                    value={newIntention}
                                    onChangeText={setNewIntention}
                                />
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.datePickerButtonText}>
                                        Wybierz datę: {date.toISOString().split('T')[0]}
                                    </Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={onChange}
                                    />
                                )}

                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.datePickerButtonText}>
                                        Wybierz godzinę: {time.toTimeString().split(' ')[0]}
                                    </Text>
                                </TouchableOpacity>

                                {showTimePicker && (
                                    <DateTimePicker
                                        value={time}
                                        mode="time"
                                        display="default"
                                        onChange={onTimeChange}
                                    />
                                )}

                                {/*<TextInput*/}
                                {/*    style={styles.input}*/}
                                {/*    placeholder="Data Mszy (YYYY-MM-DD)"*/}
                                {/*    value={newMassDate}*/}
                                {/*    onChangeText={setNewMassDate}*/}
                                {/*/>*/}
                                <Button
                                    title="Utwórz"
                                    onPress={createMassRequest}
                                />
                                <Button
                                    title="Anuluj"
                                    onPress={() => setModalVisible(false)}
                                    color="red"
                                />
                            </View>
                        </View>
                    </Modal>
                </>
            ) : (
                <View style={styles.center}>
                    <Text>Nie należysz do żadnej grupy.</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f4c3",
        // padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    head: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        marginTop: 10,
        paddingLeft: 16,
    },
    massCard: {
        backgroundColor: "#ffffff",
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    addButton: {
        backgroundColor: "#93e4c1",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 8,
        width: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 16,
        padding: 8,
    },
    logo: {
        width: 50,
        height: 50,
        position: "absolute",
        left: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    header: {
        backgroundColor: "#93e4c1",
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    nav: {
        flex: 1,
        backgroundColor: "#f0f4c3",
    },
    datePickerButton: {
        backgroundColor: '#93e4c1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16,
        alignItems: 'center',
    },
    datePickerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});