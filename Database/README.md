# AlumniNet Database Setup

## Execution Order

Execute these SQL files in the following order to avoid foreign key constraint errors:

1. `01_create_database.sql` - Creates the AlumniNet database
2. `02_core_tables.sql` - Creates Alumni and Events tables (no dependencies)
3. `03_dependent_tables.sql` - Creates Donations and Discussions tables
4. `04_junction_tables.sql` - Creates Event_Attendees and Discussion_Replies tables
5. `05_mentorship_table.sql` - Creates Mentorship table

## Quick Setup

Run `execute_all.sql` for complete database setup in one go.

## AWS RDS Integration

These scripts are compatible with:
- Amazon RDS MySQL
- Amazon RDS PostgreSQL (with minor syntax adjustments)
- Amazon Aurora MySQL/PostgreSQL