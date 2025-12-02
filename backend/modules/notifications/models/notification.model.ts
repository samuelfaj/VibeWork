import { prop, getModelForClass, index } from '@typegoose/typegoose'

@index({ userId: 1, createdAt: -1 })
class Notification {
  @prop({ required: true, type: String })
  userId!: string

  @prop({ required: true, type: String, enum: ['in-app', 'email'] })
  type!: 'in-app' | 'email'

  @prop({ required: true, type: String })
  message!: string

  @prop({ default: false, type: Boolean })
  read!: boolean

  @prop({ default: () => new Date(), type: Date })
  createdAt!: Date
}

export const NotificationModel = getModelForClass(Notification)
