import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { apiUser } from "../services/api/api.user"
import { load } from "../utils/storage"
import moment from "moment"
/**
 * Model description here for TypeScript hints.
 */
// const userInfo = types.model().props({
//   id: types.maybe(types.string),
//   name: types.maybe(types.string),
//   username: types.maybe(types.string),
//   phone: types.maybe(types.string),
//   email: types.maybe(types.string),
//   gender: types.maybe(types.string),
//   org_ids: types.maybe(types.array(types.string)),
//   role: types.maybe(types.string),
//   avatar: types.maybe(types.frozen()),
// })

export const UserModel = types
  .model("User")
  .props({
    id: types.maybe(types.string),
    name: types.maybe(types.string),
    username: types.maybe(types.string),
    // phone: types.maybe(types.string),
    email: types.maybe(types.string),
    // gender: types.maybe(types.string),
    org_ids: types.maybe(types.array(types.string)),
    role: types.maybe(types.string),
    avatar: types.maybe(types.frozen()),
    checkInStatus: types.optional(types.string, "out"),
    dateLastCheckin: types.maybe(types.frozen()),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setDateLastCheckIn: flow(function* () {
      const idSameDay = moment(self.dateLastCheckin).isSame(new Date(), "day") // cung ngay => true ,khac ngay =>false
      if (idSameDay) {
      } else {
        self.checkInStatus = "in"
        self.dateLastCheckin = new Date()
      }
    }),
    setCheckIn: flow(function* (status: string) {
      // console.log(status, "setCheckIn")
      self.checkInStatus = status
    }),
    getUserByOrg: flow(function* () {
      let access = yield load("AccessToken")
      const org_id = yield load("organizationId")
      let getUser = yield apiUser.GetListStaff(org_id, access)
      if (getUser.kind == "ok") {
        return getUser["inforUser"]
      } else {
        return []
      }
    }),
    getCurrentUser: flow(function* () {
      let access = yield load("AccessToken")
      const user = yield apiUser.getCurrentUser(access)

      if (user.kind == "ok") {
        self.id = user.result?.id
        self.name = user.result?.name
        self.username = user.result?.username
        self.email = user.result?.email
        self.org_ids = user.result?.org_ids
        self.avatar = user.result?.avatar
        self.role = user.result?.role

        return user["result"]
      } else {
        return {}
      }
    }),
    changeUserInfor: flow(function* (
      email: string,
      name: string,
      user_id: string,
      avatar: object | any,
    ) {
      const access = yield load("AccessToken")
      const user = yield apiUser.changeInfor(email, name, access, user_id, avatar)

      if (user.kind === "ok") {
        self.name = user.result?.user?.name
        self.username = user.result?.user?.username
        self.email = user.result?.user?.email
        self.org_ids = user.result?.user?.org_ids
        self.avatar = user.result?.user?.avatar
        self.role = user.result?.user?.role
        return user["result"]
      } else {
        return {}
      }
    }),
    changePassword: flow(function* (password: string, userId: string) {
      let access = yield load("AccessToken")
      const user = yield apiUser.changePassword(password, userId)
      return user
    }),
    getUserInfo: flow(function* (userId?: string) {
      const access = yield load("AccessToken")
      const user = yield apiUser.getUserInfo(access, userId ?? self.id)
      self.name = user?.name
      self.username = user?.username
      self.email = user?.email
      self.org_ids = user?.org_ids
      self.avatar = user?.avatar
      self.role = user?.role
    }),
    deleteInforUser: flow(function* () {
      self.name = null
      self.username = null
      self.email = null
      self.org_ids = null
      self.avatar = null
      self.role = null
    }),
  }))
// UserModel.volatile
// eslint-disable-line @typescript-eslint/no-unused-vars

export interface User extends Instance<typeof UserModel> {}
export interface UserSnapshotOut extends SnapshotOut<typeof UserModel> {}
export interface UserSnapshotIn extends SnapshotIn<typeof UserModel> {}
export const createUserDefaultModel = () => types.optional(UserModel, {})
