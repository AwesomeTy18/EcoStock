# EcoStock

EcoStock is a web-based platform that connects photographers with customers looking to purchase high-quality, eco-themed stock photos. The application includes features for user authentication, photo listings, reviews, an admin dashboard for managing photographers and reviews, and more.

## Features

- **User Authentication**: Register and log in to manage your profile and purchases.
- **Photo Listings**: Browse and search for a wide range of eco-friendly stock photos.
- **Shopping Cart**: Add photos to your cart and proceed to secure checkout.
- **Photographer Dashboard**: Photographers can upload photos, view sales, and manage their portfolios.
- **Reviews**: Users can leave reviews and ratings for purchased photos.
- **Admin Dashboard**: Administrators can manage photographer applications, reviews, and oversee platform operations.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [SQLite3](https://www.sqlite.org/index.html)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/ecostock.git
   cd ecostock
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following:

   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_EMAIL=your_verified_sendgrid_email
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PORT=3000
   ```

4. **Initialize the Database**

   ```bash
   node scripts/initDatabase.js
   ```

5. **Start the Server**

   ```bash
   npm start
   ```

6. **Access the Application**

   Open your browser and navigate to 

http://localhost:3000

.

## Usage

- **Register**: Create a new account to start purchasing or selling photos.
- **Browse Photos**: Explore the photo gallery and use the search feature to find specific images.
- **Add to Cart**: Select photos and add them to your shopping cart.
- **Checkout**: Proceed to secure payment to complete your purchase.
- **Upload Photos**: Photographers can upload new photos and manage their listings.
- **Leave Reviews**: Share your feedback by leaving reviews on purchased photos.
- **Admin Panel**: Administrators can approve photographer applications and manage user reviews.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JSON Web Tokens (JWT)
- **Email Services**: SendGrid
- **Payment Processing**: PayPal REST SDK

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add YourFeature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## License

This project is licensed under the MIT License.

## Contact

For any inquiries or support, please contact [support@hangwithecostock.org](mailto:support@hangwithecostock.org).
