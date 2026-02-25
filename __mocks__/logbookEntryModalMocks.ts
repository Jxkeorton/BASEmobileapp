// kyClient (useKyClient)
export const mockPost = jest
  .fn()
  .mockResolvedValue({ response: { status: 201 } });

// useUploadImage
export const mockUploadImageMutation = jest.fn().mockResolvedValue({
  success: true,
  secureUrls: ["https://img.test/1.jpg"],
});

// useUpdateProfile
export const mockUpdateProfileMutation = jest.fn().mockResolvedValue({});

// useImagePicker
export const mockImagePicker = jest.fn();

// SessionProvider user
export const mockUser = { id: "user-1", email: "test@test.com" };

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  FontAwesome: "FontAwesome",
}));

jest.mock("../providers/SessionProvider", () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock("../services/kyClient", () => ({
  useKyClient: () => ({
    POST: mockPost,
  }),
}));

jest.mock("../hooks/useUploadImage", () => ({
  useUploadImage: () => ({
    mutateAsync: mockUploadImageMutation,
    error: null,
  }),
}));

jest.mock("../hooks/useUpdateProfile", () => ({
  useUpdateProfile: () => ({
    mutateAsync: mockUpdateProfileMutation,
  }),
}));

jest.mock("../hooks/useImagePicker", () => ({
  useImagePicker: (...args: any[]) => mockImagePicker(...args),
}));
