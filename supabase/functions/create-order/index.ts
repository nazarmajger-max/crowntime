// Supabase Edge Function: create-order
// Public (no auth) endpoint for guest checkout with comprehensive validation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_REGEX = /^\+38[0-9]{10}$/;

// Validation limits
const MAX_SHIPPING_NAME = 100;
const MAX_SHIPPING_PHONE = 13;
const MAX_SHIPPING_ADDRESS = 200;
const MAX_SHIPPING_CITY = 100;
const MAX_ITEMS = 50;
const MAX_QUANTITY = 100;
const MAX_PRICE = 10_000_000; // 10 million UAH
const MAX_TOTAL = 100_000_000; // 100 million UAH

type CreateOrderItem = {
  product_id: string;
  quantity: number;
  price: number;
};

type CreateOrderBody = {
  user_id?: string | null;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  status?: string;
  items: CreateOrderItem[];
};

function validateString(value: unknown, minLen: number, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < minLen || trimmed.length > maxLen) return null;
  return trimmed;
}

function validateItem(item: unknown): CreateOrderItem | null {
  if (!item || typeof item !== "object") return null;
  const i = item as Record<string, unknown>;
  
  // Validate product_id is a valid UUID
  if (typeof i.product_id !== "string" || !UUID_REGEX.test(i.product_id)) return null;
  
  // Validate quantity is a positive integer within limits
  if (typeof i.quantity !== "number" || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > MAX_QUANTITY) return null;
  
  // Validate price is a positive number within limits
  if (typeof i.price !== "number" || i.price <= 0 || i.price > MAX_PRICE) return null;
  
  return {
    product_id: i.product_id,
    quantity: i.quantity,
    price: i.price,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Server is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let body: CreateOrderBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate basic structure
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate total_amount
    if (typeof body.total_amount !== "number" || body.total_amount <= 0 || body.total_amount > MAX_TOTAL) {
      return new Response(JSON.stringify({ error: "Invalid total_amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate shipping fields with length limits
    const shippingName = validateString(body.shipping_name, 2, MAX_SHIPPING_NAME);
    if (!shippingName) {
      return new Response(JSON.stringify({ error: "Invalid shipping_name (2-100 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shippingPhone = validateString(body.shipping_phone, 13, MAX_SHIPPING_PHONE);
    if (!shippingPhone || !PHONE_REGEX.test(shippingPhone)) {
      return new Response(JSON.stringify({ error: "Invalid shipping_phone (format: +38XXXXXXXXXX)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shippingAddress = validateString(body.shipping_address, 5, MAX_SHIPPING_ADDRESS);
    if (!shippingAddress) {
      return new Response(JSON.stringify({ error: "Invalid shipping_address (5-200 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shippingCity = validateString(body.shipping_city, 2, MAX_SHIPPING_CITY);
    if (!shippingCity) {
      return new Response(JSON.stringify({ error: "Invalid shipping_city (2-100 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate user_id if provided
    if (body.user_id !== null && body.user_id !== undefined) {
      if (typeof body.user_id !== "string" || !UUID_REGEX.test(body.user_id)) {
        return new Response(JSON.stringify({ error: "Invalid user_id format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.items.length > MAX_ITEMS) {
      return new Response(JSON.stringify({ error: `Too many items (max ${MAX_ITEMS})` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each item and calculate expected total
    const validatedItems: CreateOrderItem[] = [];
    let calculatedTotal = 0;

    for (const item of body.items) {
      const validated = validateItem(item);
      if (!validated) {
        return new Response(JSON.stringify({ error: "Invalid item in cart" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      validatedItems.push(validated);
      calculatedTotal += validated.price * validated.quantity;
    }

    // Verify total_amount matches calculated total (allow small floating point differences)
    if (Math.abs(calculatedTotal - body.total_amount) > 0.01) {
      return new Response(JSON.stringify({ error: "Total amount mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify all product_ids exist and are active
    const productIds = validatedItems.map((i) => i.product_id);
    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id, price, is_active, stock_quantity")
      .in("id", productIds);

    if (productsError) {
      console.error("Products query error:", productsError);
      return new Response(JSON.stringify({ error: "Failed to verify products" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!products || products.length !== productIds.length) {
      return new Response(JSON.stringify({ error: "Some products not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check all products are active and have sufficient stock
    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of validatedItems) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!product.is_active) {
        return new Response(JSON.stringify({ error: "Some products are unavailable" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (product.stock_quantity < item.quantity) {
        return new Response(JSON.stringify({ error: `Insufficient stock for product` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const status = body.status === "pending" ? "pending" : "pending"; // Only allow pending status

    // Create order
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert([
        {
          user_id: body.user_id ?? null,
          total_amount: body.total_amount,
          shipping_name: shippingName,
          shipping_phone: shippingPhone,
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          status,
        },
      ])
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create order items
    const orderItems = validatedItems.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      price: i.price,
    }));

    const { error: itemsError } = await admin.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Best-effort cleanup
      await admin.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update stock quantities
    for (const item of validatedItems) {
      const product = productMap.get(item.product_id)!;
      await admin
        .from("products")
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq("id", item.product_id);
    }

    console.log(`Order created successfully: ${order.id}`);
    return new Response(JSON.stringify({ order_id: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
