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
  User,
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
export class UserApi {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */

  // @demo remove-block-start
  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async GetListStaff(org_id: string, accessToken: string): Promise<{}> {
    const response: ApiResponse<ApiFeedResponse> = await apiMain.get(
      `users?org_ids=${org_id}&role=user,leader`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    try {
      if (response.status == 200) return { kind: "ok", inforUser: response["data"]["results"] }
      else return { kind: "bad", inforUser: response.data["results"] }
    } catch (e) {
      if (__DEV__) {
        console.tron.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    const response: ApiResponse<ApiFeedResponse> = await apiMain.get(
      `users/current`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    try {
      if (response.status == 200) return { kind: "ok", result: response["data"] }
      else return { kind: "bad", result: response.data }
    } catch (e) {
      if (__DEV__) {
        console.tron.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }
  async changeInfor(
    email: string,
    name: string,
    accessToken: string,
    user_id: string,
    avatar?: any,
  ): Promise<{ kind: "ok" | "bad"; result: object }> {
    const formData = new FormData()
    formData.append("avatar", {
      uri: avatar?.["uri"],
      type: avatar?.["type"],
      name: avatar?.["fileName"],
    } as unknown as File)
    formData.append("email", email)
    formData.append("name", name)
    formData.append("user_id", user_id)
    const response = await apiMain.put(`users/changeimage/${user_id}`, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data",
      },
    })
    try {
      console.log(response?.data)
      if (response.status === 200 || response.status === 304) {
        return { kind: "ok", result: response["data"] as object }
      }
      return { kind: "ok", result: response["data"] as object }
    } catch (e) {
      throw new Error(e)
    }
  }
  async changePassword(password: string, userId: string): Promise<boolean> {
    try {
      const response: ApiResponse<any> = await apiMain.put(`users/change-password/${userId}`, {
        password,
      })
      return true
    } catch {
      throw new Error("Change password error")
    }
  }
  async getUserInfo(accessToken: string, userId: string) {
    try {
      const response: ApiResponse<any> = await apiMain.get(`users/${userId}`, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.status === 200) {
        return response.data
      }
      return {}
    } catch {
      throw new Error("GetUserInfor error")
    }
  }
}

// Singleton instance of the API for convenience
export const apiUser = new UserApi()
