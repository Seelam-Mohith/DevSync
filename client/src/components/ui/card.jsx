import { cn } from "../../lib/utils";

export const Card = ({ className, glow = false, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-card-foreground shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group",
      className
    )}
    {...props}
  >
    {/* Gradient border effect */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    <div className="relative z-10">{props.children}</div>
  </div>
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-bold text-slate-100", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);
