/**
 * 聊天消息表
 *
 * 一条消息 = 历史记录的最小单元。设计参照 SillyTavern：
 * 身份用 `is_user` / `is_system` 两个布尔位表达，而不是 role 枚举，
 * 这样群聊、旁白、隐藏消息都能容纳；发给 AI 的 role 在发送前临时推导。
 */
import { ChatMessageDTO } from '@shared/types/chat'
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ChatSessionEntity } from '@electron/database/entities/chat_session'

@Entity('chat_message')
export class ChatMessageEntity implements ChatMessageDTO {
  /** 消息 id */
  @PrimaryGeneratedColumn()
  id!: number

  /** 所属会话（多对一），外键列为 session_id */
  @ManyToOne(() => ChatSessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: ChatSessionEntity

  /** 所属会话 id（与上面的关系共用同一列） */
  @Column({ type: 'integer' })
  session_id!: number

  /** 发送者名字（用户人设名 / 角色名 / 系统名） */
  @Column({ default: '' })
  name!: string

  /** 是否为用户发送 */
  @Column({ type: 'boolean', default: false })
  is_user!: boolean

  /** 是否为系统/隐藏消息（默认不发送给 AI，仅界面展示） */
  @Column({ type: 'boolean', default: false })
  is_system!: boolean

  /** 正文 */
  @Column({ type: 'text' })
  mes!: string

  /**
   * 杂项元数据（生成参数、推理过程、工具调用等，预留）。
   *
   * 用 simple-json：sqlite 里存 JSON 字符串，读写自动序列化/反序列化。
   */
  @Column({ type: 'simple-json', nullable: true })
  extra!: Record<string, unknown> | null

  /** 同一位置的多条候选回复（重新生成用，预留） */
  @Column({ type: 'simple-json', nullable: true })
  swipes!: string[] | null

  /** 当前选中的候选下标 */
  @Column({ type: 'integer', default: 0 })
  swipe_id!: number

  /** 创建时间 */
  @CreateDateColumn()
  created_at!: Date
}
