import { useEffect, useState } from "react";
import { SetupGuide } from "../components/SetupGuide";
import { Page, Layout, Card, Button } from "@shopify/polaris";
import useShareBasket from "../store/Store";
import { ExternalIcon, EditIcon } from "@shopify/polaris-icons";
import { useNavigate } from "@remix-run/react";
import LinkStatsBarChart from "../components/Chart";

export default function Index() {
  const { appEmbed, metaobject, shop, plan, theme } = useShareBasket();
  const [showGuide, setShowGuide] = useState(true);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const previewTheme = () => {
    const themeEditorId = theme.split("/").pop();
    const shopName = shop?.myshopifyDomain?.split(".")[0];
    const extensionId = "918f57f3-1d7b-425d-9d54-6998aedd7475";
    const extensionName = "sharebasket";
    const editorUrl = `https://admin.shopify.com/store/${shopName}/themes/${themeEditorId}/editor?context=apps&template=index&activateAppId=${extensionId}/${extensionName}`;
    return editorUrl;
  };

  const generateItems = () => {
    const isCartSharingEnabled = metaobject?.cartSharingEnabled === "enabled";
    console.log("cart sharing staus", isCartSharingEnabled);
    return [
      {
        id: 0,
        title: "Activate Share Basket App Embed",
        description:
          "Enable the Share Basket app embed in your Shopify theme to display cart save and share functionality on your storefront. This is required for customers to save and share their shopping carts.",
        complete: !!appEmbed,
        primaryButton: {
          content: "Enable App Embed",
          props: {
            onClick: () => {
              const url = previewTheme();
              window.open(url, "_blank");
            },
          },
        },
      },
      {
        id: 1,
        title: "Enable Cart Sharing Features",
        description:
          "Turn on cart sharing functionality to allow customers to save their shopping carts and share them with friends, family, or across devices. Boost your conversion rates with this powerful feature.",
        complete: isCartSharingEnabled,
        primaryButton: {
          content: "Configure Settings",
          props: {
            url: "/app/settings",
          },
        },
      },
    ];
  };

  useEffect(() => {
    setItems(generateItems());
  }, [metaobject, appEmbed]);

  const onStepComplete = async (id) => {
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, complete: !item.complete } : item,
        ),
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!showGuide) {
    return (
      <div className="max-w-[60rem] m-auto text-center mt-10">
        <Button onClick={() => setShowGuide(true)}>Show Setup Guide</Button>
      </div>
    );
  }

  return (
    <Page
      title={`Hello, ${shop.name}! From Cart to Heart in One Share 🧺❤️`}
      subtitle="Let shoppers save their cart or share it with friends — simple magic that brings them back."
      secondaryActions={[
        {
          content: "View Documentation",
          target: "_blank",
          icon: ExternalIcon,
          url: "https://winsomies.com/docs/sharebasket",
        },
      ]}
      primaryAction={{
        content: "Manage Cart Settings",
        icon: EditIcon,
        onAction: () => {
          navigate("/app/settings");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <SetupGuide
              onDismiss={() => {
                setItems(generateItems());
              }}
              onStepComplete={onStepComplete}
              items={items}
            />
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Cart Sharing Analytics">
            <LinkStatsBarChart
              blur={
                shop?.plan?.partnerDevelopment == false &&
                plan?.hasActivePayment == false
              }
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
