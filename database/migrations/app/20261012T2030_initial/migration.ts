#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/34483dac6db044c39d4b46c5312a482339d07382b8abc5430358a9956d676af8/contract';
import endContract from '../../snapshots/34483dac6db044c39d4b46c5312a482339d07382b8abc5430358a9956d676af8/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  createExtension,
  lit,
  primaryKey,
  rawSql,
} from '@prisma/orm-postgres/migration';

// Typo-tolerant search: `word_similarity` from `pg_trgm`, and the trigram indexes that keep it
// and `ilike '%term%'` from scanning every row. Countries are too few to need one.
const trigramIndex = (table: string, column: string) => {
  const index = `${table}_${column}_trgm_idx`;
  return rawSql({
    id: `index.${index}`,
    label: `Create index "${index}"`,
    operationClass: 'additive',
    target: { id: 'postgres' },
    precheck: [],
    execute: [
      {
        description: `Create index "${index}"`,
        sql: `CREATE INDEX IF NOT EXISTS "${index}" ON "public"."${table}" USING gin ("${column}" gin_trgm_ops)`,
      },
    ],
    postcheck: [],
  });
};

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'application_status_history',
        columns: [
          col('changed_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('job_application_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'application_status_history_status_check_989b4fe8',
            `"status" IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn', 'no_response')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'contact',
        columns: [
          col('email', 'character varying(255)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('name', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
          col('organization_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('phone', 'character varying(50)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('role', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'country',
        columns: [
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('iso_code', 'character varying(2)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 2 } },
          }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'document',
        columns: [
          col('file_path', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('name', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('original_filename', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('size', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('uploaded_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('document_type_check_ef497ccd', `"type" IN ('cv', 'cover_letter')`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'document_has_skill',
        columns: [
          col('document_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('skill_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['document_id', 'skill_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'interview_round',
        columns: [
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('job_application_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('outcome', 'text', {
            notNull: true,
            default: lit('scheduled'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('round_type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scheduled_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'interview_round_outcome_check_c5b0c77b',
            `"outcome" IN ('scheduled', 'passed', 'failed', 'cancelled')`,
          ),
          checkExpression(
            'interview_round_round_type_check_9f82b167',
            `"round_type" IN ('intro_call', 'technical', 'coding', 'take_home', 'behavioral')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'interview_round_has_contact',
        columns: [
          col('contact_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('interview_round_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['interview_round_id', 'contact_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'job_application',
        columns: [
          col('applied_at', 'date', { notNull: true, codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('country_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('cover_letter_document_id', 'character(36)', {
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('current_status', 'text', {
            notNull: true,
            default: lit('applied'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('cv_document_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('organization_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('posting_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('source', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('title', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'job_application_current_status_check_df490497',
            `"current_status" IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn', 'no_response')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'job_application_has_skill',
        columns: [
          col('job_application_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('skill_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['job_application_id', 'skill_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'organization',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('name', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('website_url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'organization_in_country',
        columns: [
          col('country_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('organization_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['organization_id', 'country_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'skill',
        columns: [
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('user_id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'character varying(255)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 255 } },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('name', 'character varying(150)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 150 } },
          }),
          col('password_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'country',
        constraint: 'country_iso_code_key',
        columns: ['iso_code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'skill',
        constraint: 'uq_skill_user_id_name',
        columns: ['user_id', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'application_status_history',
        index: 'application_status_history_job_application_id_idx_6988889c',
        columns: ['job_application_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'application_status_history',
        index: 'idx_job_application_id_changed_at_1aeda783',
        columns: ['job_application_id', 'changed_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'contact',
        index: 'contact_organization_id_idx_1a5cd3f5',
        columns: ['organization_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document',
        index: 'document_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document',
        index: 'idx_user_id_document_type_e8650bed',
        columns: ['user_id', 'type'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document_has_skill',
        index: 'document_has_skill_document_id_idx_d3d0944e',
        columns: ['document_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'document_has_skill',
        index: 'document_has_skill_skill_id_idx_676c8389',
        columns: ['skill_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'interview_round',
        index: 'idx_job_application_id_scheduled_at_bd076d63',
        columns: ['job_application_id', 'scheduled_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'interview_round',
        index: 'interview_round_job_application_id_idx_6988889c',
        columns: ['job_application_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'interview_round_has_contact',
        index: 'interview_round_has_contact_contact_id_idx_f6f6ad79',
        columns: ['contact_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'interview_round_has_contact',
        index: 'interview_round_has_contact_interview_round_id_idx_c3a0afad',
        columns: ['interview_round_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application',
        index: 'idx_user_id_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application',
        index: 'job_application_country_id_idx_30642658',
        columns: ['country_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application',
        index: 'job_application_cover_letter_document_id_idx_502843a7',
        columns: ['cover_letter_document_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application',
        index: 'job_application_cv_document_id_idx_86f7b915',
        columns: ['cv_document_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application',
        index: 'job_application_organization_id_idx_1a5cd3f5',
        columns: ['organization_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application_has_skill',
        index: 'job_application_has_skill_job_application_id_idx_6988889c',
        columns: ['job_application_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'job_application_has_skill',
        index: 'job_application_has_skill_skill_id_idx_676c8389',
        columns: ['skill_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organization',
        index: 'idx_user_id_name_ea0dee64',
        columns: ['user_id', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organization',
        index: 'organization_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organization_in_country',
        index: 'organization_in_country_country_id_idx_30642658',
        columns: ['country_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'organization_in_country',
        index: 'organization_in_country_organization_id_idx_1a5cd3f5',
        columns: ['organization_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'skill',
        index: 'skill_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'application_status_history',
        foreignKey: {
          name: 'fk_application_status_history_job_application_id',
          columns: ['job_application_id'],
          references: { schema: 'public', table: 'job_application', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'contact',
        foreignKey: {
          name: 'fk_contact_organization_id',
          columns: ['organization_id'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document',
        foreignKey: {
          name: 'fk_document_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document_has_skill',
        foreignKey: {
          name: 'fk_document_has_skill_document_id',
          columns: ['document_id'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'document_has_skill',
        foreignKey: {
          name: 'fk_document_has_skill_skill_id',
          columns: ['skill_id'],
          references: { schema: 'public', table: 'skill', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'interview_round',
        foreignKey: {
          name: 'fk_interview_round_job_application_id',
          columns: ['job_application_id'],
          references: { schema: 'public', table: 'job_application', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'interview_round_has_contact',
        foreignKey: {
          name: 'fk_interview_round_has_contact_interview_round_id',
          columns: ['interview_round_id'],
          references: { schema: 'public', table: 'interview_round', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'interview_round_has_contact',
        foreignKey: {
          name: 'fk_interview_round_has_contact_contact_id',
          columns: ['contact_id'],
          references: { schema: 'public', table: 'contact', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application',
        foreignKey: {
          name: 'fk_job_application_organization_id',
          columns: ['organization_id'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application',
        foreignKey: {
          name: 'fk_job_application_cv_document_id',
          columns: ['cv_document_id'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application',
        foreignKey: {
          name: 'fk_job_application_cover_letter_document_id',
          columns: ['cover_letter_document_id'],
          references: { schema: 'public', table: 'document', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application',
        foreignKey: {
          name: 'fk_job_application_country_id',
          columns: ['country_id'],
          references: { schema: 'public', table: 'country', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application',
        foreignKey: {
          name: 'fk_job_application_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application_has_skill',
        foreignKey: {
          name: 'fk_job_application_has_skill_job_application_id',
          columns: ['job_application_id'],
          references: { schema: 'public', table: 'job_application', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'job_application_has_skill',
        foreignKey: {
          name: 'fk_job_application_has_skill_skill_id',
          columns: ['skill_id'],
          references: { schema: 'public', table: 'skill', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'organization',
        foreignKey: {
          name: 'fk_organization_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'organization_in_country',
        foreignKey: {
          name: 'fk_organization_in_country_organization_id',
          columns: ['organization_id'],
          references: { schema: 'public', table: 'organization', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'organization_in_country',
        foreignKey: {
          name: 'fk_organization_in_country_country_id',
          columns: ['country_id'],
          references: { schema: 'public', table: 'country', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'skill',
        foreignKey: {
          name: 'fk_skill_user_id',
          columns: ['user_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      createExtension('pg_trgm'),
      trigramIndex('job_application', 'title'),
      trigramIndex('organization', 'name'),
      trigramIndex('document', 'name'),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
