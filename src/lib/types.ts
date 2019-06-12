import { Client } from "soap";

export type Method = (payload: any) => void
export type AsyncMethod = (payload: any) => Promise<any>
export type MethodMaker = (client: Client, ...path: string[]) => AsyncMethod

export interface MethodResult {
  [key: string]: string
}