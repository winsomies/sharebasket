import { json } from "@remix-run/node";
import prisma from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return new Response("Not Found", { status: 404, headers: corsHeaders });
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return json(
      { success: false, error: "Method Not Allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { shop, items, plan } = body;
    console.log(body)

    if (typeof shop !== "string" || !shop.trim()) {
      return json(
        { success: false, error: 'Missing or invalid "shop" parameter.' },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get total links count for the shop
    const totalLinks = await prisma.sharedCart.count({
      where: { shop: shop },
    });
    
    console.log("Received plan:", plan);
    console.log("Total links for shop:", totalLinks);    
    // Check plan and total links limit
    if (totalLinks >= 30 && (!plan || plan.toLowerCase() !== "pro")) {
      return json(
        {
          success: false,
          error: "Upgrade to Pro plan to create more than 30 shared baskets.",
          totalLinks,
        },
        { status: 403, headers: corsHeaders }
      );
    }
    
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !items.every((item) => item.id && item.quantity)
    ) {
      return json(
        { success: false, error: 'Invalid or empty "items" array.' },
        { status: 400, headers: corsHeaders }
      );
    }

    let shareId;
    let attempt = 0;
    const maxAttempts = 5;

    do {
      shareId = Math.random().toString(36).substring(2, 10);
      const existing = await prisma.sharedCart.findUnique({ where: { shareId } });
      if (!existing) break;
      attempt++;
    } while (attempt < maxAttempts);

    if (attempt === maxAttempts) {
      return json(
        { success: false, error: "Failed to generate unique share ID." },
        { status: 500, headers: corsHeaders }
      );
    }

    const sharedCart = await prisma.sharedCart.create({
      data: {
        shareId,
        shop: shop.trim(),
        items,
        totalClicks: 0,
      },
    });

    const shareUrl = `https://${shop}/cart?sharebasket=${shareId}`;

    return json(
      {
        success: true,
        shareId,
        shareUrl,
        data: {
          shop: sharedCart.shop,
          items: sharedCart.items,
          totalClicks: sharedCart.totalClicks,
          createdAt: sharedCart.createdAt,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[save-cart] Error:", error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
