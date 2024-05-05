import { Instance, SnapshotIn, SnapshotOut, flow, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { apiNotification } from "../services/api/api.notification"
import { load } from "../utils/storage"
/**
 * Model description here for TypeScript hints.
 */
const notificationInfo = types.model().props({
  id: types.maybe(types.string),
  user_id: types.maybe(types.string),
  create_name: types.maybe(types.string),
  content: types.maybe(types.string),
  create_date: types.maybe(types.number),
  status: types.maybe(types.boolean),
})
export const NotificationModel = types
  .model("Notification")
  .props({ notifcationList: types.maybe(types.array(notificationInfo)) })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    getNotifications: flow(function* (user_id: string, page: number, limit: number) {
      let access = yield load("AccessToken")
      const notification = yield apiNotification.getNotifications(access, user_id, page, limit)
      return notification?.response
    }),
    getNotification: flow(function* (notificationId: string) {
      const notification = yield apiNotification.getNotification(notificationId)
      return notification?.response
    }),
    createNotifications: flow(function* (
      create_date: number,
      user_id: string,
      create_name: string,
      content: string,
    ) {
      const notification = yield apiNotification.createNotification(
        create_date,
        user_id,
        create_name,
        content,
      )
      console.log(notification)
    }),
    updateNotification: flow(function* (notificationId: string) {
      const notification = yield apiNotification.updateNotification(notificationId)
      return notification
    }),
    deleteNotification: flow(function* (notificationId: string) {
      const notification = yield apiNotification.deleteNotification(notificationId)
      return notification
    }),
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface Notification extends Instance<typeof NotificationModel> {}
export interface NotificationSnapshotOut extends SnapshotOut<typeof NotificationModel> {}
export interface NotificationSnapshotIn extends SnapshotIn<typeof NotificationModel> {}
export const createNotificationDefaultModel = () => types.optional(NotificationModel, {})
