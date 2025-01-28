import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import { useGlobalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserChat = () => {
    const { id } = useGlobalSearchParams(); // Pobieranie parametru `id` z URL
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);


    const markMessagesAsRead = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if(storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                await axios.patch(
                    "http://192.168.101.3:9002/mob/chat/mark-as-read",
                    null,
                    {
                        params: { receiverId: id },
                        headers: {'User-ID': userId},
                    }
                );
            }
        } catch (err) {
            console.error("Nie udało się oznaczyć wiadomości jako przeczytane", err);
        }
    };


    const fetchMessages = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if(storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.get("http://192.168.101.3:9002/mob/chat/conversation", {
                    params: { userId: id },
                    headers: {'User-ID': userId},
                });
                setMessages(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchAndMarkMessages = async () => {
            await fetchMessages();
            await markMessagesAsRead();
        }

        fetchAndMarkMessages();

        const interval = setInterval(async () => {
            await fetchMessages();
            await markMessagesAsRead();
        }, 3000);

        return () => clearInterval(interval);
    }, [id]);


    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if(storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.post(
                    "http://192.168.101.3:9002/mob/chat/send",
                    { message: newMessage,
                        receiverId: id },
                    { headers: {'User-ID': userId} },
                );
                setMessages((prev) => [...prev, response.data]);
                setNewMessage("");
            }
        } catch (err) {
            console.error("Nie udało się wysłać wiadomości", err);
        }
    };

    if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <Text style={styles.message}>{item.message}</Text>}
            />
            <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Wpisz wiadomość"
            />
            <Button title="Wyślij" onPress={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#fff",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    message: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: "#f1f1f1",
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
});

export default UserChat;