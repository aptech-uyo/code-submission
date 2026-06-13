import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export abstract class Base {
  @PrimaryGeneratedColumn()
  id!: number

  @CreateDateColumn({ type: 'text', default: 'now' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'text', default: 'now', onUpdate: 'now' })
  updatedAt!: Date
}
