import React, { useCallback, useState } from "react";
import {
  Card,
  Box,
  Text,
  Select,
  BlockStack,
  InlineStack,
  Banner,
  TextField,
} from "@shopify/polaris";

export function PopupPreview({
  verificationEnabled,
  verificationTitle,
  verificationDescription,
  verificationType,
  popupImage,
  popupBackgroundColor = "#FFFFFF",
  borderRadius = 10,
  textColor = "#333333",
  primaryButtonColor = "#4A90E2",
  secondaryButtonColor = "#777777",
  minimumAge = "18",
  showWatermark,
  secondaryButtonText,
  primaryButtonTextColor,
  secondaryButtonTextColor,
  primaryButtonText,
  isModal = false,
}) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const handleSelectChange = useCallback(
    (value) => setSelectedMonth(value),
    [],
  );


  const monthOptions = [
    { label: "January", value: "1" },
    { label: "February", value: "2" },
    { label: "March", value: "3" },
    { label: "April", value: "4" },
    { label: "May", value: "5" },
    { label: "June", value: "6" },
    { label: "July", value: "7" },
    { label: "August", value: "8" },
    { label: "September", value: "9" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  if (verificationEnabled === "false") {
    return (
      <Card>
        <Banner title="Preview Not Available" tone="warning">
          <p>
            Age verification is currently disabled. Enable it to see a preview.
          </p>
        </Banner>
      </Card>
    );
  }

  const popupStyle = {
    backgroundColor: popupBackgroundColor,
    borderRadius: `${borderRadius}px`,
    padding: "40px 30px",
    maxWidth: "500px",
    width: "90%",
    margin: "0 auto",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    position: "relative",
  };

  const textStyle = { color: textColor };

  const primaryButtonStyle = {
    backgroundColor: primaryButtonColor,
    color: primaryButtonTextColor,
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    minWidth: "100px",
  };

  const secondaryButtonStyle = {
    backgroundColor: secondaryButtonColor,
    color: secondaryButtonTextColor,
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    minWidth: "100px",
  };

  const watermarkStyle = {
    fontSize: "12px",
    color: "#999999",
    userSelect: "none",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    textAlign: "center",
  };

  const renderBirthDateVerification = () => (
    <BlockStack gap="300">
      <Text variant="bodyMd" style={{ ...textStyle, textAlign: "center" }}>
        Enter your date of birth:
      </Text>
      <InlineStack gap="300" blockAlign="center" align="center">
        <div style={{ width: "80px" }}>
          <TextField
            type="number"
            placeholder="Day"
            value={birthDay}
            onChange={setBirthDay}
            autoComplete="off"
          />
        </div>
        <div style={{ width: "100px" }}>
          <Select
            options={monthOptions}
            onChange={handleSelectChange}
            value={selectedMonth}
            placeholder="Month"
          />
        </div>
        <div style={{ width: "100px" }}>
          <TextField
            type="number"
            placeholder="Year"
            value={birthYear}
            onChange={setBirthYear}
            autoComplete="off"
          />
        </div>
      </InlineStack>
    </BlockStack>
  );

  const deviceFrame = isModal
    ? {
        border: "16px solid #111",
        borderRadius: "24px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        margin: "20px auto",
        maxWidth: "680px",
        padding: "20px 0",
        backgroundColor: "#f4f6f8",
      }
    : null;

  const storePreviewHeader = isModal ? (
    <div
      style={{
        borderBottom: "1px solid #ddd",
        padding: "8px 16px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px 8px 0 0",
        margin: "0 auto",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "8px 12px",
          fontSize: "14px",
          color: "#888",
          textAlign: "center",
        }}
      >
        <Text variant="bodySm">yourstore.myshopify.com</Text>
      </div>
    </div>
  ) : null;

  const PreviewWrapper = ({ children }) => {
    if (isModal) {
      return (
        <div style={deviceFrame}>
          {storePreviewHeader}
          <div style={{ padding: "20px 0", backgroundColor: "#f4f6f8" }}>
            {children}
          </div>
        </div>
      );
    }
    return <div>{children}</div>;
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Box padding={isModal ? "0" : "400"}>
          <PreviewWrapper>
            <div style={popupStyle}>
              <BlockStack gap="400" align="center">
                {popupImage && (
                  <div style={{ marginBottom: "16px", textAlign: "center" }}>
                    <img
                      src={
                        popupImage instanceof File
                          ? URL.createObjectURL(popupImage)
                          : popupImage
                      }
                      alt="Store logo"
                      style={{ width: "80px", height: "80px" }}
                    />
                  </div>
                )}

                <Box>
                  <Text variant="headingXl" as="h4">
                    {verificationTitle || "Age Verification"}
                  </Text>

                  {verificationDescription && (
                    <Text variant="bodySm">{verificationDescription}</Text>
                  )}
                </Box>

                {verificationType === "yes_no" ? (
                  <Text
                    style={{
                      ...textStyle,
                      marginTop: "20px",
                      fontSize: "16px",
                    }}
                  >
                    Are you {minimumAge} years of age or older?
                  </Text>
                ) : (
                  renderBirthDateVerification()
                )}

                <InlineStack gap="300" align="center" blockAlign="center">
                  <button style={primaryButtonStyle}>
                    {primaryButtonText}
                  </button>
                  <button style={secondaryButtonStyle}>
                    {secondaryButtonText}
                  </button>
                </InlineStack>

                {/* {showWatermark && (
                  <div style={watermarkStyle}>
                    <Text>Powered by Winsomies</Text>
                  </div>
                )} */}
              </BlockStack>
            </div>
          </PreviewWrapper>
        </Box>
      </BlockStack>
    </Card>
  );
}

export default PopupPreview;
