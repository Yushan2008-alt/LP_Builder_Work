"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Brand, Product, UserLimits,
  CreateBrandInput, UpdateBrandInput,
  CreateProductInput, UpdateProductInput,
  BrandContextValue
} from "@/lib/types";
import { useAuth } from "./AuthContext";

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supabase = createClient();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserLimits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_limits")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (data) setUserLimits(data as UserLimits);
  }, [user]);

  const fetchBrands = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setBrands(data as Brand[]);
    setIsLoading(false);
  }, [user]);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data) setProducts(data as Product[]);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBrands();
      fetchProducts();
      fetchUserLimits();
    } else {
      setBrands([]);
      setProducts([]);
      setUserLimits(null);
    }
  }, [user]);

  const createBrand = useCallback(async (input: CreateBrandInput): Promise<Brand | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("brands")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const brand = data as Brand;
    setBrands((prev) => [...prev, brand]);
    await fetchUserLimits();
    return brand;
  }, [user, fetchUserLimits]);

  const updateBrand = useCallback(async (id: string, input: UpdateBrandInput): Promise<Brand | null> => {
    const { data, error } = await supabase
      .from("brands")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const brand = data as Brand;
    setBrands((prev) => prev.map((b) => (b.id === id ? brand : b)));
    return brand;
  }, []);

  const deleteBrand = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setProducts((prev) => prev.filter((p) => p.brand_id !== id));
    await fetchUserLimits();
    return true;
  }, [fetchUserLimits]);

  const createProduct = useCallback(async (input: CreateProductInput): Promise<Product | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("products")
      .insert({ ...input, user_id: user.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const product = data as Product;
    setProducts((prev) => [...prev, product]);
    await fetchUserLimits();
    return product;
  }, [user, fetchUserLimits]);

  const updateProduct = useCallback(async (id: string, input: UpdateProductInput): Promise<Product | null> => {
    const { data, error } = await supabase
      .from("products")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const product = data as Product;
    setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
    return product;
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetchUserLimits();
    return true;
  }, [fetchUserLimits]);

  return (
    <BrandContext.Provider
      value={{
        brands, products, userLimits, isLoading,
        fetchBrands, fetchProducts,
        createBrand, updateBrand, deleteBrand,
        createProduct, updateProduct, deleteProduct,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandContext() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrandContext must be used within BrandProvider");
  }
  return context;
}
