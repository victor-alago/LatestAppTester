import { BaseRequest } from "./baseRequest.interface";

export interface EditPasswordRequest extends BaseRequest {
    body: {
      oldPassword: string;
      newPassword: string;
    };
}