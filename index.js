"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitReached = exports.RateLimitError = exports.RateLimiterBus = void 0;
var timestring_1 = require("timestring");
var RateLimitError = /** @class */ (function (_super) {
    __extends(RateLimitError, _super);
    function RateLimitError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RateLimitError;
}(Error));
exports.RateLimitError = RateLimitError;
var RateLimitReached = /** @class */ (function (_super) {
    __extends(RateLimitReached, _super);
    function RateLimitReached(message, data) {
        var _this = _super.call(this) || this;
        _this.message = message;
        _this.data = data;
        return _this;
    }
    return RateLimitReached;
}(RateLimitError));
exports.RateLimitReached = RateLimitReached;
var RateLimiterBus = /** @class */ (function () {
    function RateLimiterBus(name, rate_limiter, options) {
        this.name = name;
        this.rate_limiter = rate_limiter;
        this.options = options;
        this.limiters = [];
    }
    RateLimiterBus.prototype.limit = function (per, points, options) {
        var duration = (typeof per === 'string') ? (0, timestring_1.default)(per) : per;
        this.limiters.push(
        //@ts-ignore
        new this.rate_limiter(__assign(__assign({ keyPrefix: "".concat(this.name, "_").concat(duration), points: points, duration: duration }, options), this.options)));
        return this;
    };
    RateLimiterBus.prototype.forceConsume = function (key, points) {
        if (points === void 0) { points = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var settled, ress, reached, reachedNow, msBeforeNext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(this.limiters.map(function (a) { return a.consume(key, points); }))];
                    case 1:
                        settled = _a.sent();
                        ress = settled
                            //@ts-ignore
                            .map(function (a) { return a.value && __assign({ reached: false }, a.value) || a.reason && __assign({ reached: true }, a.reason); })
                            .sort(function (a, b) { return a.msBeforeNext - b.msBeforeNext; });
                        reached = ress.some(function (a) { return a.reached; });
                        reachedNow = reached || ress.some(function (a) { return !a.reached && !a._remainingPoints; });
                        msBeforeNext = Math.max.apply(Math, ress.map(function (a) { return a.reached || !a.reached && !a._remainingPoints ? a._msBeforeNext : 0; }));
                        return [2 /*return*/, {
                                reached: reached,
                                reachedNow: reachedNow,
                                beforeNext: reachedNow ? Math.round(msBeforeNext / 1000) || 1 : 0,
                                // ress
                            }];
                }
            });
        });
    };
    RateLimiterBus.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var settled, ress, reached, msBeforeNext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(this.limiters.map(function (a) { return a.get(key); }))];
                    case 1:
                        settled = _a.sent();
                        ress = settled.map(function (a, i) { return a.value
                            //@ts-ignore
                            ? __assign({ reached: a.value.remainingPoints === 0 }, a.value) 
                        //@ts-ignore
                        : { reached: false, _msBeforeNext: 0, /*max_points: this.limiters[i]._points*/ }; });
                        reached = ress.some(function (a) { return a.reached; });
                        msBeforeNext = Math.max.apply(Math, ress.map(function (a) { return a.reached ? a._msBeforeNext : 0; }));
                        return [2 /*return*/, {
                                reached: reached,
                                beforeNext: reached ? Math.round(msBeforeNext / 1000) || 1 : 0,
                                // ress,
                            }];
                }
            });
        });
    };
    RateLimiterBus.prototype.consume = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.check(key)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.forceConsume(key)];
                    case 2:
                        res = _a.sent();
                        if (res.reached)
                            throw new RateLimitReached('Rate limit reached', __assign({ name: this.name, key: key }, res));
                        return [2 /*return*/, res];
                }
            });
        });
    };
    RateLimiterBus.prototype.check = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(key)];
                    case 1:
                        res = _a.sent();
                        if (res.reached)
                            throw new RateLimitReached('Rate limit reached', __assign({ name: this.name, key: key }, res));
                        return [2 /*return*/, res];
                }
            });
        });
    };
    return RateLimiterBus;
}());
exports.RateLimiterBus = RateLimiterBus;
