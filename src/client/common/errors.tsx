export const ErrorComponent: React.FC<{
  text?: React.ReactNode;
}> = ({ text }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {text ?? "Something went wrong. Try again later"}
    </div>
  );
};

export const Loading: React.FC<{ text?: React.ReactNode }> = ({ text }) => {
  return <ErrorComponent text={text ?? "Loading..."} />;
};
