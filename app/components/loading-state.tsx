type LoadingStateProps = {
  title?: string;
  message?: string;
};

export default function LoadingState({
  title = "Loading live results",
  message = "Server se result data load ho raha hai.",
}: LoadingStateProps) {
  return (
    <div className="state-card loading-state" aria-busy="true">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
