import supertest from 'supertest'
import {app} from '../../app'
import User from '../../models/user.model'
import Connection from '../database'
const api = supertest(app)

import { config } from 'dotenv'
import { hashPassword } from '../../utils/auth.utils'
config()

const conn = new Connection(process.env.TEST_MONGODB_URI)

beforeAll(async () => {
   await conn.connect();
  })

afterEach(async () => {
    await conn.cleanup();
  })

afterAll(async () => {
    await conn.disconnect();
  })

const userData = {
    firstName: 'clinton',
    lastName: 'akinbayo',
    email:'test@gmail.com',
    password: await hashPassword('Passs123@'),
    confirmPassword: 'Passs123@'
}

describe("POST /api/v1/auth/register", () => {

  const registerlink = "/api/v1/auth/register"

  it("Should Fail if no details are provided", async () => {
    const res = await api
      .post(registerlink)
      .set("content-type", "application/json")
      .send({
        firstName: "",
        lastName: "",
      })

    expect(res.body.error).toBe(`Fields are required`)
    expect(res.status).toBe(404)
  })

  it("Should fail if Password does not meet requirements", async() =>{
    const res = await api
        .post(registerlink)
        .set("content-type", "application/json")
        .send({
            firstName: 'mayo',
            lastName: 'tester',
            email:'test@gmail.com',
            password: 'Passs',
            confirmPassword:'Passs'
        })
    
    expect(res.body.error).toBe(`Password must be at least 8 characters of 1 uppercase and 1 special character`)
    expect(res.status).toBe(400)
  })

  it("Should Fail if user already exists in the DB", async() =>{
    const newUser = await User.create(userData)
    const res = await api
        .post(registerlink)
        .set("content-type","application/json")
        .send(userData)
    
    expect(res.body.error).toBe(`User already exist, Login!`)
    expect(res.status).toBe(400)
  })

  it("Should Successully Create a new User", async() =>{
    const res = await api
        .post(registerlink)
        .set("content-type","application/json")
        .send({...userData, password: 'Passs123@'})
    
    expect(res.body.success).toBe(true)
    expect(res.body.message).toBe(`New User was successfully created`)
    expect(res.body.newUser.email).toBe(userData.email)

  })
});

describe("POST /api/v1/auth/login", () => {
    const loginLink = "/api/v1/auth/login"

    const loginData = {
        email:'test@gmail.com',
        password: 'Passs123@'
    }

    it("Should fail if User does not exist in DB", async() =>{
        const res = await api
            .post(loginLink)
            .set("content-type","application/json")
            .send(loginData)

        expect(res.body.error).toBe(`Invalid Credentials!`)
        expect(res.status).toBe(401)

    })

    it("Should fail if Password is not Correct", async() =>{
        const user = await User.create(userData)
        const res = await api
            .post(loginLink)
            .set("content-type","application/json")
            .send({...loginData, password: 'wrong'})

        expect(res.body.error).toBe(`Invalid Credentials!`)
        expect(res.status).toBe(401)
    })

    it("Should Login Successfully", async() =>{
        const user = await User.create(userData)
        
        const res = await api
            .post(loginLink)
            .set("content-type","application/json")
            .send({
                email:'test@gmail.com',
                password: 'Passs123@'
            })

        expect(res.body.success).toBe(true)
        expect(res.body.message).toBe(`Logged In successfully`)
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('accessToken')

    })
})