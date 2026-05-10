import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@/components/Modal";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false} title="Test" message="Hello" onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and message when isOpen is true", () => {
    render(<Modal isOpen={true} title="Alert" message="Something happened" onClose={() => {}} />);
    expect(screen.getByText("Alert")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<Modal isOpen={true} title="T" message="M" onClose={onClose} />);
    fireEvent.click(screen.getByText("default_close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not show confirm button when onConfirm is not provided", () => {
    render(<Modal isOpen={true} title="T" message="M" onClose={() => {}} />);
    expect(screen.queryByText("default_confirm")).not.toBeInTheDocument();
  });

  it("shows confirm button when onConfirm is provided", () => {
    render(<Modal isOpen={true} title="T" message="M" onClose={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("default_confirm")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = jest.fn();
    render(<Modal isOpen={true} title="T" message="M" onClose={() => {}} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("default_confirm"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("uses custom confirmText and closeText when provided", () => {
    render(
      <Modal
        isOpen={true} title="T" message="M"
        onClose={() => {}} onConfirm={() => {}}
        confirmText="Yes!" closeText="No!"
      />
    );
    expect(screen.getByText("Yes!")).toBeInTheDocument();
    expect(screen.getByText("No!")).toBeInTheDocument();
  });
});
