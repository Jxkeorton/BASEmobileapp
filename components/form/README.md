# Form Components

Reusable controlled form components for React Hook Form with React Native and react-native-paper.

## Components

### ControlledTextInput

Generic text input component that integrates with react-hook-form.

**Usage:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControlledTextInput } from "@/components/form";

const MyForm = () => {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(mySchema),
  });

  return (
    <ControlledTextInput
      control={control}
      name="fieldName"
      label="Field Label"
      placeholder="Enter value"
    />
  );
};
```

**Props:**

- `control` - React Hook Form control object (required)
- `name` - Field name (required)
- `label` - Field label/placeholder
- `rules` - Validation rules (optional if using Zod)
- `defaultValue` - Default value (default: "")
- `usePaper` - Use react-native-paper TextInput (default: false)
- `showError` - Show error message (default: true)
- All standard TextInput props

### ControlledEmailInput

Specialized text input for email fields with proper keyboard and validation settings.

**Usage:**

```tsx
<ControlledEmailInput control={control} name="email" label="Email" />
```

**Features:**

- Email keyboard type
- Auto-lowercase
- No auto-capitalization
- Auto-complete support

### ControlledSecureTextInput

Specialized text input for password fields.

**Usage:**

```tsx
<ControlledSecureTextInput control={control} name="password" label="Password" />
```

**Features:**

- Secure text entry enabled
- No auto-capitalization
- No auto-correct

### ControlledSwitch

Boolean toggle switch component.

**Usage:**

```tsx
<ControlledSwitch
  control={control}
  name="enableNotifications"
  label="Enable Notifications"
  color="#007AFF"
/>
```

**Props:**

- `control` - React Hook Form control object (required)
- `name` - Field name (required)
- `label` - Switch label
- `defaultValue` - Default value (default: false)
- `disabled` - Disable switch
- `color` - Switch color
- `leftLabel` - Show label on left (default: true)
- `showError` - Show error message (default: true)

### ControlledCheckbox

Checkbox component with customizable labels.

**Usage:**

```tsx
// Simple usage
<ControlledCheckbox
  control={control}
  name="termsAccepted"
  label="I agree to the terms"
/>

// With custom label component
<ControlledCheckbox
  control={control}
  name="termsAccepted"
  labelComponent={
    <Button onPress={() => router.navigate('/terms')}>
      I agree to the Terms and Conditions
    </Button>
  }
/>

// With label press handler
<ControlledCheckbox
  control={control}
  name="termsAccepted"
  label="I agree to the terms"
  onLabelPress={() => router.navigate('/terms')}
/>
```

**Props:**

- `control` - React Hook Form control object (required)
- `name` - Field name (required)
- `label` - Checkbox label
- `labelComponent` - Custom label component (overrides label)
- `onLabelPress` - Handler for label press (opens link, etc.)
- `defaultValue` - Default value (default: false)
- `disabled` - Disable checkbox
- `color` - Checkbox color (default: "white")
- `showError` - Show error message (default: true)

### FormErrorText

Displays validation error messages with consistent styling.

**Usage:**

```tsx
<FormErrorText error={errors.fieldName?.message} />
```

**Props:**

- `error` - Error message string
- `style` - Additional styles

## Complete Form Example

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import {
  ControlledEmailInput,
  ControlledSecureTextInput,
  ControlledCheckbox,
} from "@/components/form";
import { registerSchema, RegisterFormData } from "@/utils/validationSchemas";

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      termsAccepted: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return api.post("/register", data);
    },
    onSuccess: () => {
      reset();
      router.replace("/success");
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <View style={styles.container}>
      <ControlledTextInput
        control={control}
        name="name"
        label="Name"
        autoCapitalize="words"
      />

      <ControlledEmailInput control={control} name="email" label="Email" />

      <ControlledSecureTextInput
        control={control}
        name="password"
        label="Password"
      />

      <ControlledCheckbox
        control={control}
        name="termsAccepted"
        label="I agree to the terms"
        onLabelPress={() => router.navigate("/terms")}
      />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={isSubmitting || mutation.isPending}
        disabled={isSubmitting || mutation.isPending}
      >
        Register
      </Button>
    </View>
  );
};
```

## Styling

All components include default styling that matches the app's design. You can override styles using the `style` prop:

```tsx
<ControlledTextInput
  control={control}
  name="email"
  label="Email"
  style={styles.customInput}
/>
```

## Error Handling

Components automatically display validation errors from react-hook-form. To disable error display:

```tsx
<ControlledTextInput control={control} name="email" showError={false} />
```

## TypeScript Support

All components are fully typed with generics for type-safe form data:

```tsx
interface LoginFormData {
  email: string;
  password: string;
}

const { control } = useForm<LoginFormData>();

<ControlledEmailInput<LoginFormData>
  control={control}
  name="email" // TypeScript ensures this matches LoginFormData keys
/>;
```
