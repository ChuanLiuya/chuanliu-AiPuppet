/** 一只猫 */
export interface CatDTO {
  id: number
  name: string
  age: number
  breed: string
}

/** 创建一只猫的参数 */
export type CatCreateInput = Omit<CatDTO, 'id'>

/** 更新一只猫的可选字段 */
export type CatUpdateInput = Partial<Omit<CatDTO, 'id'>>
