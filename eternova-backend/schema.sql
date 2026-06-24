-- Eternova Database Schema (Supabase PostgreSQL)

-- 1. Profiles Table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    addresses JSONB DEFAULT '[]'::jsonb,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to sync auth.users with profiles (optional but recommended in real app, we will insert manually on signup for simplicity)

-- 2. Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    images TEXT[] DEFAULT '{}',
    category TEXT CHECK (category IN ('Bloom', 'Eternal', 'Celestial')) NOT NULL,
    stock INTEGER DEFAULT 0,
    material TEXT,
    gemstone TEXT,
    weight TEXT,
    ratings NUMERIC DEFAULT 0,
    num_reviews INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Carts Table
CREATE TABLE carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    items JSONB DEFAULT '[]'::jsonb, -- Array of { product: id, quantity: num, price: num }
    total_price NUMERIC DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Wishlists Table
CREATE TABLE wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    products TEXT[] DEFAULT '{}', -- Array of product UUIDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Orders Table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    items JSONB NOT NULL, -- Array of { product: id, name, image, price, quantity }
    shipping_address JSONB NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('stripe', 'cod', 'easypaisa', 'jazzcash')) NOT NULL,
    payment_result JSONB,
    items_price NUMERIC DEFAULT 0,
    shipping_price NUMERIC DEFAULT 0,
    tax_price NUMERIC DEFAULT 0,
    total_price NUMERIC DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP WITH TIME ZONE,
    is_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMP WITH TIME ZONE,
    order_status TEXT CHECK (order_status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Reviews Table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id) -- Prevent duplicate reviews
);

-- Setup Row Level Security (RLS) policies if needed, but for an Express backend acting as admin/service role, we bypass RLS.
