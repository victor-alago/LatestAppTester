import mongoose, { Document } from 'mongoose';
export interface IRating {
    movie_id: number;
    email: string;
    rating: number;
    created_at: Date;
}
export interface IRatingDocument extends IRating, Document {
}
declare const _default: mongoose.Model<IRatingDocument, {}, {}, {}, mongoose.Document<unknown, {}, IRatingDocument> & IRatingDocument & Required<{
    _id: unknown;
}>, any>;
export default _default;
