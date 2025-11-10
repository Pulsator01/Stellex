type Props = {
  children: string;
  color?: "green" | "blue" | "red" | "gray";
};

export default function Badge({ children, color = "gray" }: Props) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}


