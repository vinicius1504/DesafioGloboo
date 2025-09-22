import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCreatedByToTasks1732376400000 implements MigrationInterface {
  name = 'AddCreatedByToTasks1732376400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add createdBy column to tasks table
    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'createdBy',
        type: 'uuid',
        isNullable: false,
        default: '\'00000000-0000-0000-0000-000000000000\'', // Temporary default for existing records
      })
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Update existing tasks to have a valid creator
    // First, try to find a user to assign as creator for existing tasks
    const userResult = await queryRunner.query('SELECT id FROM users LIMIT 1');
    if (userResult.length > 0) {
      const firstUserId = userResult[0].id;
      await queryRunner.query(
        'UPDATE tasks SET "createdBy" = $1 WHERE "createdBy" = \'00000000-0000-0000-0000-000000000000\'',
        [firstUserId]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('tasks');
    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('createdBy') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('tasks', foreignKey);
    }

    // Drop the column
    await queryRunner.dropColumn('tasks', 'createdBy');
  }
}