import { Instance, SnapshotIn, SnapshotOut, types, flow } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { load } from "../utils/storage"
import { apiTimeSheet } from "../services/api/api.timesheet"
import { dateYMD, dateYMDStr } from "../utils/common"
/**
 * Model description here for TypeScript hints.
 */
const dateInfo = types.model().props({
  name: types.maybe(types.string),
  status: types.maybe(types.string),
  datetime: types.maybe(types.number),
  target: types.maybe(types.frozen()),
})
export const TimeSheetModel = types
  .model("TimeSheet")
  .props({
    id: types.maybe(types.string),
    inforDay: types.maybe(types.array(dateInfo)),
    timesheetNumber: types.maybe(types.number),
    oneDayData: types.maybe(types.frozen()),
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setIdUserTimeSheet(id: string) {
      self.id = id
    },
    scanQR: flow(function* scanQR(placeID) {
      let accessToken = yield load("AccessToken")
      const result = yield apiTimeSheet.scanQR(placeID, accessToken)
      console.log(result)
    }),
    createTimesheet: flow(function* createTimesheet(dataPost: object) {
      let accessToken = yield load("AccessToken")
      const result = yield apiTimeSheet.createTimesheet(dataPost, accessToken)

      return result
    }),
    getAllTimeSheet: flow(function* (idUser: string, timeStart: number, timeEnd: number) {
      const access = yield load("AccessToken")
      const result = yield apiTimeSheet.getAllTimeSheet(access, self.id, timeStart, timeEnd)

      self.inforDay = result["result"]
      self.timesheetNumber = result["result"]?.filter((item) => item?.status === "out")?.length
      let dates: { [x: string]: any } = {}
      const markedRule = (item: any) => {
        return {
          marked: true,
          dotColor: "#2FD686",
          dateMarked: item["datetime"],
          name: item["name"],
          status: item["status"],
          id: item?.["id"],
        }
      }
      const filter = result?.["result"]

      const dataConvert = filter?.map((value) => {
        return {
          name: value["name"],
          datetime: value["datetime"],
          user: value["user"]["username"],
          id: value["id"],
        }
      })
      dataConvert.forEach((item) => {
        dates[dateYMDStr(item["datetime"])] = markedRule(item)
      })
      return dates
    }),
    getAnTimeSheet: flow(function* (id: string) {
      const access = yield load("AccessToken")
      const result = yield apiTimeSheet.getAnTimeSheet(access, id)
      // self.inforDay = result
      if (!result) {
        return null
      }
      return result
    }),
    getAnTimeSheetByDateTime: flow(function* (StartDayTime: number, EndDayTime: number) {
      const access = yield load("AccessToken")
      const results = yield apiTimeSheet.getAnTimeSheetByDate(access, StartDayTime, EndDayTime)
      self.oneDayData = results
    }),
    setDataDay: flow(function* () {
      self.oneDayData = []
    }),
  })) // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TimeSheet extends Instance<typeof TimeSheetModel> {}
export interface TimeSheetSnapshotOut extends SnapshotOut<typeof TimeSheetModel> {}
export interface TimeSheetSnapshotIn extends SnapshotIn<typeof TimeSheetModel> {}
export const createTimeSheetDefaultModel = () => types.optional(TimeSheetModel, {})
