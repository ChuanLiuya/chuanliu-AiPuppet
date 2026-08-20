import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import type { CatDTO } from '@shared/types/cat'

@Entity('cat')
// 实体实现共享契约 CatDTO，保证数据库结构与对外返回结构一致
// （实现层可变，但对外形状由契约约束）
export class CatEntity implements CatDTO {
  /**
   * id
   */
  @PrimaryGeneratedColumn()
  id!: number
  /**
   * 名字
   */
  @Column()
  name!: string
  /**
   * 年龄
   */
  @Column()
  age!: number
  /**
   * 品种
   */
  @Column()
  breed!: string
}
