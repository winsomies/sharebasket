const LabeledTextField = ({ label, value, onChange, ...props }) => (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      {...props}
    />
  );