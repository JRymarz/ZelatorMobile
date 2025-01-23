import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Prayer() {
    const [prayerDetails, setPrayerDetails] = useState(null);
    const [prayerStatus, setPrayerStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [loggedUser, setLoggedUser] = useState(null);

    useEffect(() => {
        const fetchPrayerDetails = async () => {
            try {
                const storedUserData = await AsyncStorage.getItem("userData");
                if (storedUserData) {
                    const user = JSON.parse(storedUserData);
                    const userId = user.id;

                    const response = await axios.get("http://192.168.101.3:9002/mob/prayer-details", {
                        headers: {
                            "User-ID": userId,
                        },
                    });
                    setPrayerDetails(response.data);

                    const status = await axios.get(
                        'http://192.168.101.3:9002/mob/prayer-status',
                        {headers: {'User-ID': userId}}
                    );
                    setPrayerStatus(status.data);

                    setLoggedUser(user);
                }
            } catch (error) {
                setError("Nie udało się pobrać informacji o modlitwie.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrayerDetails();
    }, []);

    const markPrayerAsCompleted = async () => {
        try {
            const response = await axios.post(
                'http://192.168.101.3:9002/mob/prayer-complete',
                {},
                {headers: {"User-ID": loggedUser.id}}
            );
            Alert.alert("Sukces", "Modlitwa została oznaczona jako odmówiona.");
            setPrayerStatus({ status: true, prayerDate: new Date().toISOString() });
        } catch (error) {
            Alert.alert("Błąd", "Nie udało się oznaczyć modlitwy jako odmówionej.");
        }
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

    const isPrayerCompletedToday = prayerStatus?.status;

    return (
        <ScrollView style={styles.container}>
            {/* Pasek nagłówka */}
            <View style={styles.header}>
                <Link dismissTo href="/dashboard" style={styles.logo}>
                    <Image
                        source={require("../../assets/images/rosaryIco.png")}
                        style={styles.logo}
                    />
                </Link>
                <Link dismissTo href="/dashboard" style={styles.title}>
                    <Text style={styles.title}>Modlitwa</Text>
                </Link>
            </View>

            {/* Treść modlitwy */}
            <View style={styles.prayerDetails}>
                <Text style={styles.sectionHeader}>Intencja:</Text>
                <Text style={styles.text}>{prayerDetails.intention?.title || "Brak przypisanej intencji"}</Text>
                <Text style={styles.text}>{prayerDetails.intention?.description || ""}</Text>

                <Text style={styles.sectionHeader}>Twoja tajemnica:</Text>
                <Text style={styles.text}>{prayerDetails.mystery?.name || "Brak przypisanej tajemnicy"}</Text>
                <Text style={styles.text}>{prayerDetails.mystery?.meditation || ""}</Text>

                <Text style={styles.sectionHeader}>Treść modlitwy:</Text>
                <Text style={styles.text}>
                    Ojcze nasz, któryś jest w niebie, święć się imię Twoje, przyjdź
                    królestwo Twoje, bądź wola Twoja jako w niebie, tak i na ziemi.
                    Chleba naszego powszedniego daj nam dzisiaj i odpuść nam nasze
                    winy, jako i my odpuszczamy naszym winowajcom. I nie wódź nas na
                    pokuszenie, ale nas zbaw ode złego. Amen.
                </Text>

                <Text style={styles.text}>
                    (x10) Zdrowaś Maryjo, łaski pełna, Pan z Tobą, błogosławionaś Ty między
                    niewiastami i błogosławiony owoc żywota Twojego, Jezus. Święta
                    Maryjo, Matko Boża, módl się za nami grzesznymi teraz i w godzinę
                    śmierci naszej. Amen.
                </Text>

                <Text style={styles.text}>Chwała Ojcu i Synowi, i Duchowi Świętemu.
                    Jak była na początku, teraz i zawsze, i na wieki wieków. Amen.
                </Text>
            </View>

            {/* Przycisk */}
            {prayerDetails.mystery && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        isPrayerCompletedToday && { backgroundColor: "gray" },
                    ]}
                    onPress={!isPrayerCompletedToday ? markPrayerAsCompleted : undefined}
                    disabled={isPrayerCompletedToday}
                >
                    <Text style={styles.buttonText}>
                        {isPrayerCompletedToday
                            ? "Modlitwa już zakończona"
                            : "Oznacz modlitwę jako odmówioną"}
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f4c3",
    },
    header: {
        backgroundColor: "#93e4c1",
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
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
    prayerDetails: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        marginBottom: 16,
    },
    button: {
        backgroundColor: "#93e4c1",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        margin: 16,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});