import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
const MetricCard = ({ title, value, trend, icon, tooltip }) => {
    return (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("div", { className: "relative p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200", children: [_jsx("div", { className: "absolute -top-3 right-4 p-2 rounded-lg bg-gray-50 border shadow-sm", children: _jsx("div", { className: "text-gray-500", children: icon }) }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "pt-2", children: _jsx("h3", { className: "text-sm font-medium text-gray-600", children: title }) }), _jsxs("div", { className: "flex items-baseline justify-between", children: [_jsx("span", { className: "text-3xl font-semibold text-gray-900", children: value }), _jsxs("div", { className: cn("flex items-center px-2 py-1 rounded-full text-sm font-medium", trend > 0
                                                    ? "text-green-700 bg-green-50"
                                                    : "text-red-700 bg-red-50"), children: [trend > 0 ? (_jsx(TrendingUp, { className: "h-4 w-4 mr-1" })) : (_jsx(TrendingDown, { className: "h-4 w-4 mr-1" })), _jsxs("span", { children: [Math.abs(trend).toFixed(1), "%"] })] })] })] })] }) }), _jsx(TooltipContent, { className: "bg-gray-900 text-white", children: _jsx("p", { className: "text-sm", children: tooltip }) })] }) }));
};
export default MetricCard;
