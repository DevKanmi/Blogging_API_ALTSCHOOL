import supertest from 'supertest'
import {app} from '../../app.js'
import User from '../../models/user.model.js'
import Blog from '../../models/blog.model.js'
import Connection from '../database.js'
const api = supertest(app)

import { config } from 'dotenv'
import { hashPassword } from '../../utils/auth.utils.js'
config()

const conn = new Connection(process.env.TEST_MONGODB_URI)



describe('BlogController', () => {
    let token; // Auth token for the user (you'll need to simulate login)
    let userId; // User ID to associate with blog creation

    beforeAll(async () => {
        await conn.connect();
       })

    beforeEach(async () => {
        // Connect to the test database
        await conn.cleanup()

        // Create a new user and get the auth token
        const user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: await hashPassword('Password123#'),
        });
        
        userId = user._id;
        const loginResponse = await api
            .post('/api/v1/auth/login')
            .send({ email: 'testuser@example.com', password: 'Password123#' });
            console.log(loginResponse)
        
        token = loginResponse.body.accessToken;  // Assuming you return the token in the response
    });

    afterAll(async () => {
        await conn.disconnect();
      })

    describe('POST /api/v1/blogs/create', () => {
        it('should create a new post successfully', async () => {
            const res = await api
                .post('/api/v1/blogs/create')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Blog Title',
                    description: 'Test Blog Description',
                    body: 'This is the body of the test blog.',
                    tags: ['test', 'blog'],
                    author: 'Test Author'
                });

            expect(res.status).toBe(201)

    })
    })
})


