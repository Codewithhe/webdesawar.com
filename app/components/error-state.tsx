type ErrorStateProps = {
  message: string;
};

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="state-card error-state" role="alert">
      <h2>Results unavailable</h2>
      <p>{message}</p>
    </div>
  );
}
