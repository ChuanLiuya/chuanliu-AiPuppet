
import { catApi } from '@electron/preload/apis/cat'
import { apiConfigApi } from '@electron/preload/apis/apiConfig'

export const api = {
  cat: catApi,
  apiConfig: apiConfigApi,
}
