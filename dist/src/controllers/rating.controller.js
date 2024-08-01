"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRating = void 0;
const db_connect_1 = __importDefault(require("../boot/database/db_connect"));
const winston_1 = __importDefault(require("../middleware/winston"));
const statusCodes_1 = __importDefault(require("../constants/statusCodes"));
const ratingModel_1 = __importDefault(require("../models/ratingModel"));
const addRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { movieId } = req.params;
    const { rating } = req.body;
    const movie_id = parseInt(movieId);
    if (isNaN(movie_id) || !rating) {
        return res.status(statusCodes_1.default.badRequest).json({
            message: 'Missing parameters',
        });
    }
    else {
        try {
            const ratingObj = new ratingModel_1.default({
                email: 'johndoe@email.com',
                movie_id,
                rating,
            });
            yield ratingObj.save();
            const ratings = yield ratingModel_1.default.find({ movie_id }, { rating: 1 });
            const averageRating = ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length;
            yield db_connect_1.default.query('UPDATE movies SET rating = $1 WHERE movie_id = $2;', [averageRating, movie_id]);
            return res
                .status(statusCodes_1.default.success)
                .json({ message: 'Rating added' });
        }
        catch (error) {
            winston_1.default.error(error.stack);
            return res.status(statusCodes_1.default.queryError).json({
                error: 'Exception occurred while adding rating',
            });
        }
    }
});
exports.addRating = addRating;
//# sourceMappingURL=rating.controller.js.map