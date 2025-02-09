import React, {useEffect, useRef, useState} from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView, Platform
} from "react-native";
import axios from "axios";
import {Link, useGlobalSearchParams} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants';

const UserChat = () => {
    const {id} = useGlobalSearchParams(); // Pobieranie parametru `id` z URL
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const apiUrl = Constants.expoConfig.extra.API_URL;


    const markMessagesAsRead = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                await axios.patch(
                    `http://${apiUrl}:9002/mob/chat/mark-as-read`,
                    null,
                    {
                        params: {receiverId: id},
                        headers: {'User-ID': userId},
                    }
                );
            }
        } catch (err) {
            console.log("Nie udało się oznaczyć wiadomości jako przeczytane", err);
        }
    };


    const fetchMessages = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.get(`http://${apiUrl}:9002/mob/chat/conversation`, {
                    params: {userId: id},
                    headers: {'User-ID': userId},
                });
                setMessages(response.data);
                setCurrentUserId(userId);
            }
        } catch (err) {
            console.log(err);
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
            if (storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.post(
                    `http://${apiUrl}:9002/mob/chat/send`,
                    {
                        message: newMessage,
                        receiverId: id
                    },
                    {headers: {'User-ID': userId}},
                );
                setMessages((prev) => [...prev, response.data]);
                setNewMessage("");
            }
        } catch (err) {
            console.log("Nie udało się wysłać wiadomości", err);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);

        const padZero = (num) => (num < 10 ? `0${num}` : num);

        const day = padZero(date.getDate());
        const monthNames = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());

        return `${day} ${month} ${year}, ${hours}:${minutes}`;
    };


    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollToEnd({animated: true});
    }, [messages]);

    if (loading) return <ActivityIndicator size="large" style={styles.loader}/>;


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.main}
        >
            <View style={styles.header}>
                <Link dismissTo href="/dashboard" style={styles.logo}>
                    <Image
                        source={require('../../../../assets/images/rosaryIco.png')}
                        style={styles.logo}
                    />
                </Link>
                <Link dismissTo href="/dashboard">
                    <Text style={styles.title}>Chat</Text>
                </Link>
            </View>

            <View style={styles.container}>
                <FlatList
                    ref={messagesEndRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => {
                        const isMine = item.senderId === currentUserId;

                        return (
                            <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.otherMessage]}>
                                {!isMine && (
                                    <Text style={styles.senderName}>{item.senderName}</Text>
                                )}
                                <View
                                    style={[styles.messageBox, isMine ? styles.myMessageBox : styles.otherMessageBox]}>
                                    <Text style={styles.messageText}>{item.message}</Text>
                                    <Text style={styles.timestamp}>{formatDate(item.timeStamp)}</Text>
                                </View>
                            </View>
                        );
                    }}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Wpisz wiadomość"
                />
                <Button title="Wyślij" onPress={handleSendMessage}/>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        backgroundColor: '#93e4c1',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 50,
        height: 50,
        position: 'absolute',
        left: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#f0f4c3',
        padding: 16,
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 10,
    },
    myMessage: {
        justifyContent: "flex-end",
    },
    otherMessage: {
        justifyContent: "flex-start",
    },
    messageBox: {
        maxWidth: "70%",
        padding: 10,
        borderRadius: 12,
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    },
    myMessageBox: {
        backgroundColor: "#d1ffd6",
        alignSelf: "flex-end",
    },
    otherMessageBox: {
        backgroundColor: "#f1f1f1",
        alignSelf: "flex-start",
    },
    senderName: {
        fontSize: 12,
        color: "#666",
        marginBottom: 2,
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        color: "#888",
        marginTop: 4,
        textAlign: "right",
    },
    inputContainer: {
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
    },
});


//     return (
//         <View style={styles.main}>
//             <View style={styles.header}>
//                 <Link dismissTo href="/dashboard" style={styles.logo}>
//                     <Image
//                         source={require('../../../../assets/images/rosaryIco.png')}
//                         style={styles.logo}
//                     />
//                 </Link>
//                 <Link dismissTo href="/dashboard">
//                     <Text style={styles.title}>Chat</Text>
//                 </Link>
//             </View>
//
//             <View style={styles.container}>
//                 <FlatList
//                     data={messages}
//                     keyExtractor={(item) => item.id.toString()}
//                     renderItem={({ item }) => <Text style={styles.message}>{item.message}</Text>}
//                 />
//                 <TextInput
//                     style={styles.input}
//                     value={newMessage}
//                     onChangeText={setNewMessage}
//                     placeholder="Wpisz wiadomość"
//                 />
//                 <Button title="Wyślij" onPress={handleSendMessage} />
//             </View>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     main: {
//         flex: 1,
//         backgroundColor: "#fff",
//     },
//     header: {
//         backgroundColor: '#93e4c1', // Dopasowany pasek nagłówka
//         padding: 15,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     logo: {
//         width: 50,
//         height: 50,
//         position: 'absolute',
//         left: 15, // Ikona po lewej stronie
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#fff',
//         textAlign: 'center',
//     },
//     container: {
//         flex: 1,
//         backgroundColor: '#f0f4c3', // Dopasowane tło
//         padding: 16,
//     },
//     loader: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     message: {
//         padding: 10,
//         marginVertical: 5,
//         backgroundColor: "#f1f1f1",
//         borderRadius: 8,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: "#ccc",
//         borderRadius: 8,
//         padding: 10,
//         marginBottom: 10,
//     },
// });

export default UserChat;