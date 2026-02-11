import { NextResponse } from 'next/server';
import BlogCategory from '../models/BlogCategory.js';
import Blog from '../models/Blog.js';
import { connectDB } from '../db/connect.js';

// Get all blog categories
export const getBlogCategories = async (req) => {
  try {
    await connectDB();
    const categories = await BlogCategory.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Create blog category
export const createBlogCategory = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await BlogCategory.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await BlogCategory.create({ name: name.trim() });
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Update blog category
export const updateBlogCategory = async (req, categoryId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await BlogCategory.findByIdAndUpdate(
      categoryId,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

// Delete blog category
export const deleteBlogCategory = async (req, categoryId) => {
  try {
    await connectDB();

    // Check if any blogs use this category
    const blogsCount = await Blog.countDocuments({ category: categoryId });
    if (blogsCount > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category with ${blogsCount} existing blog(s)` },
        { status: 400 }
      );
    }

    const category = await BlogCategory.findByIdAndDelete(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};
