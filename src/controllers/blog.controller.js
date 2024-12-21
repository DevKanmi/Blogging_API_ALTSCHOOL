import Blog from "../models/blog.model.js";
import User from "../models/user.model.js"
import { calculateReadingTime, convertTagsToArray } from "../utils/blog.utils.js";
import logger from "../utils/logger.js";
import { ErrorResponse } from "../utils/responses.js";

export class BlogController {
    constructor(){}

    createPost = async(req, res, next) => {
        const userId = req.user.id
        const {title, description, body, tags } = req.body
        
        
        if(!title || !body){
            return next(new ErrorResponse(`Fields are required`))
        }

        try {
            logger.info(`START: Checking if User exists`)
            
            const user = await User.findById(userId)
            if(!user){
                return next(new ErrorResponse(`Kindly Login to access this route!`, 403))
            }

            logger.info(`CONTINUE: User found and attempting to create a new post`)

            const timeToRead = calculateReadingTime(body)
            const ArrayofTags = convertTagsToArray(tags)
            const authorName = `${user.firstName} ${user.lastName}`

            const newPost = await Blog.create({
                title,
                description,
                body,
                author: authorName,
                readingTime: timeToRead,
                tags: ArrayofTags,
                createdBy: user._id
            })

            if(!newPost){
                return next(new ErrorResponse(`Failed to Create Post!`))
            }

            user.posts = user.posts.concat(newPost._id)
            await user.save()

            logger.info(`END: Post successfully created, saved to drafts!`)

            return res.status(201).json({
                success: true,
                message: `Successfully created a Post`,
                newPost
            })
            
        } catch (error) {
            logger.error(`END: Post could not be created: ${error.message}`)
            return next(new ErrorResponse(error.message, 500))
        }
    }


    getAPost = async(req, res, next) =>{
        const { blogId } = req.params
        try {
            logger.info(`START: Attempting to Find a post`)

            const blogPost = await Blog.findOne({_id:blogId, state: 'published'}).populate('createdBy',{firstName: 1, lastName: 1, email: 1})
            if(!blogPost){
                return next(new ErrorResponse(`Blog Post does not exist`, 404))
            }
             
            blogPost.readsCount++
            await blogPost.save()

            logger.info(`END: Post successfully retrieved!`)

            const {title, description, body, author, readsCount, readingTime, tags, createdBy} = blogPost

            res.status(200).json({
                success: true,
                message: `Here is your blog Post`,
                data:{
                    title,
                    description,
                    body,
                    author,
                    readsCount,
                    readingTime,
                    tags,
                    createdBy
                }
            })

        } catch (error) {
            logger.error(`END: Failed to get Blog post: ${error.message}`)
            return next(new ErrorResponse(error.message, 500))
        }
    }


    publishAPost = async(req, res, next) => {
        const userId = req.user.id
        const {blogId} = req.params
        try {
            logger.info(`START: Attempting to Publish a blog`)

            const user = await User.findById(userId)

            if(!user){
                return next(new ErrorResponse(`Kindly Login to access this route!`, 403))
            }

            const blog = await Blog.findOne({
                _id: blogId,
                createdBy: userId
            })

            if(!blog){
                return next(new ErrorResponse(`Post Does not exist!`, 404))
            }

            blog.state = 'published'
            blog.updatedAt = Date.now()
            await blog.save()

            logger.info(`END : Blog has been published Successfully!`)

            return res.status(200).json({
                success: true,
                message: `Successfully Published a Post`,
                blog
            })

        } catch (error) {
            logger.error(`END: Could not Publish the blog post!: ${error.message}`)
            return next(new ErrorResponse(error.message, 500))  
        }
    }


    getPosts = async (req, res, next) => {
        try {

            logger.info(`START: Attempting to get all Posts`)
            const { page = 1, limit = 20, search = "", sortBy = "createdAt", order = "desc" } = req.query
    
            const pageNum = parseInt(page, 10)
            const limitNum = parseInt(limit, 10)
            const sortOrder = order === "asc" ? 1 : -1
    
            const query = { state: "published" };
    
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ];
            }
    
            const sortOptions = { [sortBy]: sortOrder };
    
            const totalBlogs = await Blog.countDocuments(query)
            const totalPages = Math.ceil(totalBlogs / limitNum)
    
            const blogs = await Blog.find(query)
                .sort(sortOptions)
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .populate('createdBy', {firstName: 1, lastName: 1})
    
            logger.info(`END: Successfully retrieved all posts`)

            res.status(200).json({
                success: true,
                message: `Blogs retrieved successfully`,
                data: blogs,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalBlogs,
                    limit: limitNum
                }
            });
        } catch (error) {
            logger.error(`END: Fail to get all blog Posts: ${error.message}.`);
            return next(new ErrorResponse(error.message, 500));
        }
    };

    // The owner of a blog should be able to edit the blog in draft or published state
    editAPost = async(req, res, next) =>{
        const userId = req.user.id
        const { blogId } = req.params
        const update = req.body

        try {
            logger.info(`START: Attempting to Edit a blog post`)

            const user = await User.findById(userId)

            if(!user){
                return next(new ErrorResponse(`Kindly Login to access this route!`, 403))
            }

            
            const post = await Blog.findOneAndUpdate(
                {_id: blogId, createdBy: userId },
                {$set: update},
                {new: true}
            )

            if(!post){
                return next(new ErrorResponse(`Failed to Update the Post`, 400))
            }

            post.updatedAt = new Date.now()
            await post.save()

            logger.info(`END: Post has been edited Succesfully`)
            
            res.status(201).json({
                success: true,
                message: `Successfully edited a Post`,
                post
            })
            
        } catch (error) {
            logger.error(`END: Something went wrong updating a Post: ${error.message}`)
            return next(new ErrorResponse(error.message, 500))
            
        }
    }

    deleteAPost = async(req, res, next) =>{
        const userId = req.user.id
        const { blogId } = req.params

        try {
            logger.info(`START: Attempting to Delete a blog post`)

            const user = await User.findById(userId)

            if(!user){
                return next(new ErrorResponse(`Kindly Login to access this route!`, 403))
            }

            const blog = await Blog.findByIdAndDelete(blogId)
            
            if(!blog){
                return next(new ErrorResponse(`Failed to Delete a Post`, 400))
            }

            logger.info(`END: Blog Post was successfully deleted`)

            return res.status(200).json({
                success: true,
                message: `Deleted Post Successfully`
            })
            
        } catch (error) {
            logger.error(`END: Failed to delete a blog post : ${error.message}`)
            return next(new ErrorResponse(error.message, 500))
        }
    }

    ownerGetPost = async(req, res, next) =>{
        const userId = req.user.id
        const { state, page = 1, limit = 10 } = req.query

        try {
            
            logger.info(`START: Attempting to retrieve psot created by loggedIn Author`)
            const query = { createdBy: userId }
            if (state) query.state = state

        
            const skip = (page - 1) * limit

            const blogs = await Blog.find(query)
                .skip(skip)
                .limit(parseInt(limit)) 
                .sort({ createdAt: -1 })

            const total = await Blog.countDocuments(query)

            logger.info(`END: All Post created you has been retrieved`)
            return res.status(200).json({
                success: true,
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                blogs,
            })
        } catch (error) {
            logger.error(`END: Failed to retrieve post:  ${error.message}`)
            return next(new ErrorResponse(error.message, 500))
        }
    }
    
}