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
          <div className="relative p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Icon with background */}
            <div className="absolute -top-3 right-4 p-2 rounded-lg bg-gray-50 border shadow-sm">
              <div
                className="text-gray-500"
                style={{ color: iconColor || "inherit" }}
              >
                {icon}
              </div>
            </div>

            {/* Title and Value Section */}
            <div className="space-y-3">
              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              </div>
              <div>
                <span className="text-3xl font-semibold text-gray-900">
                  {value}
                </span>
                <span className="ml-1 text-sm font-medium text-gray-500">
                  {valueUnit}
                </span>
              </div>
            </div>

            {/* Tooltip as subtitle */}
            <div className="mt-4 text-xs text-gray-500">{tooltip}</div>
          </div>
        </TooltipTrigger>
        {/* Keep TooltipContent for consistency but hidden */}
        <TooltipContent className="hidden">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricCard;
