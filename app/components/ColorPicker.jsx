import { FormLayout, Label, TextField, Text } from "@shopify/polaris";

export function ColorPickerField({ label, value, onChange, helpText, disabled }) {
  return (
    <FormLayout>
      <Label>{label}</Label>
      <TextField
        type="color"
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {helpText && <Text as="span" tone="subdued">{helpText}</Text>}
    </FormLayout>
  );
}
