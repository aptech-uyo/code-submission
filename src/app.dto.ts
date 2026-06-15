import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export interface Page {
  pageTitle: string
}

export interface QuestionPage extends Page {
  questionId: number
}

export class SubmitCodeDto {
  @IsNumber()
  questionId!: number

  @IsString()
  @IsNotEmpty()
  studentName!: string

  @IsString()
  @IsIn(['C', 'PY', 'JAVA', 'JS'])
  language!: 'C' | 'PY' | 'JAVA' | 'JS'

  @IsString()
  @IsNotEmpty()
  codeText!: string
}