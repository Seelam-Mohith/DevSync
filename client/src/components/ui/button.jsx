import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/20 transform hover:scale-105",
        ghost: "text-foreground hover:bg-white/5 hover:backdrop-blur",
        outline: "border border-white/20 bg-white/5 backdrop-blur hover:border-blue-400 hover:bg-white/10 hover:shadow-md",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = ({ className, variant, size, ...props }) => {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...props}>
      <span className="relative z-10">{props.children}</span>
      {variant === "default" && (
        <span className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      )}
    </button>
  );
};

export { Button, buttonVariants };
