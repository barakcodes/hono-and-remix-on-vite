/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Assets": {
      "type": "sst.aws.StaticAssets"
      "url": string
    }
    "AssetsBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "MyRouter": {
      "type": "sst.aws.Router"
      "url": string
    }
    "Web": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
  }
}
export {}
