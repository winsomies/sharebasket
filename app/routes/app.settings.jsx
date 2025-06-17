import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Page,
  BlockStack,
  Select,
  TextField,
  Checkbox,
  RangeSlider,
  Modal,
  Text,
} from "@shopify/polaris";
import { Section } from "../components/Section";
import { labels } from "../constants/labels";
import { useFetcher, useNavigate } from "@remix-run/react";
import useShareBasket from "../store/Store";
import upsertMetaObject from "../services/upsertMetaobject";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const rawPayload = formData.get("payload");

  if (!rawPayload) throw new Error("Missing payload in form data.");

  let payload;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    throw new Error("Invalid JSON format in payload.");
  }

  const fields = [
    {
      key: "cartSharingEnabled",
      value: payload.cartSharingEnabled || "disabled",
    },
    {
      key: "linkExpiration",
      value: payload.linkExpiration || "3",
    },
    {
      key: "requireLogin",
      value: String(payload.requireLogin ?? false),
    },
    {
      key: "autoApplyDiscount",
      value: String(payload.autoApplyDiscount ?? false),
    },
    {
      key: "discountCode",
      value: payload.discountCode || "",
    },
    {
      key: "shareButtonLabel",
      value: payload.shareButtonLabel || "Share Cart",
    },
    {
      key: "successMessage",
      value: payload.successMessage || "Link copied!",
    },
    {
      key: "introText",
      value: payload.introText || "",
    },
    {
      key: "termsNote",
      value: payload.termsNote || "",
    },
    {
      key: "expiredMessage",
      value: payload.expiredMessage || "This link has expired.",
    },
    {
      key: "loginRequiredMessage",
      value:
        payload.loginRequiredMessage ||
        "Please log in to access this shared cart.",
    },
    {
      key: "buttonColor",
      value: payload.buttonColor || "#000000",
    },
    {
      key: "textColor",
      value: payload.textColor || "#ffffff",
    },
    {
      key: "borderRadius",
      value: String(payload.borderRadius ?? 8),
    },
    {
      key: "shareModalBackgroundColor",
      value: payload.shareModalBackgroundColor || "#ffffff",
    },
    {
      key: "shareModalTextColor",
      value: payload.shareModalTextColor || "#000000",
    },
  ];

  const { metaobject } = await upsertMetaObject(admin, fields);
  console.log(metaobject)

  return { metaobject };
};

export default function ShareBasketSettings() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isSaving = fetcher.state !== "idle";
  const { plan, setMetaobject, metaobject, discounts } = useShareBasket();
  // const hasProPlan = true;
  const hasProPlan =
    plan?.hasActivePayment &&
    plan?.appSubscriptions?.length > 0 &&
    plan.appSubscriptions[0]?.status === "ACTIVE" &&
    plan.appSubscriptions[0]?.name === "Pro Plan";

  // State variables
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cartSharingEnabled, setCartSharingEnabled] = useState("enabled");
  const [linkExpiration, setLinkExpiration] = useState("7");
  const [requireLogin, setRequireLogin] = useState(false);
  const [autoApplyDiscount, setAutoApplyDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [shareButtonLabel, setShareButtonLabel] = useState("Share Cart");
  const [successMessage, setSuccessMessage] = useState("Link copied!");
  const [introText, setIntroText] = useState("");
  const [termsNote, setTermsNote] = useState("Discount applies at checkout.");
  const [expiredMessage, setExpiredMessage] = useState(
    "This link has expired.",
  );
  const [loginRequiredMessage, setLoginRequiredMessage] = useState(
    "Please log in to access this shared cart.",
  );
  const [buttonColor, setButtonColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(8);
  const [shareModalBackgroundColor, setShareModalBackgroundColor] =
    useState("#ffffff");
  const [shareModalTextColor, setShareModalTextColor] = useState("#000000");

  const [errors, setErrors] = useState({});

  // Handle fetcher response
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.metaobject &&
      Array.isArray(fetcher.data.metaobject.fields)
    ) {
      const rawMetaobject = fetcher.data.metaobject;

      const updatedMetaobject = {
        id: rawMetaobject.id,
        handle: rawMetaobject.handle,
        displayName: rawMetaobject.displayName,
        ...Object.fromEntries(
          rawMetaobject.fields.map((field) => [field.key, field.value]),
        ),
      };
      setMetaobject(updatedMetaobject);

      if (typeof shopify !== "undefined" && shopify.toast) {
        shopify.toast.show("Settings saved successfully.");
      }
    }
  }, [fetcher.state, fetcher.data, setMetaobject]);
  useEffect(() => {
    console.log('Discounts array:', discounts);
    console.log('Current discountCode:', discountCode);
    
    // Auto-select if there's only one discount and none is selected
    if (discounts && discounts.length === 1 && !discountCode && autoApplyDiscount) {
      const singleDiscount = discounts[0];
      console.log('Auto-selecting single discount:', singleDiscount);
      setDiscountCode(singleDiscount.value);
    }
  }, [discounts, discountCode, autoApplyDiscount]);
  // Initialize state from metaobject
  useEffect(() => {
    if (!metaobject || Object.keys(metaobject).length === 0) return;

    const {
      cartSharingEnabled = "enabled",
      linkExpiration = "7",
      requireLogin = false,
      autoApplyDiscount = false,
      discountCode = "",
      shareButtonLabel = "Share Cart",
      successMessage = "Link copied!",
      introText = "",
      termsNote = "",
      expiredMessage = "",
      loginRequiredMessage = "Please log in to access this shared cart.",
      buttonColor = "#000000",
      textColor = "#ffffff",
      borderRadius = 8,
      shareModalBackgroundColor = "#ffffff",
      shareModalTextColor = "#000000",
    } = metaobject;

    setCartSharingEnabled(cartSharingEnabled);
    setLinkExpiration(linkExpiration);
    setRequireLogin(requireLogin === true || requireLogin === "true");
    setAutoApplyDiscount(
      autoApplyDiscount === true || autoApplyDiscount === "true",
    );
    setShareModalBackgroundColor(shareModalBackgroundColor);
    setShareModalTextColor(shareModalTextColor);
    setDiscountCode(discountCode);
    setShareButtonLabel(shareButtonLabel);
    setSuccessMessage(successMessage);
    setIntroText(introText);
    setTermsNote(termsNote);
    setExpiredMessage(expiredMessage);
    setLoginRequiredMessage(loginRequiredMessage);
    setButtonColor(buttonColor);
    setTextColor(textColor);
    setBorderRadius(Number(borderRadius));
  }, [metaobject]);

  // Options
  const enableDisableOptions = [
    { label: "Enabled", value: "enabled" },
    { label: "Disabled", value: "disabled" },
  ];

  const expirationOptions = [
    { label: "24 hours", value: "1" },
    { label: "3 days", value: "3" },
    { label: "7 days", value: "7" },
    { label: "Never expires", value: "never" },
  ];

  // Fixed handleProFeature function
  const handleProFeature = (callback) => {
    if (!hasProPlan) {
      setShowUpgradeModal(true);
      return false; // Indicate that the action was blocked
    } else {
      callback();
      return true; // Indicate that the action was executed
    }
  };

  const handleSave = () => {
    const newErrors = {};

    if (autoApplyDiscount && !discountCode) {
      newErrors.discountCode = "Please select a discount code to auto-apply.";
    }
    
    if (!(shareButtonLabel || "").trim()) {
      newErrors.shareButtonLabel = "Share button label is required.";
    } else if (shareButtonLabel.length > 25) {
      newErrors.shareButtonLabel = "Maximum 25 characters allowed.";
    }
    
    if (!(successMessage || "").trim()) {
      newErrors.successMessage = "Success message is required.";
    } else if (successMessage.length > 100) {
      newErrors.successMessage = "Maximum 100 characters allowed.";
    }
    
    if (introText && introText.length > 250) {
      newErrors.introText = "Intro text can't exceed 250 characters.";
    }
    
    if (!(termsNote || "").trim()) {
      newErrors.termsNote = "Terms note is required.";
    }
    
    if (!(expiredMessage || "").trim()) {
      newErrors.expiredMessage = "Expired link message is required.";
    } else if (expiredMessage.length > 150) {
      newErrors.expiredMessage = "Maximum 150 characters allowed.";
    }
    
    if (!(loginRequiredMessage || "").trim()) {
      newErrors.loginRequiredMessage = "Login required message is required.";
    } else if (loginRequiredMessage.length > 150) {
      newErrors.loginRequiredMessage = "Maximum 150 characters allowed.";
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const payload = {
        cartSharingEnabled,
        linkExpiration,
        requireLogin,
        autoApplyDiscount,
        discountCode,
        shareButtonLabel,
        successMessage,
        introText,
        termsNote,
        expiredMessage,
        loginRequiredMessage,
        buttonColor,
        textColor,
        borderRadius,
        shareModalBackgroundColor,
        shareModalTextColor,
      };

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      fetcher.submit(formData, {
        method: "POST",
        encType: "multipart/form-data",
      });
    }
  };

  return (
    <Page
      title="Cart Share Settings"
      backAction={{ content: "Back to Dashboard", url: "/app" }}
      primaryAction={{
        content: isSaving ? "Saving..." : "Save Settings",
        onAction: handleSave,
        loading: isSaving,
        disabled: isSaving,
      }}
      // secondaryActions={[
      //   {
      //     content: "Documentation",
      //     disabled: isSaving,
      //   },
      // ]}
      divider
    >
      <Box paddingBlockEnd="1000">
        <BlockStack gap="400">
          {/* Cart Share Settings */}
          <Section
            title="🛠️ Cart Share Settings"
            description="Configure how your shared cart links behave."
          >
            <Card>
              <BlockStack gap="400">
                <Select
                  label={labels.enableCartSharing.label}
                  helpText={labels.enableCartSharing.helpText}
                  options={enableDisableOptions}
                  value={cartSharingEnabled}
                  disabled={isSaving}
                  onChange={setCartSharingEnabled}
                />

                <Checkbox
                  label={labels.requireLogin.label}
                  helpText={labels.requireLogin.helpText}
                  disabled={isSaving}
                  checked={requireLogin}
                  onChange={setRequireLogin}
                />
              </BlockStack>
            </Card>
          </Section>
          {/* Link Expiration (Pro) */}
          <Section
            title="⏳ Link Expiration"
            description="Control how long shared cart links remain valid."
            pro={true}

          >
            <Card>
              <BlockStack gap="400">
                <Select
                  label={labels.linkExpiration.label}
                  helpText={labels.linkExpiration.helpText}
                  options={expirationOptions}
                  value={linkExpiration}
                  disabled={isSaving}
                  onChange={(expiration) =>
                    handleProFeature(() => setLinkExpiration(expiration))
                  }
                />
              </BlockStack>
            </Card>
          </Section>

          {/* Discount Settings */}
          <Section
            title="🎁 Discount Settings"
            pro={true}
            description={
              <>
                Choose a Shopify discount code to auto-apply when sharing a
                cart.{" "}
                <a
                  href="https://admin.shopify.com/store/YOUR_STORE_ID/discounts"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create a new discount
                </a>{" "}
                if needed.
              </>
            }
          >
            <Card>
              <BlockStack gap="400">
                <Checkbox
                  disabled={isSaving}
                  label={labels.autoApplyDiscount.label}
                  helpText={labels.autoApplyDiscount.helpText}
                  checked={autoApplyDiscount}
                  onChange={(checked) =>
                    handleProFeature(() => setAutoApplyDiscount(checked))
                  }
                />

                <Select
                  label={labels.discountCode.label}
                  helpText={labels.discountCode.helpText}
                  options={discounts}
                  
                  value={discountCode}
                  onChange={(code) =>
                    handleProFeature(() => setDiscountCode(code))
                  }
                  disabled={!autoApplyDiscount || isSaving}
                  error={errors.discountCode}
                />
              </BlockStack>
            </Card>
          </Section>

          {/* Text Customization */}
          <Section
            title="🏷️ Text Customization"
            description="Customize labels and messages shown to customers."
          >
            <Card>
              <BlockStack gap="400">
                <TextField
                  label={labels.shareButtonLabel.label}
                  helpText={labels.shareButtonLabel.helpText}
                  value={shareButtonLabel}
                  onChange={setShareButtonLabel}
                  disabled={isSaving}
                  error={errors.shareButtonLabel}
                />

                <TextField
                  label={labels.successMessage.label}
                  helpText={labels.successMessage.helpText}
                  value={successMessage}
                  onChange={setSuccessMessage}
                  disabled={isSaving}
                  error={errors.successMessage}
                />

                <TextField
                  label={labels.introText.label}
                  helpText={labels.introText.helpText}
                  value={introText}
                  onChange={setIntroText}
                  disabled={isSaving}
                  error={errors.introText}
                />

                <TextField
                  label={labels.termsNote.label}
                  helpText={labels.termsNote.helpText}
                  value={termsNote}
                  disabled={isSaving}
                  onChange={setTermsNote}
                  error={errors.termsNote}
                />

                <TextField
                  label={labels.expiredMessage.label}
                  helpText={labels.expiredMessage.helpText}
                  value={expiredMessage}
                  disabled={isSaving}
                  onChange={setExpiredMessage}
                  error={errors.expiredMessage}
                />

                <TextField
                  label={labels.loginRequiredMessage.label}
                  helpText={labels.loginRequiredMessage.helpText}
                  value={loginRequiredMessage}
                  disabled={isSaving}
                  onChange={setLoginRequiredMessage}
                  error={errors.loginRequiredMessage}
                />
              </BlockStack>
            </Card>
          </Section>

          {/* Button Styling */}
          <Section
            title="🎨 Button Styling"
            description="Customize the appearance of your share button."
            pro={true}

          >
            <Card>
              <BlockStack gap="400">
                <TextField
                  label={labels.buttonColor.label}
                  helpText={labels.buttonColor.helpText}
                  type="color"
                  disabled={isSaving}
                  value={buttonColor}
                  onChange={(color) =>
                    handleProFeature(() => setButtonColor(color))
                  }
                  error={errors.buttonColor}
                />

                <TextField
                  label={labels.textColor.label}
                  helpText={labels.textColor.helpText}
                  disabled={isSaving}
                  type="color"
                  value={textColor}
                  onChange={(value) =>
                    handleProFeature(() => setTextColor(value))
                  }
                  error={errors.textColor}
                />
                <TextField
                  label="Modal Background Color"
                  helpText="Color of the share modal background."
                  type="color"
                  disabled={isSaving}
                  value={shareModalBackgroundColor}
                  onChange={(color) =>
                    handleProFeature(() => setShareModalBackgroundColor(color))
                  }
                />

                <TextField
                  label="Modal Text Color"
                  helpText="Color of the text inside the share modal."
                  type="color"
                  disabled={isSaving}
                  value={shareModalTextColor}
                  onChange={(color) =>
                    handleProFeature(() => setShareModalTextColor(color))
                  }
                />

                <RangeSlider
                  label={labels.borderRadius.label}
                  helpText={labels.borderRadius.helpText}
                  disabled={isSaving}
                  value={borderRadius}
                  onChange={(radius) =>
                    handleProFeature(() => setBorderRadius(radius))
                  }
                  output
                  min={0}
                  max={100}
                  step={1}
                />
              </BlockStack>
            </Card>
          </Section>
        </BlockStack>
      </Box>

      {showUpgradeModal && (
        <Modal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="🔓 Unlock Pro Features"
          primaryAction={{
            content: "Upgrade Now",
            onAction: () => navigate("/app/pricing"),
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setShowUpgradeModal(false),
            },
          ]}
        >
          <Modal.Section>
            <Text>
              Don't limit what your store can do — upgrade to Pro and unlock
              your full toolkit.
            </Text>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}
