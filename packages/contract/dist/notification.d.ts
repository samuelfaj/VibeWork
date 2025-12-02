import type { Static } from 'elysia';
export declare const NotificationTypeSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"in-app">, import("@sinclair/typebox").TLiteral<"email">]>;
export declare const CreateNotificationSchema: import("@sinclair/typebox").TObject<{
    userId: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"in-app">, import("@sinclair/typebox").TLiteral<"email">]>;
    message: import("@sinclair/typebox").TString;
}>;
export declare const NotificationSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    userId: import("@sinclair/typebox").TString;
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"in-app">, import("@sinclair/typebox").TLiteral<"email">]>;
    message: import("@sinclair/typebox").TString;
    read: import("@sinclair/typebox").TBoolean;
    createdAt: import("@sinclair/typebox").TString;
}>;
export type NotificationType = Static<typeof NotificationTypeSchema>;
export type CreateNotificationInput = Static<typeof CreateNotificationSchema>;
export type Notification = Static<typeof NotificationSchema>;
//# sourceMappingURL=notification.d.ts.map