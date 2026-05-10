import { cn } from "../../lib/utils";

const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/20 bg-white/5 backdrop-blur px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-white/30",
        className
      )}
      {...props}
    />
  );
};

export default Input;
