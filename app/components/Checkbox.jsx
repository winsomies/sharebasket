import React from "react";
import {
  Box,
  Checkbox,
  Text,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";
import { StarFilledIcon } from "@shopify/polaris-icons";
import {PremiumBadge} from "./PremiumBadge";
function SmartCheckbox({ label, checked, onChange, helpText, badge, ...rest }) {
  return (
    <Box
      style={{
        width: "max-content",
      }}
    >
      <BlockStack gap="200">
        <InlineStack align="space-between" gap={"500"}>
          <Checkbox
            label={label}
            checked={checked}
            onChange={onChange}
            {...rest}
          />
          {badge && <PremiumBadge />}
        </InlineStack>
        {helpText && (
          <Text as="p" variant="bodySm" tone="subdued" paddingInlineStart="100">
            {helpText}
          </Text>
        )}
      </BlockStack>
    </Box>
  );
}

export default SmartCheckbox;
