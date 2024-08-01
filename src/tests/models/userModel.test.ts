import mongoose from "mongoose";
import User from '../../models/userModel';
import { IUser } from '../../types/user';

const { Types } = mongoose;

describe('User Model', () => {
  it('should create a new user with all required fields', () => {
    const mockUser: Partial<IUser> = {
      username: 'john_doe',
      email: 'john@example.com',
      password: '123456',
      messages: [new Types.ObjectId()],
      _id: new Types.ObjectId(), // assuming _id is needed due to Document interface
      created_at: new Date(),
      updated_at: new Date(),
    };
    const user = new User(mockUser);
    expect(user.username).toBe(mockUser.username);
    expect(user.email).toBe(mockUser.email);
    expect(user.password).toBe(mockUser.password);
    expect(user.messages.length).toEqual(1);
    expect(user.messages[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('should fail without required fields', () => {
    const userWithoutRequiredFields = new User({ username: 'john_doe' } as any); // Explicitly marking as any to avoid TypeScript errors
    const err = userWithoutRequiredFields.validateSync();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
    });
});

  // Additional tests can include:
  // Testing validation for unique fields
  // Testing setters or getters if you have them
  // Testing instance methods or statics
// });