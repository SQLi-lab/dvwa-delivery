import React, { useState, useEffect } from 'react';
import BACKEND_URL from './Constants';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    TextField,
    Paper,
} from '@mui/material';
import images from './imagesLoader';

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

function getImageForProduct(article) {
    const articleString = String(article);
    let hash = 0;
    for (let i = 0; i < articleString.length; i++) {
        hash = articleString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % images.length);
    return images[index];
}

function ProductDetail({ addToCart }) {
    const { product_id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');
    const [username, setUsername] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const userCookie = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('user='));

        if (!isLoggedIn || !userCookie) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        async function fetchProductDetails() {
            try {
                const productResponse = await fetch(`${BACKEND_URL}/products/${product_id}`);
                const productData = await productResponse.json();
                const productWithImage = {
                    ...productData,
                    image: getImageForProduct(productData.article),
                };
                setProduct(productWithImage);
            } catch (error) {
                console.error('Ошибка загрузки продукта:', error);
            }
        }

        async function fetchReviews() {
            try {
                const reviewsResponse = await fetch(`${BACKEND_URL}/products/${product_id}/reviews`);
                const reviewsData = await reviewsResponse.json();
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            } catch (error) {
                console.error('Ошибка загрузки отзывов:', error);
            }
        }

        async function fetchUserName() {
            const userCookie = getCookieByName('user');
            if (userCookie) {
                setUsername(userCookie);
            }
        }

        fetchProductDetails();
        fetchReviews();
        fetchUserName();
    }, [product_id]);

    useEffect(() => {
        async function checkFavoriteStatus() {
            if (!product || !product.article) return;

            const userCookie = getCookieByName('user');
            if (!userCookie) {
                console.error("Пользователь не авторизован!");
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/favorites/check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userCookie,
                    },
                    body: JSON.stringify({ article: product.article }),
                });
                const data = await response.json();
                setIsFavorite(data.isFavorite || false);
            } catch (error) {
                console.error('Ошибка проверки избранного:', error);
            }
        }

        checkFavoriteStatus();
    }, [product]);

    const handleFavoriteToggle = async () => {
        const userCookie = getCookieByName('user');
        if (!userCookie) {
            alert('Пользователь не авторизован!');
            return;
        }

        const endpoint = isFavorite
            ? `${BACKEND_URL}/favorites/${product.article}`
            : `${BACKEND_URL}/favorites`;
        const method = isFavorite ? 'DELETE' : 'POST';
        const body = isFavorite ? null : JSON.stringify({ article: product.article });

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + userCookie,
                },
                body,
            });

            if (!response.ok) {
                throw new Error('Ошибка управления избранным');
            }

            alert(isFavorite ? 'Продукт удален из избранного!' : 'Продукт добавлен в избранное!');
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Ошибка управления избранным:', error);
            alert('Не удалось изменить статус избранного.');
        }
    };

    const handleAddReview = async () => {
        if (!newReview.trim()) {
            alert('Пожалуйста, введите текст отзыва!');
            return;
        }

        const userCookie = getCookieByName('user');

        try {
            const response = await fetch(`${BACKEND_URL}/products/${product_id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + userCookie,
                },
                body: JSON.stringify({ review: newReview }),
            });

            if (!response.ok) {
                throw new Error('Ошибка добавления отзыва');
            }

            setReviews((prev) => [...prev, { username: username || 'guest', review_text: newReview }]);
            setNewReview('');
        } catch (error) {
            console.error('Ошибка добавления отзыва:', error);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        const cartItem = {
            article: product.article,
            name: product.name,
            price: product.price,
            image: product.image,
        };

        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
        localStorage.setItem('cart', JSON.stringify([...existingCart, cartItem]));
        alert('Продукт добавлен в корзину!');
    };

    if (!product) return <Typography>Загрузка...</Typography>;

    return (
        <Container style={{ marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Paper style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px' }}>
                <img
                    src={product.image || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        border: '2px solid #369f26',
                    }}
                />
                <div>
                    <Typography variant="h4" gutterBottom style={{ color: '#369f26' }}>
                        {product.name}
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '10px', color: '#455a64' }}>
                        Магазин: {product.store_name || 'Не указано'}
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '10px', color: '#455a64' }}>
                        Категория: {product.category || 'Не указано'}
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '10px', color: '#455a64' }}>
                        В наличии: {product.stock > 0 ? `${product.stock} шт.` : 'Нет в наличии'}
                    </Typography>
                    <Typography variant="body1" style={{ marginBottom: '10px', color: '#369f26', fontWeight: 'bold' }}>
                        Цена: {product.price} руб.
                    </Typography>
                    <Button
                        variant="contained"
                        style={{ backgroundColor: '#369f26', color: '#fff', marginTop: '20px' }}
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0} // Делаем кнопку неактивной, если товара нет в наличии
                    >
                        Добавить в корзину
                    </Button>

                    <Button
                        variant={isFavorite ? "outlined" : "contained"}
                        style={
                            isFavorite
                                ? {
                                    color: "#ff5722",
                                    borderColor: "#ff5722",
                                    backgroundColor: "#fff",
                                    marginLeft: "10px",
                                    marginTop: "20px",
                                }
                                : {
                                    color: "#fff",
                                    backgroundColor: "#ff5722",
                                    marginLeft: "10px",
                                    marginTop: "20px",
                                }
                        }
                        onClick={handleFavoriteToggle}
                    >
                        {isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                    </Button>
                </div>
            </Paper>

            <Paper style={{ padding: '20px' }}>
                <Typography variant="h5" gutterBottom style={{ color: '#369f26' }}>
                    Отзывы
                </Typography>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <Paper
                            key={index}
                            elevation={1}
                            style={{
                                padding: '10px',
                                marginBottom: '10px',
                                border: '1px solid #369f26',
                                backgroundColor: index % 2 === 0 ? '#eafbea' : '#ffffff',
                            }}
                        >
                            <Typography style={{ color: '#455a64' }}>Автор: {review.username || 'guest'}</Typography>
                            <Typography style={{ marginTop: '5px', color: '#455a64' }}>{review.review_text}</Typography>
                        </Paper>
                    ))
                ) : (
                    <Typography style={{ color: '#757575' }}>Отзывов пока нет. Будьте первым!</Typography>
                )}
                <TextField
                    label="Оставить отзыв"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    sx={{
                        marginTop: '20px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: '#369f26',
                            },
                            '&:hover fieldset': {
                                borderColor: '#2d8e22',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#369f26',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#369f26',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#369f26',
                        },
                    }}
                />

                <Button
                    variant="contained"
                    style={{ backgroundColor: '#369f26', color: '#fff', marginTop: '10px' }}
                    onClick={handleAddReview}
                >
                    Отправить
                </Button>
            </Paper>
        </Container>
    );
}

export default ProductDetail;
