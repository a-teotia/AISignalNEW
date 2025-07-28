"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.getBaseUrl = getBaseUrl;
var clsx_1 = require("clsx");
var tailwind_merge_1 = require("tailwind-merge");
function cn() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
// Utility function to get base URL for server-side API calls
function getBaseUrl() {
    if (typeof window !== 'undefined') {
        // Client-side: use relative URL
        return '';
    }
    // Server-side: use environment variable or default
    return process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
}
