import { json } from "@remix-run/node";
import prisma from "../db.server";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export const loader = async ({ request }) => {
  // Handle preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const url = new URL(request.url);
  const shareId = url.searchParams.get("shareId");

  if (!shareId) {
    return json(
      { success: false, error: "Missing 'shareId' query parameter." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const sharedCart = await prisma.sharedCart.findUnique({
      where: { shareId },
    });

    if (!sharedCart) {
      return json(
        { success: false, error: "Cart not found." },
        { status: 404, headers: corsHeaders }
      );
    }
    await prisma.sharedCart.update({
      where: { shareId },
      data: {
        totalClicks: {
          increment: 1,
        },
      },
    });
    

    return json(
      {
        success: true,
        items: sharedCart.items,
        created:sharedCart.createdAt
      },
      { status: 200, headers: corsHeaders}
    );
  } catch (error) {
    console.error("[get-cart] Error:", error);
    return json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
