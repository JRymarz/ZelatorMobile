import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatList = () => {
    const [conversations, setConversations] = useState([]);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if(storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get("http://192.168.101.3:9002/mob/chat/conversations", {
                        headers: {'User-ID': userId},
                    });
                    setGroup(response.data.group);
                    setConversations(response.data.members);
                }
            } catch (err) {
                Alert.alert("Błąd", "Nie udało się pobrać danych");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const handleConversationClick = (conversation) => {
        const path =
            conversation.type === "group"
                ? `/dashboard/chat/group/${conversation.id}`
                : `/dashboard/chat/user/${conversation.id}`;
        router.push(path);
    };

    if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

    return (
        <View style={styles.container}>
            {group && (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleConversationClick({ type: "group", id: group.id })}
                >
                    <Text style={styles.title}>{`${group.name}`}</Text>
                </TouchableOpacity>
            )}
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleConversationClick({ type: "user", id: item.id })}
                    >
                        <Text style={styles.title}>{`${item.firstName} ${item.lastName}`}</Text>
                    </TouchableOpacity>
                )}
            />
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
    card: {
        backgroundColor: "#f1f1f1",
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default ChatList;