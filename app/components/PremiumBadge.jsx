import { Box, Text } from '@shopify/polaris';
import React from 'react';

export const PremiumBadge = ({ short = true }) => {
  return (
    <Box
      as="span"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#141414',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '9999px',
        fontSize: '14px',
        fontWeight: 500,
        gap: '3px',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/128/6826/6826425.png"
        alt="Crown"
        style={{
          width: '16px',
          height: '16px',
          objectFit: 'contain',
        }}
      />
      {!short && (
        <Text as="h4" variant="headingSm" tone="text-inverse">
          Pro
        </Text>
      )}
    </Box>
  );
}
