document.addEventListener('DOMContentLoaded', () => {
    displayUserInfo();
    const currentPage = window.location.pathname;

    // Existing photo gallery code for index
    if (currentPage === '/' || currentPage === '/index') {
        loadPhotos();
    }

    // Handle Login Form Submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const message = document.getElementById('login-message');

            console.log('Sending login request with:', { email, password }); // **Debugging Log**

            fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }) // Ensure 'email' and 'password' are correctly captured
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/';
                } else {
                    message.style.color = 'red';
                    message.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                message.style.color = 'red';
                message.textContent = 'An error occurred during login.';
            });
        });
    }

    // Handle Registration Form Submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const message = document.getElementById('register-message');

            fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    message.style.color = 'green';
                    message.textContent = 'Registration successful. Please log in.';
                    window.location.href = '/login';
                } else {
                    message.style.color = 'red';
                    message.textContent = data.message;
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                message.style.color = 'red';
                message.textContent = 'An error occurred during registration.';
            });
        });
    }

    // Handle Logout via Event Delegation
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'logout') {
            e.preventDefault();
            fetch('/api/users/logout', { // Added '/api/' prefix
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Logged out successfully.');
                    window.location.reload();
                } else {
                    alert('Failed to log out.');
                }
            })
            .then(() => window.location.reload())
            .catch(error => console.error('Error during logout:', error));
        }
    });

    // Handle Cart Page
    if (currentPage === '/cart') {
        loadCart();
    }
});

// Function to add item to cart
function addToCart(photoId) {
    fetch('/api/carts', { // Updated to use '/api/carts'
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ photo_id: photoId, quantity: 1 })
    })
    .then(response => {
        if (response.status === 201) {
            alert('Photo added to cart!');
        } else {
            alert('Failed to add photo to cart.');
        }
    })
    .catch(error => console.error('Error adding to cart:', error));
}

// Function to remove item from cart
function removeFromCart(photoId) {
    fetch(`/api/carts?photo_id=${photoId}`, { // Added '/api/' prefix
        method: 'DELETE'
    })
    .then(response => {
        if (response.status === 200) {
            alert('Item removed from cart.');
            // Reload the cart page
            window.location.reload();
        } else {
            alert('Failed to remove item from cart.');
        }
    })
    .catch(error => console.error('Error removing from cart:', error));
}

// Function to add a "Details" button to each photo card with price
function loadPhotos(searchQuery = '') {
    fetch(`/api/photos?search=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(photos => {
            const photoGallery = document.getElementById('photo-gallery');
            photoGallery.innerHTML = '';
            photos.forEach(photo => {
                const photoCard = document.createElement('div');
                photoCard.classList.add('photo-card');
                photoCard.innerHTML = `
                    <img src="${photo.watermark_url}" alt="${photo.title}">
                    <h3>${photo.title}</h3>
                    <p>${photo.description}</p>
                    <p><strong>Price:</strong> $${photo.price.toFixed(2)}</p>
                    ${isAuthenticated ? `<button class="btn" onclick="addToCart(${photo.photo_id})">Add to Cart</button>` : ''}
                    <button class="btn" onclick="viewDetails(${photo.photo_id})">Details</button>
                `;
                photoGallery.appendChild(photoCard);
            });
        })
        .catch(error => console.error('Error loading photos:', error));
}

// Function to navigate to the details page with the selected photo_id
function viewDetails(photoId) {
    window.location.href = `/details?photo_id=${photoId}`;
}

// Event Listener for Search
const searchButton = document.getElementById('search-button');
if (searchButton) {
    searchButton.addEventListener('click', () => {
        const searchInput = document.getElementById('search-input').value.trim();
        loadPhotos(searchInput);
    });
}

// Add helper functions to get a cookie and parse JWT
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = atob(base64Url.replace(/-/g, '+').replace(/_/g, '/'));
    const jsonPayload = decodeURIComponent(
        base64
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

// Global variables
let isAuthenticated = false;
let userName = null;

// Immediately check for token cookie
const token = getCookie('token');
if (token) {
    isAuthenticated = true;
    const userPayload = parseJwt(token);
    userName = userPayload.name || 'User';
} else {
    isAuthenticated = false;
    userName = null;
}

// Modify displayUserInfo to use userName and remove fetch call
function displayUserInfo() {
    const userInfoElement = document.getElementById('user-info');
    const authLink = document.getElementById('auth-link');

    if (isAuthenticated && userName) {
        // Update the dropdown button with the user's name
        const dropbtn = userInfoElement.querySelector('.dropbtn');
        if (dropbtn) {
            dropbtn.textContent = userName;
        } else {
            console.error('Dropbtn element not found');
        }

        // Show the user-info dropdown and hide the auth-link
        userInfoElement.style.display = 'inline-block';
        authLink.style.display = 'none';
    } else {
        // User is not authenticated
        userInfoElement.style.display = 'none';
        authLink.style.display = 'inline-block';
    }
    updateUIBasedOnAuth(); // Call to update UI
    document.body.style.visibility = 'visible'; // Make the body visible after auth logic
}

// Function to fetch and display user info
function updateUIBasedOnAuth() {
    const authElements = document.querySelectorAll('.auth-required');
    authElements.forEach(elem => {
        elem.style.display = isAuthenticated ? '' : 'none';
    });

    const unauthElements = document.querySelectorAll('.unauthenticated');
    unauthElements.forEach(elem => {
        elem.style.display = isAuthenticated ? 'none' : '';
    });
}

// Function to load and display photo details on details
function loadPhotoDetails() {
    const parsedUrl = new URL(window.location.href);
    const photoId = parsedUrl.searchParams.get('photo_id');

    if (photoId) {
        fetch(`/api/photos/details?photo_id=${photoId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(photo => {
                console.log('Received photo details:', photo); // **Debugging Log**
                const photoDetailsDiv = document.getElementById('photo-details');
                if (photo && photo.photo_id) {
                    const highResUrl = `${photo.high_res_url}?photo_id=${photo.photo_id}`;
                    const highResLink = `<a href="${highResUrl}" target="_blank" class="btn">View High-Resolution Image</a>`;
                    photoDetailsDiv.innerHTML = `
                        <img src="${photo.watermark_url}" alt="${photo.title}" style="max-width: 100%;">
                        <h3>${photo.title}</h3>
                        <p>${photo.description}</p>
                        <p><strong>Price:</strong> ${typeof photo.price === 'number' ? '$' + photo.price.toFixed(2) : photo.price}</p>
                        <p><strong>Location:</strong> ${photo.location}</p>
                        <p><strong>Date Taken:</strong> ${new Date(photo.date_taken).toLocaleDateString()}</p>
                        ${isAuthenticated ? `<button class="btn" onclick="addToCart(${photo.photo_id})">Add to Cart</button>` : ''}
                        ${isAuthenticated ? highResLink : '' }
                    `;
                } else {
                    photoDetailsDiv.innerHTML = '<p>Photo not found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching photo details:', error);
                const photoDetailsDiv = document.getElementById('photo-details');
                photoDetailsDiv.innerHTML = '<p>Unable to load photo details. Please try again later.</p>';
            });
    } else {
        const photoDetailsDiv = document.getElementById('photo-details');
        photoDetailsDiv.innerHTML = '<p>No photo selected.</p>';
    }
}

// Call loadPhotoDetails if on details
if (window.location.pathname === '/details') {
    document.addEventListener('DOMContentLoaded', loadPhotoDetails);
}

// Function to load and display the cart
function loadCart() {
    fetch('/api/carts')
        .then(response => response.json())
        .then(cart => {
            console.log('Received cart data:', cart); // **Debugging Log**
            const cartItemsDiv = document.getElementById('cart-items');
            const totalPriceSpan = document.getElementById('total-price');

            if (cart && cart.items && cart.items.length > 0) {
                cartItemsDiv.innerHTML = '';
                let totalPrice = 0;
                cart.items.forEach(item => {
                    // Fetch photo details
                    fetch(`/api/photos/details?photo_id=${item.photo_id}`)
                        .then(response => response.json())
                        .then(photo => {
                            console.log('Fetched photo for cart item:', photo); // **Debugging Log**
                            const itemDiv = document.createElement('div');
                            itemDiv.classList.add('cart-item');
                            itemDiv.innerHTML = `
                                <img src="${photo.watermark_url}" alt="${photo.title}" width="100">
                                <span>${photo.title}</span>
                                <span>Quantity: ${item.quantity}</span>
                                <span>Price: $${photo.price}</span>
                                <button class="btn" onclick="removeFromCart(${item.photo_id})">Remove</button>
                            `;
                            cartItemsDiv.appendChild(itemDiv);
                            totalPrice += photo.price * item.quantity;
                            totalPriceSpan.textContent = totalPrice.toFixed(2);
                        })
                        .catch(error => {
                            console.error('Error fetching photo details for cart item:', error);
                        });
                });
            } else {
                cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
                totalPriceSpan.textContent = '0.00';
            }
        })
        .catch(error => {
            console.error('Error fetching cart:', error);
        });
    if (!isAuthenticated) {
        document.getElementById('cart-section').innerHTML = '<p>Please <a href="/login">login</a> to view your cart.</p>';
    }
}

// Function to show the checkout form
function showCheckoutForm() {
    const checkoutFormDiv = document.getElementById('checkout-form');
    if (checkoutFormDiv) {
        checkoutFormDiv.style.display = 'block';
        console.log('Checkout form displayed.');
    } else {
        console.error('Checkout form div not found.');
    }
}

// Function to handle checkout button click
function handleCheckout() {
    console.log('Checkout button clicked.');
    showCheckoutForm();
}

// Function to handle checkout form submission
function submitCheckoutForm(event) {
    event.preventDefault(); // Prevents the default form submission behavior

    const paymentDetails = document.getElementById('payment-details').value.trim();
    const promoCode = document.getElementById('promo-code').value.trim();
    const feedback = document.getElementById('checkout-feedback'); // Optional: feedback element

    if (!paymentDetails) {
        alert('Payment details are required.');
        return;
    }

    console.log('Submitting checkout form:', { paymentDetails, promoCode });

    fetch('/api/purchases', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            payment_details: paymentDetails,
            promo_code: promoCode || ''
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Purchase completed successfully!');
            window.location.reload();
        } else {
            alert(`Purchase failed: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout. Please try again.');
    });
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById('checkout-button');
    const checkoutForm = document.getElementById('checkoutForm');

    if (checkoutButton) {
        console.log('Checkout button found. Attaching event listener.');
        checkoutButton.addEventListener('click', handleCheckout);
    } else {
        console.error('Checkout button not found.');
    }

    if (checkoutForm) {
        console.log('Checkout form found. Attaching submit event listener.');
        checkoutForm.addEventListener('submit', submitCheckoutForm);
    } else {
        console.error('Checkout form not found.');
    }
});

// Function to load and display purchased photos on 'My Pictures' page
function loadPurchasedPhotos() {
    fetch('/api/purchases')
        .then(response => response.json())
        .then(purchases => {
            const myPicturesDiv = document.getElementById('my-pictures');
            myPicturesDiv.innerHTML = '';
            purchases.forEach(purchase => {
                fetch(`/api/photos/details?photo_id=${purchase.photo_id}`)
                    .then(response => response.json())
                    .then(photo => {
                        const photoDiv = document.createElement('div');
                        photoDiv.classList.add('photo-card');
                        photoDiv.innerHTML = `
                            <img src="${photo.watermark_url}" alt="${photo.title}">
                            <h3>${photo.title}</h3>
                            <p>${photo.description}</p>
                            <a href="${photo.high_res_url}?photo_id=${photo.photo_id}" target="_blank" class="btn">View High-Resolution Image</a>
                            <a href="${photo.high_res_url}?photo_id=${photo.photo_id}" download="${photo.title}.jpg" class="download-button">
                                <img src="/download.svg" alt="Download">
                            </a>
                        `;
                        myPicturesDiv.appendChild(photoDiv);
                    })
                    .catch(error => console.error('Error fetching photo details:', error));
            });
        })
        .catch(error => console.error('Error fetching purchases:', error));
    if (!isAuthenticated) {
        document.getElementById('my-pictures-section').innerHTML = '<p>Please <a href="/login">login</a> to view your pictures.</p>';
    }
}

// Call loadPurchasedPhotos if on 'My Pictures' page
if (window.location.pathname === '/my-pictures') {
    document.addEventListener('DOMContentLoaded', loadPurchasedPhotos);
}