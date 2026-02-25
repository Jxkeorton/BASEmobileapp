import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { mockImagePicker, mockPost } from "../__mocks__/logbookEntryModalMocks";
import LogbookEntryModal from "./LogbookEntryModal";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const renderModal = (
  props?: Partial<React.ComponentProps<typeof LogbookEntryModal>>,
) => {
  const defaultProps = {
    isModalOpen: true,
    onClose: jest.fn(),
    isLoading: false,
  };
  return render(<LogbookEntryModal {...defaultProps} {...props} />, {
    wrapper: createWrapper(),
  });
};

const fillLocationName = (value: string) => {
  const input = screen.getByPlaceholderText("Enter location name");
  fireEvent.changeText(input, value);
};

const fillDelay = (value: string) => {
  const input = screen.getByPlaceholderText("in seconds");
  fireEvent.changeText(input, value);
};

const pressSubmit = () => {
  fireEvent.press(screen.getByText("Submit"));
};

const pressCancel = () => {
  fireEvent.press(screen.getByText("Cancel"));
};

describe("LogbookEntryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("TC-01: displays all required fields when the form is open", () => {
    renderModal();

    // Title
    expect(screen.getByText("Enter Jump Details")).toBeTruthy();

    // Field labels / subtitles
    expect(screen.getByText("Location")).toBeTruthy();
    expect(screen.getByText("Exit Type")).toBeTruthy();
    expect(screen.getByText("Delay")).toBeTruthy();
    expect(screen.getByText("Date of jump")).toBeTruthy();
    expect(screen.getByText("Details")).toBeTruthy();

    // Image upload area
    expect(screen.getByText("Add photos")).toBeTruthy();
  });

  it("TC-02: defaults exit type to Earth", () => {
    renderModal();

    expect(screen.getByText("Earth")).toBeTruthy();
  });

  it("TC-03: submits form successfully with valid data", async () => {
    const onClose = jest.fn();
    renderModal({ onClose });

    fillLocationName("Test Location");

    // Select a date by pressing the date picker and confirming
    fireEvent.press(screen.getByText("Select jump date"));
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("Confirm"));

    pressSubmit();

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        "/logbook",
        expect.objectContaining({
          body: expect.objectContaining({
            location_name: "Test Location",
            exit_type: "Earth",
          }),
        }),
      );
    });
  });

  it("TC-04: cancel button closes the form without submitting", () => {
    const onClose = jest.fn();
    renderModal({ onClose });

    fillLocationName("Some Location");

    pressCancel();

    expect(onClose).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("TC-05: shows validation error when submitting an empty form", async () => {
    renderModal();

    pressSubmit();

    // The Yup schema requires location_name so an error message should appear
    await waitFor(() => {
      expect(screen.getByText("Location name is required")).toBeTruthy();
    });

    // Ensure the API was never called
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("TC-06: shows validation error when date is empty", async () => {
    renderModal();

    fillLocationName("Valid Location");
    // Do NOT select a date

    pressSubmit();

    await waitFor(() => {
      expect(screen.getByText("Date is required")).toBeTruthy();
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("TC-07: shows validation error when location name is empty", async () => {
    renderModal();

    // Leave location name blank, only press submit
    pressSubmit();

    await waitFor(() => {
      expect(screen.getByText("Location name is required")).toBeTruthy();
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("TC-08: rejects location name exceeding 60 characters", async () => {
    renderModal();

    const longName = "a".repeat(61);
    fillLocationName(longName);

    pressSubmit();

    await waitFor(() => {
      expect(
        screen.getByText("Location name must be less than 60 characters"),
      ).toBeTruthy();
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("TC-09: accepts a location name of exactly 60 characters", async () => {
    renderModal();

    const validName = "a".repeat(60);
    fillLocationName(validName);

    pressSubmit();

    // No max-length error should be shown
    await waitFor(() => {
      expect(
        screen.queryByText("Location name must be less than 60 characters"),
      ).toBeNull();
    });
  });

  it("TC-10: displays exactly four exit type options", () => {
    renderModal();

    // Open the dropdown
    fireEvent.press(screen.getByText("Earth")); // default button text

    // Verify each option is present
    expect(screen.getByText("Building")).toBeTruthy();
    expect(screen.getByText("Antenna")).toBeTruthy();
    expect(screen.getByText("Span")).toBeTruthy();
    // "Earth" appears on the dropdown button AND the option list
    const earthElements = screen.getAllByText("Earth");
    expect(earthElements.length).toBeGreaterThanOrEqual(2);
  });

  it("TC-11: delay rejects negative numbers, decimals, and accepts positive integers", async () => {
    const { unmount: unmount1 } = renderModal();

    fillLocationName("Location A");
    fillDelay("-1");
    pressSubmit();

    await waitFor(() => {
      expect(screen.getByText("Delay cannot be negative")).toBeTruthy();
    });
    expect(mockPost).not.toHaveBeenCalled();
    unmount1();

    // --- Decimal number ---
    const { unmount: unmount2 } = renderModal();
    fillLocationName("Location B");
    fillDelay("1.5");
    pressSubmit();

    await waitFor(() => {
      expect(screen.getByText("Delay must be a whole number")).toBeTruthy();
    });
    expect(mockPost).not.toHaveBeenCalled();
    unmount2();

    // --- Positive whole number (should be accepted – no delay error) ---
    renderModal();
    fillLocationName("Location C");
    fillDelay("5");
    pressSubmit();

    await waitFor(() => {
      expect(screen.queryByText("Delay cannot be negative")).toBeNull();
      expect(screen.queryByText("Delay must be a whole number")).toBeNull();
    });
  });

  it("TC-12: allows up to 5 images and rejects a 6th", async () => {
    mockImagePicker.mockResolvedValueOnce([
      { uri: "img1.jpg" },
      { uri: "img2.jpg" },
      { uri: "img3.jpg" },
      { uri: "img4.jpg" },
      { uri: "img5.jpg" },
    ]);

    renderModal();

    fireEvent.press(screen.getByText("Add photos"));

    await waitFor(() => {
      expect(screen.getByText("5 images selected")).toBeTruthy();
    });

    mockImagePicker.mockResolvedValueOnce([
      { uri: "img1.jpg" },
      { uri: "img2.jpg" },
      { uri: "img3.jpg" },
      { uri: "img4.jpg" },
      { uri: "img5.jpg" },
      { uri: "img6.jpg" },
    ]);

    fireEvent.press(screen.getByText("5 images selected"));

    await waitFor(() => {
      // Should still cap at 5, not show "6 images selected"
      expect(screen.queryByText("6 images selected")).toBeNull();
      expect(screen.getByText("5 images selected")).toBeTruthy();
    });
  });
});
