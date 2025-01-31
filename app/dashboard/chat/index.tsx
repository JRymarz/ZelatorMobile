import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import axios from "axios";
import {Link, useRouter} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatList = () => {
    const [conversations, setConversations] = useState([]);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unread, setUnread] = useState({unreadGroupConversation: false, unreadUserConversations: []});

    const router = useRouter();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if (storedUserData) {
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


    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if (storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get("http://192.168.101.3:9002/mob/chat/unread-conversations", {
                        headers: {'User-ID': userId},
                    });

                    setUnread(response.data);
                }
            } catch (error) {
                console.error("Nie udało się pobrać nieprzeczytanych");
            }
        };

        const intervalId = setInterval(fetchUnreadMessages, 3000);

        return () => clearInterval(intervalId);
    }, []);


    const handleConversationClick = (conversation) => {
        const path =
            conversation.type === "group"
                ? `/dashboard/chat/group/${conversation.id}`
                : `/dashboard/chat/user/${conversation.id}`;
        router.push(path);
    };

    return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Link dismissTo href="/dashboard" style={styles.logo}>
                        <Image
                            source={require('../../../assets/images/rosaryIco.png')}
                            style={styles.logo}
                        />
                    </Link>
                    <Link dismissTo href="/dashboard">
                        <Text style={styles.title}>Chat</Text>
                    </Link>
                </View>

                {group && (
                    <TouchableOpacity
                        style={[
                            styles.card,
                            unread.unreadGroupConversation && styles.unreadCard,
                        ]}
                        onPress={() => handleConversationClick({type: "group", id: group.id})}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.text}>{group.name}</Text>
                        {unread.unreadGroupConversation && <View style={styles.badge}/>}
                    </TouchableOpacity>
                )}
                <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                unread.unreadUserConversations.includes(item.id) && styles.unreadCard,
                            ]}
                            onPress={() => handleConversationClick({type: "user", id: item.id})}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.text}>{`${item.firstName} ${item.lastName}`}</Text>
                            {unread.unreadUserConversations.includes(item.id) && (
                                <View style={styles.badge}/>
                            )}
                        </TouchableOpacity>
                    )}
                />
            </View>
    );
};

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f0f4c3', // Dopasowane tło
            // padding: 16,
        },
        header: {
            backgroundColor: '#93e4c1', // Dopasowany pasek nagłówka
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
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
        text: {
            fontSize: 24,
            fontWeight: 'bold',
            // color: '#fff',
            textAlign: 'center',
        },
        card: {
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        unreadCard: {
            backgroundColor: "#ffebee",
        },
        badge: {
            position: "absolute",
            top: 10,
            right: 10,
            width: 12,
            height: 12,
            backgroundColor: "red",
            borderRadius: 6,
        },
    });


export default ChatList;