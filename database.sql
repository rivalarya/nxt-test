-- ----------------------------
-- Sequence structure for attack_data_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."attack_data_id_seq";
CREATE SEQUENCE "public"."attack_data_id_seq"
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for surveys_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."surveys_id_seq";
CREATE SEQUENCE "public"."surveys_id_seq"
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
CREATE SEQUENCE "public"."users_id_seq"
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for attack_data
-- ----------------------------
DROP TABLE IF EXISTS "public"."attack_data";
CREATE TABLE "public"."attack_data" (
  "id" int4 NOT NULL DEFAULT nextval('attack_data_id_seq'::regclass),
  "sourceCountry" varchar(4) COLLATE "pg_catalog"."default",
  "destinationCountry" varchar(4) COLLATE "pg_catalog"."default",
  "millisecond" int4,
  "type" varchar(30) COLLATE "pg_catalog"."default",
  "weight" int4,
  "attackTime" timestamp(6)
)
;

-- ----------------------------
-- Table structure for surveys
-- ----------------------------
DROP TABLE IF EXISTS "public"."surveys";
CREATE TABLE "public"."surveys" (
  "id" int4 NOT NULL DEFAULT nextval('surveys_id_seq'::regclass),
  "values" _int4,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "userId" int4
)
;

INSERT INTO public.surveys ("values","createdAt","updatedAt","userId") VALUES
	 ('{100,100,90,90,100}','2022-12-22 08:56:50.696+07','2022-12-22 08:56:50.696+07',1),
	 ('{90,100,100,80,90}','2022-12-22 09:08:50.908+07','2022-12-22 09:08:50.908+07',2),
	 ('{80,80,80,80,80}','2022-12-22 21:05:32.317+07','2022-12-22 21:05:32.317+07',3);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "digits" varchar(155) COLLATE "pg_catalog"."default",
  "fotoUrl" varchar(255) COLLATE "pg_catalog"."default",
  "workType" varchar(100) COLLATE "pg_catalog"."default",
  "positionTitle" varchar(100) COLLATE "pg_catalog"."default",
  "lat" float8,
  "lon" float8,
  "company" varchar(155) COLLATE "pg_catalog"."default",
  "isLogin" bool,
  "createdAt" timestamptz(6) NOT NULL DEFAULT now(),
  "updatedAt" timestamptz(6) NOT NULL DEFAULT now(),
  "dovote" bool DEFAULT false,
  "dosurvey" bool DEFAULT false,
  "dofeedback" bool DEFAULT false,
  "fullname" varchar(255) COLLATE "pg_catalog"."default",
  "cuurentLeave" int4
)
;

INSERT INTO public.users ("id",digits,"fotoUrl","workType","positionTitle",lat,lon,company,"isLogin","createdAt","updatedAt",dovote,dosurvey,dofeedback,fullname,"cuurentLeave") VALUES
	 (1,'DFA','','WFO',NULL,0.0,0.0,'NTX',true,'2021-12-15 15:06:33+07','2022-12-22 21:05:32.377+07',true,true,false,'M. Daffa Quraisy',0),
	 (2,'HTA','','WFH',NULL,0.0,0.0,'NTX',true,'2021-12-15 15:06:33+07','2022-12-22 15:04:01.302+07',true,true,false,'R. Hernanta Subagya',0),
	 (3,'HFW','','WFO',NULL,0.0,0.0,'NTX',true,'2021-12-15 15:06:33.226343+07','2022-12-22 15:03:46.848+07',true,false,false,'Hafidz Wibowo',0);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."attack_data_id_seq"
OWNED BY "public"."attack_data"."id";
SELECT setval('"public"."attack_data_id_seq"', 4187, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."surveys_id_seq"
OWNED BY "public"."surveys"."id";
SELECT setval('"public"."surveys_id_seq"', 20, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."users_id_seq"
OWNED BY "public"."users"."id";
SELECT setval('"public"."users_id_seq"', 1, false);

-- ----------------------------
-- Primary Key structure for table attack_data
-- ----------------------------
ALTER TABLE "public"."attack_data" ADD CONSTRAINT "attack_data_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table surveys
-- ----------------------------
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_digits_key" UNIQUE ("digits");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table surveys
-- ----------------------------
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
