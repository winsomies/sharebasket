import {
  Card,
  Text,
  Button,
  Badge,
  InlineStack,
  Icon,
  BlockStack,
  Box,
  Link,
} from "@shopify/polaris";
import {
  QuestionCircleIcon,
  EmailIcon,
  PhoneIcon,
} from "@shopify/polaris-icons";

export function SupportCard() {
  const supportUrl =
    "https://winsomies.atlassian.net/servicedesk/customer/portal/1";
  const supportEmail = "support@winsomies.com";
  const whatsappUrl =
    "https://wa.me/923373175451?text=Hi%20Winsomies%20Support%2C%20I%20need%20help%20with%20AgeSafe.";
  const supportAvailable = true;

  return (
    <Card>
      <BlockStack vertical spacing="tight" gap={300}>
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">
          👋 Need a Hand with Share Basket?
          </Text>
          {supportAvailable && (
            <Badge tone="success">Priority Assistance</Badge>
          )}
        </InlineStack>

        <Text as="bodyMd">
        Our team is here to help you get the most out of Share Basket. Whether you need setup assistance or have a technical question, we've got your back.

        </Text>

        <Box>
          <Button
            url={supportUrl}
            variant="primary"
            target="_blank"
            icon={QuestionCircleIcon}
          >
            Visit Support Portal
          </Button>
        </Box>

        <Box>
          <InlineStack align="start">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "5px",
              }}
            >
              <Icon source={EmailIcon} />
              <Text>
                or email us at{" "}
                <Link url={`mailto:${supportEmail}`} target="_blank">
                  {supportEmail}
                </Link>
              </Text>
            </div>
          </InlineStack>
        </Box>
        <InlineStack align="start">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
            }}
          >
            <Icon source={PhoneIcon} />
            <Text>
              We’re just a WhatsApp message away —{" "}
              <Link url={whatsappUrl} target="_blank">
                let’s talk!
              </Link>
            </Text>
          </div>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
