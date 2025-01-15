import React, { useState, useEffect } from 'react';
import BACKEND_URL from './Constants';
import { useNavigate } from 'react-router-dom';
import profileImage from './profile_pictures/profile.png';
import {
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Snackbar,
    Pagination,
    Grid,
    Box
} from '@mui/material';

function getCookieByName(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function ProfilePage() {
    const navigate = useNavigate();
    useEffect(() => {
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const userCookie = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('user='));

        if (!isLoggedIn || !userCookie) {
            navigate('/login');
        }
    }, [navigate]);

    const [userData, setUserData] = useState({
        username: '',
        name: '',
        birthDate: '',
        address: '',
        phone: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [currentReviewsPage, setCurrentReviewsPage] = useState(1);

    const itemsPerPage = 5;

    useEffect(() => {
        async function fetchUserData() {
            try {
                const userCookie = getCookieByName('user');
                const response = await fetch(`${BACKEND_URL}/profile`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userCookie,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка получения профиля');
                }

                const data = await response.json();
                setUserData({
                    username: data.username,
                    name: data.name,
                    birthDate: data.birthDate || '',
                    address: data.address || '',
                    phone: data.phone || '',
                    description: data.description || '',
                });
                setNewDescription(data.description || '');
            } catch (error) {
                console.error('Ошибка получения профиля:', error);
            }
        }

        async function fetchFavorites() {
            try {
                const userCookie = getCookieByName('user');
                const response = await fetch(`${BACKEND_URL}/profile/favorites`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userCookie,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка получения избранного');
                }

                const data = await response.json();
                setFavorites(data.favorites || []);
            } catch (error) {
                console.error('Ошибка получения избранных товаров:', error);
            }
        }

        async function fetchOrders() {
            try {
                const userCookie = getCookieByName('user');
                const response = await fetch(`${BACKEND_URL}/orders`, {
                    headers: {
                        'Authorization': 'Bearer ' + userCookie,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки заказов');
                }

                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Ошибка загрузки заказов:', error);
            }
        }

        async function fetchReviews() {
            try {
                const userCookie = getCookieByName('user');
                const response = await fetch(`${BACKEND_URL}/profile/reviews`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userCookie,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка загрузки отзывов');
                }

                const data = await response.json();
                setReviews(data || []);
            } catch (error) {
                console.error('Ошибка загрузки отзывов:', error);
            }
        }

        fetchUserData();
        fetchFavorites();
        fetchOrders();
        fetchReviews();
    }, []);

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleEdit = () => setIsEditing(true);

    const handleSave = async () => {
        try {
            const userCookie = getCookieByName('user');
            const response = await fetch(`${BACKEND_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + userCookie,
                },
                body: JSON.stringify({ description: newDescription }),
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения описания');
            }

            setUserData((prev) => ({ ...prev, description: newDescription }));
            setIsEditing(false);
            setSnackbarMessage('Описание успешно обновлено!');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Ошибка сохранения описания:', error);
        }
    };

    const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedReviews = reviews.slice((currentReviewsPage - 1) * itemsPerPage, currentReviewsPage * itemsPerPage);

    return (
        <Container style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Paper elevation={3} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <Typography variant="h5" style={{ textAlign: 'center', marginBottom: '20px', color: '#369f26' }}>
                    Профиль пользователя
                </Typography>

                <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img
                                src={profileImage}
                                alt="Аватар пользователя"
                                style={{ borderRadius: '50%', width: '150px', height: '150px', border: '2px solid #369f26' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Typography variant="h6" style={{ color: '#369f26' }}>{userData.name}</Typography>
                            <Typography>Дата рождения: {userData.birthDate}</Typography>
                            <Typography>Адрес: {userData.address}</Typography>
                            <Typography>Телефон: {userData.phone}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Typography variant="h6" style={{ marginBottom: '10px', color: '#369f26' }}>
                        Избранные товары:
                    </Typography>
                    {favorites.length === 0 ? (
                        <Typography>Нет избранных товаров</Typography>
                    ) : (
                        favorites.map((fav, index) => (
                            <Paper
                                key={index}
                                elevation={1}
                                style={{
                                    padding: '10px',
                                    marginBottom: '10px',
                                    border: '1px solid #369f26',
                                }}
                            >
                                <Typography>{fav.product_name || 'Не указано'}</Typography>
                            </Paper>
                        ))
                    )}
                </Paper>

                <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Typography variant="h6" style={{ marginBottom: '10px', color: '#369f26' }}>
                        Ваши заказы:
                    </Typography>
                    {orders.length === 0 ? (
                        <Typography>Нет заказов</Typography>
                    ) : (
                        <>
                            {paginatedOrders.map((order, index) => (
                                <Paper
                                    key={index}
                                    elevation={1}
                                    style={{
                                        padding: '10px',
                                        marginBottom: '10px',
                                        border: '1px solid #369f26',
                                    }}
                                >
                                    <Typography>Дата заказа: {new Date(order.order_date).toLocaleDateString()}</Typography>
                                    <Typography>Статус: {order.status}</Typography>
                                </Paper>
                            ))}
                            {orders.length > itemsPerPage && (
                                <Pagination
                                    count={Math.ceil(orders.length / itemsPerPage)}
                                    page={currentPage}
                                    onChange={(event, value) => setCurrentPage(value)}
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </>
                    )}
                </Paper>

                <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Typography variant="h6" style={{ marginBottom: '10px', color: '#369f26' }}>
                        Ваши отзывы:
                    </Typography>
                    {reviews.length === 0 ? (
                        <Typography>Нет отзывов</Typography>
                    ) : (
                        <>
                            {paginatedReviews.map((review, index) => (
                                <Paper
                                    key={index}
                                    elevation={1}
                                    style={{
                                        padding: '10px',
                                        marginBottom: '10px',
                                        border: '1px solid #369f26',
                                    }}
                                >
                                    <Typography>Товар: {review.product_name || 'Не указано'}</Typography>
                                    <Typography>Отзыв: {review.review_text || 'Нет текста'}</Typography>
                                    <Typography style={{ fontSize: '0.8em', color: '#757575' }}>
                                        Дата: {review.review_date || 'Не указана'}
                                    </Typography>
                                </Paper>
                            ))}
                            {reviews.length > itemsPerPage && (
                                <Pagination
                                    count={Math.ceil(reviews.length / itemsPerPage)}
                                    page={currentReviewsPage}
                                    onChange={(event, value) => setCurrentReviewsPage(value)}
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </>
                    )}
                </Paper>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </Container>
    );
}

export default ProfilePage;
