import {
  Outlet,
  useLoaderData,
  Link,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { useEffect } from "react";
import checkAppEmbedStatus from "../services/checkEmbedAppStatus";
import { Box, InlineStack, Text } from "@shopify/polaris";
import useShareBasket from "../store/Store";
import prisma from "../db.server";
import upsertMetaObject from "../services/upsertMetaobject";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { billing, admin } = await authenticate.admin(request);
  const plan = await billing.check();

  const { themeId, isEnabled } = await checkAppEmbedStatus(admin);
  console.log("Theme", isEnabled)

  const type = "share-basket-by-winsomies";

  const queryResponse = await admin.graphql(`
    {
      shop {
        name
        shopOwnerName
        myshopifyDomain
        plan{
          partnerDevelopment
        }
      }
      codeDiscountNodes(first: 250) {
        nodes {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              status
              codes(first: 10) {
                nodes {
                  code
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              title
              status
              codes(first: 10) {
                nodes {
                  code
                }
              }
            }
            ... on DiscountCodeBxgy {
              title
              status
              codes(first: 10) {
                nodes {
                  code
                }
              }
            }
          }
        }
      }
      metaobjects(type: "${type}", first: 250) {
        edges {
          node {
            id
            handle
            displayName
            fields {
              key
              jsonValue
            }
          }
        }
      }
    }
  `);

  const queryData = await queryResponse.json();


  const shop = queryData?.data?.shop || "";
  if (plan.hasActivePayment || shop?.plan?.partnerDevelopment) {
    const defaultFields = [
      { key: "appPlan", value: "pro" },
    ];
  
    const { metaobject } = await upsertMetaObject(admin, defaultFields);

  }
  const metaobjectNode = queryData?.data?.metaobjects?.edges?.[0]?.node;

  const metaobjects = metaobjectNode
    ? {
        id: metaobjectNode.id,
        handle: metaobjectNode.handle,
        displayName: metaobjectNode.displayName,
        ...Object.fromEntries(
          (metaobjectNode.fields || []).map((field) => [
            field.key,
            field.jsonValue,
          ]),
        ),
      }
    : {};

  const discountNodes = queryData?.data?.codeDiscountNodes?.nodes || [];

  // Debug: Log discount nodes

  const discounts = discountNodes
    .map(({ codeDiscount }) => {
      return codeDiscount?.title;
    })
    .filter((title) => {
      const isValid = typeof title === "string" && title.length > 0;
      return isValid;
    })
    .map((title) => ({ label: title, value: title }));

  // Debug: Log final discounts

  const apiKey = process.env.SHOPIFY_API_KEY || "";
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  

  
  // Create result array with all months initialized to zero counts
  const analytics = monthNames.map(month => ({
    monthName: month,
    totalLinks: 0,
    totalClicks: 0,
  }));
  if (plan?.hasActivePayment) {
    const allCarts = await prisma.sharedCart.findMany({
      where: { shop: shop.myShopifyDomain },
      select: { createdAt: true, totalClicks: true }
    });
    allCarts.forEach(({ createdAt, totalClicks }) => {
      const monthIndex = new Date(createdAt).getMonth();
      analytics[monthIndex].totalLinks++;
      analytics[monthIndex].totalClicks += totalClicks;
    });
  }

  console.log(metaobjects)
  
  


  return {
    metaobjects,
    shop,
    apiKey,
    themeId,
    appEmbedStatus: isEnabled,
    plan,
    discounts,
    analytics
  };
};

export default function App() {
  const navigate = useNavigate();
  const {
    metaobjects,
    shop,
    apiKey,
    plan,
    appEmbedStatus,
    discounts,
    themeId,
    analytics
  } = useLoaderData();

  const {
    setMetaobject,
    setShop,
    setPlan,
    setAppEmbed,
    setTheme,
    setDiscounts,
    setAnalytics
  } = useShareBasket();

  useEffect(() => {
    console.log(metaobjects);
    setMetaobject(metaobjects);
    setShop(shop);
    setDiscounts(discounts);
    setAppEmbed(appEmbedStatus);
    setTheme(themeId);
    setPlan(plan);
    setAnalytics(analytics)
  }, [metaobjects, shop, discounts, appEmbedStatus, themeId, plan, analytics]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/pricing">Pricing</Link>
        <Link to="/app/support">Support</Link>
      </NavMenu>
      <Outlet />
      <Box paddingBlockEnd={800} paddingBlockStart={800}>
        <InlineStack align="center" blockAlign="center">
          <Text variant="bodyLg" as="p" alignment="center">
            Have questions or need help setting up? We're here for you! Reach us
            anytime at{" "}
            <Link url="mailto:support@winsomies.com">
              support@winsomies.com
            </Link>
          </Text>
        </InlineStack>
      </Box>
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
