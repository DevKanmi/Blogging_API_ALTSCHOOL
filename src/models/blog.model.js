import { Schema, model } from "mongoose";

const blogSchema = new Schema({

    title : {
        type: String,
        required: true,
        unique: true
    },

    description : {
        type: String,
        default: ""
    },

    body : {
        type: String,
        required: true
    },

    author : {
        type: String,
        required: true
    },

    state : {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'

    },

    readsCount : {
        type: Number,
        default: 0
    },

    readingTime : {
        type : String,
    },

    tags : {
        type: [String],
        default: []
    },

    createdAt : {
        type: Date,
        default: Date.now()
    },

    updatedAt : {
        type: Date,
        default: Date.now()
    },

    createdBy : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    }

})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
            returnedObject.id = returnedObject._id.toString()
            delete returnedObject._id,
            delete returnedObject.__v
    }
})

const Blog = model('Blog', blogSchema)

export default Blog