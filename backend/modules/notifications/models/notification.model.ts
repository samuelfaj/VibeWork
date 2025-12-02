import { prop, getModelForClass, index } from '@typegoose/typegoose'

@index({ userId: 1, createdAt: -1 })
class Notification {
  @prop({ required: true })
  userId!: string

  @prop({ required: true, enum: ['in-app', 'email'] })
  type!: 'in-app' | 'email'

  @prop({ required: true })
  message!: string

  @prop({ default: false })
  read!: boolean

  @prop({ default: () => new Date() })
  createdAt!: Date
}

export const NotificationModel = getModelForClass(Notification)
