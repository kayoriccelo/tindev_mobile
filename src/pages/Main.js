import React, { useState, useEffect } from 'react';
import { SafeAreaView, Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import io from 'socket.io-client';

import api from '../services/api';
import logo from '../assets/logo.png';
import dislike from '../assets/dislike.png';
import like from '../assets/like.png';
import itsamatch from '../assets/itsamatch.png';


export default function Main({ navigation }) {
    const id = navigation.getParam('user')
    const [users, setUsers] = useState([]);
    const [matchDev, setMatchDev] = useState(null);

    useEffect(() => {
        async function loadUsers() {
            const response = await api.get('/devs', {
                headers: {
                    user: id
                }
            });

            setUsers(response.data);
        };

        loadUsers();
    }, [id]);

    useEffect(() => {
        const socket = io('http://localhost:3333', {
            query: { user: id }
        });

        socket.on('match', dev => {
            console.log(dev);
            setMatchDev(dev);
        });
    }, [id]);

    const handleLogout = async () => {
        await AsyncStorage.clear();

        navigation.navigate('Login');
    };

    async function handleDislike() {
        const [{ _id }, ...rest] = users;

        await api.post(`/devs/${_id}/dislikes`, null, {
            headers: {
                user: id
            }
        });

        setUsers(rest);
    }

    async function handleLike() {
        const [{ _id }, ...rest] = users;

        await api.post(`/devs/${_id}/likes`, null, {
            headers: {
                user: id
            }
        })

        setUsers(rest);
    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Image style={styles.logo} source={logo} />
            </TouchableOpacity>

            <View style={styles.cardsContainer}>
                {users.length === 0
                    ? <Text style={styles.empty}>Acabou :(</Text>
                    : (
                        users.map((user, index) => (
                            <View key={user._id} style={[styles.card, { zIndex: users.length - index }]}>
                                <Image style={styles.avatar} source={{ uri: user.avatar }} />
                                <View style={styles.footer}>
                                    <Text style={styles.name}> {user.name} </Text>
                                    <Text style={styles.bio} numberOfLines={3}>{user.bio}</Text>
                                </View>
                            </View>
                        ))
                    )}
            </View>

            {users.length > 0 && (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleDislike}>
                        <Image source={dislike} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleLike}>
                        <Image source={like} />
                    </TouchableOpacity>
                </View>
            )}
            {matchDev && (
                <View style={styles.matchContainer}>
                    <Image source={itsamatch} />
                    <Image style={styles.matchAvatar} source={{ uri: matchDev.avatar}} />
                    <Text style={styles.matchName}>{matchDev.name}</Text>
                    <Text style={styles.matchBio}>{matchDev.bio}</Text>
                    <TouchableOpacity onPress={() => setMatchDev(null)}>
                        <Text style={styles.matchClose}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    matchContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
    },
    matchImage: {
        height: 60,
        resizeMode: 'contain'
    },
    matchAvatar: {
        width: 200,
        height: 200,
        borderRadius: 50,
        borderWidth: 5,
        borderColor: '#FFF',
        marginTop: 30,
        marginBottom: 30,
    },
    matchName: {
        fontSize: 32,
        color: '#FFF'
    },
    matchBio: {
        marginTop: 10,
        fontSize: 20,
        lineHeight: 30,
        maxWidth: 400,
        color: 'rgba(255, 255, 255, 0.8)'
    },
    matchClose:{
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        marginTop: 30,
    },
    logo: {
        marginTop: 30
    },
    empty: {
        alignSelf: 'center',
        color: '#999',
        fontSize: 24,
        fontWeight: 'bold'
    },
    cardsContainer: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500,
    },
    card: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        margin: 30,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    avatar: {
        flex: 1,
        height: 300,
    },
    footer: {
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    bio: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        lineHeight: 18
    },
    buttonsContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },
});
