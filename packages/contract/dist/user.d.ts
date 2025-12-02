import type { Static } from 'elysia';
export declare const SignupSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString;
    password: import("@sinclair/typebox").TString;
}>;
export declare const LoginSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString;
    password: import("@sinclair/typebox").TString;
}>;
export declare const UserResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    email: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
}>;
export type SignupInput = Static<typeof SignupSchema>;
export type LoginInput = Static<typeof LoginSchema>;
export type UserResponse = Static<typeof UserResponseSchema>;
//# sourceMappingURL=user.d.ts.map