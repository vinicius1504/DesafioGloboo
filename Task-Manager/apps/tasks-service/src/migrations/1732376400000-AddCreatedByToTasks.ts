import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCreatedByToTasks1732376400000 implements MigrationInterface {
  name = 'AddCreatedByToTasks1732376400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add createdBy column to tasks table (nullable first)
    await queryRunner.addColumn(
      'tasks',
      new TableColumn({
        name: 'createdBy',
        type: 'uuid',
        isNullable: true, // Make it nullable initially
      })
    );

    // Create a default user if none exists
    const userResult = await queryRunner.query('SELECT id FROM users LIMIT 1');
    let defaultUserId: string;

    if (userResult.length > 0) {
      defaultUserId = userResult[0].id;
    } else {
      // Create a default system user
      const insertUserResult = await queryRunner.query(`
        INSERT INTO users (id, email, username, password, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'system@taskmanager.com', 'system', '$2b$10$dummy.hash.for.system.user', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `);
      defaultUserId = insertUserResult[0].id;
    }

    // Update existing tasks to have the default creator
    await queryRunner.query(
      'UPDATE tasks SET "createdBy" = $1 WHERE "createdBy" IS NULL',
      [defaultUserId]
    );

    // Now make the column NOT NULL
    await queryRunner.changeColumn(
      'tasks',
      'createdBy',
      new TableColumn({
        name: 'createdBy',
        type: 'uuid',
        isNullable: false,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('tasks');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk =>
        fk.columnNames.includes('createdBy') ||
        fk.columnNames.indexOf('createdBy') !== -1
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('tasks', foreignKey);
      }
    }

    // Drop the column
    await queryRunner.dropColumn('tasks', 'createdBy');
  }
}