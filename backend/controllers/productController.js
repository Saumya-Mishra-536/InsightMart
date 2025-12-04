import Product from "../models/Product.js";
import mongoose from "mongoose";

// CREATE
export const addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
    };
    // Add owner only if user is authenticated - convert to ObjectId
    if (req.user?.id) {
      productData.owner = new mongoose.Types.ObjectId(req.user.id);
    }
    
    // Validate required fields
    if (!productData.name || !productData.sku || !productData.price || !productData.category) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, sku, price, and category are required" 
      });
    }
    
    // Ensure category is lowercase
    if (productData.category) {
      productData.category = productData.category.toLowerCase().trim();
    }
    
    const newProduct = await Product.create(productData);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    // Handle duplicate SKU error
    if (err.code === 11000 || err.keyPattern?.sku) {
      return res.status(400).json({ 
        success: false, 
        message: `Product with SKU "${req.body.sku}" already exists` 
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const addMultipleProducts = async (req, res) => {
  try {
    const products = req.body.map((p) => {
      const productData = { ...p };
      // Add owner only if user is authenticated - convert to ObjectId
      if (req.user?.id) {
        productData.owner = new mongoose.Types.ObjectId(req.user.id);
      }
      // Ensure category is lowercase
      if (productData.category) {
        productData.category = productData.category.toLowerCase().trim();
      }
      return productData;
    });
    const saved = await Product.insertMany(products);
    res.status(201).json({ success: true, products: saved });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: "One or more products have duplicate SKUs" 
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// READ
export const getAllProducts = async (req, res) => {
  try {
    // If user is authenticated, show only their products, otherwise show all products
    const query = req.user?.id 
      ? { owner: new mongoose.Types.ObjectId(req.user.id) } 
      : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate ObjectId format BEFORE creating query
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Convert to ObjectId to prevent cast errors
    const objectId = new mongoose.Types.ObjectId(productId);

    // If user is authenticated, filter by owner, otherwise get any product
    const query = req.user?.id 
      ? { _id: objectId, owner: new mongoose.Types.ObjectId(req.user.id) }
      : { _id: objectId };
    
    const product = await Product.findOne(query);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (err) {
    // Handle cast errors specifically
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate ObjectId format BEFORE creating query
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Convert to ObjectId to prevent cast errors
    const objectId = new mongoose.Types.ObjectId(productId);

    // Prepare update data
    const updateData = { ...req.body };
    
    // Ensure category is lowercase if provided
    if (updateData.category) {
      updateData.category = updateData.category.toLowerCase().trim();
    }
    
    // Don't allow updating owner through this endpoint
    delete updateData.owner;

    // Build query: if user is authenticated, filter by owner, otherwise update any product
    const query = req.user?.id
      ? { _id: objectId, owner: new mongoose.Types.ObjectId(req.user.id) }
      : { _id: objectId };
    
    const updated = await Product.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product: updated });
  } catch (err) {
    // Handle cast errors specifically
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    // Handle duplicate SKU error
    if (err.code === 11000 || err.keyPattern?.sku) {
      return res.status(400).json({ 
        success: false, 
        message: `Product with SKU "${req.body.sku}" already exists` 
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePriceOrDiscount = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate ObjectId format BEFORE creating query
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Convert to ObjectId to prevent cast errors
    const objectId = new mongoose.Types.ObjectId(productId);

    // Build query: if user is authenticated, filter by owner, otherwise update any product
    const query = req.user?.id
      ? { _id: objectId, owner: new mongoose.Types.ObjectId(req.user.id) }
      : { _id: objectId };
    
    const updated = await Product.findOneAndUpdate(
      query,
      { $set: { price: req.body.price, discount: req.body.discount } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product: updated });
  } catch (err) {
    // Handle cast errors specifically
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Validate ObjectId format BEFORE creating query
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    // Convert to ObjectId to prevent cast errors
    const objectId = new mongoose.Types.ObjectId(productId);

    // Build query: if user is authenticated, filter by owner, otherwise delete any product
    const query = req.user?.id
      ? { _id: objectId, owner: new mongoose.Types.ObjectId(req.user.id) }
      : { _id: objectId };
    
    const removed = await Product.findOneAndDelete(query);
    if (!removed) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    // Handle cast errors specifically
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteByCategory = async (req, res) => {
  try {
    // Build query: if user is authenticated, filter by owner, otherwise delete any products in category
    const query = req.user?.id
      ? { category: req.body.category, owner: req.user.id }
      : { category: req.body.category };
    
    const result = await Product.deleteMany(query);
    res.status(200).json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query = {};

    // Name search (case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    // Category search
    if (category) {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Only return products owned by the logged-in user
    query.owner = req.user.id;

    const products = await Product.find(query);

    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const advancedFilter = async (req, res) => {
  try {
    let { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      minDiscount,
      maxDiscount,
      rating,
      sortBy, 
      sortOrder, 
      page, 
      limit 
    } = req.query;

    const query = {};

    // Owner filtering (only user's products) - Convert to ObjectId
    if (req.user?.id) {
      query.owner = new mongoose.Types.ObjectId(req.user.id);
    }

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by category (normalize to lowercase)
    if (category) {
      query.category = category.toLowerCase().trim();
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Discount range
    if (minDiscount || maxDiscount) {
      query.discount = {};
      if (minDiscount) query.discount.$gte = Number(minDiscount);
      if (maxDiscount) query.discount.$lte = Number(maxDiscount);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;  
    } else {
      // Default sort by createdAt descending
      sort.createdAt = -1;
    }

    // Pagination
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      products
    });

  } catch (err) {
    console.error("Advanced filter error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

