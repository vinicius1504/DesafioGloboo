import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  task: {
    id: string;
    title: string;
  };

  @ApiProperty()
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}