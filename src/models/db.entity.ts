import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Base } from './base.entity'

@Entity()
export class Student extends Base {
  @Column({ unique: true })
  aptechId!: string

  @Column()
  firstName!: string

  @Column()
  middleName?: string

  @Column()
  lastName!: string
}

@Entity()
export class Question extends Base {
  /**
   * You can cascade all actions on question submissions from within the `Question` entity.
   */
  @OneToMany(() => Submission, (submission) => submission.question, { cascade: true })
  submissions!: Submission[]
}

@Entity()
export class Submission extends Base {
  @Column({})
  questionId!: number

  @ManyToOne(() => Question, (question) => question.submissions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  question!: Question

  @Column()
  language!: 'C' | 'PY' | 'JAVA' | 'JS'

  @Column()
  codeText!: string

  /**
   * You can cascade all actions on submission executions from within the `Submission` entity.
   */
  @OneToMany(() => Execution, (execution) => execution.submission, { cascade: true })
  executions!: Execution[]
}

@Entity()
export class Execution extends Base {
  @Column({})
  submissionId!: number

  @ManyToOne(() => Submission, (submission) => submission.executions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  submission!: Submission

  @Column()
  status!: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'WRONG_OUTPUT'
}
