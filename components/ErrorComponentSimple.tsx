import ErrorComponent from "./ErrorComponent";

/** Error message without the home and retry buttons. */
function ErrorComponentSimple({
  message,
  inline = false,
}: {
  message?: string;
  inline?: boolean;
}) {
  return <ErrorComponent message={message} inline={inline} />;
}

export default ErrorComponentSimple;
