import e from "express";
import { BlogController } from "../controllers/blog.controller.js";
import { Authenticate } from "../middlewares/auth.middleware.js";

export const blogRouter = e.Router()

const blogController = new BlogController()

blogRouter.post('/create',Authenticate, blogController.createPost)
blogRouter.get('/all', blogController.getPosts)
blogRouter.get('/:blogId', blogController.getAPost)
blogRouter.put('/:blogId/publish', Authenticate, blogController.publishAPost)
blogRouter.put('/:blogId/edit', Authenticate, blogController.editAPost)
blogRouter.delete('/:blogId', Authenticate, blogController.deleteAPost)

blogRouter.get('/personal/articles', Authenticate, blogController.ownerGetPost)