"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
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
  const supabase = useMemo(() => createClient(), []);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserLimits = useCallback(async () => {
    if (!user) {
      setUserLimits(null);
      return;
    }
    const { data, error } = await supabase
      .from("user_limits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      setUserLimits(null);
      return;
    }
    if (data) {
      setUserLimits(data as UserLimits);
      return;
    }
    setUserLimits(null);
  }, [user, supabase]);

  const fetchBrands = useCallback(async () => {
    if (!user) {
      setBrands([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) {
        setBrands([]);
        return;
      }
      setBrands((data as Brand[]) ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  const fetchProducts = useCallback(async () => {
    if (!user) {
      setProducts([]);
      return;
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      setProducts([]);
      return;
    }
    setProducts((data as Product[]) ?? []);
  }, [user, supabase]);

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
  }, [user, fetchBrands, fetchProducts, fetchUserLimits]);

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
  }, [user, fetchUserLimits, supabase]);

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
  }, [supabase]);

  const deleteBrand = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setProducts((prev) => prev.filter((p) => p.brand_id !== id));
    await fetchUserLimits();
    return true;
  }, [fetchUserLimits, supabase]);

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
  }, [user, fetchUserLimits, supabase]);

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
  }, [supabase]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await fetchUserLimits();
    return true;
  }, [fetchUserLimits, supabase]);

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
