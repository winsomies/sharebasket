import { BlockStack, Box, InlineGrid, InlineStack, Text } from "@shopify/polaris";
import { PremiumBadge } from "./PremiumBadge";

export const Section = ({ title, description, children, pro = false }) => (
    <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
      <Box>
        <BlockStack gap="200">
          <InlineStack blockAlign="center" align="space-between">
          <Text as="h3" variant="headingMd">
            {title}
          </Text>
          {pro && <PremiumBadge/>}
          </InlineStack>
         
          <Text variant="bodyMd">{description}</Text>
        </BlockStack>
      </Box>
      <Box>{children}</Box>
    </InlineGrid>
  );