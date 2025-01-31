import { registerUser } from '../controllers/userController.js';
import { mockRequest, mockResponse } from 'jest-mock-req-res';
import User from '../models/userModel.js';
import sendToken from '../utils/jwtToken.js';
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

jest.mock('../models/userModel.js');
jest.mock('crypto');
jest.mock('../utils/jwtToken.js');

describe('registerUser', () => {
    let req, res, next;
    beforeEach(() => {
        req = mockRequest({
            body: {
                username: "testuser",
                email: "testuser@example.com",
                password: "password123"
            }
        });

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        next = jest.fn();
    });

    test('should create a user and return a token if successful', async () => {
        const mockUser = {username : "testuser", email: "testuser@example.com"}
        User.create.mockResolvedValue(mockUser);
        crypto.randomBytes.mockReturnValue(Buffer.from('mockPublicKey'));

        await registerUser(req, res, next);

        expect(User.create).toHaveBeenCalledWith({
            username: "testuser",
            email: "testuser@example.com",
            password: "password123",
            publicKey: '6d6f636b5075626c69634b6579'
        });

        expect(sendToken).toHaveBeenCalledWith(mockUser, 201, res);
    });
})