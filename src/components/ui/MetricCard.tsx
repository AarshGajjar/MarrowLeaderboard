import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  valueUnit: string;
  icon: React.ReactNode;
  tooltip: string;
  iconColor?: string;
}

const MetricCard = ({
  title,
  value,
  valueUnit,
  icon,
  tooltip,
  iconColor,
}: MetricCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative p-6 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Icon with background */}
            <div className="absolute -top-3 right-4 p-2 rounded-lg bg-muted border shadow-sm">
              <div
                className={cn("text-muted-foreground", iconColor && "text-primary")}
                style={iconColor ? { color: iconColor } : undefined}
              >
                {icon}
              </div>
            </div>

            {/* Title and Value Section */}
            <div className="space-y-3">
              <div className="pt-2">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              </div>
              <div>
                <span className="text-3xl font-semibold">
                  {value}
                </span>
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  {valueUnit}
                </span>
              </div>
            </div>

            {/* Tooltip as subtitle */}
            <div className="mt-4 text-xs text-muted-foreground">{tooltip}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricCard;
