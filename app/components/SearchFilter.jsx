import React, { useState, useCallback } from 'react';
import { Autocomplete, Icon, Tag, BlockStack, Box } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

function AutocompleteSelect({
  optionsData,
  label,
  placeholder,
  onSelectChange,
  allowMultiple = true,
  preselectedOptions = [],
  disabled,
  error,
  maxSelected = null, // ✅ New prop for max selection limit
}) {
  const [selectedOptions, setSelectedOptions] = useState(preselectedOptions);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(optionsData);
  const [open, setOpen] = useState(false);

  const updateText = useCallback(
    (value) => {
      setInputValue(value);

      if (value === '') {
        setOptions(optionsData);
      } else {
        const filterRegex = new RegExp(value, 'i');
        const resultOptions = optionsData.filter((option) =>
          option.label.match(filterRegex)
        );
        setOptions(resultOptions);
      }

      setOpen(true);
    },
    [optionsData]
  );

  const updateSelection = useCallback(
    (selected) => {
      let newSelection = selected;

      if (!allowMultiple) {
        newSelection = selected.slice(-1);
        const matchedOption = options.find((opt) => opt.value === newSelection[0]);
        setInputValue(matchedOption?.label || '');
        setSelectedOptions(newSelection);
        onSelectChange(newSelection);
        return;
      }

      // ✅ Enforce maxSelected limit
      if (maxSelected && selectedOptions.length >= maxSelected) {
        setInputValue(''); // clear field but don't update
        shopify.toast.show(`Free plan is limited to ${maxSelected} products. Upgrade to Pro for unlimited products.`);
        return;
      }

      const added = selected.filter((item) => !selectedOptions.includes(item));
      const updated = [...selectedOptions, ...added].slice(0, maxSelected || undefined);

      setInputValue('');
      setSelectedOptions(updated);
      onSelectChange(updated);
    },
    [allowMultiple, options, onSelectChange, selectedOptions, maxSelected]
  );

  const removeTag = useCallback(
    (tag) => () => {
      const updated = selectedOptions.filter((item) => item !== tag);
      setSelectedOptions(updated);
      onSelectChange(updated);
    },
    [selectedOptions, onSelectChange]
  );

  const verticalContentMarkup =
    allowMultiple && selectedOptions.length > 0 ? (
      <Box spacing="extraTight" alignment="center" paddingInlineStart={200}>
        {selectedOptions.map((value) => {
          const matchedLabel = optionsData.find((o) => o.value === value)?.label || value;
          return (
            <Tag key={value} onRemove={removeTag(value)} disabled={disabled}>
              {matchedLabel}
            </Tag>
          );
        })}
      </Box>
    ) : null;

  const textField = (
    <Autocomplete.TextField
      onChange={updateText}
      onFocus={() => {
        setOptions(optionsData);
        setOpen(true);
      }}
      label={label}
      value={inputValue}
      placeholder={placeholder}
      prefix={<Icon source={SearchIcon} tone="base" />}
      verticalContent={verticalContentMarkup}
      autoComplete="off"
      error={error}
      disabled={disabled}
    />
  );

  return (
    <Autocomplete
      options={options}
      selected={selectedOptions}
      onSelect={updateSelection}
      textField={textField}
      disabled={disabled}
      allowMultiple={allowMultiple}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  );
}

export default AutocompleteSelect;
