import mongoose from 'mongoose';
const ValidationError = mongoose.Error.ValidationError;
import ratingModel, { IRating } from '../../models/ratingModel';
import { ratings } from './rating.mockData';

describe('Rating model', () => {
    let mockRating: IRating;

    beforeEach(() => {
        mockRating = ratings[0];
    });

    it('should throw an error if any of the required fields are missing', async () => {
        try {
            await new ratingModel().validate();
        } catch (err) {
            expect(err).toBeInstanceOf(ValidationError);

            if (err instanceof ValidationError) {
                expect(err.errors.movie_id).toBeDefined();
                expect(err.errors.rating).toBeDefined();
                expect(err.errors.email).toBeDefined();
            } else {
                throw new Error('Expected a ValidationError');
            }
        }
    });

    it('should throw an error if the rating is not between 0 and 5', async () => {
        try {
            await new ratingModel({ ...mockRating, rating: 6 }).validate();
        } catch (err) {
            expect(err).toBeInstanceOf(ValidationError);

            if (err instanceof ValidationError) {
                expect(err.errors.rating).toBeDefined();
                expect(err.errors.email).toBeUndefined();
                expect(err.errors.movie_id).toBeUndefined();
            } else {
                throw new Error('Expected a ValidationError');
            }
        }

        try {
            await new ratingModel({ ...mockRating, rating: -1 }).validate();
        } catch (err) {
            expect(err).toBeInstanceOf(ValidationError);

            if (err instanceof ValidationError) {
                expect(err.errors.rating).toBeDefined();
            } else {
                throw new Error('Expected a ValidationError');
            }
        }
    });

    it('should create a rating if all required fields are present and valid', async () => {
        const rating = new ratingModel(mockRating);
        await expect(rating.validate()).resolves.toBeUndefined();

        expect(rating.movie_id).toBe(mockRating.movie_id);
        expect(rating.email).toBe(mockRating.email);
        expect(rating.rating).toBe(mockRating.rating);
        expect(rating.created_at).toBe(mockRating.created_at);
    });
});
