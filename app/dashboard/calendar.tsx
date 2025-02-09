import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, FlatList, Button, Alert, TextInput, Image} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {Link} from "expo-router";
import Constants from 'expo-constants';

LocaleConfig.locales['pl'] = {
    monthNames: [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień'
    ],
    monthNamesShort: ['Sty.', 'Lut.', 'Mrz.', 'Kwi.', 'Maj', 'Cze.', 'Lip.', 'Sie.', 'Wrz.', 'Paź.', 'List.', 'Gru.'],
    dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
    dayNamesShort: ['Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pi.', 'So.', 'Ni.'],
    today: "Dzisiaj"
};

LocaleConfig.defaultLocale = 'pl';

const CalendarScreen = () => {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [newEvent, setNewEvent] = useState({
        title: '',
        eventDate: '',
        eventType: 'OTHER',
    });
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const apiUrl = Constants.expoConfig.extra.API_URL;


    const handleDateConfirm = (date) => {
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const formattedTime = date.toTimeString().split(' ')[0]; // HH:MM:SS
        setNewEvent({ ...newEvent, eventDate: `${formattedDate}T${formattedTime}` });
        hideDatePicker();
    };


    const formatEventDate = (eventDate) => {
        const date = new Date(eventDate); // Tworzymy obiekt Date
        const day = String(date.getDate()).padStart(2, '0'); // Pobieramy dzień (dodajemy 0, jeśli jednocyfrowy)
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Pobieramy miesiąc (dodajemy 0, jeśli jednocyfrowy)
        const year = date.getFullYear(); // Pobieramy rok
        const hours = String(date.getHours()).padStart(2, '0'); // Pobieramy godziny
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Pobieramy minuty

        return `${day}.${month}.${year} ${hours}:${minutes}`; // Łączymy wszystko w jeden string
    };


    // Pobieranie wydarzeń
    const fetchEvents = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if(storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.get(`http://${apiUrl}:9002/mob/calendar-events`, {
                    headers: { 'User-ID': userId },
                });
                setEvents(response.data);
            }
        } catch (error) {
            console.log('Błąd podczas pobierania wydarzeń:', error);
            Alert.alert('Błąd', 'Nie udało się pobrać wydarzeń.');
        }
    };

    // Tworzenie nowego wydarzenia
    const createEvent = async () => {
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if(storedUserData) {
                const user = JSON.parse(storedUserData);
                const userId = user.id;

                const response = await axios.post(
                    `http://${apiUrl}:9002/mob/calendar-events/create`,
                    newEvent,
                    { headers: { 'User-ID': userId } }
                );
                Alert.alert('Sukces', 'Wydarzenie zostało utworzone');
                setNewEvent({ title: '', eventDate: '', eventType: 'OTHER' });
                fetchEvents();
            }
        } catch (error) {
            console.log('Błąd podczas tworzenia wydarzenia:', error);
            Alert.alert('Błąd', 'Nie udało się utworzyć wydarzenia.');
        }
    };

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]; // Dzisiejsza data w formacie YYYY-MM-DD
        setSelectedDate(today);
        fetchEvents();
    }, []);

    return (
        <View style={styles.site}>
            <View style={styles.header}>
                <Link dismissTo href="/dashboard" style={styles.logo}>
                    <Image
                        source={require('../../assets/images/rosaryIco.png')}
                        style={styles.logo}
                    />
                </Link>
                <Link dismissTo href="/dashboard" style={styles.title}>
                    <Text style={styles.title}>Kalendarz</Text>
                </Link>

            </View>
            <View style={styles.container}>

                <Calendar
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={events.reduce((acc, event) => {
                        const eventDate = event.eventDate.split('T')[0]; // Ekstrakcja daty (YYYY-MM-DD)
                        acc[eventDate] = acc[eventDate] || {}; // Jeśli dzień już istnieje, zachowaj jego oznaczenia
                        acc[eventDate].marked = true; // Dodaj niebieską kropkę
                        acc[eventDate].dotColor = 'blue'; // Kolor kropki

                        return acc;
                    }, {
                        [selectedDate]: { selected: true, selectedColor: 'green' }, // Dodanie zielonego zaznaczenia wybranego dnia
                    })}
                    locale="pl"
                />
                <Text style={styles.subtitle}>Wydarzenia:</Text>
                <FlatList
                    data={events.filter(event => event.eventDate.startsWith(selectedDate))}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.eventItem}>
                            <Text style={styles.eventTitle}>{item.title}</Text>
                            <Text>{formatEventDate(item.eventDate)}</Text>
                            <Text>Twórca: {item.creatorName}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text>Brak wydarzeń dla wybranego dnia.</Text>}
                />
                <Text style={styles.subtitle}>Dodaj wydarzenie:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Tytuł wydarzenia"
                    value={newEvent.title}
                    onChangeText={(text) => setNewEvent({ ...newEvent, title: text, eventDate: selectedDate })}
                />
                <Button title="Wybierz datę i godzinę" onPress={showDatePicker} />
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"
                    onConfirm={handleDateConfirm}
                    onCancel={hideDatePicker}
                />
                <Button title="Dodaj wydarzenie" onPress={createEvent} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    site: {
      flex: 1,
      backgroundColor: '#f0f4c3',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f4c3',
    },
    header: {
        backgroundColor: '#93e4c1',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    eventItem: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
    },
    eventTitle: {
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    logo: {
        width: 50,
        height: 50,
        position: 'absolute',
        left: 15, //
    },
});

export default CalendarScreen;