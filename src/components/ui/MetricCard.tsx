import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  tooltip: string;
}

const MetricCard = ({ title, value, trend, icon, tooltip }: MetricCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Icon with background */}
            <div className="absolute -top-3 right-4 p-2 rounded-lg bg-gray-50 border shadow-sm">
              <div className="text-gray-500">{icon}</div>
            </div>

            {/* Title and Value Section */}
            <div className="space-y-3">
              <div className="pt-2">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-semibold text-gray-900">
                  {value}
                </span>
                {/* Trend Indicator */}
                <div
                  className={cn(
                    "flex items-center px-2 py-1 rounded-full text-sm font-medium",
                    trend > 0
                      ? "text-green-700 bg-green-50"
                      : "text-red-700 bg-red-50"
                  )}
                >
                  {trend > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(trend).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 text-white">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MetricCard;