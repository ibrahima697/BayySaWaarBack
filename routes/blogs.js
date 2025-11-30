import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
import {protect, isAdmin}  from '../middlewares/auth.js';
//import isAdmin from '../middlewares/isAdmin.js';
import { uploadBlogImages, handleUploadError } from '../middlewares/cloudinaryUpload.js';

const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', protect, isAdmin, uploadBlogImages, handleUploadError, createBlog);
router.put('/:id', protect, isAdmin, uploadBlogImages, handleUploadError, updateBlog);
router.delete('/:id', protect, isAdmin, deleteBlog);

export default router;
