import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ExecutionStatus, Language } from '../app.dto'

abstract class Base {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date
}

@Entity()
export class Student extends Base {
  @Column({ unique: true })
  aptechId!: string

  @Column()
  firstName!: string

  @Column({ nullable: true })
  middleName?: string

  @Column()
  lastName!: string

  @OneToMany(() => Submission, (submission) => submission.student, { cascade: true })
  submissions!: Submission[]
}

@Entity()
export class Question extends Base {
  @OneToMany(() => Submission, (submission) => submission.question, { cascade: true })
  submissions!: Submission[]

  @Column()
  inputLineCount!: number

  @Column()
  outputLineCount!: number
}

@Entity()
export class Submission extends Base {
  @Column()
  questionId!: number

  @ManyToOne(() => Question, (question) => question.submissions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  question!: Question

  @Column()
  studentId!: number

  @ManyToOne(() => Student, (student) => student.submissions, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  student!: Student

  @Column()
  language!: Language

  @Column({ type: 'text' })
  codeText!: string

  @OneToMany(() => Execution, (execution) => execution.submission, { cascade: true })
  executions!: Execution[]
}

@Entity()
export class Execution extends Base {
  @Column()
  submissionId!: number

  @ManyToOne(() => Submission, (submission) => submission.executions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  submission!: Submission

  @Column()
  status!: ExecutionStatus

  @Column({ type: 'text', nullable: true })
  output?: string

  @Column({ type: 'text', nullable: true })
  errorMessage?: string
}
