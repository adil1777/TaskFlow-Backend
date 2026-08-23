-- CreateEnum
CREATE TYPE "Status" AS ENUM ('todo', 'in_progress', 'review', 'done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('org_admin', 'member');
