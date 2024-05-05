/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://github.com/infinitered/ignite/blob/master/docs/Backend-API-Integration.md)
 * documentation for more details.
 */
import {
  ApiResponse, // @demo remove-current-line
  ApisauceInstance,
  create,
} from "apisauce"
import Config from "../../config"
import type {
  ApiConfig,
  ApiFeedResponse,
  LoginAuthentication,
  RefreshToken, // @demo remove-current-line
  ChangePassword,
} from "./api.types"
import { apiMain } from "./apiMain"
import * as LocalStorage from "../../utils/storage/index"
import { testDateToDate } from "../../utils/common"
/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 20000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Notification {
  apisauce: ApisauceInstance
  config: ApiConfig

  getNotifications = async (
    accessToken: string,
    user_id: string,
    page: number,
    limit: number,
  ): Promise<{ response: any; active: boolean }> => {
    try {
      const response = await apiMain.get(
        `/notification?user_id=${user_id}&page=${page}&limit=${limit}`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )

      if (response.status === 200 || response.status === 304) {
        return { response: response.data, active: true }
      } else {
        return { active: false, response: [] }
      }
    } catch (e) {
      console.log("Error get multiple notificatioon", e)
      return { active: false, response: [] }
    }
  }

  createNotification = async (
    // accessToken: string,
    create_date: number,
    user_id: string,
    create_name: string,
    content: string,
  ) => {
    try {
      const response = await apiMain.post(`/notification`, {
        create_date,
        user_id,
        create_name,
        content,
      })
      if (response.status === 200 || response.status === 304) {
        return { response: response.data["results"], active: true }
      } else {
        return { active: false, response: {} }
      }
    } catch (e) {
      console.log("Error get multiple notificatioon", e)
      return { active: false, response: {} }
    }
  }

  getNotification = async (notificationId: string): Promise<{ response: any; active: boolean }> => {
    try {
      const response = await apiMain.get(`/notification/${notificationId}`, {})
      if (response.status === 200 || response.status === 304) {
        return { response: response.data, active: true }
      } else {
        return { active: false, response: [] }
      }
    } catch (e) {
      console.log("Error get one notificatioon", e)
      return { active: false, response: [] }
    }
  }

  updateNotification = async (notificationId: string): Promise<boolean> => {
    try {
      const response = await apiMain.patch(`/notification/${notificationId}`, { status: true })
      return response?.status == 200 ? true : false
    } catch (e) {
      console.log(e)
      return false
    }
  }

  deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      const response = await apiMain.delete(`/notification/${notificationId}`)
      return response?.status == 204 ? true : false
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

// Singleton instance of the API for convenience
export const apiNotification = new Notification()
