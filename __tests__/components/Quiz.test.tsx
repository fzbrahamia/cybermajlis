import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Quiz from "@/components/quiz";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockQuestions = [
  {
    question: "What is 2+2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    question: "Capital of Qatar?",
    options: ["Dubai", "Doha", "Riyadh", "Manama"],
    correctAnswer: "Doha",
  },
];

describe("Quiz", () => {
  it("renders the start screen initially", () => {
    render(<Quiz questions={mockQuestions} />);
    expect(screen.getByText("start")).toBeInTheDocument();
  });

  it("shows first question after clicking start", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    expect(screen.getByText("What is 2+2?")).toBeInTheDocument();
  });

  it("renders all answer options for the current question", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    ["3", "4", "5", "6"].forEach(opt => {
      expect(screen.getByText(opt)).toBeInTheDocument();
    });
  });

  it("next button is disabled before selecting an answer", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    expect(screen.getByText("next")).toBeDisabled();
  });

  it("next button is enabled after selecting an answer", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    expect(screen.getByText("next")).not.toBeDisabled();
  });

  it("calls onAnswerResult(true) for a correct answer", () => {
    const onAnswerResult = jest.fn();
    render(<Quiz questions={mockQuestions} onAnswerResult={onAnswerResult} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    expect(onAnswerResult).toHaveBeenCalledWith(true);
  });

  it("calls onAnswerResult(false) for a wrong answer", () => {
    const onAnswerResult = jest.fn();
    render(<Quiz questions={mockQuestions} onAnswerResult={onAnswerResult} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("3"));
    expect(onAnswerResult).toHaveBeenCalledWith(false);
  });

  it("calls onAnswerFeedback with 'correct' or 'wrong'", () => {
    const onAnswerFeedback = jest.fn();
    render(<Quiz questions={mockQuestions} onAnswerFeedback={onAnswerFeedback} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("3")); // wrong
    expect(onAnswerFeedback).toHaveBeenCalledWith("wrong");
  });

  it("navigates to the second question after clicking next", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("next"));
    expect(screen.getByText("Capital of Qatar?")).toBeInTheDocument();
  });

  it("shows 'finish' instead of 'next' on the last question", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("next"));
    expect(screen.getByText("finish")).toBeInTheDocument();
    expect(screen.queryByText("next")).not.toBeInTheDocument();
  });

  it("prev button is disabled on the first question", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    expect(screen.getByText("prev")).toBeDisabled();
  });

  it("prev button is enabled on subsequent questions", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("next"));
    expect(screen.getByText("prev")).not.toBeDisabled();
  });

  it("shows results screen after completing all questions", () => {
    const onQuizDone = jest.fn();
    render(<Quiz questions={mockQuestions} onQuizDone={onQuizDone} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));    // correct
    fireEvent.click(screen.getByText("next"));
    fireEvent.click(screen.getByText("Doha")); // correct
    fireEvent.click(screen.getByText("finish"));
    expect(screen.getByText("retry")).toBeInTheDocument();
    expect(onQuizDone).toHaveBeenCalledWith(2, 2);
  });

  it("resets to start screen when retry is clicked", () => {
    const onRetake = jest.fn();
    render(<Quiz questions={mockQuestions} onRetake={onRetake} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("next"));
    fireEvent.click(screen.getByText("Doha"));
    fireEvent.click(screen.getByText("finish"));
    fireEvent.click(screen.getByText("retry"));
    expect(screen.getByText("start")).toBeInTheDocument();
    expect(onRetake).toHaveBeenCalled();
  });

  it("shows 'excellent' feedback for a perfect score", () => {
    render(<Quiz questions={mockQuestions} />);
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("next"));
    fireEvent.click(screen.getByText("Doha"));
    fireEvent.click(screen.getByText("finish"));
    expect(screen.getByText("excellent")).toBeInTheDocument();
  });
});
