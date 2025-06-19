import { InlineStack, Modal, Page } from "@shopify/polaris";
import { PricingCard } from "../components/PricingCard";
import { useFetcher } from "react-router-dom";
import { useCallback, useState } from "react";
import { authenticate, PRO_PLAN } from "../shopify.server";
import upsertMetaObject from "../services/upsertMetaobject";
import useShareBasket from "../store/Store";

export const action = async ({ request }) => {
  const { billing, redirect, session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const { shop } = session;
  const shopName = shop.replace(".myshopify.com", "");

  const plan = formData.get("plan");

  if (plan === "pro") {
    await billing.require({
      plans: [PRO_PLAN],
      onFailure: async () => {
        return billing.request({
          isTest:false,
          plan: PRO_PLAN,
          returnUrl: `https://admin.shopify.com/store/${shopName}/apps/share-basket/app/`,
        });
      },
    });
    // await updateBillingMetaobject(admin, "pro");
    return redirect("/app/pricing");
  }
  if (plan === "standard") {
    const billingCheck = await billing.require({
      plans: [PRO_PLAN],
      onFailure: async () => billing.request({ plan: PRO_PLAN }),
    });
  
    const subscription = billingCheck.appSubscriptions[0];
    const defaultFields = [
      { key: "linkExpiration", value: "1" },
      { key: "appPlan", value: "free" },
      { key: "autoApplyDiscount", value: "false" },
      { key: "discountCode", value: "" },
      { key: "buttonColor", value: "#000000" },
      { key: "textColor", value: "#ffffff" },
      { key: "borderRadius", value: "8" },
      { key: "shareModalBackgroundColor", value: "#ffffff" },
      { key: "shareModalTextColor", value: "#000000" },
    ];
  
    const { metaobject } = await upsertMetaObject(admin, defaultFields);
    const cancelledSubscription = await billing.cancel({
      subscriptionId: subscription.id,
      isTest: false,
      prorate: true,
     });
  };
  

  return redirect("/app");
};

export default function Pricing() {
  const fetcher = useFetcher();
  const { plan, metaobjects, shop } = useShareBasket();
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const isSaving = fetcher.state !== "idle";

  const hasProPlan =
  shop?.plan?.partnerDevelopment === true || (
    plan?.hasActivePayment &&
    plan?.appSubscriptions?.[0]?.status === "ACTIVE" &&
    plan.appSubscriptions?.[0]?.name === "Pro Plan"
  );

  const isPartnerDevStore = shop?.plan?.partnerDevelopment === true;

  const handlePlanSelect = useCallback(
    (planName) => {
      fetcher.submit(
        { plan: planName, metaobjects: JSON.stringify(metaobjects) },
        { method: "POST" }
      );
    },
    [metaobjects]
  );

  const plans = [
    {
      title: "Standard",
      description:
        "Share basic cart links with ease — no frills, just functionality.",
      features: [
        "🔗 Enable or disable cart sharing",
        "🚫 Optional login requirement",
        "🔤 Customize share button label",
        "✅ Customize success message after sharing",
        "📝 Add intro text and terms note",
        "⌛ Customize expired link message",
        "🔒 Customize login required message",
        "📤 Basic cart sharing functionality",
        "🔗 Share up to 30 carts",
        "📧 Email support included",
      ],
      price: "$0",
      frequency: "month",
      button: hasProPlan
        ? {
            content: "Downgrade to Standard",
            props: {
              variant: "secondary",
              onClick: () => setShowDowngradeModal(true),
              disabled: isSaving || isPartnerDevStore,
              loading: isSaving,
            },
          }
        : {
            content: "Current Plan",
            props: {
              variant: "secondary",
              disabled: true,
            },
          },
    },
    {
      title: "Pro",
      featuredText: "Unlock Full Sharing Power",
      description:
        "Advanced cart sharing, branding control, and deep insights.",
      features: [
        "📊 Powerful analytics — track clicks & shares",
        "⏳ Set cart link expiration time (24 hours, 3 days, 7 days, or never)",
        "🏷️ Auto-apply Shopify discount codes on shared carts",
        "📈 Enhanced control & styling for shared cart experience",
        "🔓 Unlock full customization toolkit",
        "🎨 Fully customize button & modal colors",
        "🧠 Save unlimited carts — no limits!",
        "⚡ Priority email & chat support",
      ],
      price: "$2.99",
      frequency: "month",
      button: hasProPlan
        ? {
            content: "You're on Pro",
            props: {
              variant: "secondary",
              disabled: true,
            },
          }
        : {
            content: "Upgrade to Pro",
            props: {
              variant: "primary",
              onClick: () => handlePlanSelect("pro"),
              disabled: isSaving,
              loading: isSaving,
            },
          },
    },
  ];

  return (
    <Page title="Pricing">
      <InlineStack gap="600" align="center" blockAlign="start">
        {plans.map((plan, index) => (
          <PricingCard key={index} {...plan} />
        ))}
      </InlineStack>

      {showDowngradeModal && (
        <Modal
          open
          onClose={() => setShowDowngradeModal(false)}
          title="Are you sure you want to downgrade?"
          primaryAction={{
            content: "Yes, downgrade",
            onAction: () => {
              handlePlanSelect("standard");
              setShowDowngradeModal(false);
            },
            destructive: true,
            loading: isSaving,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setShowDowngradeModal(false),
            },
          ]}
        >
          <Modal.Section>
            <p>
              You’ll lose access to Pro features like analytics, auto-discounts,
              cart expiration, and customization. Your plan will switch to
              Standard immediately.
            </p>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
