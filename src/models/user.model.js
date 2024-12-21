import mongoose, {Schema, model} from "mongoose";

const userSchema = new Schema({
    firstName : {
        type: String, 
        required: true,
    },

    lastName : {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true
    },

    posts : [   
        {
        type: Schema.Types.ObjectId,
        ref: 'Blog'
        }
    ]

})

userSchema.set('toJSON', {
    transform:(document,returnedObject) => {
            returnedObject.id = returnedObject._id.toString()
            delete returnedObject._id
            delete returnedObject.__v
            delete returnedObject.password
    }
})

const User = model('User', userSchema)

export default User