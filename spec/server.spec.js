// server.spec.js

const request = require('supertest');
const server = require('../server'); // Adjust the path as necessary

describe('Testing', () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        // Login as admin
        const loginRes = await request(server)
            .post('/api/users/login')
            .send({
                email: 'tak132@scarletmail.rutgers.edu',
                password: 'password123'
            })
            .set('Content-Type', 'application/json');
        
        adminToken = loginRes.headers['set-cookie'][0].split(';')[0];
        console.log(adminToken);
    });

    it('Login API should register a new user', async () => {
        const res = await request(server)
            .post('/api/users/register')
            .send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'testpassword'
            })
            .set('Content-Type', 'application/json');
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('Login API should fail to register a user with existing email', async () => {
        const res = await request(server)
            .post('/api/users/register')
            .send({
                name: 'Test User Duplicate',
                email: 'testuser@example.com',
                password: 'testpassword'
            })
            .set('Content-Type', 'application/json');
        
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Email already registered.');
    });

    it('Login API should login an existing user', async () => {
        const res = await request(server)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'testpassword'
            })
            .set('Content-Type', 'application/json');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        userToken = res.headers['set-cookie'][0].split(';')[0];
    });

    it('User API should fetch user information', async () => {
        const res = await request(server)
            .get(`/api/users/1`)
            .set('cookie', userToken);
        
        expect(res.status).toBe(200);
        expect(res.body.email).toBe('tak132@scarletmail.rutgers.edu');
    });

    it('User API should fail to fetch user information for invalid user_id', async () => {
        const res = await request(server)
            .get(`/api/users/100`)
            .set('cookie', userToken);
        
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

    it('Photos API should fetch all photos', async () => {
        const res = await request(server)
            .get('/api/photos')
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(5); // Since the database must be new on start, there should be 5 photos.
    });

    it('Photos API should fetch a photo\'s details by photo_id', async () => {
        const res = await request(server)
            .get('/api/photos/details?photo_id=101')
        
        expect(res.status).toBe(200);
        expect(res.body.photo_id).toBe(101);
        expect(res.body.photographer_id).toBe(1);
        expect(res.body.price).toBe(29.99);
    });

    it('Photos API should fail to fetch a photo\'s details for invalid photo_id', async () => {
        const res = await request(server)
            .get('/api/photos/details?photo_id=100')
        
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Photo not found');
    });

    it('Reviews API should fail to submit a review for a photo the user does not own', async () => {
        const res = await request(server)
            .post('/api/reviews')
            .send({
                photo_id: 101,
                rating: 5,
                review_text: 'Great photo!'
            })
            .set('Content-Type', 'application/json')
            .set('cookie', userToken);
        
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('Reviews API should submit a review for a photo the user owns', async () => {
        const res = await request(server)
            .post('/api/reviews')
            .send({
                photo_id: 101,
                rating: 5,
                review_text: 'Great photo!'
            })
            .set('Content-Type', 'application/json')
            .set('cookie', adminToken);
    });

    it('Reviews API should fetch all reviews for a photo', async () => {
        const res = await request(server)
            .get('/api/reviews?photo_id=101')
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2); // Since the database must be new on start and we just added 1, there should be 2 reviews.
    });

    it('Reviews API should calculate the average rating for a photo', async () => {
        const res = await request(server)
            .get('/api/reviews/average?photo_id=101')
        
        expect(res.status).toBe(200);
        expect(res.body).toBe(5);
    });

    it('Purchase API should fetch all purchases for a user', async () => {
        const res = await request(server)
            .get('/api/purchases')
            .set('cookie', adminToken);
        
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1); // Since the database must be new on start, there should be 1 purchases.
    });

    it('Purchase API fail to fetch all purchases for a user without authentication', async () => {
        const res = await request(server)
            .get('/api/purchases')
        
        expect(res.status).toBe(401);
    });
});