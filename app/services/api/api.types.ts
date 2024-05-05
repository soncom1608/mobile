import { GeneralApiProblem } from "./apiProblem"

/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
export type LoginAuthentication = { kind ?: "ok" | "bad" , inforUser? : object , status?:number }
export type RefreshToken = { active: boolean, listToken:object} 
export type ChangePassword = {kind : "ok", result: object} | GeneralApiProblem
export type TimeSheetResult = { kind : "ok" | "bad" , result : object } | GeneralApiProblem
export type PlacResult = { kind : "ok" | "bad" , result : object } | GeneralApiProblem
export type ListPlaceUser = { kind : "ok" | "bad" , result : object } | GeneralApiProblem
export type User = { kind : "ok" | "bad" , result : object } | GeneralApiProblem
