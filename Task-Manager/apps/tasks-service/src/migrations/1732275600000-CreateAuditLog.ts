import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuditLog1732275600000 implements MigrationInterface {
  name = 'CreateAuditLog1732275600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'action',
            type: 'enum',
            enum: ['CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'COMMENTED'],
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'changes',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'taskId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['taskId'],
            referencedTableName: 'tasks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_AUDIT_LOGS_TASK_ID" ON "audit_logs" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_AUDIT_LOGS_USER_ID" ON "audit_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_AUDIT_LOGS_CREATED_AT" ON "audit_logs" ("createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_AUDIT_LOGS_ACTION" ON "audit_logs" ("action")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}