--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS;
CREATE ROLE shobuki;
ALTER ROLE shobuki WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:Oi6CHwykbtc1DAGW7y5zIA==$l3F+xTl5U0GQ+YvTF02glCmr1o/eSIJ/KPz4arlTnCw=:Q+C4f4ZmtGdBjWdDfb6XM8YCgVbc1AlXysHCxzP1Odg=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

--
-- Database "shobuki" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: shobuki; Type: DATABASE; Schema: -; Owner: shobuki
--

CREATE DATABASE shobuki WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE shobuki OWNER TO shobuki;

\connect shobuki

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: shobuki
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO shobuki;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: shobuki
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AccessLevel; Type: TYPE; Schema: public; Owner: shobuki
--

CREATE TYPE public."AccessLevel" AS ENUM (
    'NONE',
    'WRITE'
);


ALTER TYPE public."AccessLevel" OWNER TO shobuki;

--
-- Name: EmailStatus; Type: TYPE; Schema: public; Owner: shobuki
--

CREATE TYPE public."EmailStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);


ALTER TYPE public."EmailStatus" OWNER TO shobuki;

--
-- Name: EmailTemplateType; Type: TYPE; Schema: public; Owner: shobuki
--

CREATE TYPE public."EmailTemplateType" AS ENUM (
    'SALES_ORDER',
    'FORGOT_PASSWORD_USER',
    'FORGOT_PASSWORD_ADMIN',
    'ADMIN_NOTIFICATION_SALESORDER'
);


ALTER TYPE public."EmailTemplateType" OWNER TO shobuki;

--
-- Name: FulfillmentStatus; Type: TYPE; Schema: public; Owner: shobuki
--

CREATE TYPE public."FulfillmentStatus" AS ENUM (
    'READY',
    'IN_PO'
);


ALTER TYPE public."FulfillmentStatus" OWNER TO shobuki;

--
-- Name: SalesOrderStatus; Type: TYPE; Schema: public; Owner: shobuki
--

CREATE TYPE public."SalesOrderStatus" AS ENUM (
    'PENDING_APPROVAL',
    'APPROVED_EMAIL_SENT',
    'NEEDS_REVISION',
    'REJECTED'
);


ALTER TYPE public."SalesOrderStatus" OWNER TO shobuki;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Admin" (
    "Id" integer NOT NULL,
    "Username" character varying(30) NOT NULL,
    "Password" character varying(150) NOT NULL,
    "Email" character varying(75) NOT NULL,
    "Token" character varying(300),
    "Image" character varying(255),
    "Name" character varying(50),
    "Birthdate" timestamp(3) without time zone,
    "PhoneNumber" character varying(20),
    "Address" character varying(150),
    "Gender" character varying(10),
    "RoleId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Admin" OWNER TO shobuki;

--
-- Name: AdminForgotPasswordRequest; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."AdminForgotPasswordRequest" (
    "Id" integer NOT NULL,
    "AdminId" integer NOT NULL,
    "Token" character varying(250) NOT NULL,
    "IsUsed" boolean DEFAULT false NOT NULL,
    "ExpiresAt" timestamp(3) without time zone NOT NULL,
    "SenderEmail" character varying(75),
    "Status" public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "ErrorMessage" character varying(255),
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "EmailTemplateId" integer
);


ALTER TABLE public."AdminForgotPasswordRequest" OWNER TO shobuki;

--
-- Name: AdminForgotPasswordRequest_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."AdminForgotPasswordRequest_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AdminForgotPasswordRequest_Id_seq" OWNER TO shobuki;

--
-- Name: AdminForgotPasswordRequest_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."AdminForgotPasswordRequest_Id_seq" OWNED BY public."AdminForgotPasswordRequest"."Id";


--
-- Name: AdminNotification; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."AdminNotification" (
    "Id" integer NOT NULL,
    "AdminId" integer NOT NULL,
    "Type" text NOT NULL,
    "Title" text NOT NULL,
    "Body" text,
    "Path" text,
    "IsRead" boolean DEFAULT false NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "SalesOrderId" integer,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."AdminNotification" OWNER TO shobuki;

--
-- Name: AdminNotification_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."AdminNotification_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AdminNotification_Id_seq" OWNER TO shobuki;

--
-- Name: AdminNotification_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."AdminNotification_Id_seq" OWNED BY public."AdminNotification"."Id";


--
-- Name: AdminRole; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."AdminRole" (
    "Id" integer NOT NULL,
    "Name" character varying(30) NOT NULL,
    "Description" character varying(100)
);


ALTER TABLE public."AdminRole" OWNER TO shobuki;

--
-- Name: AdminRole_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."AdminRole_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AdminRole_Id_seq" OWNER TO shobuki;

--
-- Name: AdminRole_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."AdminRole_Id_seq" OWNED BY public."AdminRole"."Id";


--
-- Name: AdminSession; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."AdminSession" (
    "Id" integer NOT NULL,
    "AdminId" integer NOT NULL,
    "LoginTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LogoutTime" timestamp(3) without time zone,
    "Device" character varying(200),
    "UserAgent" character varying(300)
);


ALTER TABLE public."AdminSession" OWNER TO shobuki;

--
-- Name: AdminSession_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."AdminSession_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AdminSession_Id_seq" OWNER TO shobuki;

--
-- Name: AdminSession_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."AdminSession_Id_seq" OWNED BY public."AdminSession"."Id";


--
-- Name: Admin_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Admin_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Admin_Id_seq" OWNER TO shobuki;

--
-- Name: Admin_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Admin_Id_seq" OWNED BY public."Admin"."Id";


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Cart" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Cart" OWNER TO shobuki;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."CartItem" (
    "Id" integer NOT NULL,
    "CartId" integer NOT NULL,
    "ItemCodeId" integer NOT NULL,
    "Quantity" double precision NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."CartItem" OWNER TO shobuki;

--
-- Name: CartItem_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."CartItem_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CartItem_Id_seq" OWNER TO shobuki;

--
-- Name: CartItem_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."CartItem_Id_seq" OWNED BY public."CartItem"."Id";


--
-- Name: Cart_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Cart_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Cart_Id_seq" OWNER TO shobuki;

--
-- Name: Cart_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Cart_Id_seq" OWNED BY public."Cart"."Id";


--
-- Name: Dealer; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Dealer" (
    "Id" integer NOT NULL,
    "CompanyName" character varying(100) NOT NULL,
    "Region" character varying(50),
    "StoreCode" character varying(30) NOT NULL,
    "Address" character varying(150),
    "PhoneNumber" character varying(20),
    fax character varying(20),
    "PriceCategoryId" integer,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Dealer" OWNER TO shobuki;

--
-- Name: DealerWarehouse; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."DealerWarehouse" (
    "Id" integer NOT NULL,
    "DealerId" integer NOT NULL,
    "WarehouseId" integer NOT NULL,
    "Priority" integer
);


ALTER TABLE public."DealerWarehouse" OWNER TO shobuki;

--
-- Name: DealerWarehouse_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."DealerWarehouse_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."DealerWarehouse_Id_seq" OWNER TO shobuki;

--
-- Name: DealerWarehouse_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."DealerWarehouse_Id_seq" OWNED BY public."DealerWarehouse"."Id";


--
-- Name: Dealer_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Dealer_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Dealer_Id_seq" OWNER TO shobuki;

--
-- Name: Dealer_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Dealer_Id_seq" OWNED BY public."Dealer"."Id";


--
-- Name: EmailConfig; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."EmailConfig" (
    "Id" integer NOT NULL,
    "Email" text NOT NULL,
    "Password" text NOT NULL,
    "Host" text DEFAULT 'smtp.gmail.com'::text NOT NULL,
    "Port" integer DEFAULT 465 NOT NULL,
    "Secure" boolean DEFAULT true NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp(3) without time zone,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."EmailConfig" OWNER TO shobuki;

--
-- Name: EmailConfig_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."EmailConfig_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EmailConfig_Id_seq" OWNER TO shobuki;

--
-- Name: EmailConfig_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."EmailConfig_Id_seq" OWNED BY public."EmailConfig"."Id";


--
-- Name: EmailSalesOrder; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."EmailSalesOrder" (
    "Id" integer NOT NULL,
    "SalesOrderId" integer NOT NULL,
    "SenderEmail" text,
    "RecipientEmail" text NOT NULL,
    "Subject" text NOT NULL,
    "Body" text,
    "Status" public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp(3) without time zone,
    "DeletedAt" timestamp(3) without time zone,
    "ApprovedAt" timestamp(3) without time zone,
    "EmailTemplateId" integer
);


ALTER TABLE public."EmailSalesOrder" OWNER TO shobuki;

--
-- Name: EmailSalesOrderRecipient; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."EmailSalesOrderRecipient" (
    "Id" integer NOT NULL,
    "SalesId" integer NOT NULL,
    "RecipientEmail" text NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."EmailSalesOrderRecipient" OWNER TO shobuki;

--
-- Name: EmailSalesOrderRecipient_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."EmailSalesOrderRecipient_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EmailSalesOrderRecipient_Id_seq" OWNER TO shobuki;

--
-- Name: EmailSalesOrderRecipient_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."EmailSalesOrderRecipient_Id_seq" OWNED BY public."EmailSalesOrderRecipient"."Id";


--
-- Name: EmailSalesOrder_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."EmailSalesOrder_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EmailSalesOrder_Id_seq" OWNER TO shobuki;

--
-- Name: EmailSalesOrder_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."EmailSalesOrder_Id_seq" OWNED BY public."EmailSalesOrder"."Id";


--
-- Name: EmailTemplate; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."EmailTemplate" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "Subject" text,
    "Body" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "TemplateType" public."EmailTemplateType",
    "UpdatedAt" timestamp(3) without time zone,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."EmailTemplate" OWNER TO shobuki;

--
-- Name: EmailTemplate_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."EmailTemplate_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EmailTemplate_Id_seq" OWNER TO shobuki;

--
-- Name: EmailTemplate_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."EmailTemplate_Id_seq" OWNED BY public."EmailTemplate"."Id";


--
-- Name: Event; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Event" (
    id integer NOT NULL,
    name text NOT NULL,
    "dateStart" timestamp(3) without time zone NOT NULL,
    "dateEnd" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    description text
);


ALTER TABLE public."Event" OWNER TO shobuki;

--
-- Name: EventImage; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."EventImage" (
    id integer NOT NULL,
    image text NOT NULL,
    "eventId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public."EventImage" OWNER TO shobuki;

--
-- Name: EventImage_id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."EventImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EventImage_id_seq" OWNER TO shobuki;

--
-- Name: EventImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."EventImage_id_seq" OWNED BY public."EventImage".id;


--
-- Name: Event_id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Event_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Event_id_seq" OWNER TO shobuki;

--
-- Name: Event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Event_id_seq" OWNED BY public."Event".id;


--
-- Name: ItemCode; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ItemCode" (
    "Id" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Name" text NOT NULL,
    "BrandCodeId" integer,
    "OEM" text,
    "Weight" double precision,
    "AllowItemCodeSelection" boolean DEFAULT false NOT NULL,
    "MinOrderQuantity" integer,
    "QtyPO" double precision,
    "OrderStep" integer,
    "PartNumberId" integer
);


ALTER TABLE public."ItemCode" OWNER TO shobuki;

--
-- Name: ItemCodeImage; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ItemCodeImage" (
    "Id" integer NOT NULL,
    "Image" text,
    "ItemCodeId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."ItemCodeImage" OWNER TO shobuki;

--
-- Name: ItemCodeImage_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ItemCodeImage_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ItemCodeImage_Id_seq" OWNER TO shobuki;

--
-- Name: ItemCodeImage_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ItemCodeImage_Id_seq" OWNED BY public."ItemCodeImage"."Id";


--
-- Name: ItemCode_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ItemCode_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ItemCode_Id_seq" OWNER TO shobuki;

--
-- Name: ItemCode_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ItemCode_Id_seq" OWNED BY public."ItemCode"."Id";


--
-- Name: Menu; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Menu" (
    "Id" integer NOT NULL,
    "Name" character varying(50) NOT NULL,
    "Path" character varying(100) NOT NULL,
    "Description" character varying(100)
);


ALTER TABLE public."Menu" OWNER TO shobuki;

--
-- Name: MenuFeature; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."MenuFeature" (
    "Id" integer NOT NULL,
    "MenuId" integer NOT NULL,
    "Feature" character varying(80) NOT NULL
);


ALTER TABLE public."MenuFeature" OWNER TO shobuki;

--
-- Name: MenuFeature_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."MenuFeature_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MenuFeature_Id_seq" OWNER TO shobuki;

--
-- Name: MenuFeature_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."MenuFeature_Id_seq" OWNED BY public."MenuFeature"."Id";


--
-- Name: Menu_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Menu_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Menu_Id_seq" OWNER TO shobuki;

--
-- Name: Menu_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Menu_Id_seq" OWNED BY public."Menu"."Id";


--
-- Name: PartNumber; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."PartNumber" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "Dash" integer,
    "InnerDiameter" double precision,
    "OuterDiameter" double precision,
    "WorkingPressure" double precision,
    "BurstingPressure" double precision,
    "BendingRadius" double precision,
    "HoseWeight" double precision,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "ProductId" integer
);


ALTER TABLE public."PartNumber" OWNER TO shobuki;

--
-- Name: PartNumber_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."PartNumber_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PartNumber_Id_seq" OWNER TO shobuki;

--
-- Name: PartNumber_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."PartNumber_Id_seq" OWNED BY public."PartNumber"."Id";


--
-- Name: Price; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Price" (
    "Id" integer NOT NULL,
    "Price" double precision NOT NULL,
    "PriceCategoryId" integer,
    "DealerId" integer,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "ItemCodeId" integer NOT NULL
);


ALTER TABLE public."Price" OWNER TO shobuki;

--
-- Name: PriceCategory; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."PriceCategory" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."PriceCategory" OWNER TO shobuki;

--
-- Name: PriceCategory_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."PriceCategory_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PriceCategory_Id_seq" OWNER TO shobuki;

--
-- Name: PriceCategory_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."PriceCategory_Id_seq" OWNED BY public."PriceCategory"."Id";


--
-- Name: PriceHistory; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."PriceHistory" (
    "Id" integer NOT NULL,
    "Price" double precision NOT NULL,
    "UpdatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ItemCodeId" integer NOT NULL
);


ALTER TABLE public."PriceHistory" OWNER TO shobuki;

--
-- Name: PriceHistory_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."PriceHistory_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PriceHistory_Id_seq" OWNER TO shobuki;

--
-- Name: PriceHistory_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."PriceHistory_Id_seq" OWNED BY public."PriceHistory"."Id";


--
-- Name: Price_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Price_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Price_Id_seq" OWNER TO shobuki;

--
-- Name: Price_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Price_Id_seq" OWNED BY public."Price"."Id";


--
-- Name: Product; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Product" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "CodeName" text,
    "Description" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Product" OWNER TO shobuki;

--
-- Name: ProductBrand; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ProductBrand" (
    "Id" integer NOT NULL,
    "ProductBrandName" text,
    "ProductBrandCode" text
);


ALTER TABLE public."ProductBrand" OWNER TO shobuki;

--
-- Name: ProductBrand_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ProductBrand_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductBrand_Id_seq" OWNER TO shobuki;

--
-- Name: ProductBrand_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ProductBrand_Id_seq" OWNED BY public."ProductBrand"."Id";


--
-- Name: ProductCategory; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ProductCategory" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "ParentCategoryId" integer
);


ALTER TABLE public."ProductCategory" OWNER TO shobuki;

--
-- Name: ProductCategoryImage; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ProductCategoryImage" (
    "Id" integer NOT NULL,
    "Image" text,
    "ProductCategoryId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."ProductCategoryImage" OWNER TO shobuki;

--
-- Name: ProductCategoryImage_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ProductCategoryImage_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductCategoryImage_Id_seq" OWNER TO shobuki;

--
-- Name: ProductCategoryImage_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ProductCategoryImage_Id_seq" OWNED BY public."ProductCategoryImage"."Id";


--
-- Name: ProductCategory_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ProductCategory_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductCategory_Id_seq" OWNER TO shobuki;

--
-- Name: ProductCategory_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ProductCategory_Id_seq" OWNED BY public."ProductCategory"."Id";


--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ProductImage" (
    "Id" integer NOT NULL,
    "Image" text,
    "ProductId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."ProductImage" OWNER TO shobuki;

--
-- Name: ProductImage_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ProductImage_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductImage_Id_seq" OWNER TO shobuki;

--
-- Name: ProductImage_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ProductImage_Id_seq" OWNED BY public."ProductImage"."Id";


--
-- Name: ProductSpecificationFile; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ProductSpecificationFile" (
    "Id" integer NOT NULL,
    "ProductId" integer NOT NULL,
    "FileName" text NOT NULL,
    "FilePath" text NOT NULL,
    "MimeType" text NOT NULL,
    "UploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."ProductSpecificationFile" OWNER TO shobuki;

--
-- Name: ProductSpecificationFile_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."ProductSpecificationFile_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductSpecificationFile_Id_seq" OWNER TO shobuki;

--
-- Name: ProductSpecificationFile_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."ProductSpecificationFile_Id_seq" OWNED BY public."ProductSpecificationFile"."Id";


--
-- Name: Product_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Product_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_Id_seq" OWNER TO shobuki;

--
-- Name: Product_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Product_Id_seq" OWNED BY public."Product"."Id";


--
-- Name: RoleMenuAccess; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."RoleMenuAccess" (
    "Id" integer NOT NULL,
    "RoleId" integer NOT NULL,
    "MenuId" integer NOT NULL,
    "Access" public."AccessLevel" NOT NULL
);


ALTER TABLE public."RoleMenuAccess" OWNER TO shobuki;

--
-- Name: RoleMenuAccess_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."RoleMenuAccess_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RoleMenuAccess_Id_seq" OWNER TO shobuki;

--
-- Name: RoleMenuAccess_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."RoleMenuAccess_Id_seq" OWNED BY public."RoleMenuAccess"."Id";


--
-- Name: RoleMenuFeatureAccess; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."RoleMenuFeatureAccess" (
    "Id" integer NOT NULL,
    "RoleId" integer NOT NULL,
    "MenuFeatureId" integer NOT NULL,
    "Access" public."AccessLevel" NOT NULL
);


ALTER TABLE public."RoleMenuFeatureAccess" OWNER TO shobuki;

--
-- Name: RoleMenuFeatureAccess_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."RoleMenuFeatureAccess_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RoleMenuFeatureAccess_Id_seq" OWNER TO shobuki;

--
-- Name: RoleMenuFeatureAccess_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."RoleMenuFeatureAccess_Id_seq" OWNED BY public."RoleMenuFeatureAccess"."Id";


--
-- Name: Sales; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Sales" (
    "Id" integer NOT NULL,
    "AdminId" integer NOT NULL
);


ALTER TABLE public."Sales" OWNER TO shobuki;

--
-- Name: SalesOrder; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."SalesOrder" (
    "Id" integer NOT NULL,
    "SalesOrderNumber" text,
    "JdeSalesOrderNumber" text,
    "DealerId" integer NOT NULL,
    "UserId" integer NOT NULL,
    "SalesId" integer NOT NULL,
    "Status" public."SalesOrderStatus" DEFAULT 'PENDING_APPROVAL'::public."SalesOrderStatus" NOT NULL,
    "Note" text,
    "PaymentTerm" integer,
    "FOB" text,
    "CustomerPoNumber" text,
    "DeliveryOrderNumber" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "TransactionToken" text NOT NULL
);


ALTER TABLE public."SalesOrder" OWNER TO shobuki;

--
-- Name: SalesOrderDetail; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."SalesOrderDetail" (
    "Id" integer NOT NULL,
    "SalesOrderId" integer NOT NULL,
    "ItemCodeId" integer NOT NULL,
    "WarehouseId" integer,
    "Quantity" double precision NOT NULL,
    "Price" double precision NOT NULL,
    "FinalPrice" double precision NOT NULL,
    "PriceCategoryId" integer,
    "FulfillmentStatus" public."FulfillmentStatus" DEFAULT 'READY'::public."FulfillmentStatus" NOT NULL,
    "TaxId" integer
);


ALTER TABLE public."SalesOrderDetail" OWNER TO shobuki;

--
-- Name: SalesOrderDetail_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."SalesOrderDetail_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SalesOrderDetail_Id_seq" OWNER TO shobuki;

--
-- Name: SalesOrderDetail_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."SalesOrderDetail_Id_seq" OWNED BY public."SalesOrderDetail"."Id";


--
-- Name: SalesOrderFile; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."SalesOrderFile" (
    "Id" integer NOT NULL,
    "SalesOrderId" integer NOT NULL,
    "ExcelFile" text,
    "PdfFile" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp(3) without time zone
);


ALTER TABLE public."SalesOrderFile" OWNER TO shobuki;

--
-- Name: SalesOrderFile_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."SalesOrderFile_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SalesOrderFile_Id_seq" OWNER TO shobuki;

--
-- Name: SalesOrderFile_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."SalesOrderFile_Id_seq" OWNED BY public."SalesOrderFile"."Id";


--
-- Name: SalesOrder_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."SalesOrder_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SalesOrder_Id_seq" OWNER TO shobuki;

--
-- Name: SalesOrder_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."SalesOrder_Id_seq" OWNED BY public."SalesOrder"."Id";


--
-- Name: Sales_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Sales_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Sales_Id_seq" OWNER TO shobuki;

--
-- Name: Sales_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Sales_Id_seq" OWNED BY public."Sales"."Id";


--
-- Name: StockHistory; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."StockHistory" (
    "Id" integer NOT NULL,
    "WarehouseStockId" integer,
    "ItemCodeId" integer NOT NULL,
    "QtyBefore" double precision,
    "QtyAfter" double precision,
    "Note" text,
    "UpdatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UploadLogId" integer,
    "AdminId" integer
);


ALTER TABLE public."StockHistory" OWNER TO shobuki;

--
-- Name: StockHistoryExcelUploadLog; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."StockHistoryExcelUploadLog" (
    "Id" integer NOT NULL,
    "FilePath" text NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StockHistoryExcelUploadLog" OWNER TO shobuki;

--
-- Name: StockHistoryExcelUploadLog_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."StockHistoryExcelUploadLog_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StockHistoryExcelUploadLog_Id_seq" OWNER TO shobuki;

--
-- Name: StockHistoryExcelUploadLog_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."StockHistoryExcelUploadLog_Id_seq" OWNED BY public."StockHistoryExcelUploadLog"."Id";


--
-- Name: StockHistory_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."StockHistory_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StockHistory_Id_seq" OWNER TO shobuki;

--
-- Name: StockHistory_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."StockHistory_Id_seq" OWNED BY public."StockHistory"."Id";


--
-- Name: Tax; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Tax" (
    "Id" integer NOT NULL,
    "Name" text,
    "Percentage" double precision NOT NULL,
    "IsActive" boolean DEFAULT true NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp(3) without time zone,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Tax" OWNER TO shobuki;

--
-- Name: Tax_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Tax_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Tax_Id_seq" OWNER TO shobuki;

--
-- Name: Tax_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Tax_Id_seq" OWNED BY public."Tax"."Id";


--
-- Name: User; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."User" (
    "Id" integer NOT NULL,
    "Email" character varying(75) NOT NULL,
    "Name" character varying(50),
    "Password" character varying(100) NOT NULL,
    "Username" character varying(30) NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Token" character varying(300),
    "Image" character varying(255),
    "Address" character varying(150),
    "Birthdate" timestamp(3) without time zone,
    "Country" character varying(30),
    "Gender" character varying(10),
    "PhoneNumber" character varying(20),
    "Province" character varying(30),
    "DealerId" integer
);


ALTER TABLE public."User" OWNER TO shobuki;

--
-- Name: UserForgotPasswordRequest; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."UserForgotPasswordRequest" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "Token" character varying(100) NOT NULL,
    "IsUsed" boolean DEFAULT false NOT NULL,
    "ExpiresAt" timestamp(3) without time zone NOT NULL,
    "SenderEmail" character varying(75),
    "Status" public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "ErrorMessage" character varying(255),
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "EmailTemplateId" integer
);


ALTER TABLE public."UserForgotPasswordRequest" OWNER TO shobuki;

--
-- Name: UserForgotPasswordRequest_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."UserForgotPasswordRequest_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserForgotPasswordRequest_Id_seq" OWNER TO shobuki;

--
-- Name: UserForgotPasswordRequest_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."UserForgotPasswordRequest_Id_seq" OWNED BY public."UserForgotPasswordRequest"."Id";


--
-- Name: UserSession; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."UserSession" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "LoginTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LogoutTime" timestamp(3) without time zone,
    "Token" character varying(300)
);


ALTER TABLE public."UserSession" OWNER TO shobuki;

--
-- Name: UserSession_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."UserSession_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."UserSession_Id_seq" OWNER TO shobuki;

--
-- Name: UserSession_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."UserSession_Id_seq" OWNED BY public."UserSession"."Id";


--
-- Name: User_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."User_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_Id_seq" OWNER TO shobuki;

--
-- Name: User_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."User_Id_seq" OWNED BY public."User"."Id";


--
-- Name: Warehouse; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."Warehouse" (
    "Id" integer NOT NULL,
    "Name" text,
    "BusinessUnit" text NOT NULL,
    "Location" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."Warehouse" OWNER TO shobuki;

--
-- Name: WarehouseStock; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."WarehouseStock" (
    "Id" integer NOT NULL,
    "WarehouseId" integer NOT NULL,
    "ItemCodeId" integer NOT NULL,
    "QtyOnHand" double precision DEFAULT 0 NOT NULL,
    "UpdatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."WarehouseStock" OWNER TO shobuki;

--
-- Name: WarehouseStock_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."WarehouseStock_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WarehouseStock_Id_seq" OWNER TO shobuki;

--
-- Name: WarehouseStock_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."WarehouseStock_Id_seq" OWNED BY public."WarehouseStock"."Id";


--
-- Name: Warehouse_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."Warehouse_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Warehouse_Id_seq" OWNER TO shobuki;

--
-- Name: Warehouse_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."Warehouse_Id_seq" OWNED BY public."Warehouse"."Id";


--
-- Name: WholesalePrice; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."WholesalePrice" (
    "Id" integer NOT NULL,
    "MinQuantity" integer NOT NULL,
    "MaxQuantity" integer NOT NULL,
    "PriceId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone
);


ALTER TABLE public."WholesalePrice" OWNER TO shobuki;

--
-- Name: WholesalePrice_Id_seq; Type: SEQUENCE; Schema: public; Owner: shobuki
--

CREATE SEQUENCE public."WholesalePrice_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WholesalePrice_Id_seq" OWNER TO shobuki;

--
-- Name: WholesalePrice_Id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: shobuki
--

ALTER SEQUENCE public."WholesalePrice_Id_seq" OWNED BY public."WholesalePrice"."Id";


--
-- Name: _DealerSales; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."_DealerSales" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_DealerSales" OWNER TO shobuki;

--
-- Name: _ProductToProductCategory; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."_ProductToProductCategory" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_ProductToProductCategory" OWNER TO shobuki;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO shobuki;

--
-- Name: Admin Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Admin" ALTER COLUMN "Id" SET DEFAULT nextval('public."Admin_Id_seq"'::regclass);


--
-- Name: AdminForgotPasswordRequest Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminForgotPasswordRequest" ALTER COLUMN "Id" SET DEFAULT nextval('public."AdminForgotPasswordRequest_Id_seq"'::regclass);


--
-- Name: AdminNotification Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminNotification" ALTER COLUMN "Id" SET DEFAULT nextval('public."AdminNotification_Id_seq"'::regclass);


--
-- Name: AdminRole Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminRole" ALTER COLUMN "Id" SET DEFAULT nextval('public."AdminRole_Id_seq"'::regclass);


--
-- Name: AdminSession Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminSession" ALTER COLUMN "Id" SET DEFAULT nextval('public."AdminSession_Id_seq"'::regclass);


--
-- Name: Cart Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Cart" ALTER COLUMN "Id" SET DEFAULT nextval('public."Cart_Id_seq"'::regclass);


--
-- Name: CartItem Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."CartItem" ALTER COLUMN "Id" SET DEFAULT nextval('public."CartItem_Id_seq"'::regclass);


--
-- Name: Dealer Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Dealer" ALTER COLUMN "Id" SET DEFAULT nextval('public."Dealer_Id_seq"'::regclass);


--
-- Name: DealerWarehouse Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."DealerWarehouse" ALTER COLUMN "Id" SET DEFAULT nextval('public."DealerWarehouse_Id_seq"'::regclass);


--
-- Name: EmailConfig Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailConfig" ALTER COLUMN "Id" SET DEFAULT nextval('public."EmailConfig_Id_seq"'::regclass);


--
-- Name: EmailSalesOrder Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrder" ALTER COLUMN "Id" SET DEFAULT nextval('public."EmailSalesOrder_Id_seq"'::regclass);


--
-- Name: EmailSalesOrderRecipient Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrderRecipient" ALTER COLUMN "Id" SET DEFAULT nextval('public."EmailSalesOrderRecipient_Id_seq"'::regclass);


--
-- Name: EmailTemplate Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailTemplate" ALTER COLUMN "Id" SET DEFAULT nextval('public."EmailTemplate_Id_seq"'::regclass);


--
-- Name: Event id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Event" ALTER COLUMN id SET DEFAULT nextval('public."Event_id_seq"'::regclass);


--
-- Name: EventImage id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EventImage" ALTER COLUMN id SET DEFAULT nextval('public."EventImage_id_seq"'::regclass);


--
-- Name: ItemCode Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCode" ALTER COLUMN "Id" SET DEFAULT nextval('public."ItemCode_Id_seq"'::regclass);


--
-- Name: ItemCodeImage Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCodeImage" ALTER COLUMN "Id" SET DEFAULT nextval('public."ItemCodeImage_Id_seq"'::regclass);


--
-- Name: Menu Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Menu" ALTER COLUMN "Id" SET DEFAULT nextval('public."Menu_Id_seq"'::regclass);


--
-- Name: MenuFeature Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."MenuFeature" ALTER COLUMN "Id" SET DEFAULT nextval('public."MenuFeature_Id_seq"'::regclass);


--
-- Name: PartNumber Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PartNumber" ALTER COLUMN "Id" SET DEFAULT nextval('public."PartNumber_Id_seq"'::regclass);


--
-- Name: Price Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Price" ALTER COLUMN "Id" SET DEFAULT nextval('public."Price_Id_seq"'::regclass);


--
-- Name: PriceCategory Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PriceCategory" ALTER COLUMN "Id" SET DEFAULT nextval('public."PriceCategory_Id_seq"'::regclass);


--
-- Name: PriceHistory Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PriceHistory" ALTER COLUMN "Id" SET DEFAULT nextval('public."PriceHistory_Id_seq"'::regclass);


--
-- Name: Product Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Product" ALTER COLUMN "Id" SET DEFAULT nextval('public."Product_Id_seq"'::regclass);


--
-- Name: ProductBrand Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductBrand" ALTER COLUMN "Id" SET DEFAULT nextval('public."ProductBrand_Id_seq"'::regclass);


--
-- Name: ProductCategory Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductCategory" ALTER COLUMN "Id" SET DEFAULT nextval('public."ProductCategory_Id_seq"'::regclass);


--
-- Name: ProductCategoryImage Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductCategoryImage" ALTER COLUMN "Id" SET DEFAULT nextval('public."ProductCategoryImage_Id_seq"'::regclass);


--
-- Name: ProductImage Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductImage" ALTER COLUMN "Id" SET DEFAULT nextval('public."ProductImage_Id_seq"'::regclass);


--
-- Name: ProductSpecificationFile Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductSpecificationFile" ALTER COLUMN "Id" SET DEFAULT nextval('public."ProductSpecificationFile_Id_seq"'::regclass);


--
-- Name: RoleMenuAccess Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuAccess" ALTER COLUMN "Id" SET DEFAULT nextval('public."RoleMenuAccess_Id_seq"'::regclass);


--
-- Name: RoleMenuFeatureAccess Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuFeatureAccess" ALTER COLUMN "Id" SET DEFAULT nextval('public."RoleMenuFeatureAccess_Id_seq"'::regclass);


--
-- Name: Sales Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Sales" ALTER COLUMN "Id" SET DEFAULT nextval('public."Sales_Id_seq"'::regclass);


--
-- Name: SalesOrder Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrder" ALTER COLUMN "Id" SET DEFAULT nextval('public."SalesOrder_Id_seq"'::regclass);


--
-- Name: SalesOrderDetail Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail" ALTER COLUMN "Id" SET DEFAULT nextval('public."SalesOrderDetail_Id_seq"'::regclass);


--
-- Name: SalesOrderFile Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderFile" ALTER COLUMN "Id" SET DEFAULT nextval('public."SalesOrderFile_Id_seq"'::regclass);


--
-- Name: StockHistory Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistory" ALTER COLUMN "Id" SET DEFAULT nextval('public."StockHistory_Id_seq"'::regclass);


--
-- Name: StockHistoryExcelUploadLog Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistoryExcelUploadLog" ALTER COLUMN "Id" SET DEFAULT nextval('public."StockHistoryExcelUploadLog_Id_seq"'::regclass);


--
-- Name: Tax Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Tax" ALTER COLUMN "Id" SET DEFAULT nextval('public."Tax_Id_seq"'::regclass);


--
-- Name: User Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."User" ALTER COLUMN "Id" SET DEFAULT nextval('public."User_Id_seq"'::regclass);


--
-- Name: UserForgotPasswordRequest Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserForgotPasswordRequest" ALTER COLUMN "Id" SET DEFAULT nextval('public."UserForgotPasswordRequest_Id_seq"'::regclass);


--
-- Name: UserSession Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserSession" ALTER COLUMN "Id" SET DEFAULT nextval('public."UserSession_Id_seq"'::regclass);


--
-- Name: Warehouse Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Warehouse" ALTER COLUMN "Id" SET DEFAULT nextval('public."Warehouse_Id_seq"'::regclass);


--
-- Name: WarehouseStock Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WarehouseStock" ALTER COLUMN "Id" SET DEFAULT nextval('public."WarehouseStock_Id_seq"'::regclass);


--
-- Name: WholesalePrice Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WholesalePrice" ALTER COLUMN "Id" SET DEFAULT nextval('public."WholesalePrice_Id_seq"'::regclass);


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Admin" ("Id", "Username", "Password", "Email", "Token", "Image", "Name", "Birthdate", "PhoneNumber", "Address", "Gender", "RoleId", "CreatedAt", "DeletedAt") FROM stdin;
6	jejes	$2b$10$/hqRGL6voNgKOM9BKGqjLeb4rUKp7/aV.CsMvDBkZf5SsQche7B82	jeslynhamdayani17@gmail.com	\N	\N	Jeslyn Hamdayani Liwang Liwang	2025-07-15 00:00:00	081342922266	Jl. Rw. Belong No.4, RT.1/RW.9, Kb. Jeruk, Kec. Kb. Jeruk	Female	2	2025-07-04 16:03:05.844	2025-07-06 14:46:02.5
4	Andry	$2b$10$pr15z6Vqdt0eBrny.5jFx.Bhdsxyg6IBQGsj5zTptKjbUNZp7xR7e	Andry@sunway.com	\N	\N	\N	\N	\N	\N	\N	3	2025-06-24 14:29:00.258	\N
5	Rendy	$2b$10$pr15z6Vqdt0eBrny.5jFx.Bhdsxyg6IBQGsj5zTptKjbUNZp7xR7e	Rendy@sunway.com	\N	\N	\N	\N	\N	\N	\N	3	2025-06-24 14:29:00.261	\N
2	salessupport	$2b$10$m4.lvy1pTtXEt6QcFQ78wusRfQ/HXDSxGjzj06011meVfj01Zw4YG	salessupport@sunway.com	\N	\N	\N	\N	\N	\N	\N	2	2025-06-10 11:35:57.723	\N
3	Togar	$2b$10$pr15z6Vqdt0eBrny.5jFx.Bhdsxyg6IBQGsj5zTptKjbUNZp7xR7e	Togar@sunway.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbklkIjozLCJSb2xlIjoiU3VwZXJBZG1pbiIsIlJvbGVJZCI6MywiU2FsZXNJZCI6NSwiaWF0IjoxNzUyNzQxOTMzfQ.IBCaCBXXidWmg8FgaYoLGdNEt-xVgDE3e0VNbltUFAg	\N	\N	\N	\N	\N	\N	3	2025-06-24 14:29:00.252	\N
1	superadmin	$2b$10$pr15z6Vqdt0eBrny.5jFx.Bhdsxyg6IBQGsj5zTptKjbUNZp7xR7e	superadmin@sunway.com	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbklkIjoxLCJSb2xlIjoiU3VwZXJBZG1pbiIsIlJvbGVJZCI6MywiU2FsZXNJZCI6NCwiaWF0IjoxNzUyODMyNjQ5fQ.fgocJBCnGqlxhNTTP2pFzFUkfdntYK8Hw_wGKnje2u8	1.png	superadminnn	1998-01-01 00:00:00	08123456789	Jl. Mawar No. 7	Male	3	2025-06-10 11:35:57.714	\N
\.


--
-- Data for Name: AdminForgotPasswordRequest; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminForgotPasswordRequest" ("Id", "AdminId", "Token", "IsUsed", "ExpiresAt", "SenderEmail", "Status", "ErrorMessage", "CreatedAt", "EmailTemplateId") FROM stdin;
1	1	1de33f2c-d3f5-4b7e-807a-eb1897a66819	f	2025-07-02 14:35:09.831	ratatopesper@gmail.com	PENDING	\N	2025-07-02 13:35:09.842	1
2	1	430e8542-d919-4922-96ca-9f4ba747515d	t	2025-07-02 14:47:56.16	ratatopesper@gmail.com	SENT	\N	2025-07-02 13:47:56.169	1
\.


--
-- Data for Name: AdminNotification; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminNotification" ("Id", "AdminId", "Type", "Title", "Body", "Path", "IsRead", "CreatedAt", "SalesOrderId", "DeletedAt") FROM stdin;
1	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #11 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-17 09:10:57.676	11	\N
2	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #11 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-17 09:11:01.135	11	\N
3	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #11 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-17 09:11:03.966	11	\N
4	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #11 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-17 09:11:06.725	11	\N
6	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #12 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-18 10:58:18.293	12	\N
7	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #12 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-18 10:58:22.705	12	\N
8	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #12 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-18 10:58:26.458	12	\N
9	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #12 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-18 10:58:30.227	12	\N
11	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #13 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 10:17:21.864	13	\N
12	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #13 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 10:17:25.028	13	\N
13	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #13 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 10:17:27.972	13	\N
10	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #12 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-18 10:58:33.72	12	\N
14	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #13 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 10:17:30.512	13	\N
5	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #11 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-17 09:11:09.369	11	\N
15	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #13 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 10:17:33.323	13	\N
16	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #14 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:31:16.117	14	\N
17	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #14 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:31:19.931	14	\N
18	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #14 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:31:23.518	14	\N
19	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #14 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:31:26.927	14	\N
21	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #15 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:47:22.026	15	\N
22	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #15 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:47:25.404	15	\N
23	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #15 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:47:28.779	15	\N
24	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #15 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 14:47:31.982	15	\N
26	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #16 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:07:23.129	16	\N
27	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #16 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:07:26.38	16	\N
28	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #16 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:07:29.017	16	\N
29	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #16 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:07:31.779	16	\N
31	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #17 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:08:38.038	17	\N
32	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #17 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:08:40.604	17	\N
33	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #17 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:08:43.194	17	\N
34	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #17 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:08:45.743	17	\N
36	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #18 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:41:41.027	18	\N
37	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #18 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:41:44.325	18	\N
38	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #18 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:41:47.007	18	\N
39	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #18 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:41:49.594	18	\N
41	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #19 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:43:18.007	19	\N
42	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #19 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:43:20.565	19	\N
43	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #19 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:43:23.177	19	\N
44	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #19 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:43:25.759	19	\N
46	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #20 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:51:45.962	20	\N
47	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #20 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:51:50.106	20	\N
48	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #20 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:51:53.716	20	\N
49	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #20 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 15:51:57.251	20	\N
51	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #21 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:57:01.53	21	\N
52	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #21 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:57:05.182	21	\N
53	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #21 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:57:07.742	21	\N
54	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #21 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:57:10.533	21	\N
56	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #22 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:58:11.605	22	\N
57	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #22 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:58:14.263	22	\N
58	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #22 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:58:16.854	22	\N
59	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #22 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:58:19.428	22	\N
61	4	SALES_ORDER_NEW	Sales Order Baru	Sales Order #23 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:59:43.852	23	\N
62	5	SALES_ORDER_NEW	Sales Order Baru	Sales Order #23 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:59:46.527	23	\N
63	2	SALES_ORDER_NEW	Sales Order Baru	Sales Order #23 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:59:49.207	23	\N
64	3	SALES_ORDER_NEW	Sales Order Baru	Sales Order #23 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	f	2025-07-19 16:59:51.823	23	\N
20	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #14 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 14:31:30.305	14	\N
25	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #15 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 14:47:35.25	15	\N
30	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #16 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 15:07:35.284	16	\N
35	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #17 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 15:08:48.263	17	\N
40	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #18 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 15:41:52.263	18	\N
45	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #19 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 15:43:28.32	19	\N
50	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #20 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 15:52:00.668	20	\N
55	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #21 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 16:57:13.346	21	\N
60	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #22 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 16:58:21.994	22	\N
65	1	SALES_ORDER_NEW	Sales Order Baru	Sales Order #23 berhasil dibuat dari keranjang.	/listapprovalsalesorder/approvalsalesorder	t	2025-07-19 16:59:54.37	23	\N
\.


--
-- Data for Name: AdminRole; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminRole" ("Id", "Name", "Description") FROM stdin;
3	SuperAdmin	Super administrator full access
6	Sales	Sales
2	SalesSupport	Sales support limited access
5	InventoryManager	Manager inventory
\.


--
-- Data for Name: AdminSession; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminSession" ("Id", "AdminId", "LoginTime", "LogoutTime", "Device", "UserAgent") FROM stdin;
65	1	2025-06-24 14:46:04.166	2025-07-02 09:19:30.531	\N	\N
90	1	2025-07-02 11:51:52.545	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
67	1	2025-06-24 17:40:49.434	2025-07-02 09:19:30.531	\N	\N
68	1	2025-06-24 17:48:55.225	2025-07-02 09:19:30.531	\N	\N
69	1	2025-06-25 04:08:41.565	2025-07-02 09:19:30.531	\N	\N
70	1	2025-06-26 08:56:11.402	2025-07-02 09:19:30.531	\N	\N
71	1	2025-06-26 09:37:24.221	2025-07-02 09:19:30.531	\N	\N
72	1	2025-06-26 10:05:26.386	2025-07-02 09:19:30.531	\N	\N
73	1	2025-06-26 10:37:36.387	2025-07-02 09:19:30.531	\N	\N
74	1	2025-06-28 14:11:35.759	2025-07-02 09:19:30.531	\N	\N
75	1	2025-06-28 16:14:08.876	2025-07-02 09:19:30.531	\N	\N
76	1	2025-06-28 16:16:48.138	2025-07-02 09:19:30.531	\N	\N
77	1	2025-07-01 15:14:54.468	2025-07-02 09:19:30.531	\N	\N
78	1	2025-07-02 09:15:37.628	2025-07-02 09:19:30.531		\N
79	1	2025-07-02 09:16:00.055	2025-07-02 09:19:30.531		\N
80	1	2025-07-02 09:18:05.641	2025-07-02 09:19:30.531		\N
81	1	2025-07-02 09:19:40.523	2025-07-02 10:37:32.422	Windows | 10 | Chrome | 137.0.0.0	\N
82	1	2025-07-02 10:37:21.357	2025-07-02 10:37:32.422		PostmanRuntime/7.44.1
83	1	2025-07-02 10:37:48.451	2025-07-02 11:15:19.674	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
88	1	2025-07-02 11:46:03.712	2025-07-02 11:50:26.833	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
89	1	2025-07-02 11:50:15.689	2025-07-02 11:50:44.695	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
91	1	2025-07-02 11:59:17.254	2025-07-07 07:37:32.52		PostmanRuntime/7.44.1
92	1	2025-07-02 13:17:39.549	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
93	1	2025-07-02 13:37:26.094	2025-07-07 07:37:32.52		PostmanRuntime/7.44.1
94	1	2025-07-02 13:48:41.522	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
95	1	2025-07-02 15:02:36.743	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
96	1	2025-07-02 18:19:02.871	2025-07-07 07:37:32.52		PostmanRuntime/7.44.1
97	1	2025-07-03 05:53:17.954	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
98	1	2025-07-03 06:05:24.586	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
99	1	2025-07-03 06:12:36.774	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
100	1	2025-07-03 07:24:10.171	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
101	1	2025-07-04 15:41:06.89	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
102	1	2025-07-04 15:41:07.488	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
103	1	2025-07-04 15:49:29.805	2025-07-07 07:37:32.52	iOS | 18.5 | Mobile Safari | 18.5 | mobile | Apple	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1
104	1	2025-07-04 15:49:30.732	2025-07-07 07:37:32.52	iOS | 18.5 | Mobile Safari | 18.5 | mobile | Apple	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1
107	1	2025-07-05 18:06:46.877	2025-07-07 07:37:32.52		PostmanRuntime/7.44.1
109	1	2025-07-06 15:23:54.534	2025-07-07 07:37:32.52		PostmanRuntime/7.44.1
105	1	2025-07-04 15:53:46.11	2025-07-07 07:37:32.52	Windows | 10 | Edge | 138.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0
106	1	2025-07-05 17:59:41.067	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
108	1	2025-07-06 14:37:15.805	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
110	1	2025-07-07 07:20:52.943	2025-07-07 07:37:32.52	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
111	1	2025-07-07 07:37:53.606	2025-07-07 07:41:34.86	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
113	3	2025-07-17 08:45:33.721	\N	Windows | 10 | Chrome | 138.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
112	1	2025-07-07 07:41:44.999	2025-07-17 08:46:59.161	Windows | 10 | Chrome | 137.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36
114	1	2025-07-17 08:47:05.028	\N	Windows | 10 | Chrome | 138.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
115	1	2025-07-18 09:57:29.728	\N	Windows | 10 | Chrome | 138.0.0.0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Cart" ("Id", "UserId", "CreatedAt", "DeletedAt") FROM stdin;
12	10	2025-07-17 09:05:17.619	\N
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."CartItem" ("Id", "CartId", "ItemCodeId", "Quantity", "CreatedAt", "DeletedAt") FROM stdin;
14	12	1	2	2025-07-17 09:05:17.619	\N
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Dealer" ("Id", "CompanyName", "Region", "StoreCode", "Address", "PhoneNumber", fax, "PriceCategoryId", "CreatedAt", "DeletedAt") FROM stdin;
2	Fortune Mandiri - Berau	Kalimantan	#8002	\N	\N	\N	1	2025-07-04 15:58:08.99	\N
3	Fortune Mandiri - Samarinda	Kalimantan	#8001	\N	\N	\N	1	2025-07-04 16:05:18.77	\N
1	Gala Jaya - Pontianak	Sulawesi	#8003	\N	\N	\N	3	2025-06-19 06:29:28.69	\N
\.


--
-- Data for Name: DealerWarehouse; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."DealerWarehouse" ("Id", "DealerId", "WarehouseId", "Priority") FROM stdin;
4	1	3	0
3	1	2	1
2	1	1	2
\.


--
-- Data for Name: EmailConfig; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailConfig" ("Id", "Email", "Password", "Host", "Port", "Secure", "IsActive", "CreatedAt", "UpdatedAt", "DeletedAt") FROM stdin;
1	ratatopesper@gmail.com	vgiucsyfkicjosfi	smtp.gmail.com	587	f	t	2025-06-26 10:50:13.888	2025-06-26 10:50:13.888	\N
2	steven@sunway.com.my	password-email	smtp.gmail.com	465	t	t	2025-06-28 13:23:50.105	2025-07-20 18:27:17.917	\N
\.


--
-- Data for Name: EmailSalesOrder; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailSalesOrder" ("Id", "SalesOrderId", "SenderEmail", "RecipientEmail", "Subject", "Body", "Status", "CreatedAt", "UpdatedAt", "DeletedAt", "ApprovedAt", "EmailTemplateId") FROM stdin;
1	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/26/JUN/2025	\n  Nomor Sales Order: SS-01/101/26/JUN/2025\n  Tanggal Order: 5/26/2025\n  Nama Pelanggan: CV Maju Abadi\n  Sales Representative: superadmin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	SENT	2025-06-26 10:50:44.839	\N	\N	2025-06-26 10:50:44.836	\N
2	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/26/JUN/2025	\n  Nomor Sales Order: SS-01/101/26/JUN/2025\n  Tanggal Order: 5/26/2025\n  Nama Pelanggan: CV Maju Abadi\n  Sales Representative: superadmin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	SENT	2025-06-26 11:03:21.627	\N	\N	2025-06-26 11:03:21.626	\N
3	1	\N	dagonzaalfredo@gmail.com	sales order	superadminCV Maju AbadiSS-01/101/28/JUN/20255/26/2025	SENT	2025-06-28 10:47:53.052	\N	\N	2025-06-28 10:47:53.05	2
4	1	\N	dagonzaalfredo@gmail.com	sales order	Nomor Sales Order: <br>\nTanggal Order: <br>\nNama Pelanggan: <br>\nSales Representative: <br>\nNomor DO: <br>\nNomor Sales Order JDE: <br>\n<br>\nPT. SUNWAY TREK MASINDO<br>\nJl. Kosambi Timur No.47<br>\nKomplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n15211 Dadap – Tangerang, Indonesia<br>\n<br>\n📞 Tel: +62 55955445<br>\n📠 Fax: +62 55963153<br>\n📱 Mobile: +62 81398388788<br>\n✉️ Email: steven@sunway.com.my<br>\n🌐 Web: www.sunway.com.sg<br>\n<br>\n⚠️ This is an auto-generated e-mail<br>\nThe information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n<br>\nThis information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n<br>\nFor more information about Sunway Group, please visit:<br>\n🌍 www.sunway.com.my<br>\n<br>\nSunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n<br>\nWe espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n<br>\n<a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n&nbsp;|&nbsp;\n<a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n	SENT	2025-06-28 12:15:48.467	\N	\N	2025-06-28 12:15:48.465	2
5	1	\N	dagonzaalfredo@gmail.com	sales order	Nomor Sales Order: SS-01/101/28/JUN/2025\nTanggal Order: 5/26/2025\nNama Pelanggan: CV Maju Abadi\nSales Representative: superadmin\nNomor Sales Order JDE: -\n\nPT. SUNWAY TREK MASINDO\nJl. Kosambi Timur No.47\nKomplek Pergudangan Sentra Kosambi Blok H1 No.A\n15211 Dadap – Tangerang, Indonesia\n\n📞 Tel: +62 55955445\n📠 Fax: +62 55963153\n📱 Mobile: +62 81398388788\n✉️ Email: steven@sunway.com.my\n🌐 Web: www.sunway.com.sg\n\n⚠️ This is an auto-generated e-mail\nThe information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n\nThis information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n\nFor more information about Sunway Group, please visit:\n\n🌍 www.sunway.com.my\n\nSunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n\nWe espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n\n<a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n&nbsp;|&nbsp;\n<a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n	SENT	2025-06-28 12:33:41.807	\N	\N	2025-06-28 12:33:41.805	2
6	1	\N	dagonzaalfredo@gmail.com	sales order	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>\n	SENT	2025-06-28 12:44:59.684	\N	\N	2025-06-28 12:44:59.683	2
115	20	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2019/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:51:46.032	\N	\N	\N	\N
7	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 13:49:47.611	\N	\N	2025-06-28 13:49:47.609	2
8	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 14:22:31.594	\N	\N	2025-06-28 14:22:31.593	2
9	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 14:26:00.576	\N	\N	2025-06-28 14:26:00.573	2
10	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:05:18.881	\N	\N	2025-06-28 15:05:18.88	2
116	20	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2019/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:51:50.113	\N	\N	\N	\N
117	20	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2019/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:51:53.724	\N	\N	\N	\N
11	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:13:25.921	\N	\N	2025-06-28 15:13:25.92	2
12	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:14:21.497	\N	\N	2025-06-28 15:14:21.495	2
13	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:44:12.929	\N	\N	2025-06-28 15:44:12.927	2
14	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:46:48.512	\N	\N	2025-06-28 15:46:48.511	2
118	20	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2019/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:51:57.257	\N	\N	\N	\N
119	20	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2019/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:52:00.675	\N	\N	\N	\N
15	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:53:03.834	\N	\N	2025-06-28 15:53:03.833	2
16	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 15:59:06.023	\N	\N	2025-06-28 15:59:06.021	2
17	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 16:01:02.896	\N	\N	2025-06-28 16:01:02.895	2
18	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 16:04:32.002	\N	\N	2025-06-28 16:04:32	2
120	21	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2119/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:57:01.539	\N	\N	\N	\N
121	21	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2119/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:57:05.189	\N	\N	\N	\N
19	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 16:14:27.93	\N	\N	2025-06-28 16:14:27.929	2
20	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 16:17:18.985	\N	\N	2025-06-28 16:17:18.983	2
21	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 16:24:15.884	\N	\N	2025-06-28 16:24:15.883	2
22	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/28/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/28/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 16:33:27.886	\N	\N	2025-06-28 16:33:27.885	2
122	21	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2119/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:57:07.759	\N	\N	\N	\N
123	21	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2119/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:57:10.545	\N	\N	\N	\N
23	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/29/JUN/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/29/JUN/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadmin<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-06-28 17:29:01.771	\N	\N	2025-06-28 17:29:01.769	2
24	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-02 17:56:30.645	\N	\N	2025-07-02 17:56:30.643	2
25	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 05:53:45.226	\N	\N	2025-07-03 05:53:45.225	2
26	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 06:00:04.463	\N	\N	2025-07-03 06:00:04.462	2
124	21	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2119/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:57:13.4	\N	\N	\N	\N
125	22	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2219/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:58:11.616	\N	\N	\N	\N
27	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 06:05:55.629	\N	\N	2025-07-03 06:05:55.628	2
28	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 06:12:53.565	\N	\N	2025-07-03 06:12:53.563	2
29	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 06:29:20.254	\N	\N	2025-07-03 06:29:20.253	2
30	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 06:37:56.726	\N	\N	2025-07-03 06:37:56.724	2
126	22	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2219/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:58:14.269	\N	\N	\N	\N
127	22	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2219/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:58:16.861	\N	\N	\N	\N
31	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 06:43:56.019	\N	\N	2025-07-03 06:43:56.018	2
32	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 07:01:20.238	\N	\N	2025-07-03 07:01:20.237	2
33	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 07:09:58.311	\N	\N	2025-07-03 07:09:58.31	2
34	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 07:24:51.665	\N	\N	2025-07-03 07:24:51.664	2
128	22	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2219/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:58:19.436	\N	\N	\N	\N
129	22	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2219/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:58:22.002	\N	\N	\N	\N
35	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 07:31:28.524	\N	\N	2025-07-03 07:31:28.522	2
36	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 07:44:18.443	\N	\N	2025-07-03 07:44:18.441	2
37	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/03/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/03/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-03 07:47:37.568	\N	\N	2025-07-03 07:47:37.567	2
38	1	\N	jeslynhamdayani17@gmail.com	[SALES ORDER] - SS-01/101/04/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/04/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-04 15:55:01.181	\N	\N	2025-07-04 15:55:01.18	2
130	23	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:59:43.859	\N	\N	\N	\N
131	23	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:59:46.533	\N	\N	\N	\N
39	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/04/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/04/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/26/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-04 15:55:02.076	\N	\N	2025-07-04 15:55:02.075	2
40	3	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/06/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/06/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/6/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-06 16:14:08.702	\N	\N	2025-07-06 16:14:08.7	2
41	3	\N	jeslynhamdayani17@gmail.com	[SALES ORDER] - SS-01/101/06/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/06/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/6/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-06 16:14:08.794	\N	\N	2025-07-06 16:14:08.792	2
42	9	\N	jeslynhamdayani17@gmail.com	[SALES ORDER] - SS-01/101/07/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/07/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/7/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 07:26:38.831	\N	\N	2025-07-07 07:26:38.829	2
132	23	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:59:49.213	\N	\N	\N	\N
133	23	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:59:51.829	\N	\N	\N	\N
43	9	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/07/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/07/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/7/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 07:26:40.103	\N	\N	2025-07-07 07:26:40.102	2
44	10	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/07/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/07/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/7/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 07:33:58.132	\N	\N	2025-07-07 07:33:58.131	2
45	10	\N	jeslynhamdayani17@gmail.com	[SALES ORDER] - SS-02/101/07/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/101/07/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/7/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 07:33:58.966	\N	\N	2025-07-07 07:33:58.965	2
46	2	\N	jeslynhamdayani17@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 18:35:33.733	\N	\N	2025-07-07 18:35:33.732	2
134	23	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn2319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 16:59:54.376	\N	\N	\N	\N
47	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 18:35:34.207	\N	\N	2025-07-07 18:35:34.205	2
48	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 18:36:26.268	\N	\N	2025-07-07 18:36:26.267	2
49	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 18:49:45.254	\N	\N	2025-07-07 18:49:45.251	2
50	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 18:52:22.318	\N	\N	2025-07-07 18:52:22.316	2
51	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 19:05:41.653	\N	\N	2025-07-07 19:05:41.651	2
52	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 19:15:05.671	\N	\N	2025-07-07 19:15:05.667	2
53	2	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/101/08/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/3/2025<br>\n  <b>Nama Pelanggan:</b> CV Maju Abadi<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-07 19:16:51.18	\N	\N	2025-07-07 19:16:51.179	2
54	11	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1117/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-17 09:10:57.719	\N	\N	\N	\N
55	11	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1117/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-17 09:11:01.142	\N	\N	\N	\N
56	11	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1117/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-17 09:11:03.973	\N	\N	\N	\N
57	11	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1117/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-17 09:11:06.738	\N	\N	\N	\N
58	11	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1117/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-17 09:11:09.376	\N	\N	\N	\N
59	12	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1218/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-18 10:58:18.307	\N	\N	\N	\N
60	12	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1218/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-18 10:58:22.712	\N	\N	\N	\N
61	12	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1218/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-18 10:58:26.465	\N	\N	\N	\N
62	12	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1218/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-18 10:58:30.234	\N	\N	\N	\N
63	12	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1218/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-18 10:58:33.727	\N	\N	\N	\N
64	12	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/18/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/18/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/18/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-18 11:00:55.453	\N	\N	2025-07-18 11:00:55.451	2
65	12	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/18/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/18/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/18/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-18 11:02:35.886	\N	\N	2025-07-18 11:02:35.882	2
66	13	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 10:17:21.874	\N	\N	\N	\N
67	13	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 10:17:25.06	\N	\N	\N	\N
68	13	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 10:17:27.979	\N	\N	\N	\N
69	13	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 10:17:30.523	\N	\N	\N	\N
70	13	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1319/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 10:17:33.422	\N	\N	\N	\N
71	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 10:18:50.123	\N	\N	2025-07-19 10:18:50.121	2
72	11	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/17/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 10:50:44.678	\N	\N	2025-07-19 10:50:44.676	2
73	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/25/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:01:19.842	\N	\N	2025-07-19 11:01:19.84	2
74	1	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 5/25/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:02:00.193	\N	\N	2025-07-19 11:02:00.191	2
75	12	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/18/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:04:35.672	\N	\N	2025-07-19 11:04:35.67	2
76	11	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/17/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:53:04.314	\N	\N	2025-07-19 11:53:04.312	2
77	8	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-02/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/5/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:53:25.803	\N	\N	2025-07-19 11:53:25.801	2
78	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:54:43.71	\N	\N	2025-07-19 11:54:43.708	2
79	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 11:56:14.651	\N	\N	2025-07-19 11:56:14.649	2
80	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 12:00:10.301	\N	\N	2025-07-19 12:00:10.296	2
81	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 12:26:56.915	\N	\N	2025-07-19 12:26:56.913	2
82	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 12:29:39.853	\N	\N	2025-07-19 12:29:39.851	2
83	13	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 12:30:32.061	\N	\N	2025-07-19 12:30:32.059	2
84	14	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1419/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:31:16.138	\N	\N	\N	\N
85	14	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1419/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:31:19.939	\N	\N	\N	\N
86	14	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1419/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:31:23.529	\N	\N	\N	\N
87	14	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1419/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:31:26.94	\N	\N	\N	\N
88	14	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1419/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:31:30.312	\N	\N	\N	\N
89	14	\N	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/#8003/19/JUL/2025	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> SS-01/#8003/19/JUL/2025<br>\n  <b>Tanggal Order:</b> 7/19/2025<br>\n  <b>Nama Pelanggan:</b> Gala Jaya - Pontianak<br>\n  <b>Sales Representative:</b> superadminnn<br>\n  <b>Nomor Sales Order JDE:</b> -<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	SENT	2025-07-19 14:32:45.871	\N	\N	2025-07-19 14:32:45.869	2
90	15	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1519/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:47:22.038	\N	\N	\N	\N
91	15	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1519/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:47:25.41	\N	\N	\N	\N
92	15	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1519/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:47:28.787	\N	\N	\N	\N
93	15	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1519/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:47:31.988	\N	\N	\N	\N
94	15	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1519/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 14:47:35.273	\N	\N	\N	\N
95	16	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1619/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:07:23.138	\N	\N	\N	\N
96	16	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1619/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:07:26.403	\N	\N	\N	\N
97	16	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1619/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:07:29.025	\N	\N	\N	\N
98	16	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1619/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:07:31.79	\N	\N	\N	\N
99	16	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1619/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:07:35.292	\N	\N	\N	\N
100	17	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1719/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:08:38.045	\N	\N	\N	\N
101	17	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1719/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:08:40.61	\N	\N	\N	\N
102	17	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1719/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:08:43.206	\N	\N	\N	\N
103	17	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1719/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:08:45.75	\N	\N	\N	\N
104	17	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1719/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:08:48.295	\N	\N	\N	\N
105	18	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1819/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:41:41.062	\N	\N	\N	\N
106	18	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1819/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:41:44.333	\N	\N	\N	\N
107	18	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1819/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:41:47.015	\N	\N	\N	\N
108	18	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1819/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:41:49.635	\N	\N	\N	\N
109	18	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1819/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:41:52.273	\N	\N	\N	\N
110	19	ratatopesper@gmail.com	Andry@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1919/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:43:18.017	\N	\N	\N	\N
111	19	ratatopesper@gmail.com	Rendy@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1919/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:43:20.571	\N	\N	\N	\N
112	19	ratatopesper@gmail.com	salessupport@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1919/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:43:23.183	\N	\N	\N	\N
113	19	ratatopesper@gmail.com	Togar@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1919/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:43:25.767	\N	\N	\N	\N
114	19	ratatopesper@gmail.com	superadmin@sunway.com	admin notification	Gala Jaya - Pontianaksuperadminnn1919/7/2025http://sunflexstoreindonesia.com/listapprovalsalesorder/approvalsalesorder	SENT	2025-07-19 15:43:28.326	\N	\N	\N	\N
\.


--
-- Data for Name: EmailSalesOrderRecipient; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailSalesOrderRecipient" ("Id", "SalesId", "RecipientEmail", "CreatedAt", "DeletedAt") FROM stdin;
1	4	dagonzaalfredo@gmail.com	2025-06-26 10:17:21.448	\N
\.


--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailTemplate" ("Id", "Name", "Subject", "Body", "CreatedAt", "TemplateType", "UpdatedAt", "DeletedAt") FROM stdin;
1	forgot password admin	forgot password	hai {{user}} berikut linknya {{link}}	2025-06-19 06:15:01.631	FORGOT_PASSWORD_ADMIN	\N	\N
3	forgot password user	forgot password user	{{user}}{{link}}	2025-07-02 13:18:43.247	FORGOT_PASSWORD_USER	\N	\N
4	admin notification	admin notification	{{dealer}}{{sales}}{{sales_order_number}}{{created_date}}{{path}}	2025-07-17 09:05:57.755	ADMIN_NOTIFICATION_SALESORDER	\N	\N
2	SALES_ORDER_DEFAULT	[SALES ORDER] - {{sales_order_number}}	<div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">\n  <b>Nomor Sales Order:</b> {{sales_order_number}}<br>\n  <b>Tanggal Order:</b> {{created_date}}<br>\n  <b>Nama Pelanggan:</b> {{dealer}}<br>\n  <b>Sales Representative:</b> {{sales}}<br>\n  <b>Nomor Sales Order JDE:</b> {{JDE}}<br>\n  <br>\n  <b>PT. SUNWAY TREK MASINDO</b><br>\n  Jl. Kosambi Timur No.47<br>\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A<br>\n  15211 Dadap – Tangerang, Indonesia<br>\n  <br>\n  📞 Tel: +62 55955445<br>\n  📠 Fax: +62 55963153<br>\n  📱 Mobile: +62 81398388788<br>\n  ✉️ Email: steven@sunway.com.my<br>\n  🌐 Web: <a href="https://www.sunway.com.sg" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.sg</a><br>\n  <br>\n  <span style="color:#b11;">⚠️ This is an auto-generated e-mail</span><br>\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.<br>\n  <br>\n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.<br>\n  <br>\n  For more information about Sunway Group, please visit:<br>\n  🌍 <a href="https://www.sunway.com.my" target="_blank" style="color:#2a5db0;text-decoration:underline;">www.sunway.com.my</a><br>\n  <br>\n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.<br>\n  <br>\n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.<br>\n  <br>\n  <a href="https://www.sunway.com.my/investor-relations/corporate-governance/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway Group Policy</a>\n  &nbsp;|&nbsp;\n  <a href="https://www.sunwayreit.com/investor-relations/ir-home/" target="_blank" style="color:#2a5db0;text-decoration:underline;">🔗 Sunway REIT Policy</a>\n</div>	2025-06-28 10:18:02.978	SALES_ORDER	\N	\N
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Event" (id, name, "dateStart", "dateEnd", "createdAt", "deletedAt", description) FROM stdin;
\.


--
-- Data for Name: EventImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EventImage" (id, image, "eventId", "createdAt", "deletedAt") FROM stdin;
\.


--
-- Data for Name: ItemCode; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ItemCode" ("Id", "CreatedAt", "DeletedAt", "Name", "BrandCodeId", "OEM", "Weight", "AllowItemCodeSelection", "MinOrderQuantity", "QtyPO", "OrderStep", "PartNumberId") FROM stdin;
96	2025-07-05 11:17:59.479	\N	R15B-20-SF-TX	\N	\N	\N	f	\N	0	\N	683
77	2025-07-05 11:17:57.641	\N	AH600-0200	\N	\N	\N	f	\N	0	\N	69
93	2025-07-05 11:17:59.44	\N	R13B-20-SF-S	\N	\N	\N	f	\N	0	\N	455
100	2025-07-05 11:17:59.743	\N	R3-12	\N	\N	\N	f	\N	0	\N	536
78	2025-07-05 11:17:57.657	\N	AH600-0250	\N	\N	\N	f	\N	0	\N	70
101	2025-07-05 11:17:59.751	\N	R3-12-SF-JD	\N	\N	\N	f	\N	0	\N	536
79	2025-07-05 11:17:57.665	\N	AH600-0300	\N	\N	\N	f	\N	0	\N	71
57	2025-07-05 11:17:57.444	\N	AH300-0125-BK-F	\N	\N	\N	f	\N	0	\N	\N
48	2025-07-05 11:17:56.426	\N	352-04-SF	\N	\N	\N	f	\N	0	\N	494
49	2025-07-05 11:17:56.646	\N	352-06-SF	\N	\N	\N	f	\N	0	\N	495
50	2025-07-05 11:17:56.659	\N	352-08-SF	\N	\N	\N	f	\N	0	\N	496
94	2025-07-05 11:17:59.447	\N	R13B-24-SF-S	\N	\N	\N	f	\N	0	\N	456
51	2025-07-05 11:17:56.771	\N	4SHB-12-SF-TX	\N	\N	\N	f	\N	0	\N	581
1	2025-06-12 18:19:48.152	\N	AH300-0025-BK	\N		500	f	0	0	0	615
80	2025-07-05 11:17:57.68	\N	AH600-0300-BK	\N	\N	\N	f	\N	0	\N	71
40	2025-07-01 07:40:39.002	\N	AH300-0025-BK-SJ	\N		\N	t	0	0	0	615
34	2025-06-25 06:27:18.175	\N	AH300-0031-BK	\N		\N	f	\N	0	\N	616
35	2025-06-25 06:27:39.61	\N	AH300-0038-BK	\N		\N	f	\N	0	\N	617
81	2025-07-05 11:17:57.695	\N	AH600-0400	\N	\N	\N	f	\N	0	\N	72
42	2025-07-01 07:52:47.332	\N	AH300-0038-BK-SJ	\N		\N	f	0	0	0	617
39	2025-06-25 06:28:51.743	2025-07-02 15:12:43.429	AH300-0100-BK	\N		\N	f	\N	0	\N	\N
36	2025-06-25 06:28:01.26	\N	AH300-0050-BK	\N		\N	f	\N	0	\N	618
43	2025-07-05 08:11:35.817	\N	AH300-0050-BK-J	\N	\N	\N	f	\N	0	\N	618
44	2025-07-05 08:11:35.829	\N	AH300-0050-BK-SJ	\N	\N	\N	f	\N	0	\N	618
45	2025-07-05 08:11:35.849	\N	AH300-0050-YW-SJ	\N	\N	\N	f	\N	0	\N	618
37	2025-06-25 06:28:18.273	\N	AH300-0063-BK	\N		\N	f	\N	0	\N	619
38	2025-06-25 06:28:36.204	\N	AH300-0075-BK	\N		\N	f	\N	0	\N	620
41	2025-07-01 07:50:06.379	\N	AH300-0031-BK-SJ	\N		\N	f	\N	\N	\N	\N
47	2025-07-05 08:11:35.888	\N	AH300-0075-YW	\N	\N	\N	f	\N	0	\N	620
95	2025-07-05 11:17:59.455	\N	R13B-32-SF-S	\N	\N	\N	f	\N	0	\N	457
84	2025-07-05 11:17:57.888	2025-07-05 15:51:04.674	AR19-SF	\N	\N	\N	f	\N	0	\N	\N
85	2025-07-05 11:17:58.297	\N	CLWB113-08	\N	\N	\N	f	\N	0	\N	473
86	2025-07-05 11:17:58.304	\N	CLWB119-12	\N	\N	\N	f	\N	0	\N	474
87	2025-07-05 11:17:58.311	\N	CLWB125-16	\N	\N	\N	f	\N	0	\N	475
92	2025-07-05 11:17:59.433	\N	R13B-16-SF-S	\N	\N	\N	f	\N	0	\N	454
83	2025-07-05 11:17:57.879	2025-07-05 15:51:10.283	AR12-SF	\N	\N	\N	f	\N	0	\N	\N
46	2025-07-05 08:11:35.873	\N	AH300-0075-BK-SJ	\N	\N	\N	f	\N	0	\N	620
73	2025-07-05 11:17:57.605	\N	AH600-0075	\N	\N	\N	f	\N	0	\N	65
98	2025-07-05 11:17:59.729	\N	R3-04	\N	\N	\N	f	\N	0	\N	531
102	2025-07-05 11:17:59.764	\N	R5-08	\N	\N	\N	f	\N	0	\N	544
99	2025-07-05 11:17:59.737	\N	R3-08	\N	\N	\N	f	\N	0	\N	534
103	2025-07-05 11:17:59.776	\N	R5-16	\N	\N	\N	f	\N	0	\N	547
104	2025-07-05 11:17:59.783	\N	R5-20	\N	\N	\N	f	\N	0	\N	548
105	2025-07-05 11:17:59.79	\N	R5-24	\N	\N	\N	f	\N	0	\N	549
74	2025-07-05 11:17:57.613	\N	AH600-0100	\N	\N	\N	f	\N	0	\N	66
75	2025-07-05 11:17:57.62	\N	AH600-0125-L	\N	\N	\N	f	\N	0	\N	67
76	2025-07-05 11:17:57.627	\N	AH600-0150	\N	\N	\N	f	\N	0	\N	68
118	2025-07-05 11:17:59.892	\N	R8-04-SF-PP	\N	\N	\N	f	\N	0	\N	519
119	2025-07-05 11:17:59.898	\N	R8-06-SF-PP	\N	\N	\N	f	\N	0	\N	520
120	2025-07-05 11:17:59.904	\N	R8-12-SF-PP	\N	\N	\N	f	\N	0	\N	522
88	2025-07-05 11:17:58.327	\N	CONTRACTOR-0600X3M	\N	\N	\N	f	\N	0	\N	61
89	2025-07-05 11:17:58.334	\N	CONTRACTOR-0600X3M ASSY	\N	\N	\N	f	\N	0	\N	61
90	2025-07-05 11:17:58.341	\N	CONTRACTOR-0600X6M	\N	\N	\N	f	\N	0	\N	61
106	2025-07-05 11:17:59.797	\N	R5-32	\N	\N	\N	f	\N	0	\N	550
91	2025-07-05 11:17:58.349	\N	CONTRACTOR-0800X3M ASSY	\N	\N	\N	f	\N	0	\N	62
107	2025-07-05 11:17:59.804	\N	R5-40	\N	\N	\N	f	\N	0	\N	551
108	2025-07-05 11:17:59.812	\N	R6-05-SF-JD	\N	\N	\N	f	\N	0	\N	553
113	2025-07-05 11:17:59.848	\N	R6-10-SF-JD	\N	\N	\N	f	\N	0	\N	556
109	2025-07-05 11:17:59.82	\N	R6-06-SF-JD	\N	\N	\N	f	\N	0	\N	554
110	2025-07-05 11:17:59.826	\N	R6-08	\N	\N	\N	f	\N	0	\N	555
111	2025-07-05 11:17:59.832	\N	R6-08-S	\N	\N	\N	f	\N	0	\N	555
112	2025-07-05 11:17:59.842	\N	R6-08-SF-JD	\N	\N	\N	f	\N	0	\N	555
114	2025-07-05 11:17:59.855	\N	R6-12	\N	\N	\N	f	\N	0	\N	557
115	2025-07-05 11:17:59.87	\N	R7-04-SF-PP	\N	\N	\N	f	\N	0	\N	488
116	2025-07-05 11:17:59.877	\N	R7-06-SF-PP	\N	\N	\N	f	\N	0	\N	489
117	2025-07-05 11:17:59.883	\N	R7-12-SF-PP	\N	\N	\N	f	\N	0	\N	492
97	2025-07-05 11:17:59.492	\N	R15B-24-SF-TX	\N	\N	\N	f	\N	0	\N	684
56	2025-07-05 11:17:57.437	\N	AH300-0125-BK	\N	\N	\N	f	\N	305	\N	\N
58	2025-07-05 11:17:57.459	\N	AH300-0125-BK-SP	\N	\N	\N	f	\N	0	\N	\N
59	2025-07-05 11:17:57.468	\N	AH300-0150-BK	\N	\N	\N	f	\N	0	\N	\N
61	2025-07-05 11:17:57.485	\N	AH300-0150-BK-SP	\N	\N	\N	f	\N	0	\N	\N
62	2025-07-05 11:17:57.496	\N	AH300-0150-YW	\N	\N	\N	f	\N	0	\N	\N
63	2025-07-05 11:17:57.506	\N	AH300-0200-BK	\N	\N	\N	f	\N	0	\N	\N
64	2025-07-05 11:17:57.513	\N	AH300-0200-BK-F	\N	\N	\N	f	\N	0	\N	\N
179	2025-07-05 16:32:33.535	\N	R2T-24-SF-JD	\N	\N	\N	f	\N	0	\N	677
140	2025-07-05 16:32:29.427	\N	4SHB-16-SF-QX	\N	\N	\N	f	\N	0	\N	696
141	2025-07-05 16:32:29.448	\N	4SHB-16-SF-S	\N	\N	\N	f	\N	0	\N	696
170	2025-07-05 16:32:33.385	\N	R2T-16-D	\N	\N	\N	f	\N	0	\N	675
142	2025-07-05 16:32:29.468	\N	4SHB-20-SF-QX	\N	\N	\N	f	\N	0	\N	697
143	2025-07-05 16:32:29.494	\N	4SHB-20-SF-S	\N	\N	\N	f	\N	0	\N	697
160	2025-07-05 16:32:33.181	\N	R2T-06-SF-JD	\N	\N	\N	f	\N	0	\N	671
144	2025-07-05 16:32:29.531	\N	4SHB-24-SF-QX	\N	\N	\N	f	\N	0	\N	698
145	2025-07-05 16:32:29.548	\N	4SHB-24-SF-S	\N	\N	\N	f	\N	0	\N	698
180	2025-07-05 16:32:33.55	\N	R2T-24-SF-JX	\N	\N	\N	f	\N	0	\N	677
65	2025-07-05 11:17:57.523	\N	AH300-0200-BK-SP	\N	\N	\N	f	\N	0	\N	\N
66	2025-07-05 11:17:57.544	\N	AH300-0200-YW-F	\N	\N	\N	f	\N	0	\N	\N
67	2025-07-05 11:17:57.552	\N	AH300-0200-YW-SP	\N	\N	\N	f	\N	0	\N	\N
68	2025-07-05 11:17:57.559	\N	AH300-0200-YW-SP-L	\N	\N	\N	f	\N	0	\N	\N
69	2025-07-05 11:17:57.567	\N	AH300-0300-BK	\N	\N	\N	f	\N	0	\N	\N
60	2025-07-05 11:17:57.478	\N	AH300-0150-BK-F	\N	\N	\N	f	\N	0	\N	\N
70	2025-07-05 11:17:57.58	\N	AH300-0300-BK-F	\N	\N	\N	f	\N	0	\N	\N
159	2025-07-05 16:32:33.167	\N	R2T-06-D2	\N	\N	\N	f	\N	0	\N	671
121	2025-07-05 11:17:59.92	\N	R9R-06-SF-TX	\N	\N	\N	f	\N	0	\N	687
122	2025-07-05 11:17:59.94	\N	R9R-08-SF-TX	\N	\N	\N	f	\N	0	\N	688
123	2025-07-05 11:17:59.959	\N	R9R-10-SF-TX	\N	\N	\N	f	\N	0	\N	689
82	2025-07-05 11:17:57.703	\N	AH600-0400-Y	\N	\N	\N	f	\N	305	\N	72
71	2025-07-05 11:17:57.587	\N	AH300-0400-BK	\N	\N	\N	f	\N	0	\N	\N
72	2025-07-05 11:17:57.593	\N	AH300-0400-BK-F	\N	\N	\N	f	\N	0	\N	\N
52	2025-07-05 11:17:56.804	\N	4SHB-16-SF-TX	\N	\N	\N	f	\N	0	\N	582
53	2025-07-05 11:17:56.835	\N	4SHB-20-SF-TX	\N	\N	\N	f	\N	0	\N	583
54	2025-07-05 11:17:56.867	\N	4SHB-24-SF-TX	\N	\N	\N	f	\N	0	\N	584
55	2025-07-05 11:17:56.891	\N	4SHB-32-SF-TX	\N	\N	\N	f	\N	0	\N	585
147	2025-07-05 16:32:29.581	\N	4SHB-32-SF-S	\N	\N	\N	f	\N	0	\N	699
132	2025-07-05 11:29:47.547	\N	AH300-0100-BK	\N	\N	\N	f	\N	0	\N	621
161	2025-07-05 16:32:33.209	\N	R2T-06-SF-JX	\N	\N	\N	f	\N	0	\N	671
126	2025-07-05 11:18:01.924	\N	TWK-04	\N	\N	\N	f	\N	0	\N	498
127	2025-07-05 11:18:01.932	\N	TWK-05	\N	\N	\N	f	\N	0	\N	499
128	2025-07-05 11:18:01.946	\N	TWK-07	\N	\N	\N	f	\N	0	\N	501
129	2025-07-05 11:18:01.959	\N	TWK-10	\N	\N	\N	f	\N	0	\N	503
130	2025-07-05 11:18:01.976	\N	TWK-14	\N	\N	\N	f	\N	0	\N	505
131	2025-07-05 11:18:01.982	\N	TWK-18	\N	\N	\N	f	\N	0	\N	507
171	2025-07-05 16:32:33.411	\N	R2T-16-SF-JD	\N	\N	\N	f	\N	0	\N	675
162	2025-07-05 16:32:33.249	\N	R2T-06-SF-S	\N	\N	\N	f	\N	0	\N	671
133	2025-07-05 11:29:47.567	\N	AH300-0100-BK-SJ	\N	\N	\N	f	\N	0	\N	621
134	2025-07-05 12:06:33.229	\N	AH600-0200-Y	\N	\N	\N	f	\N	610	\N	69
135	2025-07-05 12:06:33.25	\N	AH600-0300-Y	\N	\N	\N	f	\N	305	\N	71
195	2025-07-05 16:32:33.964	\N	R9R-16-SF-JX	\N	\N	\N	f	\N	0	\N	691
151	2025-07-05 16:32:33.02	\N	R2T-04-D	\N	\N	\N	f	\N	0	\N	669
136	2025-07-05 16:32:29.318	\N	4SHB-12-D	\N	\N	\N	f	\N	0	\N	695
152	2025-07-05 16:32:33.042	\N	R2T-04-D2	\N	\N	\N	f	\N	0	\N	669
137	2025-07-05 16:32:29.348	\N	4SHB-12-SF-QX	\N	\N	\N	f	\N	0	\N	695
163	2025-07-05 16:32:33.265	\N	R2T-08-D	\N	\N	\N	f	\N	0	\N	672
153	2025-07-05 16:32:33.059	\N	R2T-04-D-DEF	\N	\N	\N	f	\N	0	\N	669
139	2025-07-05 16:32:29.402	\N	4SHB-16-D	\N	\N	\N	f	\N	0	\N	696
172	2025-07-05 16:32:33.438	\N	R2T-16-SF-JX	\N	\N	\N	f	\N	0	\N	675
181	2025-07-05 16:32:33.558	\N	R2T-24-SF-S	\N	\N	\N	f	\N	0	\N	677
154	2025-07-05 16:32:33.083	\N	R2T-04-SF-JD	\N	\N	\N	f	\N	0	\N	669
155	2025-07-05 16:32:33.112	\N	R2T-04-SF-JX	\N	\N	\N	f	\N	0	\N	669
164	2025-07-05 16:32:33.281	\N	R2T-08-SF-JD	\N	\N	\N	f	\N	0	\N	672
156	2025-07-05 16:32:33.121	\N	R2T-04-SF-S	\N	\N	\N	f	\N	0	\N	669
157	2025-07-05 16:32:33.136	\N	R2T-05-SF-JD	\N	\N	\N	f	\N	0	\N	670
158	2025-07-05 16:32:33.146	\N	R2T-06-D	\N	\N	\N	f	\N	0	\N	671
165	2025-07-05 16:32:33.309	\N	R2T-08-SF-JX	\N	\N	\N	f	\N	0	\N	672
166	2025-07-05 16:32:33.323	\N	R2T-10-SF-JD	\N	\N	\N	f	\N	0	\N	673
167	2025-07-05 16:32:33.345	\N	R2T-12-D	\N	\N	\N	f	\N	0	\N	674
174	2025-07-05 16:32:33.469	\N	R2T-16-SF-SR	\N	\N	\N	f	\N	0	\N	675
168	2025-07-05 16:32:33.354	\N	R2T-12-SF-JD	\N	\N	\N	f	\N	0	\N	674
169	2025-07-05 16:32:33.375	\N	R2T-12-SF-S	\N	\N	\N	f	\N	0	\N	674
187	2025-07-05 16:32:33.788	\N	R9R-08-SF-C	\N	\N	\N	f	\N	0	\N	688
176	2025-07-05 16:32:33.488	\N	R2T-20-SF-JD	\N	\N	\N	f	\N	0	\N	676
183	2025-07-05 16:32:33.583	\N	R2T-32-SF-S	\N	\N	\N	f	\N	0	\N	678
177	2025-07-05 16:32:33.51	\N	R2T-20-SF-JX	\N	\N	\N	f	\N	0	\N	676
184	2025-07-05 16:32:33.593	\N	R2T-48-SF-S	\N	\N	\N	f	\N	0	\N	680
190	2025-07-05 16:32:33.852	\N	R9R-10-SF-A	\N	\N	\N	f	\N	0	\N	689
186	2025-07-05 16:32:33.752	\N	R9R-06-SF-JX	\N	\N	\N	f	\N	0	\N	687
124	2025-07-05 11:17:59.978	\N	R9R-12-SF-TX	\N	\N	\N	f	\N	0	\N	690
188	2025-07-05 16:32:33.796	\N	R9R-08-SF-JX	\N	\N	\N	f	\N	0	\N	688
192	2025-07-05 16:32:33.881	\N	R9R-10-SF-S	\N	\N	\N	f	\N	0	\N	689
193	2025-07-05 16:32:33.91	\N	R9R-12-SF-S	\N	\N	\N	f	\N	0	\N	690
194	2025-07-05 16:32:33.956	\N	R9R-16-SF-A	\N	\N	\N	f	\N	0	\N	691
196	2025-07-05 16:32:33.973	\N	R9R-16-SF-S	\N	\N	\N	f	\N	0	\N	691
197	2025-07-05 16:32:36.621	\N	WSD150-0125	\N	\N	\N	f	\N	0	\N	623
198	2025-07-05 16:32:36.632	\N	WSD150-0150	\N	\N	\N	f	\N	0	\N	624
199	2025-07-05 16:32:36.644	\N	WSD150-0200	\N	\N	\N	f	\N	0	\N	625
201	2025-07-05 16:32:36.69	\N	WSD150-0250-F	\N	\N	\N	f	\N	0	\N	626
202	2025-07-05 16:32:36.703	\N	WSD150-0300	\N	\N	\N	f	\N	0	\N	627
203	2025-07-05 16:32:36.735	\N	WSD150-0300-F	\N	\N	\N	f	\N	0	\N	627
204	2025-07-05 16:32:36.764	\N	WSD150-0400	\N	\N	\N	f	\N	0	\N	630
232	2025-07-05 16:51:51.098	\N	R1T-20-SF-S	\N	\N	\N	f	\N	0	\N	715
205	2025-07-05 16:32:36.793	\N	WSD150-0400-F	\N	\N	\N	f	\N	0	\N	630
206	2025-07-05 16:32:36.82	\N	WSD150-0600	\N	\N	\N	f	\N	0	\N	633
208	2025-07-05 16:32:36.863	\N	WSD150-0800	\N	\N	\N	f	\N	0	\N	634
211	2025-07-05 16:51:50.737	\N	R1T-04-D2	\N	\N	\N	f	\N	0	\N	708
234	2025-07-05 16:51:51.139	\N	R1T-32-SF-C	\N	\N	\N	f	\N	0	\N	717
213	2025-07-05 16:51:50.771	\N	R1T-04-SF-JX	\N	\N	\N	f	\N	0	\N	708
214	2025-07-05 16:51:50.78	\N	R1T-04-SF-S	\N	\N	\N	f	\N	0	\N	708
215	2025-07-05 16:51:50.804	\N	R1T-06-D	\N	\N	\N	f	\N	0	\N	710
236	2025-07-05 16:51:51.166	\N	R1T-32-SF-JX	\N	\N	\N	f	\N	0	\N	717
216	2025-07-05 16:51:50.819	\N	R1T-06-SF-JD	\N	\N	\N	f	\N	0	\N	710
217	2025-07-05 16:51:50.847	\N	R1T-06-SF-S	\N	\N	\N	f	\N	0	\N	710
237	2025-07-05 16:51:51.176	\N	R1T-32-SF-S	\N	\N	\N	f	\N	0	\N	717
218	2025-07-05 16:51:50.856	\N	R1T-08-D	\N	\N	\N	f	\N	0	\N	711
210	2025-07-05 16:51:50.707	\N	R1T-04-D	\N		\N	f	0	0	0	708
219	2025-07-05 16:51:50.878	\N	R1T-08-SF-JD	\N	\N	\N	f	\N	0	\N	711
220	2025-07-05 16:51:50.905	\N	R1T-08-SF-S	\N	\N	\N	f	\N	0	\N	711
148	2025-07-05 16:32:32.802	\N	R15B-16-SF-S	\N	\N	\N	f	\N	0	\N	682
149	2025-07-05 16:32:32.813	\N	R15B-20-SF-S	\N	\N	\N	f	\N	0	\N	683
150	2025-07-05 16:32:32.843	\N	R15B-24-SF-S	\N	\N	\N	f	\N	0	\N	684
212	2025-07-05 16:51:50.754	\N	R1T-04-SF-JD	\N	\N	\N	f	\N	0	\N	708
233	2025-07-05 16:51:51.124	\N	R1T-24-SF-JD	\N	\N	\N	f	\N	0	\N	716
173	2025-07-05 16:32:33.448	\N	R2T-16-SF-S	\N	\N	\N	f	\N	0	\N	675
235	2025-07-05 16:51:51.155	\N	R1T-32-SF-JD	\N	\N	\N	f	\N	0	\N	717
175	2025-07-05 16:32:33.478	\N	R2T-20-D	\N	\N	\N	f	\N	0	\N	676
178	2025-07-05 16:32:33.525	\N	R2T-20-SF-S	\N	\N	\N	f	\N	0	\N	676
182	2025-07-05 16:32:33.567	\N	R2T-32-SF-JD	\N	\N	\N	f	\N	0	\N	678
185	2025-07-05 16:32:33.741	\N	R9R-06-SF-A	\N	\N	\N	f	\N	0	\N	687
189	2025-07-05 16:32:33.825	\N	R9R-08-SF-QX	\N	\N	\N	f	\N	0	\N	688
191	2025-07-05 16:32:33.863	\N	R9R-10-SF-QX	\N	\N	\N	f	\N	0	\N	689
125	2025-07-05 11:18:00.011	\N	R9R-16-SF-TX	\N	\N	\N	f	\N	0	\N	691
207	2025-07-05 16:32:36.852	\N	WSD150-0600-F	\N	\N	\N	f	\N	610	\N	633
209	2025-07-05 16:32:36.885	\N	WSD150-0800-F	\N	\N	\N	f	\N	0	\N	634
221	2025-07-05 16:51:50.928	\N	R1T-10-SF-S	\N	\N	\N	f	\N	0	\N	712
222	2025-07-05 16:51:50.943	\N	R1T-12-D	\N	\N	\N	f	\N	0	\N	713
224	2025-07-05 16:51:50.974	\N	R1T-12-SF-JX	\N	\N	\N	f	\N	0	\N	713
225	2025-07-05 16:51:50.983	\N	R1T-12-SF-S	\N	\N	\N	f	\N	0	\N	713
226	2025-07-05 16:51:50.998	\N	R1T-16-D	\N	\N	\N	f	\N	0	\N	714
227	2025-07-05 16:51:51.013	\N	R1T-16-SF-JD	\N	\N	\N	f	\N	0	\N	714
228	2025-07-05 16:51:51.04	\N	R1T-16-SF-JX	\N	\N	\N	f	\N	0	\N	714
229	2025-07-05 16:51:51.05	\N	R1T-20-D	\N	\N	\N	f	\N	0	\N	715
231	2025-07-05 16:51:51.088	\N	R1T-20-SF-JX	\N	\N	\N	f	\N	0	\N	715
138	2025-07-05 16:32:29.378	\N	4SHB-12-SF-S	\N	\N	\N	f	\N	0	\N	695
146	2025-07-05 16:32:29.572	\N	4SHB-32-SF-QX	\N	\N	\N	f	\N	0	\N	699
238	2025-07-20 18:28:41.769	\N	CDH150-0300	\N	\N	\N	f	\N	0	\N	739
240	2025-07-20 18:28:41.855	\N	CDH150-0400-F	\N	\N	\N	f	\N	0	\N	740
241	2025-07-20 18:28:41.928	\N	CDH150-0500-F	\N	\N	\N	f	\N	0	\N	741
242	2025-07-20 18:28:42.447	\N	CSD150-0300	\N	\N	\N	f	\N	0	\N	757
243	2025-07-20 18:28:42.669	\N	CSD150-0400	\N	\N	\N	f	\N	0	\N	758
245	2025-07-20 18:28:42.819	\N	CSD150-0500	\N	\N	\N	f	\N	0	\N	759
246	2025-07-20 18:28:42.907	\N	CSD150-0500-B	\N	\N	\N	f	\N	0	\N	759
247	2025-07-20 18:28:42.951	\N	CSD150-0500-F	\N	\N	\N	f	\N	0	\N	759
248	2025-07-20 18:28:43.047	\N	CSD150-0600	\N	\N	\N	f	\N	0	\N	760
223	2025-07-05 16:51:50.958	\N	R1T-12-SF-JD	\N	\N	\N	f	\N	0	\N	713
249	2025-07-20 18:28:49.403	\N	R9R-06-SF-QX	\N	\N	\N	f	\N	0	\N	687
250	2025-07-20 18:28:55.952	\N	TWK-12	\N	\N	\N	f	\N	0	\N	504
253	2025-07-20 18:28:56.978	\N	XLPE150-0100	\N	\N	\N	f	\N	0	\N	788
254	2025-07-20 18:28:57.021	\N	XLPE150-0150	\N	\N	\N	f	\N	0	\N	790
255	2025-07-20 18:28:57.122	\N	XLPE150-0200	\N	\N	\N	f	\N	0	\N	791
256	2025-07-20 18:28:57.267	\N	XLPE150-0300	\N	\N	\N	f	\N	0	\N	793
257	2025-07-20 18:28:57.327	\N	XLPE150-0400	\N	\N	\N	f	\N	0	\N	794
239	2025-07-20 18:28:41.817	\N	CDH150-0400	\N	\N	\N	f	\N	0	\N	740
258	2025-07-20 18:29:53.727	\N	CTH150-0400-0450X4.47M	\N	\N	\N	f	\N	0	\N	768
259	2025-07-20 18:30:10.611	\N	XLPE150-0125	\N	\N	\N	f	\N	0	\N	789
260	2025-07-20 18:30:10.924	\N	XLPE150-0200-L	\N	\N	\N	f	\N	0	\N	791
244	2025-07-20 18:28:42.753	\N	CSD150-0400-F	\N	\N	\N	f	\N	610	\N	758
230	2025-07-05 16:51:51.073	\N	R1T-20-SF-JD	\N	\N	\N	f	\N	0	\N	715
251	2025-07-20 18:28:56.06	\N	UHMW250-0100-PE-F	\N	\N	\N	f	\N	1830	\N	780
252	2025-07-20 18:28:56.141	\N	UHMW250-0200-PE-F	\N	\N	\N	f	\N	610	\N	783
200	2025-07-05 16:32:36.678	\N	WSD150-0200-F	\N	\N	\N	f	\N	2440	\N	625
\.


--
-- Data for Name: ItemCodeImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ItemCodeImage" ("Id", "Image", "ItemCodeId", "CreatedAt", "DeletedAt") FROM stdin;
\.


--
-- Data for Name: Menu; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Menu" ("Id", "Name", "Path", "Description") FROM stdin;
1	manageadmin	/listpeople/manageadmin	Manajemen user admin
2	emailsetting	/email/emailsetting	Manajemen email & template
3	approvesalesorder	/listapprovalsalesorder/approvalsalesorder	Approve Sales Order
4	salesorder	/listtransaction/transaction	Sales Order
5	statistic	/liststatistic/statistic	Statistic / Laporan
6	stock	/liststock/stock	Stock Management
7	product	/productsetting/product	Product Management
8	sales	/listsales/sales	Sales List
9	price	/listprice/price	Price Management
10	rolemenuaccess	/listpeople/manageadmin/RoleMenuAccess	Role Menu Access Setting
11	manageuser	/listpeople/listuser/user	Manage User
12	managedealer	/listdealer/dealer	Manage Dealer
13	stockhistory	/liststock/StockHistory	Stock History
\.


--
-- Data for Name: MenuFeature; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."MenuFeature" ("Id", "MenuId", "Feature") FROM stdin;
1	1	create
2	1	edit
3	1	setsales
4	1	session
5	1	sendforgotpassword
6	1	delete
7	2	setconfig
8	2	createtemplate
9	2	editemplate
10	2	deletetemplate
11	3	listemailrecipient
12	3	createupdatedeleteemailrecipient
13	3	taxconfig
14	3	reviewsalesorder
15	4	editsalesorder
16	4	deletesalesorder
17	6	managewarehouse
18	6	updateexcel
19	6	editstockmanual
20	7	managecategory
21	7	createproduct
22	7	editproduct
23	7	deleteproduct
24	9	managepricecategory
25	9	addprice
26	9	editprice
27	9	deleteprice
28	12	create
29	12	edit
30	12	delete
31	12	editwarehousepriority
\.


--
-- Data for Name: PartNumber; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."PartNumber" ("Id", "Name", "Description", "Dash", "InnerDiameter", "OuterDiameter", "WorkingPressure", "BurstingPressure", "BendingRadius", "HoseWeight", "CreatedAt", "DeletedAt", "ProductId") FROM stdin;
68	AH600-0150	Pressure: 38, Radius: 1-1/2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.911	\N	10
69	AH600-0200	Pressure: 51, Radius: 2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.913	\N	10
70	AH600-0250	Pressure: 63.5, Radius: 2-1/2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.916	\N	10
71	AH600-0300	Pressure: 76, Radius: 3	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.918	\N	10
72	AH600-0400	Pressure: 102, Radius: 4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.92	\N	10
73	AH600-0600	Pressure: 152.4, Radius: 6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.923	\N	10
74	WDH300-0600	Pressure: 152	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.953	\N	11
75	WDH300-0800	Pressure: 203	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.955	\N	11
76	WDH300-1000	Pressure: 254	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.958	\N	11
623	WSD150-0125	Radius: 32	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.084	\N	12
624	WSD150-0150	Radius: 38	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.088	\N	12
625	WSD150-0200	Radius: 51	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.091	\N	12
626	WSD150-0250	Radius: 63	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.094	\N	12
627	WSD150-0300	Radius: 76	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.096	\N	12
628	WSD150-0338	Radius: 86	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.1	\N	12
77	WDH300-1200	Pressure: 305	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.961	\N	11
629	WSD150-0350	Radius: 90	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.103	\N	12
630	WSD150-0400	Radius: 102	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.107	\N	12
631	WSD150-0450	Radius: 115	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.11	\N	12
632	WSD150-0500	Radius: 127	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.112	\N	12
633	WSD150-0600	Radius: 152	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.115	\N	12
634	WSD150-0800	Radius: 203	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.117	\N	12
635	WSD150-1000	Radius: 254	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.12	\N	12
636	WSD150-1200	Radius: 305	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:30:37.122	\N	12
667	X6KP-24-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:03:36.479	\N	38
26	AR25-SF	Length: 1	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:48:12.974	2025-07-05 15:51:06.435	\N
668	X6KP-32-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:03:42.776	\N	38
25	AR19-SF	Length: 3/4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:48:12.971	2025-07-05 15:51:08.206	\N
681	R15B-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.353	\N	40
24	AR12-SF	Length: 1/2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:48:12.969	2025-07-05 15:51:12.352	\N
682	R15B-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.358	\N	40
23	AR09-SF	Length: 3/8	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:48:12.966	2025-07-05 15:51:14.522	\N
661	X6KP-06-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:02:42.979	\N	38
451	R13B-06	: -6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.562	\N	17
452	R13B-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.565	\N	17
453	R13B-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.568	\N	17
454	R13B-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.57	\N	17
455	R13B-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.572	\N	17
456	R13B-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.575	\N	17
457	R13B-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.577	\N	17
662	X6KP-08-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:02:49.229	\N	38
663	X6KP-10-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:03:03.863	\N	38
27	AH301-0025	: 6.4, : 1/4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.547	\N	8
28	AH301-0031	: 7.9, : 5/16	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.552	\N	8
29	AH301-0038	: 9.5, : 3/8	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.555	\N	8
30	AH301-0050	: 12.7, : 1/2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.558	\N	8
31	AH301-0063	: 15.9, : 5/8	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.56	\N	8
32	AH301-0075	: 19.1, : 3/4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.563	\N	8
33	AH301-0100	: 25.4, : 1	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.565	\N	8
664	X6KP-12-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:03:16.289	\N	38
665	X6KP-16-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:03:23.589	\N	38
666	X6KP-20-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:03:29.368	\N	38
683	R15B-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.36	\N	40
684	R15B-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.363	\N	40
685	R15B-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.366	\N	40
686	R9R-04	\N	-4	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.4	\N	41
687	R9R-06	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.403	\N	41
688	R9R-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.405	\N	41
689	R9R-10	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.408	\N	41
690	R9R-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.411	\N	41
691	R9R-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.414	\N	41
472	CLWB109-06	\N	\N	\N	\N	\N	\N	\N	0.375	2025-07-05 11:29:21.758	\N	21
473	CLWB113-08	\N	\N	\N	\N	\N	\N	\N	0.5	2025-07-05 11:29:21.76	\N	21
474	CLWB119-12	\N	\N	\N	\N	\N	\N	\N	0.75	2025-07-05 11:29:21.763	\N	21
475	CLWB125-16	\N	\N	\N	\N	\N	\N	\N	1	2025-07-05 11:29:21.765	\N	21
476	CLWB132-20	\N	\N	\N	\N	\N	\N	\N	2.75	2025-07-05 11:29:21.768	\N	21
477	CLWB138-24	\N	\N	\N	\N	\N	\N	\N	5.5	2025-07-05 11:29:21.77	\N	21
478	CLWB151-32	\N	\N	\N	\N	\N	\N	\N	2	2025-07-05 11:29:21.772	\N	21
479	AFX-9806	Pressure: 3/8"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.796	\N	22
692	R9R-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.415	\N	41
693	R9R-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.417	\N	41
694	R9R-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.42	\N	41
695	4SHB-12	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.451	\N	42
696	4SHB-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.454	\N	42
697	4SHB-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.456	\N	42
59	CONTRACTOR-0300	Pressure: 76.2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.84	\N	9
60	CONTRACTOR-0400	Pressure: 101.6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.842	\N	9
61	CONTRACTOR-0600	Pressure: 152.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.844	\N	9
62	CONTRACTOR-0800	Pressure: 203.0	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.847	\N	9
63	CONTRACTOR-1000	Pressure: 254.0	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.85	\N	9
64	AH600-0050	Pressure: 13, Radius: 1/2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.901	\N	10
65	AH600-0075	Pressure: 19, Radius: 3/4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.903	\N	10
66	AH600-0100	Pressure: 25, Radius: 1	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.906	\N	10
67	AH600-0125	Pressure: 32, Radius: 1-1/4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:16.908	\N	10
480	AFX-9808	Size: 1/2"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.798	\N	22
481	AFX-9810	Size: 5/8"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.801	\N	22
93	AH1200-0200	Pressure: 50.8, Radius: 2	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:17.087	\N	13
94	AH1200-0300	Pressure: 76.2, Radius: 3	\N	\N	\N	\N	\N	\N	\N	2025-07-05 10:55:17.089	\N	13
482	AFX-9812	Size: 3/4"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.803	\N	22
483	AFX-9816	Size: 1"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.806	\N	22
484	AFX-9820	Size: 1-1/4"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.808	\N	22
485	AFX-9824	Size: 1-1/2"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.81	\N	22
486	AFX-9832	Size: 2"	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.812	\N	22
487	R7-03-SF-PP	Pressure: 3/16, Radius: 4.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.84	\N	23
488	R7-04-SF-PP	Pressure: 1/4, Radius: 6.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.843	\N	23
489	R7-06-SF-PP	Pressure: 3/8, Radius: 9.6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.846	\N	23
490	R7-08-SF-PP	Pressure: 1/2, Radius: 12.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.849	\N	23
698	4SHB-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.46	\N	42
699	4SHB-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 16:11:49.462	\N	42
708	R1T-04	: -4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.607	\N	44
709	R1T-05	\N	-5	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.612	\N	44
491	R7-10-SF-PP	Pressure: 5/8, Radius: 15.9	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.851	\N	23
492	R7-12-SF-PP	Pressure: 3/4, Radius: 19.0	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.853	\N	23
493	R7-16-SF-PP	Pressure: 1, Radius: 25.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.855	\N	23
494	352-04-SF	Diameter: 1/4, Radius: 6.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.919	\N	25
495	352-06-SF	Diameter: 3/8, Radius: 9.6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.922	\N	25
496	352-08-SF	Diameter: 1/2, Radius: 12.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.924	\N	25
497	TWK-03	Diameter: 1/8", Diameter: 3.00, Pressure: 1.00	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.974	\N	26
498	TWK-04	Diameter: 3/16", Diameter: 5.00, Pressure: 0.70	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.976	\N	26
499	TWK-05	Diameter: 1/4", Diameter: 6.00, Pressure: 0.70	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.979	\N	26
500	TWK-06	Diameter: 5/16", Diameter: 8.00, Pressure: 0.70	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.984	\N	26
501	TWK-07	Diameter: 3/8", Diameter: 9.50, Pressure: 0.70	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.986	\N	26
502	TWK-08	Diameter: 13/32", Diameter: 10.30, Pressure: 0.70	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.988	\N	26
503	TWK-10	Diameter: 1/2", Diameter: 12.50, Pressure: 0.75	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.99	\N	26
504	TWK-12	Diameter: 5/8", Diameter: 16.00, Pressure: 0.90	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.993	\N	26
505	TWK-14	Diameter: 3/4", Diameter: 19.00, Pressure: 0.90	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.995	\N	26
506	TWK-16	Diameter: 7/8", Diameter: 22.20, Pressure: 1.00	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.997	\N	26
507	TWK-18	Diameter: 1", Diameter: 25.00, Pressure: 1.20	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:21.999	\N	26
508	TWK-20	Diameter: 1-1/8", Diameter: 29.00, Pressure: 1.25	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.001	\N	26
509	TWK-14-HD	Diameter: 3/4", Diameter: 19.0, Pressure: 1.10	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.003	\N	26
510	TWK-18-HD	Diameter: 1", Diameter: 25.5, Pressure: 1.25	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.005	\N	26
511	R7WT-03-SF-PP	Pressure: 3/16, Radius: 4.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.029	\N	27
512	R7WT-04-SF-PP	Pressure: 1/4, Radius: 6.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.032	\N	27
513	R7WT-06-SF-PP	Pressure: 3/8, Radius: 9.6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.034	\N	27
514	R7WT-08-SF-PP	Pressure: 1/2, Radius: 12.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.036	\N	27
515	R7WT-10-SF-PP	Pressure: 5/8, Radius: 15.9	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.038	\N	27
516	R7WT-12-SF-PP	Pressure: 3/4, Radius: 19.0	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.04	\N	27
517	R7WT-16-SF-PP	Pressure: 1, Radius: 25.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.042	\N	27
518	R8-03-SF-PP	Pressure: 3/16	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.067	\N	28
519	R8-04-SF-PP	Pressure: 1/4, Radius: 6.5	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.07	\N	28
520	R8-06-SF-PP	Pressure: 3/8, Radius: 9.8	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.072	\N	28
521	R8-08-SF-PP	Pressure: 1/2, Radius: 13.0	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.075	\N	28
522	R8-12-SF-PP	Pressure: 3/4, Radius: 19.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.077	\N	28
523	R8WT-03-SF-PP	Pressure: 3/16, : 4.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.1	\N	29
524	R8WT-04-SF-PP	Pressure: 1/4, Radius: 6.4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.103	\N	29
525	R8WT-06-SF-PP	Pressure: 3/8, Radius: 9.6	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.105	\N	29
526	R8WT-08-SF-PP	Pressure: 1/2, Radius: 12.7	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.108	\N	29
527	R8WT-12-SF-PP	Pressure: 3/4, Radius: 19.0	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.11	\N	29
528	TEST-02	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.127	\N	30
529	TEST-03	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.129	\N	30
530	TEST-04	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.132	\N	30
531	R3-04	: -4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.15	\N	31
532	R3-05	\N	-5	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.152	\N	31
533	R3-06	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.154	\N	31
534	R3-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.157	\N	31
535	R3-10	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.159	\N	31
536	R3-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.161	\N	31
537	R3-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.164	\N	31
538	R3-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.166	\N	31
539	R3-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.168	\N	31
540	R3-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.17	\N	31
541	R5-04	\N	-4	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.2	\N	32
542	R5-05	\N	-5	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.202	\N	32
543	R5-06	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.204	\N	32
544	R5-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.206	\N	32
545	R5-10	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.208	\N	32
546	R5-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.211	\N	32
547	R5-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.213	\N	32
548	R5-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.216	\N	32
549	R5-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.218	\N	32
550	R5-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.219	\N	32
551	R5-40	\N	-40	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.222	\N	32
552	R6-04	: -4	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.237	\N	33
553	R6-05	\N	-5	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.24	\N	33
554	R6-06	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.242	\N	33
555	R6-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.244	\N	33
556	R6-10	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.246	\N	33
557	R6-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.249	\N	33
558	R6-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.251	\N	33
581	4SHB-12-SF-TX	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.417	\N	37
582	4SHB-16-SF-TX	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.419	\N	37
583	4SHB-20-SF-TX	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.423	\N	37
584	4SHB-24-SF-TX	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.431	\N	37
585	4SHB-32-SF-TX	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.439	\N	37
571	R1T-04-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.346	\N	34
572	R1T-05-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.349	\N	34
573	R1T-06-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.351	\N	34
574	R1T-08-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.353	\N	34
575	R1T-10-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.355	\N	34
576	R1T-12-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.358	\N	34
577	R1T-16-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.361	\N	34
578	R1T-20-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.364	\N	34
579	R1T-24-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.366	\N	34
580	R1T-32-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.368	\N	34
586	R2T-04-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.504	\N	16
587	R2T-05-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.506	\N	16
588	R2T-06-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.508	\N	16
589	R2T-08-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.51	\N	16
590	R2T-10-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.513	\N	16
591	R2T-12-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.515	\N	16
592	R2T-16-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.517	\N	16
593	R2T-20-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.519	\N	16
594	R2T-24-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.521	\N	16
595	R2T-32-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.523	\N	16
608	2K-04-SF-S	\N	-4	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.651	\N	14
609	2K-05-SF-S	\N	-5	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.653	\N	14
610	2K-06-SF-S	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.655	\N	14
611	2K-08-SF-S	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.658	\N	14
612	2K-10-SF-S	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.66	\N	14
613	2K-12-SF-S	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.663	\N	14
614	2K-16-SF-S	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.666	\N	14
615	AH300-0025	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.705	\N	1
616	AH300-0031	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.708	\N	1
617	AH300-0038	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.71	\N	1
618	AH300-0050	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.715	\N	1
619	AH300-0063	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.719	\N	1
649	R9R-06-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.602	\N	19
650	R9R-08-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.604	\N	19
651	R9R-10-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.606	\N	19
652	R9R-12-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.607	\N	19
653	R9R-16-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.61	\N	19
654	R15B-06-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.69	\N	20
655	R15B-08-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.692	\N	20
656	R15B-12-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.696	\N	20
657	R15B-16-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.699	\N	20
658	R15B-20-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.701	\N	20
659	R15B-24-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.703	\N	20
660	R15B-32-SF-TX	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 15:55:08.704	\N	20
669	R2T-04	\N	-4	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.76	\N	39
670	R2T-05	\N	-5	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.763	\N	39
671	R2T-06	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.766	\N	39
672	R2T-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.769	\N	39
673	R2T-10	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.771	\N	39
674	R2T-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.774	\N	39
675	R2T-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.776	\N	39
676	R2T-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.778	\N	39
677	R2T-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.781	\N	39
678	R2T-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.783	\N	39
679	R2T-40	\N	-40	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.786	\N	39
680	R2T-48	\N	-48	\N	\N	\N	\N	\N	\N	2025-07-05 16:06:26.788	\N	39
700	X6KP-06-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:29:48.497	\N	35
701	X6KP-08-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:29:55.345	\N	35
702	X6KP-10-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:30:01.27	\N	35
703	X6KP-12-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:30:08.266	\N	35
704	X6KP-16-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:30:13.965	\N	35
705	X6KP-20-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:30:20.271	\N	35
706	X6KP-24-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:30:25.964	\N	35
707	X6KP-32-SF-S		\N	\N	\N	\N	\N	\N	\N	2025-07-05 16:30:31.526	\N	35
710	R1T-06	\N	-6	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.615	\N	44
711	R1T-08	\N	-8	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.618	\N	44
712	R1T-10	\N	-10	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.621	\N	44
713	R1T-12	\N	-12	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.624	\N	44
714	R1T-16	\N	-16	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.627	\N	44
715	R1T-20	\N	-20	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.63	\N	44
716	R1T-24	\N	-24	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.633	\N	44
717	R1T-32	\N	-32	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.636	\N	44
718	R1T-40	\N	-40	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.638	\N	44
719	R1T-48	\N	-48	\N	\N	\N	\N	\N	\N	2025-07-05 16:51:10.641	\N	44
620	AH300-0075	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.722	\N	1
621	AH300-0100	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-05 11:29:22.725	\N	1
720	AHT150-0150		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:04:40.101	\N	45
721	AHT150-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:04:46.162	\N	45
722	AHT150-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:04:52.783	\N	45
723	AHT150-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:05:05.199	\N	45
724	AHT150-0350		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:05:12.341	\N	45
725	AHT150-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:05:21.005	\N	45
726	AHT150-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:05:28.059	\N	45
727	AHT150-0600		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:05:34.569	\N	45
728	AHT220-0150		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:12.469	\N	46
729	AHT220-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:19.19	\N	46
730	AHT220-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:25.691	\N	46
731	AHT220-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:31.682	\N	46
732	AHT220-0350		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:38.454	\N	46
733	AHT220-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:45.018	\N	46
734	AHT220-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:51.056	\N	46
735	AHT220-0600		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:06:56.188	\N	46
736	AHT295-0075		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:07:23.363	\N	47
737	AHT295-0100		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:07:29.875	\N	47
738	AHT295-0125		\N	\N	\N	\N	\N	\N	\N	2025-07-20 09:07:35.195	\N	47
739	CDH150-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:02:07.109	\N	48
740	CDH150-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:02:12.735	\N	48
741	CDH150-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:02:19.132	\N	48
742	CFD75-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:27.592	\N	49
743	CFD75-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:33.868	\N	49
744	CFD75-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:39.379	\N	49
745	CFD75-0350		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:44.377	\N	49
746	CFD75-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:49.563	\N	49
747	CFD75-0431		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:54.603	\N	49
748	CFD75-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:03:59.882	\N	49
749	CFD75-0600		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:04.728	\N	49
750	CFD75-0800		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:10.191	\N	49
751	CPH1232-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:34.201	\N	50
752	CPH1232-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:39.792	\N	50
753	CPH1232-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:45.748	\N	50
754	CPH1232-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:50.712	\N	50
755	CPH1232-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:04:55.513	\N	50
756	CPH1232-0600		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:05:01.128	\N	50
757	CSD150-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:05:21.813	\N	51
758	CSD150-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:05:26.67	\N	51
759	CSD150-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:05:32.063	\N	51
760	CSD150-0600		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:05:37.111	\N	51
761	CTH150-0100		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:05:59.307	\N	52
762	CTH150-0125		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:04.791	\N	52
763	CTH150-0150		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:09.721	\N	52
764	CTH150-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:15.043	\N	52
765	CTH150-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:20.344	\N	52
766	CTH150-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:24.942	\N	52
767	CTH150-0350		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:30.509	\N	52
768	CTH150-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:37.012	\N	52
769	CTH150-0500		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:42.364	\N	52
770	CTH150-0600		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:48.452	\N	52
771	CTH150-0800		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:06:54.581	\N	52
772	CTH150-1000		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:07:03.103	\N	52
773	BT600-0125		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:07:23.408	\N	53
774	BT600-0150		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:07:30.643	\N	53
775	BT600-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:07:36.691	\N	53
776	BT600-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:07:46.818	\N	53
777	BT600-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:07:53.62	\N	53
778	BT600-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:08:00.182	\N	53
779	UHMW250-0075-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:08:33.841	\N	54
780	UHMW250-0100-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:08:39.747	\N	54
781	UHMW250-0125-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:08:48.77	\N	54
782	UHMW250-0150-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:08:55.394	\N	54
783	UHMW250-0200-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:09:06.492	\N	54
784	UHMW250-0250-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:09:12.915	\N	54
785	UHMW250-0300-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:09:19.939	\N	54
786	UHMW250-0350-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:09:27.578	\N	54
787	UHMW250-0400-PE		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:09:36.257	\N	54
788	XLPE150-0100		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:09:59.444	\N	55
789	XLPE150-0125		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:10:05.694	\N	55
790	XLPE150-0150		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:10:11.455	\N	55
791	XLPE150-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:10:20.05	\N	55
792	XLPE150-0250		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:10:29.359	\N	55
793	XLPE150-0300		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:10:37.125	\N	55
794	XLPE150-0400		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:10:43.865	\N	55
795	XLPE250-0200		\N	\N	\N	\N	\N	\N	\N	2025-07-20 18:11:08.424	\N	56
\.


--
-- Data for Name: Price; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Price" ("Id", "Price", "PriceCategoryId", "DealerId", "CreatedAt", "DeletedAt", "ItemCodeId") FROM stdin;
1	5e+57	1	\N	2025-06-18 07:07:18.32	2025-06-18 07:07:23.849	1
2	5e+86	1	\N	2025-06-18 07:08:42.605	2025-06-18 07:08:57.147	1
4	33000	2	\N	2025-06-25 04:06:15.564	\N	1
5	30000	\N	1	2025-06-25 04:09:09.333	\N	1
7	35000	1	\N	2025-06-25 06:30:20.293	\N	35
6	33000	1	\N	2025-06-25 06:30:02.177	\N	34
8	50000	1	\N	2025-06-25 06:30:55.801	\N	36
9	77250	1	\N	2025-06-25 06:31:09.321	\N	37
10	114750	1	\N	2025-06-25 06:31:48.561	\N	38
11	147750	1	\N	2025-06-25 06:32:15.391	\N	39
12	500000	1	\N	2025-07-05 17:02:41.033	\N	210
14	500000	\N	1	2025-07-06 15:45:21.893	\N	210
13	40000	\N	1	2025-07-05 17:11:42.636	2025-07-06 16:00:51.464	210
15	30000	\N	1	2025-07-06 16:01:09.695	\N	210
16	13000	1	\N	2025-07-07 07:24:46.374	\N	151
17	15000	1	\N	2025-07-07 07:29:04.604	\N	157
18	17000	1	\N	2025-07-07 07:29:14.399	\N	159
19	18000	1	\N	2025-07-07 07:29:25.79	\N	163
20	20000	1	\N	2025-07-07 07:29:36.482	\N	166
3	30000	1	\N	2025-06-19 06:27:52.65	\N	1
21	30000	1	\N	2025-07-17 08:49:36.726	\N	42
22	30000	1	\N	2025-07-17 08:49:48.433	\N	211
23	30000	1	\N	2025-07-17 08:53:50.762	\N	40
24	30000	3	\N	2025-07-17 09:10:44.933	\N	40
25	30000	3	\N	2025-07-17 09:16:33.326	\N	34
26	30000	3	\N	2025-07-17 09:16:59.868	\N	1
27	30000	3	\N	2025-07-17 09:17:06.049	\N	35
28	30000	3	\N	2025-07-17 09:17:10.386	\N	42
29	30000	3	\N	2025-07-17 09:17:16.269	\N	36
30	30000	3	\N	2025-07-17 09:17:20.488	\N	43
31	30000	3	\N	2025-07-17 09:17:24.453	\N	44
32	30000	3	\N	2025-07-17 09:17:29.678	\N	45
33	30000	3	\N	2025-07-17 09:17:34.393	\N	37
34	30000	3	\N	2025-07-17 09:17:39.293	\N	38
35	30000	3	\N	2025-07-17 09:17:44.693	\N	132
36	30000	3	\N	2025-07-17 09:19:25.354	\N	211
37	30000	3	\N	2025-07-17 09:19:30.473	\N	215
38	30000	3	\N	2025-07-17 09:19:36.787	\N	218
39	30000	3	\N	2025-07-17 09:19:41.522	\N	221
40	30000	3	\N	2025-07-17 09:19:47.084	\N	222
41	30000	3	\N	2025-07-17 09:19:57.448	\N	226
42	20000	\N	1	2025-07-19 14:41:46.417	\N	1
\.


--
-- Data for Name: PriceCategory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."PriceCategory" ("Id", "Name", "CreatedAt", "DeletedAt") FROM stdin;
1	S1	2025-06-18 07:07:08.641	\N
2	S2	2025-06-24 15:54:12.586	\N
3	S3	2025-06-24 15:54:15.39	\N
4	S4	2025-06-24 15:54:18.137	\N
\.


--
-- Data for Name: PriceHistory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."PriceHistory" ("Id", "Price", "UpdatedAt", "ItemCodeId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Product" ("Id", "Name", "CodeName", "Description", "CreatedAt", "DeletedAt") FROM stdin;
16	X-Series R2T		<p>X Series SAE 100 R2AT / EN 853 2SN Application : | | Construction/Agriculture Machine, Industrial Equipment, Machine Tool &amp; Various Hydraulic System Operating Temperature : | | -40°C to +100°C Reinforcement : | | Steel Wire Inner Cover : | | Oil Resistant Synthetic Rubber Outer Cover : | | Oil &amp; Weather Resistant Synthetic Rubber Recommended Fluids : | | Mineral Hydraulic Oil Max. Impulse Test Pressure : | | 133% Of Max. Working Pressure Branding : | | White Positive Text SUNFLEX X SERIES SAE 100 R2AT / EN 853 2SN Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose I.D. | | O.D. | Pressure | Pressure | Radius | Weight</p>	2025-07-05 11:00:18.816	\N
7	AR09		<p>SUNFLEX PVC/PU HOSES AR type JACK HAMMER HOSE Compressor Air Specialized Hose Applications:  | | Civil Engineering  | | Road And Bridge Construction  | | Tunnel And Dam Construction  | | Subway Construction  | | Quarry  | | Reclamation Construction  | | Building Construction  | | Sewage Piping Works  | | Seabed Drilling  | | Shipyard  | | Construction Equipment  | | Other Industrial Applications Working Pressure | | Bursting Pressure Nominal | | Hose Dimension | | Coil o | o</p>	2025-07-05 10:48:03.674	2025-07-05 15:51:26.643
12	WSD150		WSD150\nWATER SUCTION/DISCHARGE HOSE 150 PSI\nMandrel Built Heavy Water Suction & Discharge Hose, It Handles Sewage. Waste Water, Mud etc.\nTemperature Range |   | : -40 | ˚ | C (-40˚F) to +85˚C (+185˚F)\nTube |   | : Black, Smooth, Synthetic Rubber Resistant To Water With pH Value 5 To 8\nReinforcement |   | : High Strength Synthetic Cord Plus Helix Wire\nCover |   | : Black, Smooth (Wrapped Finish) Synthetic Rubber, Abrasion And Weathering Resistant\nCoils |   | : 61mt (200ft) Continuous Length; Other Length Available On Request\nBranding |   | : Yellow Transfer Tape With Negative Text\n'SUNFLEX WSD 150 WATER SUCTION/DELIVERY HOSE WPSI 150'\nBursting\nWorking |  | Bending\nI.D. |   | O.D. |   | Pressure |  | Hose Weight	2025-07-05 10:55:17.001	\N
1	AH300		AH300 (FROM SIZE 1/4" TO 1")\nAIR/WATER HOSE 300 PSI\nA General Purpose Air Hose Engineered For Medium To Heavy Duty Application. It's Strong Yet Flexible Construction Guarantees\nA Long Life And Easy Handling.\nTemperature Range |   | : -10 | ˚ | C (+14˚F) to +80˚C (+176˚F)\nTube |   | : Black, Smooth, TPR Material, Oil Mist Resistant\nReinforcement |   | : High Strength Synthetic Cord\nCover |   | : Black, Smooth TPR Material, Weather And Abrasion Resistant\nCoils |   | : 100mt (330ft) Continuous Length; Other Length Available On Request\nBranding |   | : Inkjet White\n'SUNFLEX AH300 AIR/WATER HOSE WPSI 300'\nBursting\nBending\nI.D. |   | O.D. |   | Working Pressure | Pressure |  | Hose Weight	2025-06-12 18:18:40.543	\N
8	AH301		<p>AH301 (FROM SIZE 1/4" TO 1") AIR/WATER HOSE 300 PSI Oil mist resistant Air hose for versatile general industries and constructionn sites. NOT suitable for transfer of petroleum products.and abrasive medium. Temperature Range | | : | | -20°C(-4°F) to +80°C (+176°F) Tube | | : | | Black, smooth, synthetic rubber, oil mist resistant. Reinforcement | | : | | High strength synthetic yarn. Cover | | : | | Black, smooth, synthetic rubber, weathering and ozone resistant. Optional Request | | : | | Standard ISO 2398, Type 1, Class A. 'SUNFLEX AH301 AIR/WATER HOSE WPSI 300' Bursting Working | | Max.Hose I.D. | | O.D. | | | Pressure</p>	2025-07-05 10:55:16.539	\N
9	CONTRACTOR		<p>www.sunflexhose.com CONTRACTOR HOSE For Water Suction And Delivery, In Agricutural Industrial And Construction. Temperature Range | | : -35˚C (-31˚F) to +70˚C (+158˚F) Tube | | : Black, Natural And Synthetic Rubber Reinforcement | | : High Tensile Synthetic Textile Fabric, Steel Wire Helix Embedded Between The Layers Cover | | : Black, Abrasion, Weather And Ozone Resistant, Synthetic Rubber - Corrugated With Cuffed Ends (230mm) Branding | | : Black Cover With Embossed Tape 'SUNFLEX CONTRACTOR HOSE WPSI 75' Bursting Cuff End | | Working | | Bending I.D. | | O.D. | | Pressure | | Hose Weight</p>	2025-07-05 10:55:16.837	\N
13	AH1200		<p>HEAVY DUTY AIR HOSE HOSE 1200 PSI High Temperature Compressed Air Specifically Designed For Use In The Mining And Drilling Industry. Braided Construction For Diameters 38mm &amp; 51mm. Spiral Construction For Diameter 76mm. Temperature Range | | : -40 | ˚ | C to +120˚C With Peaks Of 232˚C Working Pressure | | : 1,200 PSI Tube | | : Black Bromobutyl - Oil Mist And High Temperature Resistant Reinforcement | | : High Tensile Steel Braids / Cords Cover | | : Blue EPDM - Abrasion And Ozone Resistant - Pin Pricked Coils | | : 61mt (200ft) Continuous Length; Other Length Available On Request Branding | | : Blue Cover With Embossed Tape 'SUNFLEX AH1200 HEAVY DUTY AIR HOSE WPSI 1200' Working | | Bursting | | Bending I.D. | | O.D. | | Hose Weight</p>	2025-07-05 10:55:17.084	\N
10	AH600		<p>AH600 AIR/WATER HOSE 600 PSI Designed For The Most Severe Working Conditions In Mining, Quarries, Industrial And Construction Service. This Mandrel Built Hose Has A High Margin Safety And Gives A Long And Trouble-Free Service Under The Most Arduous Working Conditions. Temperature Range | | : -40 | ˚ | C (+40˚F) to +100˚C (+212˚F) Tube | | : Black, Smooth, Synthetic Rubber, Oil Mist Resistant Reinforcement | | : High Tensile Steel Wire Spirals Cover | | : Yellow, Smooth (Wrapped Finish) Long Lasting Synthetic Rubber, Weather And Abrasion Resistant Coils | | : 61mt (200ft) Continuous Length; Other Length Available On Request Branding | | : Black Transfer Tape With Negative Text 'SUNFLEX AH600 HEAVY DUTY AIR HOSE WPSI 600' Bursting Working | | Bending I.D. | | O.D. | | Pressure | | Hose Weight</p>	2025-07-05 10:55:16.899	\N
11	WDH300		<p>WDH300 WATER DELIVERY HOSE 300 PSI Mandrel Built Water Discharge Hose, Widely Used By Industry, Construction Site, etc. Temperature Range | | : -40 | ˚ | C (-40˚F) to +85˚C (+185˚F) Tube | | : Black, Smooth, Synthetic Rubber Reinforcement | | : High Strength Synthetic Cord Cover | | : Black, Smooth (Wrapped Finish) Synthetic Rubber, Abrasion, Weather And Ozone Resistant Coils | | : 61mt (200ft) Continuous Length; Other Length Available On Request Branding | | : Yellow Transfer Tape With Negative Text 'SUNFLEX WDH 300 WATER DELIVERY HOSE WPSI 300' Bursting Working | | Bending I.D. | | O.D. | | Pressure | | Hose Weight</p>	2025-07-05 10:55:16.95	\N
21	CLWB109		<p>TYPE - CLWB PTFE Convoluted Hoses Braided AISI 304 Applications: - Plastic moulding presses - Collant lines for canning machines - Collant lines for gas and chlorine cilinders - Compressors discharge line - Cable sheating for electrical line - Transport of air, oil and petrol in the car motorcycle and shipyard fields - Transport of corrosive chemical, food and pharmaceutical products Advantages: - Extreme flexibility - Long term durability - Low maintenance - Chemical inertness Produced with PTFE resins characterized by low miscroporosity and high tensile strength, the convoluted tubes and hoses are the right answer for the transport of gas, fluids and chemicals where the bending radius request a high flexibility together with a low permeability. The helicoidal profile has been studied to avoid blockages of the passing fluids and their consequent solidification and it makes them easily washable and sterilizable. The wide range of temperatures from -54°C to 260°C reachable by our tubes allow them to be the right solution for many industrial and technical processes. Their high resistance to the peroxides, present in the normal rubber hoses, makes them the obliged choice for the car, motorcycle and shipyard industries. Wall | | Min. | | Maximum | | Minimum Internal | | Outside | | Hose Size | | Thicknes | Bend | Working | Bursting</p>	2025-07-05 11:00:19.102	\N
109	Layflat - OF30			2025-07-20 09:19:15.977	\N
110	Layflat - Yagum			2025-07-20 09:19:20.826	\N
19	X-Series 4SP		<p>X Series SAE 4SP / EN856 Application : | | Construction/Agriculture Machine, Industrial Equipment, Machine Tool &amp; Various Hydraulic System Operating Temperature : | | -40°C to +120°C (-40F to +212F) Reinforcement : | | Steel Wire Inner Cover : | | Oil Resistant Synthetic Rubber Outer Cover : | | Oil &amp; Weather Resistant Synthetic Rubber Recommended Fluids : | | Mineral Hydraulic Oil Max. Impulse Test Pressure : | | 133% Of Max. Working Pressure Branding : | | White Positive Text SUNFLEX X SERIES DIN EN 856/4SP MSHA IC-263/2 - FLAME RESISTANT Hose Size | Max Working | | Minimum Burst | | Minimum Bend | | Hose Pressure | Pressure | Radius | Weight I.D. | | O.D.</p>	2025-07-05 11:00:19.015	\N
22	AFX		<p>TEFLON - PTFE HOSES Type - Tape Wrapped Convoluted Hose Combining extreme flexibility of application, corrosion resistance, long term durability and chemical inertness, this hose can be used in many diverse applications. Chemical transfers, food handling, and various processing applications, from pure water to hazardous waste. This cost effective hose can replace existing nylon, rubber, metal hose or solid piping and tubing | . Constructed using a helical tape wrapped PTFE with a glass fibre overlay, overbraided with 304 AISI 304/S15 stainless steel. Also available with a carbon liner. The stainless steel braided hose assemblies are also highly resistant to the demands of thermal cycling in laundries, rubber and plastic moulding and other types of steam service characterised by frequent o on/off cycles. Not recommended for steam-cold water cycling applications. Steam, 200 psi at +200 | C maximum Maximum Internal | Outside | Bend | | Minimum Working Diameter | Diameter | Radius | Burst Pressure</p>	2025-07-05 11:00:19.154	\N
23	R7		<p>SUNFLEX SAE 100R7 THERMOPLASTIC HOSE BS4983: 1973 | | DIN 24951 pt 2 | | ISO3945 Sunflex Thermoplastic Hose | | - | | SAE 100R7 An all | - | purpose medium pressure hose suitable for many hydraulic and pneumatic systems. Compatible with hydraulic oils, grease, fuel oils, mineral oils and most phosphate esters o For water and water | - | based hydraulic fluids, temperature is limited to 70 | C This hose is also suitable for many industrial gases, e.g. Heliox (max.25% O | ), Argon, Nitrogen, Carbon Dioxide, Helium and 2 Air. Refer to BS6596 for recommended factors of safety. SAE 100R7 has a pin | - | pricked cover Applications: | | General Hydraulics, Mechanical Handling, Construction Equipment, Gas Applications, Machine Tools Construction: | | Comprises of an unplasticised polyester elastomer tube reinforced with a single braid of polyester fibre, and a black polyurethane outer cover. Performance: o | o - | | Min/Max continuous service temperature range | | - | 40 | C to 100 | C o (water and water | - | based fluids limited to 70 | C) - | | Low ID to OD ratios, slim and lightweight - | | First | - | rate stability | | - | | change in length better than +/ | - | | 3% - | | Excellent flexibility and flex fatigue resistance throughout temperature range. Nominal Nominal Inside | | Working | | Bursting | | Min. Bend Outside | Hose Weight</p>	2025-07-05 11:00:19.207	\N
20	X-Series R15		<p>SAE 100 R15 / EN 856 OPERATING TEMPERATURE : | | -40°C to +120°C REINFORCEMENT : | | Steel INNER COVER : | | Oil resistant synthetic rubber OUTER COVER : | | Oil &amp; ozone resistant synthetic rubber RECOMMENDED FLUIDS : | | Mineral Synthetic Oil MAX IMPULSE TEST PRESSURE: | | 133% of max working pressure BRANDING : White positive text SUNFLEX X SERIES DIN EN 856 / SAE 100 R15 DN 32 1 1/4" W.P. 420 BAR B.P. 1680 BAR MSHA IC-263/2 - FLAME RESISTANT Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose I.D. | Pressure | Pressure | Radius | Weight</p>	2025-07-05 11:00:19.066	\N
25	352		<p>SUNFLEX 352 VERY HIGH PRESSURE HOSE WP 10000PSI APPLICATION | | : Very High Pressure Hydraulic Lines 520 To 700 Bar. Compact, High Pressure, Light Weight, High Abrasion Resistance And Low Change In Length. For Use With Petroleum, Synthetic Or Water Based Fluids In Hydraulic Systems. Mainly Used For Rescue, Safety Equipment, Bolt Tensioning Tools And Jacking &amp; Re-Railing Equipments. Also, Suitable For Earthmoving And Material Handling Equipments. CORE | | : Thermoplastic Elastomer REINFORCEMENT | | : Double Braids Of Aramid Fibre With Single Steel Wire Braid COVER | | : Orange Color Polyurethane. Available Twin And Multi Lines With Different Hose Combination And Size TEMPERATURE RANGE | | : -40 | ˚ | C to +100˚C. Temperature Not Exceed +70˚C For Air And Water Based Fluids Nominal Inside | | Nominal Outside | Minimum Bending | | Hose Working Pressure | | Bursting Pressure |</p>	2025-07-05 11:00:19.294	\N
27	R7WT		<p>SUNFLEX SAE 100R7 TWIN THERMOPLASTIC HOSE BS4983: 1973 | | DIN 24951 pt 2 | | ISO3945 Sunflex Thermoplastic Hose | | - | | SAE 100R7 Twin An all | - | purpose medium pressure hose suitable for many hydraulic and pneumatic systems. Type 726 is compatible with hydraulic oils, grease, fuel oils, mineral oils and most phosphate esters. o For water and water | - | based hydraulic fluids, temperature is limited to 70 | c. 2 This hose is also suitable for many industrial gases, e.g. Heliox (max.25% O | ), Argon, Nitrogen, Carbon Dioxide, Helium and Air. Refer to BS6596 for recommended factors of safety. Hose type 726 has a pin | - | pricked cover. Applications: | | General Hydraulics, Mechanical Handling, Construction Equipment, Gas Applications, Machine tools. Construction: | | Type 726 consists of two unplasticised polyester elastomer tubes, each reinforced with one braid of polyester fibre. The hose is then extruded together with a black polyurethane cover to form a Siamese hose. This construction provides easier parting than a welded construction. Performance: o | o - | | Min/Max continuous service temperature range | | - | 40 | C to 100 | C o (water and water | - | based fluids limited to 70 | C) - | | Low ID to OD ratios, slim and lightweight - | | First | - | rate stability | | - | | change in length better than +/ | - | | 3% - | | Excellent flexibility and flex fatigue resistance throughout temperature range. Nominal Nominal Inside | | Working | | Bursting | | Min. Bend Outside | Hose Weight</p>	2025-07-05 11:00:19.404	\N
26	TWK		<p>TEFLON (PTFE) HOSES - WITH ONE S/S WIRE BRAIDED COVER The PTFE hose core is manufactured from Teflon. No pigments or additives are incorporated thus giving the hose liner a translucent appearance free from any contamination. The wire braiding (1 or 2 wire available) is produced from AISI 304/S15 or BS970 1970 quality hard drawn tensile stainless steel wire. PTFE hose has an excellent temperature charateristics both in high and low temperature. Excellent chemical resistant, non contamination properties, low coefficient of friction and resists deterioration. Reduced static versions of all hoses are available for applications where electrically resistive fluids are being transferred at high flow rates. The standard wall products are not recommended for steam-cold water cycling. We recommend the Heavy Wall range for the most demanding applications including intense thermal cycling Temperature Range * Continuous: -60 | | ̊ | C to | | +205 | | ̊ | C * Intermittent: max. +220 | | ̊ | C Min. Internal | | Wall | | Outside | | Maximum Working | | Minimum Bursting | | Hose Bend</p>	2025-07-05 11:00:19.344	\N
111	Jack Hammer Hose			2025-07-20 09:19:52.028	\N
112	PVC Blue White Spiral-032N			2025-07-20 09:20:11.811	\N
113	PVC Clear Steel Wire-501N			2025-07-20 09:20:17.485	\N
114	PVC Clear White Spiral-007N			2025-07-20 09:20:23.548	\N
115	PVC Clear White Spiral-012N			2025-07-20 09:20:29.475	\N
116	PVC Ducting			2025-07-20 09:20:35.119	\N
117	PVC Grit			2025-07-20 09:20:42.49	\N
118	Transparent Reinforced Hose (Hinet)			2025-07-20 09:20:49.032	\N
34	X-Series R1T 		<p>X Series SAE 100 R1AT / EN 853 1SN Application : | | Construction/Agriculture Machine, Industrial Equipment, Machine Tool &amp; Various Hydraulic System Operating Temperature : | | -40°C to +100°C Reinforcement : | | Steel Wire Inner Cover : | | Oil Resistant Synthetic Rubber Outer Cover : | | Oil &amp; Weather Resistant Synthetic Rubber Recommended Fluids : | | Mineral Hydraulic Oil Max. Impulse Test Pressure : | | 133% Of Max. Working Pressure Branding : | | White Positive Text SUNFLEX X SERIES SAE 100 R1AT / EN 853 1SN Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose I.D. | | O.D. | Pressure | Pressure | Radius | Weight</p>	2025-07-05 11:00:19.641	\N
32	R5		<p>SAE 100 R5 / EN 853 Temperature Range | | : -40°C (-40°F) to +120°C (+248°F) Application | | : For Hydraulics, Air, Gasoline, Fuel And Lubricating Oils Tube | | : Synthetic Oil Resistant Rubber Reinforcement | | : 1 Wire Braid Between 2 Textile Braids Cover | | : Impregnated Textile Braid Cover Branding | | : Inkjet White 'SUNFLEX SAE 100 R5 / EN 853' Hose Size | | Hose Size | | | Max Working | Max Working | | Minimum Burst | | Minimum Burst | | Minimum Bend | | Minimum Bend | | Hose | | Hose Pressure | | Pressure | | Radius | | Weight I.D. | | R.O.D | | O.D.</p>	2025-07-05 11:00:19.573	\N
14	2K		<p>2K SUPER-COMPACT TEMPERATUR RANGE | | : -40°C (-40°F) to +100°C (+212°F) APPLICATION | | : For High Pressure Hydraulic Systems Using Hydraulic Oils, Mineral And Vegetable Lubricants TUBE | | : Mineral, Vegetable And Hydraulic Oil Resistant Special Synthetic Rubber REINFORCEMENT | | : 2 High Tensile Steel Wire Braid COVER | | : Oil, Abrasion And Weather Resistant Special Synthetic Rubber BRANDING | | : Positive White 'SUNFLEX 2K EXCEEDS EN857 2SC' Minimum Hose Size Max | | Minimum | | Hose Bend Working Pressure | Burst Pressure | Weight I.D. | | O.D. | Radius</p>	2025-07-05 11:00:18.624	\N
17	R13		<p>SAE 100 R13 / EN 856 Temperature Range | | : -40°C (-40°F) to +100°C (+212°F) + 121°C (250°F) Intermittent Application | | : Extremely High Pressure Hydraulics Tube | | : Oil Resistant Synthetic Rubber Reinforcement | | : 4 or 6 High Tensile Steel Wire Spirals Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Impulse Cycles | | : Minimum 500,000 Branding | | : Positive Green `SUNFLEX SAE 100 R13 / EN 856' Hose Size | | Max Working | Minimum Burst | Minimum Bend | Hose I.D. | O.D. | Pressure | Pressure | Radius | Weight</p>	2025-07-05 11:00:18.878	\N
30	TEST		<p>SUNFLEX TEST HOSE Temperature Range | | : -40°C to +100°C (Not To Exceed +70°C For Air And Water Based Fluids) Application | | : Very High Pressure Mini Hydraulic Lines Up To 630 Bar. Suitable For Hydraulic Application With Increased Resistance To Abrasion For Use With Petroleum, Synthetic Or Water Based Fluids In Hydraulic Systems Pressure Test Equipments And Test Points, General Mini Hydraulic Equipments. Automotive Roof And Boot Opening System And Truck's Cab Lifting Systems. Core | Core | | | : Thermoplastic Elastomer | : Thermoplastic Elastomer Reinforcement | | : Single Braid Of Aramid Fiber Cover | | : Black Color, Polyurethane And Pin Prick Upon Request. Available With Polyamide 12 As Core And Cover. Branding | | : Ink Jet With White Text 'SUNFLEX TEST HOSE' Hose Size | | Max Working | Minimum Burst | Minimum Bend Pressure | Pressure | Radius I.D. | O.D.</p>	2025-07-05 11:00:19.503	\N
31	R3		<p>SAE 100 R3 / EN 854 Temperature Range | | : -40°C (-40°F) to +120°C (+248°F) Application | | : Medium Pressure Hydraulic Oils, Air And Water Tube | | : Synthetic Oil Resistant Rubber Reinforcement | | : 2 Textile Braids Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Branding | | : Inkjet White 'SUNFLEX SAE 100 R3 / EN 854' Hose Size | | Max Working | Minimum Burst | Minimum Bend | | Hose I.D. | O.D. | Pressure | Pressure | Radius | Weight</p>	2025-07-05 11:00:19.525	\N
33	R6		<p>SAE 100 R6 / EN 854 Temperature Range | | : -40°C (-40°F) to +120°C (+248°F) Application | | : Low Pressure Hydraulic Oils, Air And Water Tube | | : Synthetic Oil Resistant Rubber Reinforcement | | : 1 Textile Braids Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Branding | | : Inkjet White 'SUNFLEX SAE 100 R6 / EN 854' Hose Size | | Max Working | Minimum Burst | Minimum Bend | | Hose Pressure | Pressure | Radius | Weight I.D. | O.D.</p>	2025-07-05 11:00:19.61	\N
15	4SH		<p>SAE 4SH / EN856 Application : | | Construction/Agriculture Machine, Industrial Equipment, Machine Tool &amp; Various Hydraulic System Operating Temperature : | | -40°C to +120°C (-40°F to +212°F) Reinforcement : | | Steel Wire Inner Cover : | | Oil Resistant Synthetic Rubber Outer Cover : | | Oil &amp; Weather Resistant Synthetic Rubber Recommended Fluids : | | Mineral Hydraulic Oil Max. Impulse Test Pressure : | | 133% Of Max. Working Pressure Branding : | | White Positive Text SUNFLEX X SERIES DIN EN 856/4SH MSHA IC-263/2 - FLAME RESISTANT Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose I.D. | | O.D. | | Pressure | | Pressure | | Radius | | Weight</p>	2025-07-05 11:00:18.71	2025-07-05 15:54:53.716
28	R8		<p>SUNFLEX SAE 100R8 THERMOPLASTIC HOSE BS4983 TYPE 2 | | ISO3945 Sunflex Thermoplastic Hose - SAE 100R8 An all-purpose high pressure hose meeting SAE 100R8 working pressure standards and benefiting from the increased flexibility of SAE 100R7 dimensions. Suitable for many hydraulic and pneumatic systems., compatible with hydraulic oils, grease, fuel oils, mineral oils and most phosphate esters. o For water and water-based hydraulic fluids, temperature is limited to 70 | C. This hose is also suitable for many industrial gases, e.g. Heliox (max.25% O | ), Argon, Nitrogen, Carbon Dioxide, Helium and 2 Air. Refer to BS6596 for recommended factors of safety. SAE 100R8 has a non-pricked cover. For gas applications a pin-pricked cover is recommended which must be specified at time of ordering. Applications: | | General Hydraulics, Mechanical Handling, Pressure Jetting, Machine Tools, Construction Equipment Construction: | | Comprises of a polyester elastomer tube reinforced with a single braid of polyaramid fibre, and a black polyurethane outer cover. Performance: o | o - Min/Max continuous service temperature range -40 | C to 100 | C o (water and water-based fluids limited to 70 | C) - Low ID to OD ratios, slim and lightweight - First-rate stability - change in length better than +/- 2% - Excellent flexibility and flex fatigue resistance throughout temperature range Nominal Nominal Inside | Working | Bursting | Min. Bend Outside | | Hose Weight</p>	2025-07-05 11:00:19.444	\N
36	WSD150 SP			2025-07-05 15:27:25.394	\N
24	714		<p>. SUNFLEX THERMOPLASTIC HOSE | | SUNFLEX THERMOPLASTIC HOSE HOSE TYPE 714 - 1 WIRE AIRLESS | HOSE TYPE 714 - 1 WIRE AIRLESS PAINT SPRAY | PAINT SPRAY Sunflex Thermoplastic Hose 714 - 1 Wire Paint Spray Hose | | Sunflex Thermoplastic Hose 714 - 1 Wire Paint Spray Hose A high pressure, high performance, airless paint spray hose specially designed to meet the exacting requirements | | A high pressure, high performance, airless paint spray hose specially designed to meet the exacting requirements of the industry. Steel braid reinforcing ensures strength and guaranteed electrical conductivity. | of the industry. Steel braid reinforcing ensures strength and guaranteed electrical conductivity. This hose offers optimum resistance to a wide range of fluids including paints, chlorinated solvents and other | This hose offers optimum resistance to a wide range of fluids including paints, chlorinated solvents and other chemicals. Cover pin-pricked as standard. | chemicals. Cover pin-pricked as standard. Applications: | | Applications: | | | Airless Paint Spray Equipment | Airless Paint Spray Equipment Construction: | | Construction: | | | Type 714 comprises of a nylon 6 tube reinforced with one braid of brass coated high tensile steel | Type 714 comprises of a nylon 6 tube reinforced with one braid of brass coated high tensile steel wire. The blue outer cover is polyurethane, other colours are available to special order. | wire. The blue outer cover is polyurethane, other colours are available to special order. Performance: | | Performance: o | o | o | o - Min/Max continuous service temperature range -40 | | - Min/Max continuous service temperature range -40 | | | C to 95 | C to 95 | C. | C. - Resistant to most chemicals, paints and solvents. | - Resistant to most chemicals, paints and solvents. - Excellent flexibility with small bend radius | - Excellent flexibility with small bend radius. - Superior and reliable electrical conductivity resistance in the order of 1.0 ohms/metre. - Cover provides excellent abrasion resistance. NOMINAL | NOMINAL | WORKING | BURSTING | MIN BEND WEIGHT INSIDE | OUTSIDE | PRESSURE | PRESSURE | RADIUS PART NO | DIAMETER | DIAMETER PSI | | BAR | PSI | | BAR | INCH | | MM | LB/FT | | KG/M INCH | | MM | | INCH | | MM 714-03-SF-PP | | 3/16 | | 4.7 | | 0.365 | | 9.3 | | 8120 | | 560 | | 20300 | | 1400 | | 3.0 | | 75 | | 0.08 | | 0.12 714-04-SF-PP | | 1/4 | | 6.4 | | 0.460 | | 11.7 | | 7540 | | 520 | | 18850 | | 1300 | | 4.0 | | 100 | | 0.11 | | 0.16 714-06-SF-PP | | 3/8 | | 9.6 | | 0.610 | | 15.5 | | 5800 | | 400 | | 14500 | | 1000 | | 5.0 | | 127 | | 0.15 | | 0.23 714-08-SF-PP | | 1/2 | | 12.7 | | 0.725 | | 18.4 | | 2750 | | 190 | | 11000 | | 758 | | 4.5 | | 114 | | 0.20 | | 0.30 714-12-SF-PP | | 3/4 | | 19.0 | | 1.020 | | 26.0 | | 1750 | | 120 | | 7000 | | 483 | | 8.0 | | 200 | | 0.29 | | 0.43</p>	2025-07-05 11:00:19.253	2025-07-05 15:34:08.363
39	R2T		<p>SAE 100 R2AT / EN 853 2SN Temperature Range | | : -40°C (-40°F) to +120°C (+248°F) Application | | : High Pressure Hydraulic Oils, Air And Water Tube | | : Synthetic Oil Resistant Rubber Reinforcement | | : 2 High Tensile Steel Wire Braids Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Impulse Cycles | | : 200,000 Branding | | : Blue Transfer Tape With White Text 'SUNFLEX SAE 100 R2AT / EN 853 2SN' Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose Pressure | | Pressure | | Radius | | Weight I.D. | | O.D.</p>	2025-07-05 16:06:26.755	\N
38	X6KP			2025-07-05 16:02:16.401	\N
35	X6KP		<p>X6KP - 4/6 Steel Wire Spiral Hose Construction Core: | | Special synthetic rubber tube resistant to mineral. Vegetable and glycol based hydralic oil Reinforcement: | | 4 or 6 high tensile strength steel wire reinforced Cover: | | Super high abrasion and weather resistance special synthetic rubber cover Temperature Range: | | -40°C to +120°C Application: | | For hydraulic systems with high peak pressure and arduous operating condition such as high pressure hydraulic circuits (for example on booms) on mobile construction equipment, mining equipment, agricultre machines. Branding: | | Orange transfer tap with negative text ‘SUNFLEX X6KP EXCEEDS ISO 18752-CC/SAE 100 R15 PERFORMANCE Technical Details Hose I.D. | | Hose O.D. | | Working | | Min.Burst | | Min. Bend | 4 or 6 SUNFLEX | | DN | | Weight | (Nom.) | (Nom.) | Pressure | Pressure | | Radius | Spiral Part # | | (In.) | | (mm) | | (In.) | | (mm) | | (psi) | | (Bar) | | (psi) | | (Bar) | | (mm) | | (In.) | | (kg/m) X6KP-06-SF-S | | 6 | | 3/8 | | 9.5 | | 0.82 | | 20.9 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 65 | | 2.6 | | 0.70 | | 4 X6KP-08-SF-S | | 8 | | 1/2 | | 12.7 | | 0.96 | | 24.4 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 90 | | 3.6 | | 0.92 | | 4 X6KP-10-SF-S | | 10 | | 5/8 | | 15.9 | | 1.11 | | 28.1 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 100 | | 4.0 | | 1.13 | | 4 X6KP-12-SF-S | | 12 | | 3/4 | | 19 | | 1.21 | | 30.7 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 150 | | 6.0 | | 1.246 | | 4 X6KP-16-SF-S | | 16 | | 1 | | 25.4 | | 1.49 | | 37.9 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 210 | | 8.4 | | 1.828 | | 4 X6KP-20-SF-S | | 20 | | 1.1/4 | | 31.8 | | 1.95 | | 49.6 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 260 | | 10.4 | | 3.166 | | 6 X6KP-24-SF-S | | 24 | | 1.1/2 | | 38.1 | | 2.24 | | 56.9 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 310 | | 12.4 | | 4.396 | | 6 X6KP-32-SF-S | | 32 | | 2 | | 50.8 | | 2.83 | | 72.0 | | 6,090 | | 420 | | 24,360 | | 1,680 | | 350 | | 14.0 | | 6.252 | | 6</p>	2025-07-05 11:02:16.712	\N
37	X-Series 4SH		<p>SAE 4SH / EN856 Application : | | Construction/Agriculture Machine, Industrial Equipment, Machine Tool &amp; Various Hydraulic System Operating Temperature : | | -40°C to +120°C (-40°F to +212°F) Reinforcement : | | Steel Wire Inner Cover : | | Oil Resistant Synthetic Rubber Outer Cover : | | Oil &amp; Weather Resistant Synthetic Rubber Recommended Fluids : | | Mineral Hydraulic Oil Max. Impulse Test Pressure : | | 133% Of Max. Working Pressure Branding : | | White Positive Text SUNFLEX X SERIES DIN EN 856/4SH MSHA IC-263/2 - FLAME RESISTANT Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose I.D. | | O.D. | | Pressure | | Pressure | | Radius | | Weight</p>	2025-07-05 15:53:42.575	\N
43	R12 (4 spiral wire hydraulic hose)			2025-07-05 16:31:35.504	\N
40	R15B		<p>SAE 100 R15 / EN 856 Temperature Range | | : -40°C (-40°F) to +100°C (+212°F) + 121°C (250°F) Intermittent Application | | : Extremely High Pressure, Heavy Duty, High Impulse Hydraulics Tube | | : Oil Resistant Synthetic Rubber Reinforcement | | : 4 or 6 High Tensile Steel Wire Spirals Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Impulse Cycles | | : Minimum 500,000 Branding | | : Positive White `SUNFLEX SAE 100 R15 / EN 856' Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose Pressure | | Pressure | | Radius | | Weight I.D. | | O.D.</p>	2025-07-05 16:11:49.35	\N
41	4SP (4 spiral wire hydraulic hose)		<p>SAE 4SP / EN856 Temperature Range | | : | | -40°C (-40°F) to +100°C (+212°F) + 125°C (257°F) Intermittent Application | | : Extra High Pressure Hydraulics Tube | | : Oil Resistant Synthetic Rubber Reinforcement | | : 4 High Tensile Steel Wire Spirals Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Impulse Cycles | | : Minimum 400,000 Branding | | : Black Transfer Tape With White Text `SUNFLEX SAE 4SP / EN856' Hose Size | | Max Working | | Minimum Burst | | Minimum Bend | | Hose Pressure | | Pressure | | Radius | | Weight I.D. | | O.D.</p>	2025-07-05 16:11:49.398	\N
29	R8 Twin-Hose (single braid thermoplastic hose)		<p>SUNFLEX SAE 100R8 TWIN THERMOPLASTIC HOSE BS4983 TYPE 2 | | ISO3945 SUNFLEX THERMOPLASTIC HOSE - SAE 100R8 TWIN An all-purpose high pressure hose meeting SAE 100R8 working pressure standards and benefiting from the increased flexibility of SAE 100R7 dimensions. Suitable for many hydraulic and pneumatic systems, compatible with hydraulic oils, grease, fuel oils, mineral oils and most phosphate esters. o For water and water-based hydraulic fluids, temperature is limited to 70 | C. 2 This hose is also suitable for many industrial gases, e.g. Heliox (max. 25% O | ), Argon, Nitrogen, Carbon Dioxide, Helium and Air. Refer to BS6596 for recommended factors of safety. | | Refer to BS6596 for recommended factors of safety. SAE R8 has a non-pricked cover. For gas applications a pin-pricked cover is recommended which must be specified at time of ordering. Applications: | | General Hydraulics, Mechanical Handling,Pressure Jetting, Machine Tools, Construction Equipment. Construction: | | Consists of two unplasticised polyester elastomer tubes, each reinforced with one braid of polyaramid fibre. The hose is then extruded together with a black polyurethane cover to form a Siamese hose. This construction provides easier parting than a welded construction. Performance: o | o - Min/Max continuous service temperature range -40 | C to 100 | C o (water and water-based fluids limited to 70 | C) - Low ID to OD ratios, slim and lightweight - First-rate stability - change in length maximum +/- 2%. - Excellent flexibility and flex fatigue resistance throughout temperature range. Nominal Nominal Inside | | Working | Bursting | Min. Bend Outside | Hose Weight</p>	2025-07-05 11:00:19.475	\N
18	HMS0		SAE 100 R12 / EN 856\nTEMPERATURE RANGE : |   | -40°C (-40°F) to +100°C (+212°F) + 121°C (250°F) intermittent\nAPPLICATION : |   | Very high pressure hydraulics\nTUBE : |   | Oil resistant synthetic rubber\nREINFORCEMENT : |   | 4 high tensile steel wire spirals\nCOVER : |   | Synthetic rubber - abrasion, ozone and weather resistant\nIMPULSE CYCLES : |   | Minimum 500,000\nBRANDING : Positive White `SUNFLEX SAE 100 R12 / EN 856'\nHose Size |  | Max Working |  | Minimum Burst |  | Minimum Bend\nI.D. |  | R.O.D. |   | O.D. | Pressure | Pressure | Radius\nDN |   | dash\ninch |   | mm |   | mm |   | mm |   | psi |   | bar |   | psi |   | bar |   | inch |   | mm\n10 |   | -6 |   | 3/8 |   | 9.5 |   | 17.2 |   | 20.1 |   | 4000 |   | 276 |   | 16000 |   | 1100 |   | 5.0 |   | 127\n12 |   | -8 |   | 1/2 |   | 12.7 |   | 20.7 |   | 23.6 |   | 4000 |   | 276 |   | 16000 |   | 1100 |   | 7.0 |   | 178\n16 |   | -10 |   | 5/8 |   | 15.9 |   | 24.6 |   | 27.2 |   | 4000 |   | 276 |   | 16000 |   | 1100 |   | 8.0 |   | 203\n19 |   | -12 |   | 3/4 |   | 19.0 |   | 27.65 |   | 30.5 |   | 4000 |   | 276 |   | 16000 |   | 1100 |   | 9.5 |   | 241\n25 |   | -16 |   | 1 |   | 25.4 |   | 34.9 |   | 37.8 |   | 4000 |   | 276 |   | 16000 |   | 1100 |   | 12.0 |   | 305\n32 |   | -20 |   | 11/4 |   | 31.8 |   | 43.9 |   | 46.8 |   | 3000 |   | 207 |   | 12000 |   | 825 |   | 16.5 |   | 419\n38 |   | -24 |   | 1 1/2 |   | 38.1 |   | 50.4 |   | 53.3 |   | 2500 |   | 172 |   | 10000 |   | 685 |   | 20.0 |   | 508\n51 |   | -32 |   | 2 |   | 50.8 |   | 63.65 |   | 66.5 |   | 2500 |   | 172 |   | 10000 |   | 685 |   | 25.0 |   | 635\nFERRULE FOR R12 HOSE\nOUR PART NO |   | SIZE\nHMS0-06 |   | UMS-06 |   | 3/8"\nHMS0-08 |   | UMS-08 |   | 1/2"\nHMS0-10 |   | UMS-10 |   | 5/8"\nHMS0-12 |   | UMS-12 |   | 3/4"\nHMS0-16 |   | UMS-16 |   | 1"\nHMS0-20 |   | UMS-20 |   | 1-1/4"\nHMS0-24 |   | UMS-24 |   | 1-1/2"\nHMS0-32 |   | UMS-32 |   | 2"	2025-07-05 11:00:18.974	2025-07-05 16:40:00.588
42	4SHB		<p>SAE 4SH / EN856 Temperature Range | | : -40°C (-40°F) to +100°C (+212°F) + 125°C (257°F) Intermittent Application | | : Extra High Pressure Hydraulics Tube | | : Oil Resistant Synthetic Rubber Reinforcement | | : 4 High Tensile Steel Wire Spirals Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Impulse Cycles | | : Minimum 400,000 Branding | | : Black Transfer Tape With White Text `SUNFLEX SAE 4SH / EN856' Hose Size | Max Working | Minimum Burst | Minimum Bend | Hose Pressure | Pressure | Radius | Weight I.D. | O.D.</p>	2025-07-05 16:11:49.448	\N
44	R1T		<p>SAE 100 R1AT / EN 853 1SN Temperature Range | | : -40°C (-40°F) to +120°C (+248°F) Application | | : High Pressure Hydraulic Oils, Air And Water Tube | | : Synthetic Oil Resistant Rubber Reinforcement | | : 1 High Tensile Steel Wire Braid Cover | | : Synthetic Rubber - Abrasion, Ozone And Weather Resistant Impulse Cycles | | : 150,000 Branding | | : Red transfer tape with white text `SUNFLEX SAE 100 R1AT / EN 853 1 SN' Hose Size | | Max Working | Minimum Burst | Minimum Bend | | Hose I.D. | | O.D. | Pressure | Pressure | Radius | Weight</p>	2025-07-05 16:51:10.598	\N
46	Asphalt - AHT220			2025-07-20 08:53:04.319	\N
47	Asphalt - AHT295			2025-07-20 08:53:09.993	\N
48	Cement / Bulk Material - CDH150			2025-07-20 08:53:18.832	\N
49	Cement / Bulk Material - CFD75			2025-07-20 08:53:28.172	\N
50	Cement / Bulk Material - CPH1232			2025-07-20 08:53:34.841	\N
51	Cement / Bulk Material - CSD150			2025-07-20 08:53:40.992	\N
52	Cement / Bulk Material - CTH150			2025-07-20 08:53:46.401	\N
53	Grouting Hose - BT600			2025-07-20 08:53:52.448	\N
54	Chemical - UHMWPE250			2025-07-20 08:54:06.261	\N
55	Chemical - XLPE150			2025-07-20 08:54:12.364	\N
56	Chemical - XLPE250			2025-07-20 08:54:17.362	\N
57	Foodgrade - BDH150			2025-07-20 08:54:27.441	\N
58	Foodgrade - BSD150			2025-07-20 08:54:34.049	\N
59	High Temp - SH260			2025-07-20 08:54:43.94	\N
60	High Temp - SH260-HEL			2025-07-20 08:54:51.561	\N
61	High Temp. - FND150			2025-07-20 08:54:58.347	\N
62	High Temp. - RH150			2025-07-20 08:55:04.439	\N
63	High Temp. - SH250			2025-07-20 08:55:10.829	\N
64	Tank Cleaning Hose - TCH350			2025-07-20 08:55:17.487	\N
65	Liquid Mud - MD600			2025-07-20 08:55:26.034	\N
66	Water / Mud - WMH250			2025-07-20 08:55:35.248	\N
67	Water / Mud - WMH300			2025-07-20 08:55:40.386	\N
68	Multipurpose - MSD300			2025-07-20 08:55:48.085	\N
69	Multipurpose - MSH300			2025-07-20 08:55:54.565	\N
70	Multipurpose - MSH301			2025-07-20 08:56:00.49	\N
71	Oil - DH300			2025-07-20 08:56:09.285	\N
72	Oil - ODH150			2025-07-20 08:56:17.787	\N
73	Oil - OSD150			2025-07-20 08:56:23.404	\N
74	OIL - OSD150 FC			2025-07-20 08:56:28.476	\N
75	Oil - OSD250			2025-07-20 08:56:34.418	\N
76	Oil - OSD400			2025-07-20 08:56:40.925	\N
77	Oil - OSD600			2025-07-20 08:56:46.715	\N
78	Sand Blasting - SBH150			2025-07-20 08:58:41.112	\N
79	Slurry - SSD150			2025-07-20 08:58:50.969	\N
80	Slurry - SSD250			2025-07-20 08:58:58.975	\N
81	Welding - Acetylene Single Line			2025-07-20 08:59:30.056	\N
82	Welding - LPG Single Line			2025-07-20 08:59:37.457	\N
83	Welding - Oxygen Single Line			2025-07-20 08:59:45.96	\N
84	Welding - Twin Hose			2025-07-20 08:59:52.674	\N
85	Waterblasting - WB30			2025-07-20 09:00:02.797	\N
86	Water Jetting - JH1232			2025-07-20 09:00:10.176	\N
45	Asphalt - AHT150		<p>A Strong Yet Flexible Hose, Specially Designed As Tank Truck Or Tank Wagon Hose For Loading And Unloading Hot Asphalt. </p><p>Temperature Range : -15˚C (-5˚F) to +185˚C (+365F˚) </p><p>Tube : Black, Smooth, Polyacrylic Compound </p><p>Reinforcement : Plies Of Steel Wire Cord Plus Helix Wire </p><p>Cover : Black, Smooth (Wrapped Finish) Special Synthetic Rubber, Compounded For An Excellent Resistance To Weather, Ozone, Abrasion, Tar And Oil </p><p>Coils : Size 3/4" to 5" Supply In 61mt (200ft) Continous Length </p><p>Branding : White Transfer Tape With Negative Text </p><p>'SUNFLEX AHT 150 ASPHALT HOSE WPSI 150'&nbsp;</p>	2025-07-20 08:52:58.905	\N
87	Compotec - Abratec400			2025-07-20 09:14:45.652	\N
88	Compotec - Biodiesel			2025-07-20 09:14:53.467	\N
89	Compotec - Chem700			2025-07-20 09:15:39.402	\N
90	Compotec - Cryotec660			2025-07-20 09:15:46.211	\N
91	Compotec - Draintec			2025-07-20 09:15:52.644	\N
92	Compotec - Exilite			2025-07-20 09:15:58.066	\N
93	Compotec - Extraflex			2025-07-20 09:16:03.356	\N
94	Compotec - Food500			2025-07-20 09:16:08.69	\N
95	Compotec - Higrade101			2025-07-20 09:16:14.819	\N
96	Compotec - Hitemp305			2025-07-20 09:16:20.148	\N
97	Compotec - Oil800			2025-07-20 09:16:26.694	\N
98	Compotec - PTFE300			2025-07-20 09:16:33.123	\N
99	Sunflex - Chem700			2025-07-20 09:16:49.713	\N
100	Sunflex - Chemchlor			2025-07-20 09:16:55.752	\N
101	Sunflex - Cryotec660 (LPG)			2025-07-20 09:17:01.154	\N
102	Sunflex - Cryotec661 (LNG)			2025-07-20 09:17:06.416	\N
103	Sunflex - Hitemp305			2025-07-20 09:17:12.423	\N
104	Sunflex - Oil800			2025-07-20 09:17:18.858	\N
105	Sunflex - PTFE300			2025-07-20 09:17:25.457	\N
106	Layflat - Armtex			2025-07-20 09:18:59.694	\N
107	Layflat - OF10			2025-07-20 09:19:05.553	\N
108	Layflat - OF20			2025-07-20 09:19:10.759	\N
\.


--
-- Data for Name: ProductBrand; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductBrand" ("Id", "ProductBrandName", "ProductBrandCode") FROM stdin;
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductCategory" ("Id", "Name", "CreatedAt", "DeletedAt", "ParentCategoryId") FROM stdin;
2	Air / Water	2025-06-12 18:18:15.609	\N	1
3	a	2025-07-03 13:27:29.668	2025-07-03 13:27:43.656	\N
4	aaaaa	2025-07-04 15:59:31.634	2025-07-05 11:06:04.911	\N
6	1 Wire	2025-07-05 13:45:31.54	\N	5
7	2 Wires	2025-07-05 13:45:48.666	\N	5
8	4 / 6 Wires	2025-07-05 13:46:03.125	\N	5
9	Teflon	2025-07-05 13:46:16.383	\N	5
10	Thermoplastic	2025-07-05 13:46:23.596	\N	5
11	Textile Braided	2025-07-05 13:46:31.968	\N	5
13	1 Wire	2025-07-05 13:46:58.936	\N	12
14	2 Wires	2025-07-05 13:47:09.468	\N	12
15	4 / 6 Wires	2025-07-05 13:47:17.427	\N	12
1	Industrial Hose	2025-06-12 18:18:05.082	\N	\N
5	Hydraulic Hose	2025-07-05 13:45:21.304	\N	\N
12	Hydraulic Hose - X-Series	2025-07-05 13:46:41.704	\N	\N
16	Asphalt	2025-07-20 08:49:15.555	\N	1
17	Cement / Bulk Material	2025-07-20 08:49:44.237	\N	1
18	Chemical	2025-07-20 08:50:00.031	2025-07-20 08:50:09.705	\N
19	Chemical	2025-07-20 08:50:17.686	\N	1
20	Foodgrade	2025-07-20 08:50:31.79	\N	1
21	High Temp	2025-07-20 08:50:42.8	\N	1
22	Liquid Mud	2025-07-20 08:50:50.086	\N	1
23	Multipurpose	2025-07-20 08:50:58.298	\N	1
24	Oil	2025-07-20 08:51:05.098	\N	1
25	Sand Blasting	2025-07-20 08:51:13.643	\N	1
26	Slurry	2025-07-20 08:51:19.895	\N	1
27	Welding	2025-07-20 08:51:27.768	\N	1
28	Waterblasting	2025-07-20 08:51:34.304	\N	1
29	Water Jetting	2025-07-20 08:51:45.051	\N	1
31	Compotec Brand	2025-07-20 09:12:41.866	\N	30
32	Sunflex Brand	2025-07-20 09:12:51.778	\N	30
33	Layflat Hose	2025-07-20 09:17:57.721	\N	\N
34	PVC Hose	2025-07-20 09:19:33.59	\N	\N
35	Stainless Steel Hose	2025-07-20 09:21:10.183	\N	\N
36	Specialty Hose	2025-07-20 09:21:18.331	\N	\N
37	Technical Information	2025-07-20 09:21:24.051	2025-07-20 09:22:36.981	\N
30	Composite Hose	2025-07-20 09:08:59.009	\N	\N
\.


--
-- Data for Name: ProductCategoryImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductCategoryImage" ("Id", "Image", "ProductCategoryId", "CreatedAt", "DeletedAt") FROM stdin;
1	category_1_1752741793767.jpg	1	2025-07-17 08:43:13.77	\N
2	category_5_1752741811194.jpg	5	2025-07-17 08:43:31.195	\N
3	category_12_1752741822842.jpg	12	2025-07-17 08:43:42.843	\N
4	category_30_1753003399949.jpg	30	2025-07-20 09:23:19.95	\N
5	category_33_1753004072825.jpg	33	2025-07-20 09:34:32.827	\N
6	category_34_1753004099747.jpg	34	2025-07-20 09:34:59.748	\N
7	category_35_1753004129671.jpg	35	2025-07-20 09:35:29.672	\N
8	category_36_1753004171313.jpg	36	2025-07-20 09:36:11.314	\N
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductImage" ("Id", "Image", "ProductId", "CreatedAt", "DeletedAt") FROM stdin;
1	product_1_1751644293225.JPG	1	2025-07-04 15:51:33.229	2025-07-04 15:52:02.328
2	product_1_1751644340731.png	1	2025-07-04 15:52:20.736	2025-07-17 08:35:25.542
3	product_1_1752741329502.jpg	1	2025-07-17 08:35:29.503	2025-07-18 08:51:35.832
4	product_1_1752831113742.png	1	2025-07-18 09:31:53.744	2025-07-18 09:59:10.797
6	product_1_1752832794437.jpg	1	2025-07-18 09:59:54.439	\N
5	product_1_1752832748804.ico	1	2025-07-18 09:59:08.807	2025-07-18 09:59:58.667
7	product_44_1753003924290.jpg	44	2025-07-20 09:32:04.294	\N
\.


--
-- Data for Name: ProductSpecificationFile; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductSpecificationFile" ("Id", "ProductId", "FileName", "FilePath", "MimeType", "UploadedAt", "DeletedAt") FROM stdin;
1	1	productspec_1_1752815253527_19757.pdf	/images/product/productspecification/productspec_1_1752815253527_19757.pdf	application/pdf	2025-07-18 05:07:33.537	2025-07-18 09:17:23.529
2	1	productspec_1_1752815320977_94199.pdf	/images/product/productspecification/productspec_1_1752815320977_94199.pdf	application/pdf	2025-07-18 05:08:40.978	2025-07-18 09:17:23.551
3	1	productspec_1_1752815333381_89718.pdf	/images/product/productspecification/productspec_1_1752815333381_89718.pdf	application/pdf	2025-07-18 05:08:53.382	2025-07-18 09:17:23.56
4	1	productspec_1_1752815356455_62929.jpg	/images/product/productspecification/productspec_1_1752815356455_62929.jpg	image/jpeg	2025-07-18 05:09:16.456	2025-07-18 09:17:23.569
5	1	productspec_1_1752815371729_30904.pdf	/images/product/productspecification/productspec_1_1752815371729_30904.pdf	application/pdf	2025-07-18 05:09:31.73	2025-07-18 09:17:23.574
6	1	productspec_1_1752828709608_23215.pdf	/images/product/productspecification/productspec_1_1752828709608_23215.pdf	application/pdf	2025-07-18 08:51:49.61	2025-07-18 09:17:23.585
7	1	productspec_1_1752830243592_20148.pdf	/images/product/productspecification/productspec_1_1752830243592_20148.pdf	application/pdf	2025-07-18 09:17:23.83	2025-07-18 09:57:59.317
8	1	productspec_1_1752832679325_91148.pdf	/images/product/productspecification/productspec_1_1752832679325_91148.pdf	application/pdf	2025-07-18 09:57:59.558	\N
9	45	productspec_45_1753002056599_40124.pdf	/images/product/productspecification/productspec_45_1753002056599_40124.pdf	application/pdf	2025-07-20 09:00:56.909	\N
10	46	productspec_46_1753002209152_34316.pdf	/images/product/productspecification/productspec_46_1753002209152_34316.pdf	application/pdf	2025-07-20 09:03:29.319	\N
11	47	productspec_47_1753002222688_88262.pdf	/images/product/productspecification/productspec_47_1753002222688_88262.pdf	application/pdf	2025-07-20 09:03:42.776	\N
\.


--
-- Data for Name: RoleMenuAccess; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."RoleMenuAccess" ("Id", "RoleId", "MenuId", "Access") FROM stdin;
42	5	3	WRITE
41	5	2	WRITE
40	5	1	NONE
51	5	12	WRITE
50	5	11	WRITE
48	5	9	WRITE
46	5	7	WRITE
49	5	10	WRITE
47	5	8	WRITE
43	5	4	WRITE
44	5	5	WRITE
45	5	6	WRITE
52	5	13	WRITE
3	3	3	WRITE
2	3	2	WRITE
1	3	1	WRITE
12	3	12	WRITE
11	3	11	WRITE
9	3	9	WRITE
7	3	7	WRITE
10	3	10	WRITE
8	3	8	WRITE
4	3	4	WRITE
5	3	5	WRITE
6	3	6	WRITE
13	3	13	WRITE
25	6	12	WRITE
26	6	13	WRITE
27	2	1	WRITE
28	2	2	WRITE
29	2	3	WRITE
30	2	4	WRITE
31	2	5	WRITE
32	2	6	WRITE
33	2	7	WRITE
34	2	8	WRITE
35	2	9	WRITE
36	2	10	WRITE
37	2	11	WRITE
38	2	12	WRITE
39	2	13	WRITE
14	6	1	WRITE
15	6	2	WRITE
16	6	3	WRITE
17	6	4	WRITE
18	6	5	WRITE
19	6	6	WRITE
20	6	7	WRITE
21	6	8	WRITE
22	6	9	WRITE
23	6	10	WRITE
24	6	11	WRITE
\.


--
-- Data for Name: RoleMenuFeatureAccess; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."RoleMenuFeatureAccess" ("Id", "RoleId", "MenuFeatureId", "Access") FROM stdin;
32	6	1	WRITE
33	6	2	WRITE
34	6	3	WRITE
35	6	4	WRITE
36	6	5	WRITE
37	6	6	WRITE
38	6	7	WRITE
39	6	8	WRITE
40	6	9	WRITE
41	6	10	WRITE
42	6	11	WRITE
43	6	12	WRITE
44	6	13	WRITE
45	6	14	WRITE
46	6	15	WRITE
47	6	16	WRITE
48	6	17	WRITE
49	6	18	WRITE
50	6	19	WRITE
51	6	20	WRITE
52	6	21	WRITE
53	6	22	WRITE
54	6	23	WRITE
55	6	24	WRITE
56	6	25	WRITE
57	6	26	WRITE
58	6	27	WRITE
59	6	28	WRITE
60	6	29	WRITE
61	6	30	WRITE
62	6	31	WRITE
63	2	1	WRITE
64	2	2	WRITE
65	2	3	WRITE
66	2	4	WRITE
67	2	5	WRITE
68	2	6	WRITE
69	2	7	WRITE
70	2	8	WRITE
71	2	9	WRITE
72	2	10	WRITE
73	2	11	WRITE
74	2	12	WRITE
75	2	13	WRITE
76	2	14	WRITE
77	2	15	WRITE
78	2	16	WRITE
79	2	17	WRITE
80	2	18	WRITE
81	2	19	WRITE
82	2	20	WRITE
83	2	21	WRITE
84	2	22	WRITE
85	2	23	WRITE
86	2	24	WRITE
87	2	25	WRITE
26	3	26	WRITE
27	3	27	WRITE
20	3	20	WRITE
21	3	21	WRITE
22	3	22	WRITE
96	5	3	NONE
97	5	4	NONE
98	5	5	NONE
99	5	6	NONE
121	5	28	WRITE
122	5	29	WRITE
123	5	30	WRITE
124	5	31	WRITE
117	5	24	WRITE
118	5	25	WRITE
119	5	26	WRITE
120	5	27	WRITE
113	5	20	WRITE
114	5	21	WRITE
115	5	22	WRITE
116	5	23	WRITE
108	5	15	WRITE
109	5	16	WRITE
110	5	17	WRITE
111	5	18	WRITE
112	5	19	WRITE
23	3	23	WRITE
15	3	15	WRITE
16	3	16	WRITE
17	3	17	WRITE
18	3	18	WRITE
19	3	19	WRITE
104	5	11	WRITE
105	5	12	WRITE
106	5	13	WRITE
107	5	14	WRITE
100	5	7	WRITE
101	5	8	WRITE
102	5	9	WRITE
103	5	10	WRITE
94	5	1	NONE
95	5	2	NONE
11	3	11	WRITE
12	3	12	WRITE
13	3	13	WRITE
14	3	14	WRITE
7	3	7	WRITE
8	3	8	WRITE
9	3	9	WRITE
10	3	10	WRITE
1	3	1	WRITE
2	3	2	WRITE
3	3	3	WRITE
4	3	4	WRITE
88	2	26	WRITE
89	2	27	WRITE
90	2	28	WRITE
91	2	29	WRITE
92	2	30	WRITE
93	2	31	WRITE
5	3	5	WRITE
6	3	6	WRITE
28	3	28	WRITE
29	3	29	WRITE
30	3	30	WRITE
31	3	31	WRITE
24	3	24	WRITE
25	3	25	WRITE
\.


--
-- Data for Name: Sales; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Sales" ("Id", "AdminId") FROM stdin;
2	2
3	4
4	1
5	3
\.


--
-- Data for Name: SalesOrder; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."SalesOrder" ("Id", "SalesOrderNumber", "JdeSalesOrderNumber", "DealerId", "UserId", "SalesId", "Status", "Note", "PaymentTerm", "FOB", "CustomerPoNumber", "DeliveryOrderNumber", "CreatedAt", "DeletedAt", "TransactionToken") FROM stdin;
2	SS-01/101/08/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-02 17:55:53.406	\N	
4	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-05 17:34:02.7	\N	
5	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-05 17:34:05.316	\N	
6	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-05 17:34:06.349	\N	
7	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-05 17:34:30.361	\N	
3	SS-01/101/06/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-05 17:23:08.138	\N	
9	SS-01/101/07/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	30	\N	\N	\N	2025-07-07 07:25:30.091	\N	
10	SS-02/101/07/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-07 07:32:59.156	\N	
14	SS-01/#8003/19/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-19 14:31:15.232	\N	
16	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 15:07:23.041	\N	
15	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 14:47:21.954	\N	
13	SS-01/#8003/19/JUL/2025		1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 10:17:20.92	\N	
17	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 15:08:37.962	\N	
18	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 15:41:40.849	\N	
1	SS-02/#8003/19/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	30	Jakarta	Memo 011/Mei	\N	2025-05-25 19:30:02.454	\N	
20	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 15:51:45.8	\N	
12	SS-02/#8003/19/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-18 10:58:17.636	\N	
19	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 15:43:17.955	\N	
11	SS-02/#8003/19/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-17 09:10:57.184	\N	
22	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 16:58:11.544	\N	
8	SS-02/#8003/19/JUL/2025		1	9	4	APPROVED_EMAIL_SENT	\N	\N	\N	\N	\N	2025-07-05 17:36:32.384	\N	
21	\N	\N	1	9	4	REJECTED	\N	\N	\N	\N	\N	2025-07-19 16:57:01.401	\N	
23	\N	\N	1	9	4	PENDING_APPROVAL	\N	\N	\N	\N	\N	2025-07-19 16:59:43.797	\N	
\.


--
-- Data for Name: SalesOrderDetail; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."SalesOrderDetail" ("Id", "SalesOrderId", "ItemCodeId", "WarehouseId", "Quantity", "Price", "FinalPrice", "PriceCategoryId", "FulfillmentStatus", "TaxId") FROM stdin;
201	13	1	1	160.79	30000	9647400	\N	READY	12
82	3	210	2	17	40000	1360000	\N	READY	12
141	2	1	2	1	30000	30000	\N	READY	\N
142	2	38	2	2	114750	229500	\N	READY	\N
91	9	151	2	100	13000	2600000	1	READY	12
96	10	157	3	10	15000	300000	1	READY	12
97	10	159	2	10	17000	340000	1	READY	12
98	10	163	2	9	18000	324000	1	READY	12
99	10	151	2	4	13000	104000	1	READY	12
202	13	1	3	1839.21	30000	110352600	\N	READY	12
206	14	1	2	157.79	30000	5254407	3	READY	13
207	14	1	1	1279.79	30000	42617007.00000001	3	READY	13
208	15	1	3	10	20000	22200	3	READY	13
209	16	1	3	3000	30000	33300	3	READY	13
210	17	1	3	3000	30000	33300	3	READY	13
211	18	40	3	3000	30000	33300	3	READY	13
212	19	40	3	4000	30000	33300	3	READY	13
213	20	40	2	1500	30000	33300	3	READY	13
214	20	40	1	1500	30000	33300	3	READY	13
215	21	40	3	6000	30000	33300	3	READY	13
216	22	40	3	6000	30000	33300	3	READY	13
217	23	40	3	6000	30000	33300	3	READY	13
160	1	40	2	1000	300000	600000000	\N	READY	12
161	1	77	2	1	5000	10000	\N	READY	12
162	1	1	1	1	3000	6000	\N	READY	12
164	12	42	1	101	30000	6060000	\N	READY	12
165	11	1	1	1	30000	60000	3	READY	12
166	8	210	2	19	50000	1900000	1	READY	12
\.


--
-- Data for Name: SalesOrderFile; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."SalesOrderFile" ("Id", "SalesOrderId", "ExcelFile", "PdfFile", "CreatedAt", "UpdatedAt") FROM stdin;
3	3	salesorder_3.xlsx	salesorder_3.pdf	2025-07-06 16:13:40.622	2025-07-06 16:13:40.622
4	9	salesorder_9.xlsx	salesorder_9.pdf	2025-07-07 07:26:11.283	2025-07-07 07:26:11.283
5	10	salesorder_10.xlsx	salesorder_10.pdf	2025-07-07 07:33:30.489	2025-07-07 07:33:30.489
2	2	salesorder_2.xlsx	salesorder_2.pdf	2025-07-02 17:56:26.894	2025-07-07 19:16:23.283
1	1	salesorder_1.xlsx	salesorder_1.pdf	2025-06-26 11:03:17.477	2025-07-19 11:01:32.095
6	12	salesorder_12.xlsx	salesorder_12.pdf	2025-07-18 11:00:43.071	2025-07-19 11:04:07.493
8	11	salesorder_11.xlsx	salesorder_11.pdf	2025-07-19 10:50:16.084	2025-07-19 11:52:53.964
9	8	salesorder_8.xlsx	salesorder_8.pdf	2025-07-19 11:53:15.994	2025-07-19 11:53:15.994
7	13	salesorder_13.xlsx	salesorder_13.pdf	2025-07-19 10:18:21.355	2025-07-19 12:51:04.678
10	14	salesorder_14.xlsx	salesorder_14.pdf	2025-07-19 14:32:35.34	2025-07-19 14:32:35.34
\.


--
-- Data for Name: StockHistory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."StockHistory" ("Id", "WarehouseStockId", "ItemCodeId", "QtyBefore", "QtyAfter", "Note", "UpdatedAt", "UploadLogId", "AdminId") FROM stdin;
49	1	1	4389	4390	QtyOnHand updated manually	2025-06-24 18:54:27.969	\N	1
50	1	1	4390	1119	Updated from Excel upload	2025-06-25 04:01:52.848	6	1
51	2	1	0	157.79	Updated from Excel upload	2025-06-25 04:01:52.864	6	1
52	3	1	0	8589	Updated from Excel upload	2025-06-25 04:01:52.871	6	1
53	2	1	157.79	160.79	QtyOnHand updated manually	2025-06-25 04:02:13.797	\N	1
54	\N	1	0	3	QtyPO updated manually	2025-06-25 04:02:13.821	\N	1
55	3	1	8589	8592	QtyOnHand updated manually	2025-06-25 04:02:13.841	\N	1
56	1	1	1119	1122	QtyOnHand updated manually	2025-06-25 04:02:13.941	\N	1
57	1	1	1122	4389	Updated from Excel upload	2025-06-25 04:02:20.756	7	1
58	\N	1	3	0	QtyPO updated from Excel	2025-06-25 04:02:20.759	7	1
59	2	1	160.79	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-06-25 04:02:20.771	7	1
60	3	1	8592	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-06-25 04:02:20.776	7	1
61	1	1	4389	1119	Updated from Excel upload	2025-06-25 06:32:58.626	8	1
62	2	1	0	157.79	Updated from Excel upload	2025-06-25 06:32:58.636	8	1
63	3	1	0	8589	Updated from Excel upload	2025-06-25 06:32:58.641	8	1
64	34	34	0	200	Created from Excel upload	2025-06-25 06:32:58.649	8	1
65	35	35	0	989	Created from Excel upload	2025-06-25 06:32:58.656	8	1
66	36	35	0	233	Created from Excel upload	2025-06-25 06:32:58.663	8	1
67	37	35	0	800	Created from Excel upload	2025-06-25 06:32:58.672	8	1
68	38	35	0	2849	Created from Excel upload	2025-06-25 06:32:58.678	8	1
69	39	36	0	18.4	Created from Excel upload	2025-06-25 06:32:58.685	8	1
70	40	36	0	229.3	Created from Excel upload	2025-06-25 06:32:58.691	8	1
71	41	36	0	922	Created from Excel upload	2025-06-25 06:32:58.696	8	1
72	42	37	0	350	Created from Excel upload	2025-06-25 06:32:58.703	8	1
73	43	37	0	110	Created from Excel upload	2025-06-25 06:32:58.707	8	1
74	44	37	0	580	Created from Excel upload	2025-06-25 06:32:58.711	8	1
75	45	38	0	154.23	Created from Excel upload	2025-06-25 06:32:58.716	8	1
76	46	38	0	54.58	Created from Excel upload	2025-06-25 06:32:58.72	8	1
77	47	38	0	500	Created from Excel upload	2025-06-25 06:32:58.725	8	1
78	48	38	0	1519	Created from Excel upload	2025-06-25 06:32:58.73	8	1
79	49	39	0	419	Created from Excel upload	2025-06-25 06:32:58.736	8	1
80	50	39	0	29.37	Created from Excel upload	2025-06-25 06:32:58.74	8	1
81	51	39	0	4525	Created from Excel upload	2025-06-25 06:32:58.744	8	1
82	2	1	157.79	57.78999999999999	Kurangi stok saat Approval SalesOrder #1 (prioritas DealerWarehouse, warehouse 2)	2025-06-28 13:49:43.916	\N	\N
83	2	1	57.78999999999999	157.79	Updated from Excel upload	2025-06-28 14:22:20.502	9	1
84	2	1	157.79	57.78999999999999	Kurangi stok saat Approval SalesOrder #1 (prioritas DealerWarehouse, warehouse 2)	2025-06-28 14:22:27.255	\N	\N
85	2	1	57.78999999999999	157.79	Updated from Excel upload	2025-06-28 14:25:42.943	10	1
86	2	1	157.79	57.78999999999999	Kurangi stok saat Approval SalesOrder #1 (prioritas DealerWarehouse, warehouse 2)	2025-06-28 14:25:52.056	\N	\N
87	2	1	57.78999999999999	0	Kurangi stok saat Approval SalesOrder #1 (prioritas DealerWarehouse, warehouse 2)	2025-06-28 15:05:14.09	\N	\N
88	1	1	1119	1076.79	Kurangi stok saat Approval SalesOrder #1 (prioritas DealerWarehouse, warehouse 1)	2025-06-28 15:05:14.099	\N	\N
89	2	1	0	100	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:07:18.518	\N	\N
90	2	1	100	0	Kurangi stok saat Approval SalesOrder #1 (warehouseId 2)	2025-06-28 15:13:21.413	\N	\N
91	2	1	0	100	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:13:54.665	\N	\N
92	2	1	100	99	QtyOnHand updated manually	2025-06-28 15:14:05.436	\N	1
93	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 15:14:17.885	\N	\N
94	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:15:03.474	\N	\N
95	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 15:44:08.191	\N	\N
96	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:46:22.622	\N	\N
97	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 15:46:44.197	\N	\N
98	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:52:51.32	\N	\N
99	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 15:53:00.047	\N	1
100	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:58:12.626	\N	\N
101	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 15:59:01.867	\N	1
102	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 15:59:23.181	\N	\N
103	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 16:00:59.322	\N	1
104	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 16:01:22.775	\N	\N
105	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 16:04:28.098	\N	1
106	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 16:04:38.04	\N	\N
107	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 16:14:23.813	\N	1
108	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 16:14:42.35	\N	\N
109	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 16:17:15.193	\N	1
110	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 16:17:27.96	\N	\N
111	1	1	1076.79	976.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 16:24:12.186	\N	1
112	1	1	976.79	1076.79	Reversal stok SalesOrder #1 dari status APPROVED_EMAIL_SENT	2025-06-28 16:24:20.843	\N	\N
113	1	1	1076.79	75.78999999999996	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 16:33:24.036	\N	1
114	1	1	75.78999999999996	1076.79	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-06-28 16:33:34.107	\N	1
115	1	1	1076.79	76.78999999999996	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-06-28 17:28:57.695	\N	1
116	1	1	76.78999999999996	1119	Updated from Excel upload	2025-07-01 07:40:58.571	11	1
117	2	1	99	157.79	Updated from Excel upload	2025-07-01 07:40:58.58	11	1
118	52	40	0	2900	Created from Excel upload	2025-07-01 07:40:58.588	11	1
119	53	40	0	1500	Created from Excel upload	2025-07-01 07:40:58.594	11	1
120	54	40	0	19500	Created from Excel upload	2025-07-01 07:40:58.601	11	1
121	55	42	0	2900	Created from Excel upload	2025-07-01 07:52:56.046	13	1
122	56	42	0	1500	Created from Excel upload	2025-07-01 07:52:56.056	13	1
123	57	42	0	3000	Created from Excel upload	2025-07-01 07:52:56.061	13	1
124	2	1	157.79	156.79	Kurangi stok saat Approval SalesOrder #2 (warehouseId 2)	2025-07-02 17:56:26.839	\N	1
125	46	38	54.58	52.58	Kurangi stok saat Approval SalesOrder #2 (warehouseId 2)	2025-07-02 17:56:26.851	\N	1
126	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-02 17:57:53.778	\N	1
127	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 05:53:41.536	\N	1
128	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 05:59:49.747	\N	1
129	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 06:00:00.698	\N	1
130	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 06:05:47.754	\N	1
131	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 06:05:51.929	\N	1
132	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 06:12:45.639	\N	1
133	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 06:12:49.814	\N	1
134	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 06:29:11.534	\N	1
135	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 06:29:16.138	\N	1
136	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 06:37:48.783	\N	1
137	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 06:37:53.065	\N	1
138	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 06:43:45.919	\N	1
139	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 06:43:52.318	\N	1
140	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 06:58:21.754	\N	1
141	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 07:00:51.869	\N	1
142	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 07:08:50.742	\N	1
143	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 07:09:31.026	\N	1
144	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 07:24:16.659	\N	1
145	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 07:24:23.402	\N	1
146	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 07:30:54.565	\N	1
147	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 07:31:00.226	\N	1
148	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 07:43:45.058	\N	1
149	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 07:43:50.515	\N	1
150	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 07:47:04.752	\N	1
151	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-03 07:47:09.634	\N	1
152	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-03 07:49:58.521	\N	1
153	1	1	2119	1119	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-04 15:54:32.5	\N	1
154	2	1	156.79	157.79	Updated from Excel upload	2025-07-05 08:11:35.781	14	1
155	61	43	0	500	Created from Excel upload	2025-07-05 08:11:35.826	14	1
156	62	44	0	4000	Created from Excel upload	2025-07-05 08:11:35.834	14	1
157	63	44	0	2000	Created from Excel upload	2025-07-05 08:11:35.84	14	1
158	64	44	0	27000	Created from Excel upload	2025-07-05 08:11:35.847	14	1
159	65	45	0	2000	Created from Excel upload	2025-07-05 08:11:35.855	14	1
160	46	38	52.58	54.58	Updated from Excel upload	2025-07-05 08:11:35.869	14	1
161	66	46	0	9300	Created from Excel upload | QtyPO: 2700	2025-07-05 08:11:35.879	14	1
162	67	46	0	2000	Created from Excel upload	2025-07-05 08:11:35.886	14	1
163	68	47	0	700	Created from Excel upload	2025-07-05 08:11:35.893	14	1
164	69	48	0	252	Created from Excel upload	2025-07-05 11:17:56.637	15	1
165	70	49	0	791.5	Created from Excel upload	2025-07-05 11:17:56.654	15	1
166	71	50	0	89	Created from Excel upload	2025-07-05 11:17:56.668	15	1
167	72	51	0	1956.9	Created from Excel upload	2025-07-05 11:17:56.778	15	1
168	73	51	0	80	Created from Excel upload	2025-07-05 11:17:56.785	15	1
169	74	52	0	2360	Created from Excel upload	2025-07-05 11:17:56.811	15	1
170	75	52	0	80	Created from Excel upload	2025-07-05 11:17:56.819	15	1
171	76	53	0	385.74	Created from Excel upload	2025-07-05 11:17:56.841	15	1
172	77	53	0	0	Created from Excel upload	2025-07-05 11:17:56.846	15	1
173	78	53	0	40	Created from Excel upload	2025-07-05 11:17:56.857	15	1
174	79	54	0	320.84	Created from Excel upload	2025-07-05 11:17:56.874	15	1
175	80	54	0	60	Created from Excel upload	2025-07-05 11:17:56.88	15	1
176	81	55	0	196.3	Created from Excel upload	2025-07-05 11:17:56.898	15	1
177	82	55	0	138.4	Created from Excel upload	2025-07-05 11:17:56.904	15	1
178	83	55	0	58	Created from Excel upload	2025-07-05 11:17:56.91	15	1
179	84	55	0	99	Created from Excel upload	2025-07-05 11:17:56.914	15	1
180	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:17:57.42	15	1
181	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:17:57.424	15	1
182	85	56	0	0	Created from Excel upload | QtyPO: 305	2025-07-05 11:17:57.442	15	1
183	86	57	0	0	Created from Excel upload | QtyPO: 305	2025-07-05 11:17:57.45	15	1
184	87	57	0	106	Created from Excel upload	2025-07-05 11:17:57.457	15	1
185	88	58	0	63	Created from Excel upload	2025-07-05 11:17:57.465	15	1
186	89	59	0	13	Created from Excel upload	2025-07-05 11:17:57.472	15	1
187	90	59	0	80.25	Created from Excel upload	2025-07-05 11:17:57.477	15	1
188	91	60	0	427	Created from Excel upload	2025-07-05 11:17:57.484	15	1
189	92	61	0	753	Created from Excel upload	2025-07-05 11:17:57.49	15	1
190	93	61	0	183	Created from Excel upload	2025-07-05 11:17:57.494	15	1
191	94	62	0	11	Created from Excel upload	2025-07-05 11:17:57.501	15	1
192	95	62	0	305	Created from Excel upload	2025-07-05 11:17:57.505	15	1
193	96	63	0	6	Created from Excel upload	2025-07-05 11:17:57.511	15	1
194	97	64	0	1363	Created from Excel upload	2025-07-05 11:17:57.518	15	1
195	98	64	0	40	Created from Excel upload	2025-07-05 11:17:57.522	15	1
196	99	65	0	742	Created from Excel upload	2025-07-05 11:17:57.529	15	1
197	100	65	0	351	Created from Excel upload	2025-07-05 11:17:57.535	15	1
198	101	65	0	19.2	Created from Excel upload	2025-07-05 11:17:57.541	15	1
199	102	66	0	61	Created from Excel upload	2025-07-05 11:17:57.55	15	1
200	103	67	0	31	Created from Excel upload	2025-07-05 11:17:57.558	15	1
201	104	68	0	41	Created from Excel upload	2025-07-05 11:17:57.565	15	1
202	105	69	0	20	Created from Excel upload	2025-07-05 11:17:57.572	15	1
203	106	69	0	21	Created from Excel upload	2025-07-05 11:17:57.578	15	1
204	107	70	0	549	Created from Excel upload	2025-07-05 11:17:57.585	15	1
205	108	71	0	85	Created from Excel upload	2025-07-05 11:17:57.591	15	1
206	109	72	0	228	Created from Excel upload	2025-07-05 11:17:57.598	15	1
207	110	72	0	41	Created from Excel upload	2025-07-05 11:17:57.603	15	1
208	111	73	0	219.31	Created from Excel upload	2025-07-05 11:17:57.611	15	1
209	112	74	0	61	Created from Excel upload	2025-07-05 11:17:57.618	15	1
210	113	75	0	40	Created from Excel upload	2025-07-05 11:17:57.626	15	1
211	114	76	0	196	Created from Excel upload	2025-07-05 11:17:57.634	15	1
212	115	76	0	61	Created from Excel upload	2025-07-05 11:17:57.639	15	1
213	116	77	0	682.6	Created from Excel upload	2025-07-05 11:17:57.646	15	1
214	117	77	0	76	Created from Excel upload	2025-07-05 11:17:57.651	15	1
215	118	77	0	173	Created from Excel upload	2025-07-05 11:17:57.656	15	1
216	119	78	0	27	Created from Excel upload	2025-07-05 11:17:57.662	15	1
217	120	79	0	274	Created from Excel upload	2025-07-05 11:17:57.671	15	1
218	121	79	0	147.74	Created from Excel upload	2025-07-05 11:17:57.677	15	1
219	122	80	0	452.1	Created from Excel upload	2025-07-05 11:17:57.689	15	1
220	123	80	0	112	Created from Excel upload	2025-07-05 11:17:57.694	15	1
221	124	81	0	16.5	Created from Excel upload	2025-07-05 11:17:57.701	15	1
222	125	82	0	0	Created from Excel upload | QtyPO: 305	2025-07-05 11:17:57.71	15	1
225	128	85	0	171	Created from Excel upload	2025-07-05 11:17:58.302	15	1
226	129	86	0	71	Created from Excel upload	2025-07-05 11:17:58.309	15	1
227	130	87	0	175	Created from Excel upload	2025-07-05 11:17:58.316	15	1
228	131	88	0	5	Created from Excel upload	2025-07-05 11:17:58.332	15	1
229	132	89	0	20	Created from Excel upload	2025-07-05 11:17:58.339	15	1
230	133	90	0	4	Created from Excel upload	2025-07-05 11:17:58.347	15	1
231	134	91	0	4	Created from Excel upload	2025-07-05 11:17:58.354	15	1
232	135	91	0	10	Created from Excel upload	2025-07-05 11:17:58.359	15	1
233	136	92	0	29.08	Created from Excel upload	2025-07-05 11:17:59.438	15	1
234	137	93	0	11.3	Created from Excel upload	2025-07-05 11:17:59.445	15	1
235	138	94	0	10.5	Created from Excel upload	2025-07-05 11:17:59.452	15	1
236	139	95	0	42	Created from Excel upload	2025-07-05 11:17:59.461	15	1
237	140	95	0	17.9	Created from Excel upload	2025-07-05 11:17:59.466	15	1
238	141	95	0	115	Created from Excel upload	2025-07-05 11:17:59.471	15	1
239	142	96	0	87.65	Created from Excel upload	2025-07-05 11:17:59.486	15	1
240	143	97	0	60	Created from Excel upload	2025-07-05 11:17:59.498	15	1
241	144	98	0	9	Created from Excel upload	2025-07-05 11:17:59.735	15	1
242	145	99	0	300	Created from Excel upload	2025-07-05 11:17:59.742	15	1
243	146	100	0	35	Created from Excel upload	2025-07-05 11:17:59.749	15	1
244	147	101	0	37	Created from Excel upload	2025-07-05 11:17:59.756	15	1
245	148	102	0	201.7	Created from Excel upload	2025-07-05 11:17:59.77	15	1
246	149	103	0	247.5	Created from Excel upload	2025-07-05 11:17:59.782	15	1
247	150	104	0	16	Created from Excel upload	2025-07-05 11:17:59.788	15	1
248	151	105	0	46	Created from Excel upload	2025-07-05 11:17:59.795	15	1
249	152	106	0	8	Created from Excel upload	2025-07-05 11:17:59.802	15	1
223	\N	83	0	3	Created from Excel upload	2025-07-05 11:17:57.885	15	1
250	153	107	0	19.3	Created from Excel upload	2025-07-05 11:17:59.809	15	1
251	154	108	0	40	Created from Excel upload	2025-07-05 11:17:59.818	15	1
252	155	109	0	39	Created from Excel upload	2025-07-05 11:17:59.824	15	1
253	156	110	0	89.6	Created from Excel upload	2025-07-05 11:17:59.831	15	1
254	157	111	0	587	Created from Excel upload	2025-07-05 11:17:59.837	15	1
255	158	111	0	127	Created from Excel upload	2025-07-05 11:17:59.84	15	1
256	159	112	0	50	Created from Excel upload	2025-07-05 11:17:59.847	15	1
257	160	113	0	39	Created from Excel upload	2025-07-05 11:17:59.853	15	1
258	161	114	0	225.4	Created from Excel upload	2025-07-05 11:17:59.86	15	1
259	162	114	0	164	Created from Excel upload	2025-07-05 11:17:59.865	15	1
260	163	115	0	3516.5	Created from Excel upload	2025-07-05 11:17:59.876	15	1
261	164	116	0	123	Created from Excel upload	2025-07-05 11:17:59.882	15	1
262	165	117	0	85	Created from Excel upload	2025-07-05 11:17:59.888	15	1
263	166	118	0	214	Created from Excel upload	2025-07-05 11:17:59.897	15	1
264	167	119	0	330	Created from Excel upload	2025-07-05 11:17:59.903	15	1
265	168	120	0	60	Created from Excel upload	2025-07-05 11:17:59.908	15	1
266	169	121	0	313	Created from Excel upload	2025-07-05 11:17:59.925	15	1
267	170	121	0	50	Created from Excel upload	2025-07-05 11:17:59.929	15	1
268	171	122	0	1356.9	Created from Excel upload	2025-07-05 11:17:59.946	15	1
269	172	122	0	19	Created from Excel upload	2025-07-05 11:17:59.951	15	1
270	173	123	0	1276.8	Created from Excel upload	2025-07-05 11:17:59.965	15	1
271	174	123	0	40	Created from Excel upload	2025-07-05 11:17:59.968	15	1
272	175	123	0	47.6	Created from Excel upload	2025-07-05 11:17:59.972	15	1
273	176	124	0	800.6	Created from Excel upload	2025-07-05 11:17:59.987	15	1
274	177	124	0	120	Created from Excel upload	2025-07-05 11:17:59.992	15	1
275	178	124	0	160	Created from Excel upload	2025-07-05 11:17:59.997	15	1
276	179	124	0	37	Created from Excel upload	2025-07-05 11:18:00.003	15	1
277	180	125	0	511.6	Created from Excel upload	2025-07-05 11:18:00.018	15	1
278	181	125	0	163.3	Created from Excel upload	2025-07-05 11:18:00.025	15	1
279	182	126	0	128.71	Created from Excel upload	2025-07-05 11:18:01.93	15	1
280	183	127	0	739.06	Created from Excel upload	2025-07-05 11:18:01.938	15	1
281	184	127	0	138	Created from Excel upload	2025-07-05 11:18:01.944	15	1
282	185	128	0	1028.5	Created from Excel upload	2025-07-05 11:18:01.951	15	1
283	186	128	0	395	Created from Excel upload	2025-07-05 11:18:01.956	15	1
284	187	129	0	364.26	Created from Excel upload	2025-07-05 11:18:01.965	15	1
285	188	129	0	157	Created from Excel upload	2025-07-05 11:18:01.97	15	1
286	189	129	0	61.1	Created from Excel upload	2025-07-05 11:18:01.974	15	1
287	190	130	0	294.5	Created from Excel upload	2025-07-05 11:18:01.981	15	1
288	191	131	0	15	Created from Excel upload	2025-07-05 11:18:01.988	15	1
289	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:26:44.929	16	1
290	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:26:44.941	16	1
291	\N	57	0	305	QtyPO updated from Excel	2025-07-05 11:26:44.959	16	1
292	\N	57	305	0	QtyPO updated from Excel	2025-07-05 11:26:44.964	16	1
293	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:29:47.534	17	1
294	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:29:47.54	17	1
295	192	132	0	419	Created from Excel upload	2025-07-05 11:29:47.555	17	1
296	193	132	0	29.37	Created from Excel upload	2025-07-05 11:29:47.56	17	1
297	194	132	0	4525	Created from Excel upload	2025-07-05 11:29:47.565	17	1
298	195	133	0	8820	Created from Excel upload | QtyPO: 2000	2025-07-05 11:29:47.573	17	1
299	196	133	0	2000	Created from Excel upload	2025-07-05 11:29:47.577	17	1
300	\N	57	0	305	QtyPO updated from Excel	2025-07-05 11:29:47.584	17	1
301	\N	57	305	0	QtyPO updated from Excel	2025-07-05 11:29:47.589	17	1
302	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:33:27.317	18	1
303	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:33:27.325	18	1
304	\N	133	0	2000	QtyPO updated from Excel	2025-07-05 11:33:27.338	18	1
305	\N	133	2000	0	QtyPO updated from Excel	2025-07-05 11:33:27.342	18	1
306	\N	57	0	305	QtyPO updated from Excel	2025-07-05 11:33:27.352	18	1
307	\N	57	305	0	QtyPO updated from Excel	2025-07-05 11:33:27.358	18	1
308	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:34:24.253	19	1
309	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:34:24.257	19	1
310	\N	133	0	2000	QtyPO updated from Excel	2025-07-05 11:34:24.268	19	1
311	\N	133	2000	0	QtyPO updated from Excel	2025-07-05 11:34:24.272	19	1
312	\N	57	0	305	QtyPO updated from Excel	2025-07-05 11:34:24.281	19	1
313	\N	57	305	0	QtyPO updated from Excel	2025-07-05 11:34:24.287	19	1
314	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:37:22.908	20	1
315	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:37:22.918	20	1
316	\N	133	0	2000	QtyPO updated from Excel	2025-07-05 11:37:22.931	20	1
317	\N	133	2000	0	QtyPO updated from Excel	2025-07-05 11:37:22.936	20	1
318	\N	57	0	305	QtyPO updated from Excel	2025-07-05 11:37:22.946	20	1
319	\N	57	305	0	QtyPO updated from Excel	2025-07-05 11:37:22.954	20	1
320	\N	46	0	2700	QtyPO updated from Excel	2025-07-05 11:38:27.486	21	1
321	\N	46	2700	0	QtyPO updated from Excel	2025-07-05 11:38:27.497	21	1
322	\N	133	0	2000	QtyPO updated from Excel	2025-07-05 11:38:27.51	21	1
323	\N	133	2000	0	QtyPO updated from Excel	2025-07-05 11:38:27.515	21	1
324	\N	57	0	305	QtyPO updated from Excel	2025-07-05 11:38:27.525	21	1
325	\N	57	305	0	QtyPO updated from Excel	2025-07-05 11:38:27.531	21	1
326	\N	82	305	307	QtyPO updated manually	2025-07-05 11:56:01.253	\N	1
327	\N	73	0	2	QtyPO updated manually	2025-07-05 11:56:07.72	\N	1
328	\N	73	2	0	QtyPO updated from Excel (global)	2025-07-05 11:56:48.263	23	1
329	\N	82	307	305	QtyPO updated from Excel (global)	2025-07-05 11:56:48.276	23	1
330	72	51	1956.9	1541.9	Updated from Excel upload	2025-07-05 12:06:33.052	24	1
331	74	52	2360	1464	Updated from Excel upload	2025-07-05 12:06:33.069	24	1
332	76	53	385.74	215.74	Updated from Excel upload	2025-07-05 12:06:33.078	24	1
333	79	54	320.84	170.84	Updated from Excel upload	2025-07-05 12:06:33.088	24	1
334	81	55	196.3	136.3	Updated from Excel upload	2025-07-05 12:06:33.097	24	1
335	1	1	1119	4389	Updated from Excel upload	2025-07-05 12:06:33.122	24	1
336	35	35	989	238	Updated from Excel upload	2025-07-05 12:06:33.127	24	1
337	55	42	2900	2400	Updated from Excel upload	2025-07-05 12:06:33.132	24	1
338	39	36	18.4	6918.4	Updated from Excel upload	2025-07-05 12:06:33.137	24	1
339	62	44	4000	450	Updated from Excel upload	2025-07-05 12:06:33.141	24	1
340	42	37	350	100	Updated from Excel upload	2025-07-05 12:06:33.146	24	1
341	45	38	154.23	2679.73	Updated from Excel upload	2025-07-05 12:06:33.151	24	1
342	66	46	9300	3400	Updated from Excel upload	2025-07-05 12:06:33.155	24	1
343	192	132	419	9509	Updated from Excel upload	2025-07-05 12:06:33.16	24	1
344	195	133	8820	3790	Updated from Excel upload	2025-07-05 12:06:33.164	24	1
345	86	57	0	51	Updated from Excel upload	2025-07-05 12:06:33.171	24	1
346	88	58	63	27	Updated from Excel upload	2025-07-05 12:06:33.177	24	1
347	91	60	427	305	Updated from Excel upload	2025-07-05 12:06:33.183	24	1
348	92	61	753	550	Updated from Excel upload	2025-07-05 12:06:33.189	24	1
349	97	64	1363	1180	Updated from Excel upload	2025-07-05 12:06:33.195	24	1
350	99	65	742	452	Updated from Excel upload	2025-07-05 12:06:33.202	24	1
351	107	70	549	57	Updated from Excel upload	2025-07-05 12:06:33.209	24	1
352	111	73	219.31	119	Updated from Excel upload	2025-07-05 12:06:33.217	24	1
353	114	76	196	183	Updated from Excel upload	2025-07-05 12:06:33.222	24	1
354	116	77	682.6	433	Updated from Excel upload	2025-07-05 12:06:33.227	24	1
355	197	134	0	0	Created from Excel upload | QtyPO: 610	2025-07-05 12:06:33.241	24	1
356	120	79	274	101	Updated from Excel upload	2025-07-05 12:06:33.247	24	1
357	198	135	0	0	Created from Excel upload | QtyPO: 305	2025-07-05 12:06:33.257	24	1
358	125	82	0	352	Updated from Excel upload	2025-07-05 12:06:33.264	24	1
359	130	87	175	190	Updated from Excel upload	2025-07-05 12:06:33.437	24	1
360	139	95	42	30.2	Updated from Excel upload	2025-07-05 12:06:33.808	24	1
361	199	97	0	120	Created from Excel upload	2025-07-05 12:06:33.816	24	1
362	157	111	587	517	Updated from Excel upload	2025-07-05 12:06:33.931	24	1
363	169	121	313	189	Updated from Excel upload	2025-07-05 12:06:33.944	24	1
364	171	122	1356.9	1316.9	Updated from Excel upload	2025-07-05 12:06:33.953	24	1
365	173	123	1276.8	796.8	Updated from Excel upload	2025-07-05 12:06:33.96	24	1
366	176	124	800.6	330.6	Updated from Excel upload	2025-07-05 12:06:33.965	24	1
367	180	125	511.6	26.6	Updated from Excel upload	2025-07-05 12:06:33.971	24	1
368	187	129	364.26	389.26	Updated from Excel upload	2025-07-05 12:06:34.425	24	1
369	190	130	294.5	232	Updated from Excel upload	2025-07-05 12:06:34.429	24	1
370	\N	82	305	366	QtyPO updated from Excel (global)	2025-07-05 12:06:34.527	24	1
371	108	71	85	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.58	24	1
372	110	72	41	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.583	24	1
373	112	74	61	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.585	24	1
374	113	75	40	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.588	24	1
375	115	76	61	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.59	24	1
376	117	77	76	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.593	24	1
377	118	77	173	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.596	24	1
378	119	78	27	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.598	24	1
379	121	79	147.74	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.601	24	1
380	123	80	112	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.604	24	1
381	124	81	16.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.606	24	1
384	131	88	5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.614	24	1
385	133	90	4	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.617	24	1
386	134	91	4	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.62	24	1
387	135	91	10	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.622	24	1
388	3	1	8589	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.625	24	1
389	34	34	200	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.628	24	1
390	36	35	233	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.63	24	1
391	37	35	800	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.633	24	1
392	38	35	2849	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.636	24	1
393	40	36	229.3	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.639	24	1
394	41	36	922	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.648	24	1
382	\N	83	3	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.609	24	1
395	43	37	110	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.653	24	1
396	44	37	580	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.659	24	1
397	47	38	500	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.663	24	1
398	48	38	1519	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.666	24	1
399	50	39	29.37	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.67	24	1
400	51	39	4525	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.674	24	1
401	2	1	157.79	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.678	24	1
402	61	43	500	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.682	24	1
403	63	44	2000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.687	24	1
404	64	44	27000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.691	24	1
405	65	45	2000	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.695	24	1
406	46	38	54.58	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.699	24	1
407	67	46	2000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.702	24	1
408	68	47	700	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.705	24	1
409	69	48	252	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.709	24	1
410	70	49	791.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.713	24	1
411	71	50	89	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.715	24	1
412	73	51	80	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.718	24	1
413	75	52	80	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.722	24	1
414	78	53	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.726	24	1
415	80	54	60	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.729	24	1
416	82	55	138.4	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.732	24	1
417	83	55	58	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.734	24	1
418	84	55	99	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.738	24	1
419	87	57	106	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.741	24	1
420	89	59	13	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.744	24	1
421	90	59	80.25	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.747	24	1
422	136	92	29.08	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.75	24	1
423	137	93	11.3	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.752	24	1
424	52	40	2900	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.755	24	1
425	53	40	1500	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.757	24	1
426	54	40	19500	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.759	24	1
427	56	42	1500	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.761	24	1
428	57	42	3000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.763	24	1
429	93	61	183	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.765	24	1
430	94	62	11	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.768	24	1
431	95	62	305	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.771	24	1
432	96	63	6	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.774	24	1
433	98	64	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.777	24	1
434	100	65	351	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.781	24	1
435	101	65	19.2	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.784	24	1
436	102	66	61	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.788	24	1
437	103	67	31	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.792	24	1
438	104	68	41	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.794	24	1
439	105	69	20	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.798	24	1
440	106	69	21	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.801	24	1
441	138	94	10.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.805	24	1
442	140	95	17.9	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.807	24	1
443	141	95	115	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.81	24	1
444	142	96	87.65	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.813	24	1
445	143	97	60	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.816	24	1
446	144	98	9	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.819	24	1
447	146	100	35	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.821	24	1
448	147	101	37	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.824	24	1
449	148	102	201.7	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.827	24	1
450	149	103	247.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.831	24	1
451	150	104	16	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.835	24	1
452	151	105	46	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.838	24	1
453	152	106	8	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.841	24	1
454	153	107	19.3	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.844	24	1
455	154	108	40	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.847	24	1
456	155	109	39	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.849	24	1
457	158	111	127	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.853	24	1
458	159	112	50	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.855	24	1
459	160	113	39	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.858	24	1
460	162	114	164	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.862	24	1
461	163	115	3516.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.864	24	1
462	164	116	123	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.867	24	1
463	165	117	85	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.87	24	1
464	166	118	214	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.873	24	1
465	167	119	330	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.876	24	1
466	168	120	60	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.878	24	1
467	170	121	50	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.881	24	1
468	172	122	19	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.884	24	1
469	174	123	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.887	24	1
470	175	123	47.6	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.889	24	1
471	177	124	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.892	24	1
472	178	124	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.896	24	1
473	179	124	37	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.898	24	1
474	181	125	163.3	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.902	24	1
475	182	126	128.71	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.905	24	1
476	184	127	138	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.908	24	1
477	186	128	395	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.911	24	1
478	188	129	157	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.914	24	1
479	189	129	61.1	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.917	24	1
480	191	131	15	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.919	24	1
481	193	132	29.37	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.921	24	1
482	194	132	4525	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.924	24	1
483	196	133	2000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:06:34.926	24	1
484	69	48	0	252	Updated from Excel upload	2025-07-05 12:16:17.045	25	1
485	70	49	0	791.5	Updated from Excel upload	2025-07-05 12:16:17.057	25	1
486	71	50	0	89	Updated from Excel upload	2025-07-05 12:16:17.062	25	1
487	72	51	1541.9	1956.9	Updated from Excel upload	2025-07-05 12:16:17.167	25	1
488	73	51	0	80	Updated from Excel upload	2025-07-05 12:16:17.172	25	1
489	74	52	1464	2360	Updated from Excel upload	2025-07-05 12:16:17.193	25	1
490	75	52	0	80	Updated from Excel upload	2025-07-05 12:16:17.199	25	1
491	76	53	215.74	385.74	Updated from Excel upload	2025-07-05 12:16:17.215	25	1
492	78	53	0	40	Updated from Excel upload	2025-07-05 12:16:17.223	25	1
493	79	54	170.84	320.84	Updated from Excel upload	2025-07-05 12:16:17.236	25	1
494	80	54	0	60	Updated from Excel upload	2025-07-05 12:16:17.241	25	1
495	81	55	136.3	196.3	Updated from Excel upload	2025-07-05 12:16:17.253	25	1
496	82	55	0	138.4	Updated from Excel upload	2025-07-05 12:16:17.258	25	1
497	83	55	0	58	Updated from Excel upload	2025-07-05 12:16:17.262	25	1
498	84	55	0	99	Updated from Excel upload	2025-07-05 12:16:17.267	25	1
499	1	1	4389	1119	Updated from Excel upload	2025-07-05 12:16:17.804	25	1
500	2	1	0	157.79	Updated from Excel upload	2025-07-05 12:16:17.808	25	1
501	3	1	0	8589	Updated from Excel upload	2025-07-05 12:16:17.812	25	1
502	52	40	0	2900	Updated from Excel upload	2025-07-05 12:16:17.816	25	1
503	53	40	0	1500	Updated from Excel upload	2025-07-05 12:16:17.82	25	1
504	54	40	0	19500	Updated from Excel upload	2025-07-05 12:16:17.824	25	1
505	34	34	0	200	Updated from Excel upload	2025-07-05 12:16:17.829	25	1
506	35	35	238	989	Updated from Excel upload	2025-07-05 12:16:17.834	25	1
507	36	35	0	233	Updated from Excel upload	2025-07-05 12:16:17.837	25	1
508	37	35	0	800	Updated from Excel upload	2025-07-05 12:16:17.84	25	1
509	38	35	0	2849	Updated from Excel upload	2025-07-05 12:16:17.845	25	1
510	55	42	2400	2900	Updated from Excel upload	2025-07-05 12:16:17.849	25	1
511	56	42	0	1500	Updated from Excel upload	2025-07-05 12:16:17.852	25	1
512	57	42	0	3000	Updated from Excel upload	2025-07-05 12:16:17.855	25	1
513	39	36	6918.4	18.4	Updated from Excel upload	2025-07-05 12:16:17.859	25	1
514	40	36	0	229.3	Updated from Excel upload	2025-07-05 12:16:17.863	25	1
515	41	36	0	922	Updated from Excel upload	2025-07-05 12:16:17.866	25	1
516	61	43	0	500	Updated from Excel upload	2025-07-05 12:16:17.869	25	1
517	62	44	450	4000	Updated from Excel upload	2025-07-05 12:16:17.873	25	1
518	63	44	0	2000	Updated from Excel upload	2025-07-05 12:16:17.877	25	1
519	64	44	0	27000	Updated from Excel upload	2025-07-05 12:16:17.882	25	1
520	65	45	0	2000	Updated from Excel upload	2025-07-05 12:16:17.886	25	1
521	42	37	100	350	Updated from Excel upload	2025-07-05 12:16:17.89	25	1
522	43	37	0	110	Updated from Excel upload	2025-07-05 12:16:17.893	25	1
523	44	37	0	580	Updated from Excel upload	2025-07-05 12:16:17.897	25	1
524	45	38	2679.73	154.23	Updated from Excel upload	2025-07-05 12:16:17.901	25	1
525	46	38	0	54.58	Updated from Excel upload	2025-07-05 12:16:17.904	25	1
526	47	38	0	500	Updated from Excel upload	2025-07-05 12:16:17.908	25	1
527	48	38	0	1519	Updated from Excel upload	2025-07-05 12:16:17.911	25	1
528	66	46	3400	9300	Updated from Excel upload	2025-07-05 12:16:17.915	25	1
529	67	46	0	2000	Updated from Excel upload	2025-07-05 12:16:17.918	25	1
530	68	47	0	700	Updated from Excel upload	2025-07-05 12:16:17.924	25	1
531	192	132	9509	419	Updated from Excel upload	2025-07-05 12:16:17.928	25	1
532	193	132	0	29.37	Updated from Excel upload	2025-07-05 12:16:17.932	25	1
533	194	132	0	4525	Updated from Excel upload	2025-07-05 12:16:17.936	25	1
534	195	133	3790	8820	Updated from Excel upload	2025-07-05 12:16:17.94	25	1
535	196	133	0	2000	Updated from Excel upload	2025-07-05 12:16:17.945	25	1
536	86	57	51	0	Updated from Excel upload	2025-07-05 12:16:17.954	25	1
537	87	57	0	106	Updated from Excel upload	2025-07-05 12:16:17.959	25	1
538	88	58	27	63	Updated from Excel upload	2025-07-05 12:16:17.965	25	1
539	89	59	0	13	Updated from Excel upload	2025-07-05 12:16:17.971	25	1
540	90	59	0	80.25	Updated from Excel upload	2025-07-05 12:16:17.976	25	1
541	91	60	305	427	Updated from Excel upload	2025-07-05 12:16:17.982	25	1
542	92	61	550	753	Updated from Excel upload	2025-07-05 12:16:17.987	25	1
543	93	61	0	183	Updated from Excel upload	2025-07-05 12:16:17.992	25	1
544	94	62	0	11	Updated from Excel upload	2025-07-05 12:16:17.997	25	1
545	95	62	0	305	Updated from Excel upload	2025-07-05 12:16:18.002	25	1
546	96	63	0	6	Updated from Excel upload	2025-07-05 12:16:18.007	25	1
547	97	64	1180	1363	Updated from Excel upload	2025-07-05 12:16:18.013	25	1
548	98	64	0	40	Updated from Excel upload	2025-07-05 12:16:18.019	25	1
549	99	65	452	742	Updated from Excel upload	2025-07-05 12:16:18.025	25	1
550	100	65	0	351	Updated from Excel upload	2025-07-05 12:16:18.031	25	1
551	101	65	0	19.2	Updated from Excel upload	2025-07-05 12:16:18.036	25	1
552	102	66	0	61	Updated from Excel upload	2025-07-05 12:16:18.042	25	1
553	103	67	0	31	Updated from Excel upload	2025-07-05 12:16:18.048	25	1
554	104	68	0	41	Updated from Excel upload	2025-07-05 12:16:18.053	25	1
555	105	69	0	20	Updated from Excel upload	2025-07-05 12:16:18.059	25	1
556	106	69	0	21	Updated from Excel upload	2025-07-05 12:16:18.065	25	1
557	107	70	57	549	Updated from Excel upload	2025-07-05 12:16:18.071	25	1
558	108	71	0	85	Updated from Excel upload	2025-07-05 12:16:18.077	25	1
559	110	72	0	41	Updated from Excel upload	2025-07-05 12:16:18.087	25	1
560	111	73	119	219.31	Updated from Excel upload	2025-07-05 12:16:18.091	25	1
561	112	74	0	61	Updated from Excel upload	2025-07-05 12:16:18.096	25	1
562	113	75	0	40	Updated from Excel upload	2025-07-05 12:16:18.101	25	1
563	114	76	183	196	Updated from Excel upload	2025-07-05 12:16:18.105	25	1
564	115	76	0	61	Updated from Excel upload	2025-07-05 12:16:18.109	25	1
565	116	77	433	682.6	Updated from Excel upload	2025-07-05 12:16:18.114	25	1
566	117	77	0	76	Updated from Excel upload	2025-07-05 12:16:18.118	25	1
567	118	77	0	173	Updated from Excel upload	2025-07-05 12:16:18.122	25	1
568	119	78	0	27	Updated from Excel upload	2025-07-05 12:16:18.127	25	1
569	120	79	101	274	Updated from Excel upload	2025-07-05 12:16:18.132	25	1
570	121	79	0	147.74	Updated from Excel upload	2025-07-05 12:16:18.137	25	1
571	123	80	0	112	Updated from Excel upload	2025-07-05 12:16:18.144	25	1
572	124	81	0	16.5	Updated from Excel upload	2025-07-05 12:16:18.15	25	1
573	125	82	352	0	Updated from Excel upload	2025-07-05 12:16:18.155	25	1
576	130	87	190	175	Updated from Excel upload	2025-07-05 12:16:18.835	25	1
577	131	88	0	5	Updated from Excel upload	2025-07-05 12:16:18.85	25	1
578	133	90	0	4	Updated from Excel upload	2025-07-05 12:16:18.855	25	1
579	134	91	0	4	Updated from Excel upload	2025-07-05 12:16:18.858	25	1
580	135	91	0	10	Updated from Excel upload	2025-07-05 12:16:18.862	25	1
581	136	92	0	29.08	Updated from Excel upload	2025-07-05 12:16:20.263	25	1
582	137	93	0	11.3	Updated from Excel upload	2025-07-05 12:16:20.268	25	1
583	138	94	0	10.5	Updated from Excel upload	2025-07-05 12:16:20.272	25	1
584	139	95	30.2	42	Updated from Excel upload	2025-07-05 12:16:20.276	25	1
585	140	95	0	17.9	Updated from Excel upload	2025-07-05 12:16:20.28	25	1
586	141	95	0	115	Updated from Excel upload	2025-07-05 12:16:20.283	25	1
587	142	96	0	87.65	Updated from Excel upload	2025-07-05 12:16:20.293	25	1
588	143	97	0	60	Updated from Excel upload	2025-07-05 12:16:20.303	25	1
589	144	98	0	9	Updated from Excel upload	2025-07-05 12:16:20.538	25	1
590	146	100	0	35	Updated from Excel upload	2025-07-05 12:16:20.544	25	1
591	147	101	0	37	Updated from Excel upload	2025-07-05 12:16:20.548	25	1
592	148	102	0	201.7	Updated from Excel upload	2025-07-05 12:16:20.561	25	1
593	149	103	0	247.5	Updated from Excel upload	2025-07-05 12:16:20.571	25	1
594	150	104	0	16	Updated from Excel upload	2025-07-05 12:16:20.576	25	1
595	151	105	0	46	Updated from Excel upload	2025-07-05 12:16:20.58	25	1
596	152	106	0	8	Updated from Excel upload	2025-07-05 12:16:20.585	25	1
597	153	107	0	19.3	Updated from Excel upload	2025-07-05 12:16:20.591	25	1
598	154	108	0	40	Updated from Excel upload	2025-07-05 12:16:20.599	25	1
599	155	109	0	39	Updated from Excel upload	2025-07-05 12:16:20.604	25	1
600	157	111	517	587	Updated from Excel upload	2025-07-05 12:16:20.611	25	1
601	158	111	0	127	Updated from Excel upload	2025-07-05 12:16:20.616	25	1
602	159	112	0	50	Updated from Excel upload	2025-07-05 12:16:20.62	25	1
603	160	113	0	39	Updated from Excel upload	2025-07-05 12:16:20.625	25	1
574	\N	83	0	3	Updated from Excel upload	2025-07-05 12:16:18.343	25	1
604	162	114	0	164	Updated from Excel upload	2025-07-05 12:16:20.631	25	1
605	163	115	0	3516.5	Updated from Excel upload	2025-07-05 12:16:20.642	25	1
606	164	116	0	123	Updated from Excel upload	2025-07-05 12:16:20.646	25	1
607	165	117	0	85	Updated from Excel upload	2025-07-05 12:16:20.651	25	1
608	166	118	0	214	Updated from Excel upload	2025-07-05 12:16:20.66	25	1
609	167	119	0	330	Updated from Excel upload	2025-07-05 12:16:20.665	25	1
610	168	120	0	60	Updated from Excel upload	2025-07-05 12:16:20.67	25	1
611	169	121	189	313	Updated from Excel upload	2025-07-05 12:16:20.688	25	1
612	170	121	0	50	Updated from Excel upload	2025-07-05 12:16:20.694	25	1
613	171	122	1316.9	1356.9	Updated from Excel upload	2025-07-05 12:16:20.717	25	1
614	172	122	0	19	Updated from Excel upload	2025-07-05 12:16:20.723	25	1
615	173	123	796.8	1276.8	Updated from Excel upload	2025-07-05 12:16:20.74	25	1
616	174	123	0	40	Updated from Excel upload	2025-07-05 12:16:20.746	25	1
617	175	123	0	47.6	Updated from Excel upload	2025-07-05 12:16:20.752	25	1
618	176	124	330.6	800.6	Updated from Excel upload	2025-07-05 12:16:20.764	25	1
619	177	124	0	120	Updated from Excel upload	2025-07-05 12:16:20.77	25	1
620	178	124	0	160	Updated from Excel upload	2025-07-05 12:16:20.775	25	1
621	179	124	0	37	Updated from Excel upload	2025-07-05 12:16:20.781	25	1
622	180	125	26.6	511.6	Updated from Excel upload	2025-07-05 12:16:20.792	25	1
623	181	125	0	163.3	Updated from Excel upload	2025-07-05 12:16:20.797	25	1
624	182	126	0	128.71	Updated from Excel upload	2025-07-05 12:16:22.968	25	1
625	184	127	0	138	Updated from Excel upload	2025-07-05 12:16:22.974	25	1
626	186	128	0	395	Updated from Excel upload	2025-07-05 12:16:22.98	25	1
627	187	129	389.26	364.26	Updated from Excel upload	2025-07-05 12:16:22.984	25	1
628	188	129	0	157	Updated from Excel upload	2025-07-05 12:16:22.989	25	1
629	189	129	0	61.1	Updated from Excel upload	2025-07-05 12:16:22.993	25	1
630	190	130	232	294.5	Updated from Excel upload	2025-07-05 12:16:22.996	25	1
631	191	131	0	15	Updated from Excel upload	2025-07-05 12:16:23	25	1
632	\N	82	366	305	QtyPO updated from Excel (global)	2025-07-05 12:16:23.264	25	1
633	199	97	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:16:23.382	25	1
634	72	51	1956.9	1541.9	Updated from Excel upload	2025-07-05 12:26:48.56	26	1
635	74	52	2360	1464	Updated from Excel upload	2025-07-05 12:26:48.577	26	1
636	76	53	385.74	215.74	Updated from Excel upload	2025-07-05 12:26:48.59	26	1
637	79	54	320.84	170.84	Updated from Excel upload	2025-07-05 12:26:48.6	26	1
638	81	55	196.3	136.3	Updated from Excel upload	2025-07-05 12:26:48.61	26	1
639	1	1	1119	4389	Updated from Excel upload	2025-07-05 12:26:48.641	26	1
640	35	35	989	238	Updated from Excel upload	2025-07-05 12:26:48.648	26	1
641	55	42	2900	2400	Updated from Excel upload	2025-07-05 12:26:48.654	26	1
642	39	36	18.4	6918.4	Updated from Excel upload	2025-07-05 12:26:48.66	26	1
643	62	44	4000	450	Updated from Excel upload	2025-07-05 12:26:48.667	26	1
644	42	37	350	100	Updated from Excel upload	2025-07-05 12:26:48.673	26	1
645	45	38	154.23	2679.73	Updated from Excel upload	2025-07-05 12:26:48.68	26	1
646	66	46	9300	3400	Updated from Excel upload	2025-07-05 12:26:48.686	26	1
647	192	132	419	9509	Updated from Excel upload	2025-07-05 12:26:48.692	26	1
648	195	133	8820	3790	Updated from Excel upload	2025-07-05 12:26:48.698	26	1
649	86	57	0	51	Updated from Excel upload	2025-07-05 12:26:48.708	26	1
650	88	58	63	27	Updated from Excel upload	2025-07-05 12:26:48.716	26	1
651	91	60	427	305	Updated from Excel upload	2025-07-05 12:26:48.724	26	1
652	92	61	753	550	Updated from Excel upload	2025-07-05 12:26:48.732	26	1
653	97	64	1363	1180	Updated from Excel upload	2025-07-05 12:26:48.74	26	1
654	99	65	742	452	Updated from Excel upload	2025-07-05 12:26:48.747	26	1
655	107	70	549	57	Updated from Excel upload	2025-07-05 12:26:48.755	26	1
656	111	73	219.31	119	Updated from Excel upload	2025-07-05 12:26:48.764	26	1
657	114	76	196	183	Updated from Excel upload	2025-07-05 12:26:48.77	26	1
658	116	77	682.6	433	Updated from Excel upload	2025-07-05 12:26:48.775	26	1
659	120	79	274	101	Updated from Excel upload	2025-07-05 12:26:48.783	26	1
660	125	82	0	352	Updated from Excel upload	2025-07-05 12:26:48.791	26	1
661	130	87	175	190	Updated from Excel upload	2025-07-05 12:26:48.943	26	1
662	139	95	42	30.2	Updated from Excel upload	2025-07-05 12:26:49.306	26	1
663	199	97	0	120	Updated from Excel upload	2025-07-05 12:26:49.315	26	1
664	157	111	587	517	Updated from Excel upload	2025-07-05 12:26:49.417	26	1
665	169	121	313	189	Updated from Excel upload	2025-07-05 12:26:49.429	26	1
666	171	122	1356.9	1316.9	Updated from Excel upload	2025-07-05 12:26:49.437	26	1
667	173	123	1276.8	796.8	Updated from Excel upload	2025-07-05 12:26:49.445	26	1
668	176	124	800.6	330.6	Updated from Excel upload	2025-07-05 12:26:49.449	26	1
669	180	125	511.6	26.6	Updated from Excel upload	2025-07-05 12:26:49.454	26	1
670	187	129	364.26	389.26	Updated from Excel upload	2025-07-05 12:26:49.901	26	1
671	190	130	294.5	232	Updated from Excel upload	2025-07-05 12:26:49.906	26	1
672	\N	82	305	366	QtyPO updated from Excel (global)	2025-07-05 12:26:49.996	26	1
673	36	35	233	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.049	26	1
674	68	47	700	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.052	26	1
675	78	53	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.054	26	1
676	80	54	60	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.057	26	1
677	82	55	138.4	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.059	26	1
678	2	1	157.79	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.062	26	1
679	56	42	1500	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.066	26	1
680	40	36	229.3	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.068	26	1
681	63	44	2000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.071	26	1
682	43	37	110	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.073	26	1
683	46	38	54.58	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.075	26	1
684	67	46	2000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.078	26	1
685	87	57	106	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.08	26	1
686	89	59	13	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.082	26	1
687	93	61	183	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.085	26	1
688	98	64	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.087	26	1
689	101	65	19.2	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.089	26	1
690	112	74	61	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.092	26	1
691	115	76	61	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.094	26	1
692	117	77	76	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.097	26	1
693	121	79	147.74	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.1	26	1
695	131	88	5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.105	26	1
696	140	95	17.9	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.108	26	1
697	110	72	41	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.111	26	1
698	113	75	40	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.113	26	1
699	118	77	173	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.116	26	1
700	119	78	27	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.119	26	1
701	124	81	16.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.122	26	1
703	133	90	4	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.128	26	1
704	134	91	4	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.131	26	1
705	135	91	10	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.133	26	1
706	136	92	29.08	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.136	26	1
707	52	40	2900	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.138	26	1
708	37	35	800	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.141	26	1
709	38	35	2849	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.143	26	1
710	41	36	922	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.146	26	1
711	61	43	500	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.148	26	1
712	44	37	580	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.151	26	1
713	3	1	8589	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.153	26	1
714	64	44	27000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.156	26	1
715	65	45	2000	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.158	26	1
716	47	38	500	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.161	26	1
717	70	49	791.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.163	26	1
718	71	50	89	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.166	26	1
719	73	51	80	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.168	26	1
720	75	52	80	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.17	26	1
721	84	55	99	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.172	26	1
722	90	59	80.25	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.175	26	1
723	137	93	11.3	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.177	26	1
724	138	94	10.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.179	26	1
725	53	40	1500	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.182	26	1
726	54	40	19500	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.185	26	1
727	34	34	200	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.187	26	1
728	57	42	3000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.19	26	1
729	94	62	11	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.192	26	1
730	95	62	305	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.195	26	1
731	96	63	6	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.198	26	1
732	102	66	61	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.2	26	1
733	103	67	31	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.203	26	1
734	104	68	41	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.205	26	1
735	105	69	20	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.208	26	1
736	106	69	21	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.211	26	1
737	108	71	85	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.213	26	1
738	141	95	115	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.216	26	1
739	142	96	87.65	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.218	26	1
740	143	97	60	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.221	26	1
694	\N	83	3	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.102	26	1
741	144	98	9	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.224	26	1
742	146	100	35	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.227	26	1
743	147	101	37	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.229	26	1
744	148	102	201.7	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.232	26	1
745	149	103	247.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.235	26	1
746	196	133	2000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.237	26	1
747	100	65	351	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.24	26	1
748	69	48	252	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.243	26	1
749	83	55	58	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.245	26	1
750	48	38	1519	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.248	26	1
751	193	132	29.37	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.251	26	1
752	194	132	4525	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.253	26	1
753	123	80	112	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.256	26	1
754	150	104	16	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.258	26	1
755	151	105	46	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.261	26	1
756	152	106	8	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.264	26	1
757	153	107	19.3	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.266	26	1
758	154	108	40	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.269	26	1
759	155	109	39	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.271	26	1
760	158	111	127	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.274	26	1
761	159	112	50	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.277	26	1
762	160	113	39	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.28	26	1
763	162	114	164	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.282	26	1
764	163	115	3516.5	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.285	26	1
765	164	116	123	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.288	26	1
766	165	117	85	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.29	26	1
767	166	118	214	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.293	26	1
768	167	119	330	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.296	26	1
769	168	120	60	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.299	26	1
770	170	121	50	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.301	26	1
771	172	122	19	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.304	26	1
772	174	123	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.306	26	1
773	175	123	47.6	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.309	26	1
774	177	124	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.311	26	1
775	178	124	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.314	26	1
776	179	124	37	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.317	26	1
777	181	125	163.3	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.319	26	1
778	182	126	128.71	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.322	26	1
779	184	127	138	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.324	26	1
780	186	128	395	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.327	26	1
781	188	129	157	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.33	26	1
782	189	129	61.1	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 12:26:50.333	26	1
783	191	131	15	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.336	26	1
224	\N	84	0	1	Created from Excel upload	2025-07-05 11:17:57.892	15	1
383	\N	84	1	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:06:34.612	24	1
575	\N	84	0	1	Updated from Excel upload	2025-07-05 12:16:18.35	25	1
702	\N	84	1	0	Stock nulled: ItemCode not found in Excel	2025-07-05 12:26:50.125	26	1
784	69	48	0	252	Updated from Excel upload	2025-07-05 16:32:29.209	27	1
785	70	49	0	791.5	Updated from Excel upload	2025-07-05 16:32:29.219	27	1
786	71	50	0	89	Updated from Excel upload	2025-07-05 16:32:29.225	27	1
787	200	136	0	3511	Created from Excel upload	2025-07-05 16:32:29.33	27	1
788	201	136	0	1170	Created from Excel upload	2025-07-05 16:32:29.337	27	1
789	202	136	0	551	Created from Excel upload	2025-07-05 16:32:29.344	27	1
790	203	137	0	1970	Created from Excel upload	2025-07-05 16:32:29.355	27	1
791	204	137	0	180	Created from Excel upload	2025-07-05 16:32:29.362	27	1
792	205	137	0	60	Created from Excel upload	2025-07-05 16:32:29.369	27	1
793	206	137	0	342.5	Created from Excel upload	2025-07-05 16:32:29.375	27	1
794	207	138	0	716.5	Created from Excel upload	2025-07-05 16:32:29.385	27	1
795	208	138	0	82	Created from Excel upload	2025-07-05 16:32:29.39	27	1
796	72	51	1541.9	1956.9	Updated from Excel upload	2025-07-05 16:32:29.396	27	1
797	73	51	0	80	Updated from Excel upload	2025-07-05 16:32:29.4	27	1
798	209	139	0	1439	Created from Excel upload	2025-07-05 16:32:29.41	27	1
799	210	139	0	560	Created from Excel upload	2025-07-05 16:32:29.417	27	1
800	211	139	0	160	Created from Excel upload	2025-07-05 16:32:29.423	27	1
801	212	140	0	2390	Created from Excel upload | QtyPO: 600	2025-07-05 16:32:29.434	27	1
802	213	140	0	840	Created from Excel upload	2025-07-05 16:32:29.439	27	1
803	214	140	0	172	Created from Excel upload	2025-07-05 16:32:29.445	27	1
804	215	141	0	27.05	Created from Excel upload	2025-07-05 16:32:29.454	27	1
805	74	52	1464	2360	Updated from Excel upload	2025-07-05 16:32:29.462	27	1
806	75	52	0	80	Updated from Excel upload	2025-07-05 16:32:29.466	27	1
807	216	142	0	300	Created from Excel upload	2025-07-05 16:32:29.476	27	1
808	217	142	0	0	Created from Excel upload	2025-07-05 16:32:29.484	27	1
809	218	142	0	81.5	Created from Excel upload	2025-07-05 16:32:29.491	27	1
810	219	143	0	8	Created from Excel upload	2025-07-05 16:32:29.501	27	1
811	220	143	0	20	Created from Excel upload	2025-07-05 16:32:29.508	27	1
812	221	143	0	51	Created from Excel upload	2025-07-05 16:32:29.515	27	1
813	76	53	215.74	385.74	Updated from Excel upload	2025-07-05 16:32:29.522	27	1
814	78	53	0	40	Updated from Excel upload	2025-07-05 16:32:29.529	27	1
815	222	144	0	300	Created from Excel upload	2025-07-05 16:32:29.538	27	1
816	223	144	0	40	Created from Excel upload	2025-07-05 16:32:29.545	27	1
817	224	145	0	79.5	Created from Excel upload	2025-07-05 16:32:29.554	27	1
818	225	145	0	77.3	Created from Excel upload	2025-07-05 16:32:29.56	27	1
819	79	54	170.84	320.84	Updated from Excel upload	2025-07-05 16:32:29.566	27	1
820	80	54	0	60	Updated from Excel upload	2025-07-05 16:32:29.571	27	1
821	226	146	0	240	Created from Excel upload	2025-07-05 16:32:29.578	27	1
822	227	147	0	122.3	Created from Excel upload	2025-07-05 16:32:29.588	27	1
823	228	147	0	46.6	Created from Excel upload	2025-07-05 16:32:29.594	27	1
824	229	147	0	42.7	Created from Excel upload	2025-07-05 16:32:29.6	27	1
825	81	55	136.3	196.3	Updated from Excel upload	2025-07-05 16:32:29.606	27	1
826	82	55	0	138.4	Updated from Excel upload	2025-07-05 16:32:29.611	27	1
827	83	55	0	58	Updated from Excel upload	2025-07-05 16:32:29.618	27	1
828	84	55	0	99	Updated from Excel upload	2025-07-05 16:32:29.622	27	1
829	1	1	4389	1119	Updated from Excel upload	2025-07-05 16:32:30.221	27	1
830	2	1	0	157.79	Updated from Excel upload	2025-07-05 16:32:30.227	27	1
831	3	1	0	8589	Updated from Excel upload	2025-07-05 16:32:30.231	27	1
832	52	40	0	2900	Updated from Excel upload	2025-07-05 16:32:30.236	27	1
833	53	40	0	1500	Updated from Excel upload	2025-07-05 16:32:30.24	27	1
834	54	40	0	19500	Updated from Excel upload	2025-07-05 16:32:30.245	27	1
835	34	34	0	200	Updated from Excel upload	2025-07-05 16:32:30.249	27	1
836	35	35	238	989	Updated from Excel upload	2025-07-05 16:32:30.254	27	1
837	36	35	0	233	Updated from Excel upload	2025-07-05 16:32:30.26	27	1
838	37	35	0	800	Updated from Excel upload	2025-07-05 16:32:30.265	27	1
839	38	35	0	2849	Updated from Excel upload	2025-07-05 16:32:30.271	27	1
840	55	42	2400	2900	Updated from Excel upload	2025-07-05 16:32:30.277	27	1
841	56	42	0	1500	Updated from Excel upload	2025-07-05 16:32:30.282	27	1
842	57	42	0	3000	Updated from Excel upload	2025-07-05 16:32:30.286	27	1
843	39	36	6918.4	18.4	Updated from Excel upload	2025-07-05 16:32:30.291	27	1
844	40	36	0	229.3	Updated from Excel upload	2025-07-05 16:32:30.296	27	1
845	41	36	0	922	Updated from Excel upload	2025-07-05 16:32:30.3	27	1
846	61	43	0	500	Updated from Excel upload	2025-07-05 16:32:30.305	27	1
847	62	44	450	4000	Updated from Excel upload	2025-07-05 16:32:30.31	27	1
848	63	44	0	2000	Updated from Excel upload	2025-07-05 16:32:30.314	27	1
849	64	44	0	27000	Updated from Excel upload	2025-07-05 16:32:30.319	27	1
850	65	45	0	2000	Updated from Excel upload	2025-07-05 16:32:30.324	27	1
851	42	37	100	350	Updated from Excel upload	2025-07-05 16:32:30.329	27	1
852	43	37	0	110	Updated from Excel upload	2025-07-05 16:32:30.334	27	1
853	44	37	0	580	Updated from Excel upload	2025-07-05 16:32:30.338	27	1
854	45	38	2679.73	154.23	Updated from Excel upload	2025-07-05 16:32:30.343	27	1
855	46	38	0	54.58	Updated from Excel upload	2025-07-05 16:32:30.347	27	1
856	47	38	0	500	Updated from Excel upload	2025-07-05 16:32:30.351	27	1
857	48	38	0	1519	Updated from Excel upload	2025-07-05 16:32:30.356	27	1
858	66	46	3400	9300	Updated from Excel upload	2025-07-05 16:32:30.361	27	1
859	67	46	0	2000	Updated from Excel upload	2025-07-05 16:32:30.366	27	1
860	68	47	0	700	Updated from Excel upload	2025-07-05 16:32:30.374	27	1
861	192	132	9509	419	Updated from Excel upload	2025-07-05 16:32:30.379	27	1
862	193	132	0	29.37	Updated from Excel upload	2025-07-05 16:32:30.383	27	1
863	194	132	0	4525	Updated from Excel upload	2025-07-05 16:32:30.388	27	1
864	195	133	3790	8820	Updated from Excel upload	2025-07-05 16:32:30.393	27	1
865	196	133	0	2000	Updated from Excel upload	2025-07-05 16:32:30.397	27	1
866	86	57	51	0	Updated from Excel upload	2025-07-05 16:32:30.408	27	1
867	87	57	0	106	Updated from Excel upload	2025-07-05 16:32:30.414	27	1
868	88	58	27	63	Updated from Excel upload	2025-07-05 16:32:30.421	27	1
869	89	59	0	13	Updated from Excel upload	2025-07-05 16:32:30.427	27	1
870	90	59	0	80.25	Updated from Excel upload	2025-07-05 16:32:30.435	27	1
871	91	60	305	427	Updated from Excel upload	2025-07-05 16:32:30.443	27	1
872	92	61	550	753	Updated from Excel upload	2025-07-05 16:32:30.449	27	1
873	93	61	0	183	Updated from Excel upload	2025-07-05 16:32:30.456	27	1
874	94	62	0	11	Updated from Excel upload	2025-07-05 16:32:30.463	27	1
875	95	62	0	305	Updated from Excel upload	2025-07-05 16:32:30.469	27	1
876	96	63	0	6	Updated from Excel upload	2025-07-05 16:32:30.476	27	1
877	97	64	1180	1363	Updated from Excel upload	2025-07-05 16:32:30.483	27	1
878	98	64	0	40	Updated from Excel upload	2025-07-05 16:32:30.49	27	1
879	99	65	452	742	Updated from Excel upload	2025-07-05 16:32:30.496	27	1
880	100	65	0	351	Updated from Excel upload	2025-07-05 16:32:30.504	27	1
881	101	65	0	19.2	Updated from Excel upload	2025-07-05 16:32:30.511	27	1
882	102	66	0	61	Updated from Excel upload	2025-07-05 16:32:30.518	27	1
883	103	67	0	31	Updated from Excel upload	2025-07-05 16:32:30.524	27	1
884	104	68	0	41	Updated from Excel upload	2025-07-05 16:32:30.531	27	1
885	105	69	0	20	Updated from Excel upload	2025-07-05 16:32:30.538	27	1
886	106	69	0	21	Updated from Excel upload	2025-07-05 16:32:30.545	27	1
887	107	70	57	549	Updated from Excel upload	2025-07-05 16:32:30.551	27	1
888	108	71	0	85	Updated from Excel upload	2025-07-05 16:32:30.557	27	1
889	110	72	0	41	Updated from Excel upload	2025-07-05 16:32:30.569	27	1
890	111	73	119	219.31	Updated from Excel upload	2025-07-05 16:32:30.574	27	1
891	112	74	0	61	Updated from Excel upload	2025-07-05 16:32:30.578	27	1
892	113	75	0	40	Updated from Excel upload	2025-07-05 16:32:30.582	27	1
893	114	76	183	196	Updated from Excel upload	2025-07-05 16:32:30.587	27	1
894	115	76	0	61	Updated from Excel upload	2025-07-05 16:32:30.591	27	1
895	116	77	433	682.6	Updated from Excel upload	2025-07-05 16:32:30.595	27	1
896	117	77	0	76	Updated from Excel upload	2025-07-05 16:32:30.599	27	1
897	118	77	0	173	Updated from Excel upload	2025-07-05 16:32:30.605	27	1
898	119	78	0	27	Updated from Excel upload	2025-07-05 16:32:30.612	27	1
899	120	79	101	274	Updated from Excel upload	2025-07-05 16:32:30.617	27	1
900	121	79	0	147.74	Updated from Excel upload	2025-07-05 16:32:30.622	27	1
901	123	80	0	112	Updated from Excel upload	2025-07-05 16:32:30.628	27	1
902	124	81	0	16.5	Updated from Excel upload	2025-07-05 16:32:30.632	27	1
903	125	82	352	0	Updated from Excel upload	2025-07-05 16:32:30.637	27	1
904	130	87	190	175	Updated from Excel upload	2025-07-05 16:32:31.413	27	1
905	131	88	0	5	Updated from Excel upload	2025-07-05 16:32:31.429	27	1
906	133	90	0	4	Updated from Excel upload	2025-07-05 16:32:31.436	27	1
907	134	91	0	4	Updated from Excel upload	2025-07-05 16:32:31.44	27	1
908	135	91	0	10	Updated from Excel upload	2025-07-05 16:32:31.445	27	1
909	136	92	0	29.08	Updated from Excel upload	2025-07-05 16:32:32.775	27	1
910	137	93	0	11.3	Updated from Excel upload	2025-07-05 16:32:32.78	27	1
911	138	94	0	10.5	Updated from Excel upload	2025-07-05 16:32:32.784	27	1
912	139	95	30.2	42	Updated from Excel upload	2025-07-05 16:32:32.791	27	1
913	140	95	0	17.9	Updated from Excel upload	2025-07-05 16:32:32.796	27	1
914	141	95	0	115	Updated from Excel upload	2025-07-05 16:32:32.801	27	1
915	230	148	0	26.1	Created from Excel upload	2025-07-05 16:32:32.809	27	1
916	231	149	0	305	Created from Excel upload	2025-07-05 16:32:32.819	27	1
917	232	149	0	46	Created from Excel upload	2025-07-05 16:32:32.825	27	1
918	233	149	0	22.75	Created from Excel upload	2025-07-05 16:32:32.831	27	1
919	142	96	0	87.65	Updated from Excel upload	2025-07-05 16:32:32.841	27	1
920	234	150	0	125.45	Created from Excel upload	2025-07-05 16:32:32.849	27	1
921	235	150	0	30.5	Created from Excel upload	2025-07-05 16:32:32.856	27	1
922	236	150	0	25.79	Created from Excel upload	2025-07-05 16:32:32.863	27	1
923	143	97	0	60	Updated from Excel upload	2025-07-05 16:32:32.874	27	1
924	237	151	0	1968	Created from Excel upload	2025-07-05 16:32:33.031	27	1
925	238	151	0	319	Created from Excel upload	2025-07-05 16:32:33.038	27	1
926	239	152	0	294	Created from Excel upload	2025-07-05 16:32:33.049	27	1
927	240	152	0	480	Created from Excel upload	2025-07-05 16:32:33.056	27	1
928	241	153	0	1206	Created from Excel upload	2025-07-05 16:32:33.066	27	1
929	242	153	0	1095	Created from Excel upload	2025-07-05 16:32:33.073	27	1
930	243	153	0	2042	Created from Excel upload	2025-07-05 16:32:33.079	27	1
931	244	154	0	727	Created from Excel upload | QtyPO: 4432	2025-07-05 16:32:33.09	27	1
932	245	154	0	914	Created from Excel upload	2025-07-05 16:32:33.096	27	1
933	246	154	0	416	Created from Excel upload	2025-07-05 16:32:33.103	27	1
934	247	154	0	575.5	Created from Excel upload	2025-07-05 16:32:33.109	27	1
935	248	155	0	27	Created from Excel upload	2025-07-05 16:32:33.118	27	1
936	249	156	0	8	Created from Excel upload	2025-07-05 16:32:33.127	27	1
937	250	156	0	64.87	Created from Excel upload	2025-07-05 16:32:33.132	27	1
938	251	157	0	65	Created from Excel upload	2025-07-05 16:32:33.142	27	1
939	252	158	0	4358.06	Created from Excel upload	2025-07-05 16:32:33.152	27	1
940	253	158	0	208	Created from Excel upload	2025-07-05 16:32:33.158	27	1
941	254	158	0	944	Created from Excel upload	2025-07-05 16:32:33.164	27	1
942	255	159	0	605	Created from Excel upload	2025-07-05 16:32:33.173	27	1
943	256	159	0	400	Created from Excel upload	2025-07-05 16:32:33.178	27	1
944	257	160	0	5132	Created from Excel upload	2025-07-05 16:32:33.187	27	1
945	258	160	0	2652	Created from Excel upload	2025-07-05 16:32:33.193	27	1
946	259	160	0	103	Created from Excel upload	2025-07-05 16:32:33.199	27	1
947	260	160	0	243.5	Created from Excel upload	2025-07-05 16:32:33.206	27	1
948	261	161	0	9	Created from Excel upload	2025-07-05 16:32:33.215	27	1
949	262	161	0	44	Created from Excel upload	2025-07-05 16:32:33.239	27	1
950	263	161	0	60	Created from Excel upload	2025-07-05 16:32:33.245	27	1
951	264	162	0	107	Created from Excel upload	2025-07-05 16:32:33.255	27	1
952	265	162	0	15.2	Created from Excel upload	2025-07-05 16:32:33.261	27	1
953	266	163	0	593	Created from Excel upload	2025-07-05 16:32:33.272	27	1
954	267	163	0	103	Created from Excel upload	2025-07-05 16:32:33.278	27	1
955	268	164	0	4751.9	Created from Excel upload	2025-07-05 16:32:33.288	27	1
956	269	164	0	2243	Created from Excel upload	2025-07-05 16:32:33.294	27	1
957	270	164	0	622	Created from Excel upload	2025-07-05 16:32:33.299	27	1
958	271	164	0	521	Created from Excel upload	2025-07-05 16:32:33.305	27	1
959	272	165	0	1031	Created from Excel upload	2025-07-05 16:32:33.314	27	1
960	273	165	0	519	Created from Excel upload	2025-07-05 16:32:33.32	27	1
961	274	166	0	491	Created from Excel upload | QtyPO: 389	2025-07-05 16:32:33.33	27	1
962	275	166	0	300	Created from Excel upload	2025-07-05 16:32:33.335	27	1
963	276	166	0	55	Created from Excel upload	2025-07-05 16:32:33.342	27	1
964	277	167	0	678	Created from Excel upload	2025-07-05 16:32:33.35	27	1
965	278	168	0	4936.5	Created from Excel upload | QtyPO: 1489	2025-07-05 16:32:33.359	27	1
966	279	168	0	1450	Created from Excel upload	2025-07-05 16:32:33.365	27	1
967	280	168	0	287.5	Created from Excel upload	2025-07-05 16:32:33.371	27	1
968	281	169	0	7.8	Created from Excel upload	2025-07-05 16:32:33.382	27	1
969	282	170	0	1268	Created from Excel upload	2025-07-05 16:32:33.391	27	1
970	283	170	0	741	Created from Excel upload	2025-07-05 16:32:33.397	27	1
971	284	170	0	163	Created from Excel upload	2025-07-05 16:32:33.402	27	1
972	285	170	0	267	Created from Excel upload	2025-07-05 16:32:33.408	27	1
973	286	171	0	1606.3	Created from Excel upload | QtyPO: 38	2025-07-05 16:32:33.417	27	1
974	287	171	0	900	Created from Excel upload	2025-07-05 16:32:33.423	27	1
975	288	171	0	1346	Created from Excel upload	2025-07-05 16:32:33.429	27	1
976	289	171	0	33	Created from Excel upload	2025-07-05 16:32:33.435	27	1
977	290	172	0	396	Created from Excel upload	2025-07-05 16:32:33.445	27	1
978	291	173	0	2188.55	Created from Excel upload	2025-07-05 16:32:33.455	27	1
979	292	173	0	7.5	Created from Excel upload	2025-07-05 16:32:33.46	27	1
980	293	173	0	268	Created from Excel upload	2025-07-05 16:32:33.466	27	1
981	294	174	0	274.85	Created from Excel upload	2025-07-05 16:32:33.475	27	1
982	295	175	0	200	Created from Excel upload	2025-07-05 16:32:33.484	27	1
983	296	176	0	80	Created from Excel upload	2025-07-05 16:32:33.493	27	1
984	297	176	0	0	Created from Excel upload	2025-07-05 16:32:33.498	27	1
985	298	176	0	40	Created from Excel upload	2025-07-05 16:32:33.505	27	1
986	299	177	0	120	Created from Excel upload	2025-07-05 16:32:33.516	27	1
987	300	177	0	15	Created from Excel upload	2025-07-05 16:32:33.522	27	1
988	301	178	0	10.1	Created from Excel upload	2025-07-05 16:32:33.532	27	1
989	302	179	0	7.3	Created from Excel upload	2025-07-05 16:32:33.541	27	1
990	303	179	0	40	Created from Excel upload	2025-07-05 16:32:33.547	27	1
991	304	180	0	16.5	Created from Excel upload	2025-07-05 16:32:33.556	27	1
992	305	181	0	76	Created from Excel upload	2025-07-05 16:32:33.564	27	1
993	306	182	0	80	Created from Excel upload	2025-07-05 16:32:33.574	27	1
994	307	182	0	0	Created from Excel upload	2025-07-05 16:32:33.58	27	1
995	308	183	0	15	Created from Excel upload	2025-07-05 16:32:33.59	27	1
996	309	184	0	21	Created from Excel upload	2025-07-05 16:32:33.599	27	1
997	144	98	0	9	Updated from Excel upload	2025-07-05 16:32:33.605	27	1
998	146	100	0	35	Updated from Excel upload	2025-07-05 16:32:33.611	27	1
999	147	101	0	37	Updated from Excel upload	2025-07-05 16:32:33.616	27	1
1000	148	102	0	201.7	Updated from Excel upload	2025-07-05 16:32:33.631	27	1
1001	149	103	0	247.5	Updated from Excel upload	2025-07-05 16:32:33.643	27	1
1002	150	104	0	16	Updated from Excel upload	2025-07-05 16:32:33.647	27	1
1003	151	105	0	46	Updated from Excel upload	2025-07-05 16:32:33.651	27	1
1004	152	106	0	8	Updated from Excel upload	2025-07-05 16:32:33.656	27	1
1005	153	107	0	19.3	Updated from Excel upload	2025-07-05 16:32:33.66	27	1
1006	154	108	0	40	Updated from Excel upload	2025-07-05 16:32:33.667	27	1
1007	155	109	0	39	Updated from Excel upload	2025-07-05 16:32:33.671	27	1
1008	157	111	517	587	Updated from Excel upload	2025-07-05 16:32:33.677	27	1
1009	158	111	0	127	Updated from Excel upload	2025-07-05 16:32:33.682	27	1
1010	159	112	0	50	Updated from Excel upload	2025-07-05 16:32:33.687	27	1
1011	160	113	0	39	Updated from Excel upload	2025-07-05 16:32:33.692	27	1
1012	162	114	0	164	Updated from Excel upload	2025-07-05 16:32:33.698	27	1
1013	163	115	0	3516.5	Updated from Excel upload	2025-07-05 16:32:33.709	27	1
1014	164	116	0	123	Updated from Excel upload	2025-07-05 16:32:33.713	27	1
1015	165	117	0	85	Updated from Excel upload	2025-07-05 16:32:33.718	27	1
1016	166	118	0	214	Updated from Excel upload	2025-07-05 16:32:33.727	27	1
1017	167	119	0	330	Updated from Excel upload	2025-07-05 16:32:33.731	27	1
1018	168	120	0	60	Updated from Excel upload	2025-07-05 16:32:33.735	27	1
1019	310	185	0	11.9	Created from Excel upload	2025-07-05 16:32:33.748	27	1
1020	311	186	0	700	Created from Excel upload	2025-07-05 16:32:33.759	27	1
1021	312	186	0	200	Created from Excel upload	2025-07-05 16:32:33.765	27	1
1022	313	186	0	40	Created from Excel upload	2025-07-05 16:32:33.771	27	1
1023	169	121	189	313	Updated from Excel upload	2025-07-05 16:32:33.781	27	1
1024	170	121	0	50	Updated from Excel upload	2025-07-05 16:32:33.786	27	1
1025	314	187	0	50	Created from Excel upload	2025-07-05 16:32:33.794	27	1
1026	315	188	0	66	Created from Excel upload	2025-07-05 16:32:33.802	27	1
1027	316	188	0	200	Created from Excel upload	2025-07-05 16:32:33.809	27	1
1028	317	188	0	200	Created from Excel upload	2025-07-05 16:32:33.815	27	1
1029	318	188	0	7	Created from Excel upload	2025-07-05 16:32:33.822	27	1
1030	319	189	0	1426	Created from Excel upload	2025-07-05 16:32:33.831	27	1
1031	320	189	0	480	Created from Excel upload	2025-07-05 16:32:33.836	27	1
1032	171	122	1316.9	1356.9	Updated from Excel upload	2025-07-05 16:32:33.846	27	1
1033	172	122	0	19	Updated from Excel upload	2025-07-05 16:32:33.85	27	1
1034	321	190	0	185	Created from Excel upload	2025-07-05 16:32:33.859	27	1
1035	322	191	0	280	Created from Excel upload	2025-07-05 16:32:33.871	27	1
1036	323	191	0	60	Created from Excel upload	2025-07-05 16:32:33.878	27	1
1037	324	192	0	560.05	Created from Excel upload	2025-07-05 16:32:33.888	27	1
1038	173	123	796.8	1276.8	Updated from Excel upload	2025-07-05 16:32:33.898	27	1
1039	174	123	0	40	Updated from Excel upload	2025-07-05 16:32:33.903	27	1
1040	175	123	0	47.6	Updated from Excel upload	2025-07-05 16:32:33.908	27	1
1041	325	193	0	502.78	Created from Excel upload	2025-07-05 16:32:33.918	27	1
1042	326	193	0	157	Created from Excel upload	2025-07-05 16:32:33.925	27	1
1043	327	193	0	213	Created from Excel upload	2025-07-05 16:32:33.931	27	1
1044	176	124	330.6	800.6	Updated from Excel upload	2025-07-05 16:32:33.941	27	1
1045	177	124	0	120	Updated from Excel upload	2025-07-05 16:32:33.946	27	1
1046	178	124	0	160	Updated from Excel upload	2025-07-05 16:32:33.95	27	1
1047	179	124	0	37	Updated from Excel upload	2025-07-05 16:32:33.955	27	1
1048	328	194	0	10	Created from Excel upload	2025-07-05 16:32:33.962	27	1
1049	329	195	0	150	Created from Excel upload	2025-07-05 16:32:33.97	27	1
1050	330	196	0	73.6	Created from Excel upload	2025-07-05 16:32:33.979	27	1
1051	180	125	26.6	511.6	Updated from Excel upload	2025-07-05 16:32:33.99	27	1
1052	181	125	0	163.3	Updated from Excel upload	2025-07-05 16:32:33.996	27	1
1053	182	126	0	128.71	Updated from Excel upload	2025-07-05 16:32:36.516	27	1
1054	184	127	0	138	Updated from Excel upload	2025-07-05 16:32:36.523	27	1
1055	186	128	0	395	Updated from Excel upload	2025-07-05 16:32:36.53	27	1
1056	187	129	389.26	364.26	Updated from Excel upload	2025-07-05 16:32:36.534	27	1
1057	188	129	0	157	Updated from Excel upload	2025-07-05 16:32:36.539	27	1
1058	189	129	0	61.1	Updated from Excel upload	2025-07-05 16:32:36.544	27	1
1059	190	130	232	294.5	Updated from Excel upload	2025-07-05 16:32:36.548	27	1
1060	191	131	0	15	Updated from Excel upload	2025-07-05 16:32:36.553	27	1
1061	331	197	0	61	Created from Excel upload	2025-07-05 16:32:36.628	27	1
1062	332	198	0	23	Created from Excel upload	2025-07-05 16:32:36.639	27	1
1063	333	199	0	129	Created from Excel upload	2025-07-05 16:32:36.652	27	1
1064	334	199	0	44	Created from Excel upload	2025-07-05 16:32:36.659	27	1
1065	335	199	0	55	Created from Excel upload	2025-07-05 16:32:36.667	27	1
1066	336	199	0	30	Created from Excel upload	2025-07-05 16:32:36.674	27	1
1067	337	200	0	122	Created from Excel upload | QtyPO: 2440	2025-07-05 16:32:36.685	27	1
1068	338	201	0	7.9	Created from Excel upload	2025-07-05 16:32:36.698	27	1
1069	339	202	0	130.65	Created from Excel upload	2025-07-05 16:32:36.712	27	1
1070	340	202	0	6.5	Created from Excel upload	2025-07-05 16:32:36.72	27	1
1071	341	202	0	11	Created from Excel upload	2025-07-05 16:32:36.73	27	1
1072	342	203	0	92	Created from Excel upload | QtyPO: 1830	2025-07-05 16:32:36.742	27	1
1073	343	203	0	51	Created from Excel upload	2025-07-05 16:32:36.75	27	1
1074	344	203	0	140	Created from Excel upload	2025-07-05 16:32:36.759	27	1
1075	345	204	0	21	Created from Excel upload	2025-07-05 16:32:36.773	27	1
1076	346	204	0	29	Created from Excel upload	2025-07-05 16:32:36.781	27	1
1077	347	204	0	6	Created from Excel upload	2025-07-05 16:32:36.789	27	1
1078	348	205	0	0	Created from Excel upload | QtyPO: 1220	2025-07-05 16:32:36.8	27	1
1079	349	205	0	67	Created from Excel upload	2025-07-05 16:32:36.807	27	1
1080	350	205	0	244	Created from Excel upload	2025-07-05 16:32:36.815	27	1
1081	351	206	0	63.75	Created from Excel upload	2025-07-05 16:32:36.828	27	1
1082	352	206	0	17	Created from Excel upload	2025-07-05 16:32:36.836	27	1
1083	353	206	0	72	Created from Excel upload	2025-07-05 16:32:36.845	27	1
1084	354	207	0	244	Created from Excel upload | QtyPO: 610	2025-07-05 16:32:36.859	27	1
1085	355	208	0	8.5	Created from Excel upload	2025-07-05 16:32:36.872	27	1
1086	356	208	0	6	Created from Excel upload	2025-07-05 16:32:36.879	27	1
1087	357	209	0	48.9	Created from Excel upload	2025-07-05 16:32:36.893	27	1
1088	\N	82	366	305	QtyPO updated from Excel (global)	2025-07-05 16:32:37.115	27	1
1089	199	97	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-05 16:32:37.338	27	1
1090	358	210	0	651	Created from Excel upload	2025-07-05 16:51:50.72	28	1
1091	359	210	0	191	Created from Excel upload	2025-07-05 16:51:50.733	28	1
1092	360	211	0	1575	Created from Excel upload	2025-07-05 16:51:50.743	28	1
1093	361	211	0	1000	Created from Excel upload	2025-07-05 16:51:50.75	28	1
1094	362	212	0	2026.12	Created from Excel upload | QtyPO: 310	2025-07-05 16:51:50.76	28	1
1095	363	212	0	1039	Created from Excel upload	2025-07-05 16:51:50.767	28	1
1096	364	213	0	119	Created from Excel upload	2025-07-05 16:51:50.777	28	1
1097	365	214	0	17	Created from Excel upload	2025-07-05 16:51:50.787	28	1
1098	366	214	0	297.8	Created from Excel upload	2025-07-05 16:51:50.794	28	1
1099	367	214	0	36	Created from Excel upload	2025-07-05 16:51:50.8	28	1
1100	368	215	0	3395	Created from Excel upload	2025-07-05 16:51:50.81	28	1
1101	369	215	0	712	Created from Excel upload	2025-07-05 16:51:50.816	28	1
1102	370	216	0	0	Created from Excel upload | QtyPO: 2034	2025-07-05 16:51:50.825	28	1
1103	371	216	0	819	Created from Excel upload	2025-07-05 16:51:50.831	28	1
1104	372	216	0	514	Created from Excel upload	2025-07-05 16:51:50.837	28	1
1105	373	216	0	130	Created from Excel upload	2025-07-05 16:51:50.843	28	1
1106	374	217	0	238.9	Created from Excel upload	2025-07-05 16:51:50.852	28	1
1107	375	218	0	2350	Created from Excel upload	2025-07-05 16:51:50.862	28	1
1108	376	218	0	406	Created from Excel upload	2025-07-05 16:51:50.868	28	1
1109	377	218	0	313	Created from Excel upload	2025-07-05 16:51:50.875	28	1
1110	378	219	0	1222.91	Created from Excel upload | QtyPO: 515	2025-07-05 16:51:50.884	28	1
1111	379	219	0	1028	Created from Excel upload	2025-07-05 16:51:50.89	28	1
1112	380	219	0	103	Created from Excel upload	2025-07-05 16:51:50.896	28	1
1113	381	219	0	41.5	Created from Excel upload	2025-07-05 16:51:50.902	28	1
1114	382	220	0	303.5	Created from Excel upload	2025-07-05 16:51:50.91	28	1
1115	383	220	0	160.5	Created from Excel upload	2025-07-05 16:51:50.917	28	1
1116	384	220	0	202	Created from Excel upload	2025-07-05 16:51:50.923	28	1
1117	385	221	0	637.7	Created from Excel upload	2025-07-05 16:51:50.933	28	1
1118	386	221	0	106	Created from Excel upload	2025-07-05 16:51:50.939	28	1
1119	387	222	0	2216	Created from Excel upload	2025-07-05 16:51:50.948	28	1
1120	388	222	0	320	Created from Excel upload	2025-07-05 16:51:50.954	28	1
1121	389	223	0	1416	Created from Excel upload | QtyPO: 514	2025-07-05 16:51:50.964	28	1
1122	390	223	0	1015	Created from Excel upload	2025-07-05 16:51:50.97	28	1
1123	391	224	0	262	Created from Excel upload	2025-07-05 16:51:50.98	28	1
1124	392	225	0	48.66	Created from Excel upload	2025-07-05 16:51:50.989	28	1
1125	393	225	0	45	Created from Excel upload	2025-07-05 16:51:50.995	28	1
1126	394	226	0	99	Created from Excel upload	2025-07-05 16:51:51.004	28	1
1127	395	226	0	155	Created from Excel upload	2025-07-05 16:51:51.01	28	1
1128	396	227	0	2656	Created from Excel upload | QtyPO: 413	2025-07-05 16:51:51.019	28	1
1129	397	227	0	269	Created from Excel upload	2025-07-05 16:51:51.025	28	1
1130	398	227	0	207	Created from Excel upload	2025-07-05 16:51:51.031	28	1
1131	399	227	0	77	Created from Excel upload	2025-07-05 16:51:51.037	28	1
1132	400	228	0	183	Created from Excel upload	2025-07-05 16:51:51.047	28	1
1133	401	229	0	200	Created from Excel upload	2025-07-05 16:51:51.056	28	1
1134	402	229	0	160	Created from Excel upload	2025-07-05 16:51:51.062	28	1
1135	403	229	0	40	Created from Excel upload	2025-07-05 16:51:51.069	28	1
1136	404	230	0	80	Created from Excel upload	2025-07-05 16:51:51.078	28	1
1137	405	230	0	0	Created from Excel upload	2025-07-05 16:51:51.085	28	1
1138	406	231	0	40	Created from Excel upload	2025-07-05 16:51:51.094	28	1
1139	407	232	0	6.94	Created from Excel upload	2025-07-05 16:51:51.104	28	1
1140	408	232	0	26.5	Created from Excel upload	2025-07-05 16:51:51.109	28	1
1141	409	232	0	37	Created from Excel upload	2025-07-05 16:51:51.115	28	1
1142	410	232	0	19.24	Created from Excel upload	2025-07-05 16:51:51.121	28	1
1143	411	233	0	40	Created from Excel upload	2025-07-05 16:51:51.13	28	1
1144	412	233	0	23.5	Created from Excel upload	2025-07-05 16:51:51.136	28	1
1145	413	234	0	40	Created from Excel upload	2025-07-05 16:51:51.145	28	1
1146	414	234	0	40	Created from Excel upload	2025-07-05 16:51:51.151	28	1
1147	415	235	0	65	Created from Excel upload	2025-07-05 16:51:51.162	28	1
1148	416	236	0	10	Created from Excel upload	2025-07-05 16:51:51.173	28	1
1149	417	237	0	8	Created from Excel upload	2025-07-05 16:51:51.183	28	1
1150	418	237	0	42	Created from Excel upload	2025-07-05 16:51:51.189	28	1
1151	359	210	191	174	Kurangi stok saat Approval SalesOrder #3 (warehouseId 2)	2025-07-06 16:13:40.097	\N	1
1152	1	1	1119	2119	Reversal stok ke warehouse asal pada SalesOrder #1 (WarehouseId=1)	2025-07-06 16:25:06.684	\N	1
1153	238	151	319	219	Kurangi stok saat Approval SalesOrder #9 (warehouseId 2)	2025-07-07 07:26:10.97	\N	1
1154	251	157	65	55	Kurangi stok saat Approval SalesOrder #10 (warehouseId 3)	2025-07-07 07:33:30.118	\N	1
1155	255	159	605	595	Kurangi stok saat Approval SalesOrder #10 (warehouseId 2)	2025-07-07 07:33:30.128	\N	1
1156	267	163	103	94	Kurangi stok saat Approval SalesOrder #10 (warehouseId 2)	2025-07-07 07:33:30.137	\N	1
1157	238	151	219	215	Kurangi stok saat Approval SalesOrder #10 (warehouseId 2)	2025-07-07 07:33:30.144	\N	1
1158	2	1	157.79	158.79	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=2)	2025-07-07 18:34:19.948	\N	1
1159	46	38	54.58	56.58	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=2)	2025-07-07 18:34:19.962	\N	1
1160	2	1	158.79	159.79	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:34:19.982	\N	1
1161	46	38	56.58	58.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:34:19.988	\N	1
1162	3	1	8589	8590	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:34:57.284	\N	1
1163	46	38	58.58	60.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:34:57.292	\N	1
1164	3	1	8590	8589	Kurangi stok saat Approval SalesOrder #2 (warehouseId 3)	2025-07-07 18:34:57.665	\N	1
1165	46	38	60.58	58.58	Kurangi stok saat Approval SalesOrder #2 (warehouseId 2)	2025-07-07 18:34:57.672	\N	1
1166	3	1	8589	8590	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:35:56.794	\N	1
1167	46	38	58.58	60.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:35:56.808	\N	1
1168	3	1	8590	8589	Kurangi stok saat Approval SalesOrder #2 (warehouseId 3)	2025-07-07 18:35:57.247	\N	1
1169	46	38	60.58	58.58	Kurangi stok saat Approval SalesOrder #2 (warehouseId 2)	2025-07-07 18:35:57.257	\N	1
1170	3	1	8589	8590	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=3)	2025-07-07 18:48:31.765	\N	1
1171	46	38	58.58	60.58	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=2)	2025-07-07 18:48:31.795	\N	1
1172	3	1	8590	8591	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:48:31.823	\N	1
1173	46	38	60.58	62.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:48:31.83	\N	1
1174	3	1	8591	8592	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:49:14.164	\N	1
1175	46	38	62.58	64.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:49:14.191	\N	1
1176	3	1	8592	8593	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=3)	2025-07-07 18:51:04.761	\N	1
1177	46	38	64.58	66.58	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=2)	2025-07-07 18:51:04.778	\N	1
1178	3	1	8593	8594	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:51:04.827	\N	1
1179	46	38	66.58	68.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:51:04.843	\N	1
1180	1	1	2119	2120	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:51:50.326	\N	1
1181	46	38	68.58	70.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 18:51:50.338	\N	1
1182	46	38	70.58	72.58	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=2)	2025-07-07 19:04:16.804	\N	1
1183	46	38	72.58	74.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 19:04:16.868	\N	1
1184	46	38	74.58	76.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 19:05:09.249	\N	1
1185	46	38	76.58	78.58	Reversal stok ke warehouse asal pada SalesOrder #2 (WarehouseId=2)	2025-07-07 19:06:15.997	\N	1
1186	46	38	78.58	80.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 19:06:16.026	\N	1
1187	46	38	80.58	82.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 19:14:36.028	\N	1
1188	2	1	159.79	160.79	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 19:16:22.307	\N	1
1189	46	38	82.58	84.58	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #2	2025-07-07 19:16:22.316	\N	1
1190	35	35	989	979	Kurangi stok saat Approval SalesOrder #12 (warehouseId 1)	2025-07-18 11:00:41.879	\N	1
1191	35	35	979	989	Reversal stok ke warehouse asal pada SalesOrder #12 (WarehouseId=1)	2025-07-18 11:01:38.858	\N	1
1222	2	1	0	160.79	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=2)	2025-07-19 12:25:57.949	\N	1
1223	1	1	278.79	2118	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 12:25:57.979	\N	1
1226	2	1	0	160.79	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=2)	2025-07-19 12:27:08.639	\N	1
1227	1	1	278.79	2118	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 12:27:08.653	\N	1
1229	1	1	2118	1957.21	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 12:27:41.891	\N	1
1230	1	1	1957.21	1796.42	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 12:27:52.194	\N	1
1231	1	1	1796.42	1635.63	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 12:29:03.952	\N	1
1232	1	1	1635.63	1474.84	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 12:29:11.594	\N	1
1233	3	1	8594	6754.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 3)	2025-07-19 12:29:11.716	\N	1
1234	1	1	1474.84	1635.63	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 12:29:52.383	\N	1
1235	3	1	6754.79	8594	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=3)	2025-07-19 12:29:52.399	\N	1
1236	1	1	1635.63	1474.84	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 12:30:02.828	\N	1
1237	3	1	8594	6754.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 3)	2025-07-19 12:30:02.842	\N	1
1256	69	48	252	148	Updated from Excel upload	2025-07-20 18:28:35.776	31	1
1257	70	49	791.5	347	Updated from Excel upload	2025-07-20 18:28:35.795	31	1
1258	71	50	89	79	Updated from Excel upload	2025-07-20 18:28:35.812	31	1
1259	200	136	3511	4832	Updated from Excel upload	2025-07-20 18:28:36.059	31	1
1260	204	137	180	300	Updated from Excel upload	2025-07-20 18:28:36.084	31	1
1261	203	137	1970	420	Updated from Excel upload	2025-07-20 18:28:36.131	31	1
1262	206	137	342.5	40	Updated from Excel upload	2025-07-20 18:28:36.154	31	1
1263	419	138	0	82	Created from Excel upload	2025-07-20 18:28:36.244	31	1
1264	72	51	1956.9	981.9	Updated from Excel upload	2025-07-20 18:28:36.28	31	1
1265	73	51	80	400	Updated from Excel upload	2025-07-20 18:28:36.329	31	1
1266	209	139	1439	2039	Updated from Excel upload	2025-07-20 18:28:36.347	31	1
1267	213	140	840	360	Updated from Excel upload	2025-07-20 18:28:36.363	31	1
1268	212	140	2390	1180.2	Updated from Excel upload	2025-07-20 18:28:36.38	31	1
1269	214	140	172	204	Updated from Excel upload	2025-07-20 18:28:36.401	31	1
1270	75	52	80	120	Updated from Excel upload	2025-07-20 18:28:36.423	31	1
1271	74	52	2360	1064	Updated from Excel upload	2025-07-20 18:28:36.441	31	1
1272	216	142	300	240	Updated from Excel upload	2025-07-20 18:28:36.459	31	1
1273	217	142	0	240	Updated from Excel upload	2025-07-20 18:28:36.513	31	1
1274	218	142	81.5	108	Updated from Excel upload	2025-07-20 18:28:36.557	31	1
1275	76	53	385.74	171.8	Updated from Excel upload	2025-07-20 18:28:36.579	31	1
1276	77	53	0	200	Updated from Excel upload	2025-07-20 18:28:36.624	31	1
1277	222	144	300	266.5	Updated from Excel upload	2025-07-20 18:28:36.64	31	1
1278	223	144	40	111	Updated from Excel upload	2025-07-20 18:28:36.665	31	1
1279	225	145	77.3	77	Updated from Excel upload	2025-07-20 18:28:36.69	31	1
1280	79	54	320.84	170.84	Updated from Excel upload	2025-07-20 18:28:36.709	31	1
1281	80	54	60	120	Updated from Excel upload	2025-07-20 18:28:36.73	31	1
1282	226	146	240	90	Updated from Excel upload	2025-07-20 18:28:36.827	31	1
1283	420	146	0	120	Created from Excel upload	2025-07-20 18:28:36.942	31	1
1284	229	147	42.7	42	Updated from Excel upload	2025-07-20 18:28:37.016	31	1
1285	81	55	196.3	136.3	Updated from Excel upload	2025-07-20 18:28:37.037	31	1
1286	82	55	138.4	167.4	Updated from Excel upload	2025-07-20 18:28:37.053	31	1
1287	84	55	99	75	Updated from Excel upload	2025-07-20 18:28:37.087	31	1
1288	1	1	0	3889	Updated from Excel upload	2025-07-20 18:28:38.524	31	1
1289	2	1	0	870	Updated from Excel upload	2025-07-20 18:28:38.54	31	1
1290	3	1	11000	32030	Updated from Excel upload	2025-07-20 18:28:38.596	31	1
1291	53	40	1500	300	Updated from Excel upload	2025-07-20 18:28:38.614	31	1
1292	35	35	989	238	Updated from Excel upload	2025-07-20 18:28:38.631	31	1
1293	36	35	233	685	Updated from Excel upload	2025-07-20 18:28:38.679	31	1
1294	38	35	2849	2840	Updated from Excel upload	2025-07-20 18:28:38.697	31	1
1295	55	42	2900	2400	Updated from Excel upload	2025-07-20 18:28:38.783	31	1
1296	56	42	1500	1100	Updated from Excel upload	2025-07-20 18:28:38.801	31	1
1297	39	36	18.4	4818.4	Updated from Excel upload	2025-07-20 18:28:38.824	31	1
1298	41	36	922	19500	Updated from Excel upload	2025-07-20 18:28:38.853	31	1
1299	40	36	229.3	1100	Updated from Excel upload	2025-07-20 18:28:38.896	31	1
1300	62	44	4000	50	Updated from Excel upload	2025-07-20 18:28:38.917	31	1
1301	63	44	2000	400	Updated from Excel upload	2025-07-20 18:28:38.952	31	1
1302	64	44	27000	4350	Updated from Excel upload	2025-07-20 18:28:39.001	31	1
1303	42	37	350	100	Updated from Excel upload	2025-07-20 18:28:39.02	31	1
1304	44	37	580	180	Updated from Excel upload	2025-07-20 18:28:39.038	31	1
1305	45	38	154.23	1779.73	Updated from Excel upload	2025-07-20 18:28:39.056	31	1
1306	46	38	54.58	200	Updated from Excel upload	2025-07-20 18:28:39.111	31	1
1307	48	38	1519	1008	Updated from Excel upload	2025-07-20 18:28:39.132	31	1
1308	66	46	9300	2000	Updated from Excel upload	2025-07-20 18:28:39.191	31	1
1309	67	46	2000	1100	Updated from Excel upload	2025-07-20 18:28:39.21	31	1
1192	57	42	3000	2990	Kurangi stok saat Approval SalesOrder #12 (warehouseId 3)	2025-07-18 11:02:24.679	\N	1
1193	57	42	2990	3000	Reversal stok ke warehouse asal pada SalesOrder #12 (WarehouseId=3)	2025-07-18 11:03:33.095	\N	1
1224	2	1	160.79	0	Kurangi stok saat Approval SalesOrder #13 (warehouseId 2)	2025-07-19 12:26:28.366	\N	1
1225	1	1	2118	278.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 12:26:28.382	\N	1
1228	2	1	160.79	0	Kurangi stok saat Approval SalesOrder #13 (warehouseId 2)	2025-07-19 12:27:27.913	\N	1
1310	192	132	419	7359	Updated from Excel upload	2025-07-20 18:28:39.233	31	1
1311	193	132	29.37	400	Updated from Excel upload	2025-07-20 18:28:39.279	31	1
1312	194	132	4525	1345	Updated from Excel upload	2025-07-20 18:28:39.295	31	1
1313	195	133	8820	2300	Updated from Excel upload	2025-07-20 18:28:39.311	31	1
1314	196	133	2000	1100	Updated from Excel upload	2025-07-20 18:28:39.33	31	1
1315	87	57	106	66	Updated from Excel upload	2025-07-20 18:28:39.361	31	1
1316	88	58	63	27	Updated from Excel upload	2025-07-20 18:28:39.382	31	1
1317	90	59	80.25	80	Updated from Excel upload	2025-07-20 18:28:39.404	31	1
1318	91	60	427	122	Updated from Excel upload	2025-07-20 18:28:39.426	31	1
1319	421	60	0	122	Created from Excel upload	2025-07-20 18:28:39.453	31	1
1320	92	61	753	550	Updated from Excel upload	2025-07-20 18:28:39.504	31	1
1321	95	62	305	274	Updated from Excel upload	2025-07-20 18:28:39.527	31	1
1322	97	64	1363	997	Updated from Excel upload	2025-07-20 18:28:39.616	31	1
1323	98	64	40	305	Updated from Excel upload	2025-07-20 18:28:39.658	31	1
1324	99	65	742	86	Updated from Excel upload	2025-07-20 18:28:39.682	31	1
1325	100	65	351	301	Updated from Excel upload	2025-07-20 18:28:39.707	31	1
1326	102	66	61	213	Updated from Excel upload	2025-07-20 18:28:39.731	31	1
1327	104	68	41	26	Updated from Excel upload	2025-07-20 18:28:39.809	31	1
1328	107	70	549	0	Updated from Excel upload	2025-07-20 18:28:39.84	31	1
1329	422	70	0	61	Created from Excel upload	2025-07-20 18:28:39.864	31	1
1330	111	73	219.31	119	Updated from Excel upload	2025-07-20 18:28:39.91	31	1
1331	114	76	196	183	Updated from Excel upload	2025-07-20 18:28:39.931	31	1
1332	117	77	76	19	Updated from Excel upload	2025-07-20 18:28:39.981	31	1
1333	116	77	682.6	429	Updated from Excel upload	2025-07-20 18:28:39.997	31	1
1334	118	77	173	110	Updated from Excel upload	2025-07-20 18:28:40.014	31	1
1335	119	78	27	17	Updated from Excel upload	2025-07-20 18:28:40.099	31	1
1336	120	79	274	101	Updated from Excel upload	2025-07-20 18:28:40.159	31	1
1337	121	79	147.74	146.9	Updated from Excel upload	2025-07-20 18:28:40.188	31	1
1338	123	80	112	92	Updated from Excel upload	2025-07-20 18:28:40.206	31	1
1339	122	80	452.1	380.1	Updated from Excel upload	2025-07-20 18:28:40.224	31	1
1340	125	82	0	338	Updated from Excel upload	2025-07-20 18:28:40.245	31	1
1341	423	238	0	19.8	Created from Excel upload	2025-07-20 18:28:41.799	31	1
1342	424	239	0	41.4	Created from Excel upload	2025-07-20 18:28:41.837	31	1
1343	425	240	0	225	Created from Excel upload	2025-07-20 18:28:41.878	31	1
1344	426	240	0	793	Created from Excel upload	2025-07-20 18:28:41.908	31	1
1345	427	241	0	442	Created from Excel upload	2025-07-20 18:28:41.946	31	1
1346	428	241	0	234	Created from Excel upload	2025-07-20 18:28:41.976	31	1
1347	129	86	71	46	Updated from Excel upload	2025-07-20 18:28:42.348	31	1
1348	130	87	175	190	Updated from Excel upload	2025-07-20 18:28:42.383	31	1
1349	135	91	10	2	Updated from Excel upload	2025-07-20 18:28:42.431	31	1
1350	429	242	0	20.35	Created from Excel upload	2025-07-20 18:28:42.575	31	1
1351	430	242	0	85	Created from Excel upload	2025-07-20 18:28:42.628	31	1
1352	431	243	0	7	Created from Excel upload	2025-07-20 18:28:42.687	31	1
1353	432	243	0	156.1	Created from Excel upload	2025-07-20 18:28:42.71	31	1
1354	433	243	0	5	Created from Excel upload	2025-07-20 18:28:42.736	31	1
1355	434	244	0	799.6	Created from Excel upload	2025-07-20 18:28:42.774	31	1
1356	435	244	0	61	Created from Excel upload	2025-07-20 18:28:42.797	31	1
1357	436	245	0	62	Created from Excel upload	2025-07-20 18:28:42.86	31	1
1358	437	245	0	53.7	Created from Excel upload	2025-07-20 18:28:42.888	31	1
1359	438	246	0	42	Created from Excel upload	2025-07-20 18:28:42.93	31	1
1360	439	247	0	244	Created from Excel upload	2025-07-20 18:28:42.999	31	1
1361	440	247	0	15	Created from Excel upload	2025-07-20 18:28:43.029	31	1
1362	441	248	0	61.2	Created from Excel upload	2025-07-20 18:28:43.07	31	1
1363	141	95	115	61	Updated from Excel upload	2025-07-20 18:28:46.558	31	1
1364	442	148	0	26	Created from Excel upload	2025-07-20 18:28:46.575	31	1
1365	443	149	0	46	Created from Excel upload	2025-07-20 18:28:46.599	31	1
1366	234	150	125.45	81.9	Updated from Excel upload	2025-07-20 18:28:46.62	31	1
1367	444	150	0	30.5	Created from Excel upload	2025-07-20 18:28:46.638	31	1
1368	199	97	0	120	Updated from Excel upload	2025-07-20 18:28:46.661	31	1
1369	143	97	60	90	Updated from Excel upload	2025-07-20 18:28:46.741	31	1
1370	358	210	651	842	Updated from Excel upload	2025-07-20 18:28:46.787	31	1
1371	360	211	1575	1759	Updated from Excel upload	2025-07-20 18:28:46.806	31	1
1372	362	212	2026.12	2687.2	Updated from Excel upload	2025-07-20 18:28:46.823	31	1
1373	363	212	1039	1236	Updated from Excel upload	2025-07-20 18:28:46.841	31	1
1374	445	212	0	70	Created from Excel upload	2025-07-20 18:28:46.861	31	1
1375	364	213	119	45	Updated from Excel upload	2025-07-20 18:28:46.887	31	1
1376	366	214	297.8	333	Updated from Excel upload	2025-07-20 18:28:46.911	31	1
1377	368	215	3395	3281	Updated from Excel upload	2025-07-20 18:28:46.93	31	1
1194	2	1	160.79	0	Kurangi stok saat Approval SalesOrder #13 (warehouseId 2)	2025-07-19 10:18:20.323	\N	1
1195	1	1	2120	280.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 10:18:20.346	\N	1
1238	1	1	1474.84	1119	Updated from Excel upload	2025-07-19 12:49:14.944	30	1
1239	2	1	0	157.79	Updated from Excel upload	2025-07-19 12:49:14.964	30	1
1240	3	1	6754.79	8589	Updated from Excel upload	2025-07-19 12:49:14.979	30	1
1241	53	40	500	1500	Updated from Excel upload	2025-07-19 12:49:15.001	30	1
1242	55	42	2799	2900	Updated from Excel upload	2025-07-19 12:49:15.114	30	1
1243	46	38	84.58	54.58	Updated from Excel upload	2025-07-19 12:49:15.252	30	1
1244	117	77	75	76	Updated from Excel upload	2025-07-19 12:49:15.594	30	1
1246	238	151	215	319	Updated from Excel upload	2025-07-19 12:49:20.668	30	1
1247	251	157	55	65	Updated from Excel upload	2025-07-19 12:49:20.737	30	1
1248	255	159	595	605	Updated from Excel upload	2025-07-19 12:49:20.769	30	1
1249	267	163	94	103	Updated from Excel upload	2025-07-19 12:49:20.921	30	1
1378	371	216	819	1014	Updated from Excel upload	2025-07-20 18:28:46.955	31	1
1379	370	216	0	3354	Updated from Excel upload	2025-07-20 18:28:46.972	31	1
1380	373	216	130	138	Updated from Excel upload	2025-07-20 18:28:46.99	31	1
1381	378	219	1222.91	2157	Updated from Excel upload	2025-07-20 18:28:47.01	31	1
1382	379	219	1028	1122	Updated from Excel upload	2025-07-20 18:28:47.03	31	1
1383	381	219	41.5	180	Updated from Excel upload	2025-07-20 18:28:47.046	31	1
1384	382	220	303.5	463.5	Updated from Excel upload	2025-07-20 18:28:47.066	31	1
1385	384	220	202	43	Updated from Excel upload	2025-07-20 18:28:47.082	31	1
1386	387	222	2216	2162	Updated from Excel upload	2025-07-20 18:28:47.112	31	1
1387	390	223	1015	501	Updated from Excel upload	2025-07-20 18:28:47.143	31	1
1388	389	223	1416	2469	Updated from Excel upload	2025-07-20 18:28:47.16	31	1
1389	446	223	0	197	Created from Excel upload	2025-07-20 18:28:47.18	31	1
1390	397	227	269	605	Updated from Excel upload	2025-07-20 18:28:47.211	31	1
1391	396	227	2656	2449	Updated from Excel upload	2025-07-20 18:28:47.228	31	1
1392	399	227	77	131	Updated from Excel upload	2025-07-20 18:28:47.244	31	1
1393	401	229	200	240	Updated from Excel upload	2025-07-20 18:28:47.263	31	1
1394	404	230	80	0	Updated from Excel upload	2025-07-20 18:28:47.281	31	1
1395	406	231	40	96.5	Updated from Excel upload	2025-07-20 18:28:47.33	31	1
1396	408	232	26.5	63.5	Updated from Excel upload	2025-07-20 18:28:47.38	31	1
1397	411	233	40	460	Updated from Excel upload	2025-07-20 18:28:47.399	31	1
1398	447	233	0	160	Created from Excel upload	2025-07-20 18:28:47.419	31	1
1399	412	233	23.5	15	Updated from Excel upload	2025-07-20 18:28:47.445	31	1
1400	448	235	0	320	Created from Excel upload	2025-07-20 18:28:47.472	31	1
1401	449	235	0	320	Created from Excel upload	2025-07-20 18:28:47.498	31	1
1402	415	235	65	64	Updated from Excel upload	2025-07-20 18:28:47.553	31	1
1403	237	151	1968	2287	Updated from Excel upload	2025-07-20 18:28:47.59	31	1
1404	241	153	1206	3137	Updated from Excel upload	2025-07-20 18:28:47.617	31	1
1405	244	154	727	5016.3	Updated from Excel upload	2025-07-20 18:28:47.636	31	1
1406	245	154	914	1012	Updated from Excel upload	2025-07-20 18:28:47.654	31	1
1407	247	154	575.5	206	Updated from Excel upload	2025-07-20 18:28:47.682	31	1
1408	250	156	64.87	57.9	Updated from Excel upload	2025-07-20 18:28:47.706	31	1
1409	251	157	65	96	Updated from Excel upload	2025-07-20 18:28:47.727	31	1
1410	252	158	4358.06	4395.06	Updated from Excel upload	2025-07-20 18:28:47.742	31	1
1411	253	158	208	103	Updated from Excel upload	2025-07-20 18:28:47.759	31	1
1412	450	159	0	1005	Created from Excel upload	2025-07-20 18:28:47.847	31	1
1413	257	160	5132	7790	Updated from Excel upload	2025-07-20 18:28:47.876	31	1
1414	258	160	2652	202	Updated from Excel upload	2025-07-20 18:28:47.893	31	1
1415	260	160	243.5	1603	Updated from Excel upload	2025-07-20 18:28:47.912	31	1
1416	264	162	107	96.4	Updated from Excel upload	2025-07-20 18:28:47.939	31	1
1417	265	162	15.2	15	Updated from Excel upload	2025-07-20 18:28:47.964	31	1
1418	268	164	4751.9	13556.5	Updated from Excel upload	2025-07-20 18:28:47.979	31	1
1419	269	164	2243	1877	Updated from Excel upload	2025-07-20 18:28:47.996	31	1
1420	271	164	521	1097	Updated from Excel upload	2025-07-20 18:28:48.017	31	1
1421	272	165	1031	833	Updated from Excel upload	2025-07-20 18:28:48.033	31	1
1422	273	165	519	128	Updated from Excel upload	2025-07-20 18:28:48.052	31	1
1423	274	166	491	1488.2	Updated from Excel upload	2025-07-20 18:28:48.071	31	1
1424	275	166	300	49	Updated from Excel upload	2025-07-20 18:28:48.089	31	1
1425	276	166	55	865	Updated from Excel upload	2025-07-20 18:28:48.106	31	1
1426	278	168	4936.5	3525.4	Updated from Excel upload	2025-07-20 18:28:48.125	31	1
1427	279	168	1450	519	Updated from Excel upload	2025-07-20 18:28:48.141	31	1
1428	280	168	287.5	279	Updated from Excel upload	2025-07-20 18:28:48.158	31	1
1429	282	170	1268	1761	Updated from Excel upload	2025-07-20 18:28:48.179	31	1
1430	287	171	900	105	Updated from Excel upload	2025-07-20 18:28:48.198	31	1
1431	286	171	1606.3	0	Updated from Excel upload	2025-07-20 18:28:48.225	31	1
1432	289	171	33	102	Updated from Excel upload	2025-07-20 18:28:48.242	31	1
1433	290	172	396	253	Updated from Excel upload	2025-07-20 18:28:48.291	31	1
1434	291	173	2188.55	2187.95	Updated from Excel upload	2025-07-20 18:28:48.313	31	1
1435	293	173	268	163	Updated from Excel upload	2025-07-20 18:28:48.356	31	1
1436	451	173	0	7.5	Created from Excel upload	2025-07-20 18:28:48.378	31	1
1437	294	174	274.85	269.1	Updated from Excel upload	2025-07-20 18:28:48.531	31	1
1438	452	175	0	160	Created from Excel upload	2025-07-20 18:28:48.556	31	1
1196	3	1	8594	8592	Kurangi stok saat Approval SalesOrder #11 (warehouseId 3)	2025-07-19 10:50:14.954	\N	1
1245	359	210	155	191	Updated from Excel upload	2025-07-19 12:49:20.359	30	1
1439	296	176	80	0	Updated from Excel upload	2025-07-20 18:28:48.581	31	1
1440	297	176	0	20	Updated from Excel upload	2025-07-20 18:28:48.598	31	1
1441	453	178	0	10	Created from Excel upload	2025-07-20 18:28:48.624	31	1
1442	302	179	7.3	0	Updated from Excel upload	2025-07-20 18:28:48.648	31	1
1443	303	179	40	32	Updated from Excel upload	2025-07-20 18:28:48.666	31	1
1444	305	181	76	61	Updated from Excel upload	2025-07-20 18:28:48.685	31	1
1445	306	182	80	222	Updated from Excel upload	2025-07-20 18:28:48.732	31	1
1446	307	182	0	160	Updated from Excel upload	2025-07-20 18:28:48.836	31	1
1447	454	182	0	200	Created from Excel upload	2025-07-20 18:28:48.892	31	1
1448	308	183	15	5	Updated from Excel upload	2025-07-20 18:28:48.919	31	1
1449	147	101	37	32	Updated from Excel upload	2025-07-20 18:28:48.94	31	1
1450	154	108	40	31	Updated from Excel upload	2025-07-20 18:28:49.013	31	1
1451	157	111	587	517	Updated from Excel upload	2025-07-20 18:28:49.038	31	1
1452	160	113	39	17	Updated from Excel upload	2025-07-20 18:28:49.063	31	1
1453	163	115	3516.5	3172	Updated from Excel upload	2025-07-20 18:28:49.117	31	1
1454	166	118	214	102	Updated from Excel upload	2025-07-20 18:28:49.147	31	1
1455	167	119	330	277	Updated from Excel upload	2025-07-20 18:28:49.168	31	1
1456	455	185	0	11.9	Created from Excel upload	2025-07-20 18:28:49.265	31	1
1457	311	186	700	200	Updated from Excel upload	2025-07-20 18:28:49.323	31	1
1458	312	186	200	290	Updated from Excel upload	2025-07-20 18:28:49.393	31	1
1459	456	249	0	320	Created from Excel upload	2025-07-20 18:28:49.435	31	1
1460	457	121	0	116	Created from Excel upload	2025-07-20 18:28:49.462	31	1
1461	169	121	313	189	Updated from Excel upload	2025-07-20 18:28:49.488	31	1
1462	315	188	66	13	Updated from Excel upload	2025-07-20 18:28:49.504	31	1
1463	319	189	1426	899	Updated from Excel upload	2025-07-20 18:28:49.56	31	1
1464	320	189	480	180	Updated from Excel upload	2025-07-20 18:28:49.578	31	1
1465	458	189	0	174	Created from Excel upload	2025-07-20 18:28:49.598	31	1
1466	459	122	0	120	Created from Excel upload	2025-07-20 18:28:49.62	31	1
1467	171	122	1356.9	1076.9	Updated from Excel upload	2025-07-20 18:28:49.644	31	1
1468	460	191	0	8	Created from Excel upload	2025-07-20 18:28:49.674	31	1
1469	173	123	1276.8	792	Updated from Excel upload	2025-07-20 18:28:49.731	31	1
1470	461	123	0	320	Created from Excel upload	2025-07-20 18:28:49.78	31	1
1471	326	193	157	370	Updated from Excel upload	2025-07-20 18:28:49.823	31	1
1472	176	124	800.6	290.6	Updated from Excel upload	2025-07-20 18:28:49.847	31	1
1473	177	124	120	200	Updated from Excel upload	2025-07-20 18:28:49.903	31	1
1474	179	124	37	46	Updated from Excel upload	2025-07-20 18:28:49.919	31	1
1475	180	125	511.6	26.6	Updated from Excel upload	2025-07-20 18:28:49.937	31	1
1476	462	125	0	80	Created from Excel upload	2025-07-20 18:28:49.96	31	1
1477	181	125	163.3	141	Updated from Excel upload	2025-07-20 18:28:49.989	31	1
1636	410	232	19.24	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.366	31	1
1637	416	236	10	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.416	31	1
1638	417	237	8	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.432	31	1
1639	418	237	42	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.448	31	1
1640	359	210	191	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.47	31	1
1641	238	151	319	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.486	31	1
1642	267	163	103	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.499	31	1
1643	69	48	148	252	Updated from Excel upload	2025-07-20 18:29:46.47	33	1
1644	70	49	347	791.5	Updated from Excel upload	2025-07-20 18:29:46.488	33	1
1645	71	50	79	89	Updated from Excel upload	2025-07-20 18:29:46.507	33	1
1646	200	136	4832	3511	Updated from Excel upload	2025-07-20 18:29:46.754	33	1
1647	201	136	0	1170	Updated from Excel upload	2025-07-20 18:29:46.773	33	1
1648	202	136	0	551	Updated from Excel upload	2025-07-20 18:29:46.79	33	1
1649	203	137	420	1970	Updated from Excel upload	2025-07-20 18:29:46.809	33	1
1650	204	137	300	180	Updated from Excel upload	2025-07-20 18:29:46.887	33	1
1651	205	137	0	60	Updated from Excel upload	2025-07-20 18:29:46.905	33	1
1652	206	137	40	342.5	Updated from Excel upload	2025-07-20 18:29:46.92	33	1
1653	208	138	0	82	Updated from Excel upload	2025-07-20 18:29:46.967	33	1
1654	72	51	981.9	1956.9	Updated from Excel upload	2025-07-20 18:29:47.005	33	1
1655	73	51	400	80	Updated from Excel upload	2025-07-20 18:29:47.06	33	1
1656	209	139	2039	1439	Updated from Excel upload	2025-07-20 18:29:47.079	33	1
1657	210	139	0	560	Updated from Excel upload	2025-07-20 18:29:47.096	33	1
1658	211	139	0	160	Updated from Excel upload	2025-07-20 18:29:47.114	33	1
1659	212	140	1180.2	2390	Updated from Excel upload	2025-07-20 18:29:47.13	33	1
1660	213	140	360	840	Updated from Excel upload	2025-07-20 18:29:47.146	33	1
1661	214	140	204	172	Updated from Excel upload	2025-07-20 18:29:47.163	33	1
1662	74	52	1064	2360	Updated from Excel upload	2025-07-20 18:29:47.187	33	1
1663	75	52	120	80	Updated from Excel upload	2025-07-20 18:29:47.205	33	1
1664	216	142	240	300	Updated from Excel upload	2025-07-20 18:29:47.224	33	1
1665	217	142	240	0	Updated from Excel upload	2025-07-20 18:29:47.239	33	1
1666	218	142	108	81.5	Updated from Excel upload	2025-07-20 18:29:47.258	33	1
1667	220	143	0	20	Updated from Excel upload	2025-07-20 18:29:47.281	33	1
1668	221	143	0	51	Updated from Excel upload	2025-07-20 18:29:47.301	33	1
1197	53	40	1500	500	Kurangi stok saat Approval SalesOrder #1 (warehouseId 2)	2025-07-19 11:00:50.614	\N	1
1198	117	77	76	75	Kurangi stok saat Approval SalesOrder #1 (warehouseId 2)	2025-07-19 11:00:50.636	\N	1
1199	1	1	280.79	279.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-19 11:00:50.684	\N	1
1200	53	40	500	1500	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #1	2025-07-19 11:01:31.006	\N	1
1201	117	77	75	76	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #1	2025-07-19 11:01:31.047	\N	1
1202	1	1	279.79	280.79	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #1	2025-07-19 11:01:31.092	\N	1
1203	53	40	1500	500	Kurangi stok saat Approval SalesOrder #1 (warehouseId 2)	2025-07-19 11:01:32.213	\N	1
1204	117	77	76	75	Kurangi stok saat Approval SalesOrder #1 (warehouseId 2)	2025-07-19 11:01:32.234	\N	1
1205	1	1	280.79	279.79	Kurangi stok saat Approval SalesOrder #1 (warehouseId 1)	2025-07-19 11:01:32.254	\N	1
1206	55	42	2900	2799	Kurangi stok saat Approval SalesOrder #12 (warehouseId 1)	2025-07-19 11:04:07.527	\N	1
1250	1	1	1119	1279.79	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 12:51:03.284	\N	1
1251	3	1	8589	10428.21	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=3)	2025-07-19 12:51:03.413	\N	1
1478	184	127	138	17	Updated from Excel upload	2025-07-20 18:28:55.879	31	1
1479	186	128	395	211	Updated from Excel upload	2025-07-20 18:28:55.905	31	1
1480	187	129	364.26	202.26	Updated from Excel upload	2025-07-20 18:28:55.922	31	1
1481	189	129	61.1	9	Updated from Excel upload	2025-07-20 18:28:55.94	31	1
1482	463	250	0	21	Created from Excel upload	2025-07-20 18:28:55.972	31	1
1483	190	130	294.5	232	Updated from Excel upload	2025-07-20 18:28:55.998	31	1
1484	191	131	15	8.7	Updated from Excel upload	2025-07-20 18:28:56.043	31	1
1485	464	251	0	1891	Created from Excel upload	2025-07-20 18:28:56.118	31	1
1486	465	252	0	610	Created from Excel upload	2025-07-20 18:28:56.158	31	1
1487	334	199	44	99	Updated from Excel upload	2025-07-20 18:28:56.381	31	1
1488	333	199	129	68	Updated from Excel upload	2025-07-20 18:28:56.404	31	1
1489	337	200	122	2379	Updated from Excel upload	2025-07-20 18:28:56.425	31	1
1490	466	200	0	61	Created from Excel upload	2025-07-20 18:28:56.442	31	1
1491	339	202	130.65	86.45	Updated from Excel upload	2025-07-20 18:28:56.468	31	1
1492	342	203	92	1292.8	Updated from Excel upload	2025-07-20 18:28:56.515	31	1
1493	343	203	51	122	Updated from Excel upload	2025-07-20 18:28:56.535	31	1
1494	344	203	140	152	Updated from Excel upload	2025-07-20 18:28:56.554	31	1
1495	345	204	21	10	Updated from Excel upload	2025-07-20 18:28:56.57	31	1
1496	348	205	0	873.85	Updated from Excel upload	2025-07-20 18:28:56.586	31	1
1497	349	205	67	113	Updated from Excel upload	2025-07-20 18:28:56.643	31	1
1498	350	205	244	91	Updated from Excel upload	2025-07-20 18:28:56.694	31	1
1499	351	206	63.75	29.3	Updated from Excel upload	2025-07-20 18:28:56.742	31	1
1500	354	207	244	468	Updated from Excel upload	2025-07-20 18:28:56.805	31	1
1501	467	207	0	122	Created from Excel upload	2025-07-20 18:28:56.829	31	1
1502	357	209	48.9	0	Updated from Excel upload	2025-07-20 18:28:56.86	31	1
1503	468	253	0	110	Created from Excel upload	2025-07-20 18:28:56.998	31	1
1504	469	254	0	8	Created from Excel upload	2025-07-20 18:28:57.098	31	1
1505	470	255	0	10	Created from Excel upload	2025-07-20 18:28:57.222	31	1
1506	471	255	0	15.2	Created from Excel upload	2025-07-20 18:28:57.252	31	1
1507	472	256	0	21	Created from Excel upload	2025-07-20 18:28:57.287	31	1
1508	473	256	0	86.9	Created from Excel upload	2025-07-20 18:28:57.309	31	1
1509	474	257	0	220.84	Created from Excel upload	2025-07-20 18:28:57.417	31	1
1510	\N	82	305	366	QtyPO updated from Excel (global)	2025-07-20 18:28:57.856	31	1
1511	\N	230	0	520	QtyPO updated from Excel (global)	2025-07-20 18:28:58.086	31	1
1512	\N	209	0	122	QtyPO updated from Excel (global)	2025-07-20 18:28:58.418	31	1
1513	43	37	110	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.532	31	1
1514	47	38	500	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.574	31	1
1515	94	62	11	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.587	31	1
1516	124	81	16.5	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.6	31	1
1517	134	91	4	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.614	31	1
1518	140	95	17.9	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.626	31	1
1519	136	92	29.08	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.639	31	1
1520	137	93	11.3	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.652	31	1
1521	61	43	500	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.675	31	1
1522	52	40	2900	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.718	31	1
1523	65	45	2000	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.732	31	1
1524	89	59	13	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.771	31	1
1525	78	53	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.786	31	1
1526	138	94	10.5	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.801	31	1
1527	139	95	42	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.814	31	1
1528	34	34	200	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.826	31	1
1529	96	63	6	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.838	31	1
1530	101	65	19.2	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.851	31	1
1531	112	74	61	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.872	31	1
1207	3	1	8592	8594	Reversal stok karena SalesOrderDetail dihapus pada SalesOrder #11	2025-07-19 11:52:52.812	\N	1
1208	1	1	279.79	278.79	Kurangi stok saat Approval SalesOrder #11 (warehouseId 1)	2025-07-19 11:52:53.996	\N	1
1209	359	210	174	155	Kurangi stok saat Approval SalesOrder #8 (warehouseId 2)	2025-07-19 11:53:14.967	\N	1
1210	2	1	0	160.79	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=2)	2025-07-19 11:54:11.511	\N	1
1211	1	1	278.79	2118	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 11:54:11.525	\N	1
1212	2	1	160.79	0	Kurangi stok saat Approval SalesOrder #13 (warehouseId 2)	2025-07-19 11:54:33.87	\N	1
1213	1	1	2118	278.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 11:54:33.901	\N	1
1252	2	1	157.79	0	Kurangi stok saat Approval SalesOrder #14 (warehouseId 2)	2025-07-19 14:32:34.294	\N	1
1253	1	1	1279.79	0	Kurangi stok saat Approval SalesOrder #14 (warehouseId 1)	2025-07-19 14:32:34.315	\N	1
1532	105	69	20	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:58.985	31	1
1533	142	96	87.65	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:58.998	31	1
1534	37	35	800	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.013	31	1
1535	144	98	9	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.026	31	1
1536	146	100	35	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.049	31	1
1537	148	102	201.7	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.065	31	1
1538	149	103	247.5	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.078	31	1
1539	233	149	22.75	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.09	31	1
1540	170	121	50	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.106	31	1
1541	172	122	19	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.122	31	1
1542	54	40	9000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.137	31	1
1543	174	123	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.15	31	1
1544	188	129	157	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.163	31	1
1545	235	150	30.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.203	31	1
1546	236	150	25.79	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.224	31	1
1547	239	152	294	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.312	31	1
1548	240	152	480	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.327	31	1
1549	152	106	8	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.339	31	1
1550	153	107	19.3	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.353	31	1
1551	155	109	39	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.367	31	1
1552	164	116	123	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.387	31	1
1553	165	117	85	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.399	31	1
1554	168	120	60	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.411	31	1
1555	175	123	47.6	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.424	31	1
1556	178	124	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.437	31	1
1557	201	136	1170	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.451	31	1
1558	202	136	551	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.462	31	1
1559	205	137	60	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.475	31	1
1560	208	138	82	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.49	31	1
1561	210	139	560	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.502	31	1
1562	211	139	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.517	31	1
1563	220	143	20	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.531	31	1
1564	221	143	51	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.543	31	1
1565	83	55	58	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.555	31	1
1566	230	148	26.1	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.574	31	1
1567	242	153	1095	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.596	31	1
1568	231	149	305	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.608	31	1
1569	243	153	2042	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.626	31	1
1570	246	154	416	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.641	31	1
1571	232	149	46	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.67	31	1
1572	254	158	944	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.692	31	1
1573	256	159	400	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.735	31	1
1574	259	160	103	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.756	31	1
1575	262	161	44	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.771	31	1
1576	263	161	60	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.787	31	1
1577	266	163	593	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.807	31	1
1578	270	164	622	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.821	31	1
1579	255	159	605	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.836	31	1
1580	277	167	678	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.85	31	1
1581	283	170	741	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.87	31	1
1582	284	170	163	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.883	31	1
1583	285	170	267	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.911	31	1
1214	2	1	0	160.79	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=2)	2025-07-19 11:55:18.629	\N	1
1215	1	1	278.79	2118	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 11:55:18.647	\N	1
1216	2	1	160.79	0	Kurangi stok saat Approval SalesOrder #13 (warehouseId 2)	2025-07-19 11:56:04.254	\N	1
1217	1	1	2118	278.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 11:56:04.276	\N	1
1218	2	1	0	160.79	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=2)	2025-07-19 11:57:35.098	\N	1
1219	1	1	278.79	2118	Reversal stok ke warehouse asal pada SalesOrder #13 (WarehouseId=1)	2025-07-19 11:57:35.112	\N	1
1220	2	1	160.79	0	Kurangi stok saat Approval SalesOrder #13 (warehouseId 2)	2025-07-19 11:59:41.368	\N	1
1221	1	1	2118	278.79	Kurangi stok saat Approval SalesOrder #13 (warehouseId 1)	2025-07-19 11:59:41.392	\N	1
1254	3	1	10428.21	11000	QtyOnHand updated manually	2025-07-19 16:57:36.916	\N	1
1255	54	40	19500	9000	QtyOnHand updated manually	2025-07-19 16:57:43.709	\N	1
1584	288	171	1346	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.924	31	1
1585	292	173	7.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.935	31	1
1586	295	175	200	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.948	31	1
1587	299	177	120	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.96	31	1
1588	300	177	15	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:28:59.972	31	1
1589	301	178	10.1	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:28:59.984	31	1
1590	304	180	16.5	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.006	31	1
1591	309	184	21	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.019	31	1
1592	150	104	16	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.035	31	1
1593	310	185	11.9	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.052	31	1
1594	313	186	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.065	31	1
1595	314	187	50	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.084	31	1
1596	316	188	200	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.131	31	1
1597	317	188	200	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.165	31	1
1598	318	188	7	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.18	31	1
1599	321	190	185	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.198	31	1
1600	322	191	280	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.287	31	1
1601	325	193	502.78	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.301	31	1
1602	327	193	213	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.317	31	1
1603	328	194	10	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.341	31	1
1604	329	195	150	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.352	31	1
1605	330	196	73.6	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.364	31	1
1606	332	198	23	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.385	31	1
1607	335	199	55	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.404	31	1
1608	336	199	30	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.417	31	1
1609	338	201	7.9	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.43	31	1
1610	340	202	6.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.446	31	1
1611	341	202	11	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.461	31	1
1612	346	204	29	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.476	31	1
1613	347	204	6	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.492	31	1
1614	353	206	72	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.509	31	1
1615	355	208	8.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.524	31	1
1616	361	211	1000	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.59	31	1
1617	367	214	36	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.61	31	1
1618	369	215	712	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.629	31	1
1619	372	216	514	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.683	31	1
1620	374	217	238.9	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.697	31	1
1621	375	218	2350	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.711	31	1
1622	376	218	406	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.759	31	1
1623	377	218	313	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.801	31	1
1624	380	219	103	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.824	31	1
1625	383	220	160.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.853	31	1
1626	388	222	320	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.903	31	1
1627	391	224	262	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:00.925	31	1
1628	393	225	45	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:00.954	31	1
1629	394	226	99	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.008	31	1
1630	395	226	155	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.219	31	1
1631	398	227	207	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.245	31	1
1632	400	228	183	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:29:01.268	31	1
1633	402	229	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.321	31	1
1634	403	229	40	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.335	31	1
1635	409	232	37	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:29:01.353	31	1
1669	76	53	171.8	385.74	Updated from Excel upload	2025-07-20 18:29:47.321	33	1
1670	77	53	200	0	Updated from Excel upload	2025-07-20 18:29:47.341	33	1
1671	78	53	0	40	Updated from Excel upload	2025-07-20 18:29:47.429	33	1
1672	222	144	266.5	300	Updated from Excel upload	2025-07-20 18:29:47.451	33	1
1673	223	144	111	40	Updated from Excel upload	2025-07-20 18:29:47.469	33	1
1674	225	145	77	77.3	Updated from Excel upload	2025-07-20 18:29:47.496	33	1
1675	79	54	170.84	320.84	Updated from Excel upload	2025-07-20 18:29:47.579	33	1
1676	80	54	120	60	Updated from Excel upload	2025-07-20 18:29:47.597	33	1
1677	226	146	90	240	Updated from Excel upload	2025-07-20 18:29:47.616	33	1
1678	229	147	42	42.7	Updated from Excel upload	2025-07-20 18:29:47.671	33	1
1679	81	55	136.3	196.3	Updated from Excel upload	2025-07-20 18:29:47.703	33	1
1680	82	55	167.4	138.4	Updated from Excel upload	2025-07-20 18:29:47.749	33	1
1681	83	55	0	58	Updated from Excel upload	2025-07-20 18:29:47.767	33	1
1682	84	55	75	99	Updated from Excel upload	2025-07-20 18:29:47.784	33	1
1683	1	1	3889	1119	Updated from Excel upload	2025-07-20 18:29:49.282	33	1
1684	2	1	870	157.79	Updated from Excel upload	2025-07-20 18:29:49.302	33	1
1685	3	1	32030	8589	Updated from Excel upload	2025-07-20 18:29:49.327	33	1
1686	52	40	0	2900	Updated from Excel upload	2025-07-20 18:29:49.345	33	1
1687	53	40	300	1500	Updated from Excel upload	2025-07-20 18:29:49.362	33	1
1688	54	40	0	19500	Updated from Excel upload	2025-07-20 18:29:49.381	33	1
1689	34	34	0	200	Updated from Excel upload	2025-07-20 18:29:49.398	33	1
1690	35	35	238	989	Updated from Excel upload	2025-07-20 18:29:49.417	33	1
1691	36	35	685	233	Updated from Excel upload	2025-07-20 18:29:49.433	33	1
1692	37	35	0	800	Updated from Excel upload	2025-07-20 18:29:49.449	33	1
1693	38	35	2840	2849	Updated from Excel upload	2025-07-20 18:29:49.468	33	1
1694	55	42	2400	2900	Updated from Excel upload	2025-07-20 18:29:49.509	33	1
1695	56	42	1100	1500	Updated from Excel upload	2025-07-20 18:29:49.554	33	1
1696	39	36	4818.4	18.4	Updated from Excel upload	2025-07-20 18:29:49.582	33	1
1697	40	36	1100	229.3	Updated from Excel upload	2025-07-20 18:29:49.599	33	1
1698	41	36	19500	922	Updated from Excel upload	2025-07-20 18:29:49.614	33	1
1699	61	43	0	500	Updated from Excel upload	2025-07-20 18:29:49.636	33	1
1700	62	44	50	4000	Updated from Excel upload	2025-07-20 18:29:49.706	33	1
1701	63	44	400	2000	Updated from Excel upload	2025-07-20 18:29:49.723	33	1
1702	64	44	4350	27000	Updated from Excel upload	2025-07-20 18:29:49.744	33	1
1703	65	45	0	2000	Updated from Excel upload	2025-07-20 18:29:49.819	33	1
1704	42	37	100	350	Updated from Excel upload	2025-07-20 18:29:49.837	33	1
1705	43	37	0	110	Updated from Excel upload	2025-07-20 18:29:49.854	33	1
1706	44	37	180	580	Updated from Excel upload	2025-07-20 18:29:49.87	33	1
1707	45	38	1779.73	154.23	Updated from Excel upload	2025-07-20 18:29:49.885	33	1
1708	46	38	200	54.58	Updated from Excel upload	2025-07-20 18:29:49.901	33	1
1709	47	38	0	500	Updated from Excel upload	2025-07-20 18:29:49.919	33	1
1710	48	38	1008	1519	Updated from Excel upload	2025-07-20 18:29:49.935	33	1
1711	66	46	2000	9300	Updated from Excel upload	2025-07-20 18:29:49.951	33	1
1712	67	46	1100	2000	Updated from Excel upload	2025-07-20 18:29:49.966	33	1
1713	192	132	7359	419	Updated from Excel upload	2025-07-20 18:29:49.987	33	1
1714	193	132	400	29.37	Updated from Excel upload	2025-07-20 18:29:50.004	33	1
1715	194	132	1345	4525	Updated from Excel upload	2025-07-20 18:29:50.02	33	1
1716	195	133	2300	8820	Updated from Excel upload	2025-07-20 18:29:50.038	33	1
1717	196	133	1100	2000	Updated from Excel upload	2025-07-20 18:29:50.057	33	1
1718	87	57	66	106	Updated from Excel upload	2025-07-20 18:29:50.097	33	1
1719	88	58	27	63	Updated from Excel upload	2025-07-20 18:29:50.299	33	1
1720	89	59	0	13	Updated from Excel upload	2025-07-20 18:29:50.404	33	1
1721	90	59	80	80.25	Updated from Excel upload	2025-07-20 18:29:50.459	33	1
1722	91	60	122	427	Updated from Excel upload	2025-07-20 18:29:50.511	33	1
1723	92	61	550	753	Updated from Excel upload	2025-07-20 18:29:50.535	33	1
1724	94	62	0	11	Updated from Excel upload	2025-07-20 18:29:50.589	33	1
1725	95	62	274	305	Updated from Excel upload	2025-07-20 18:29:50.613	33	1
1726	96	63	0	6	Updated from Excel upload	2025-07-20 18:29:50.631	33	1
1727	97	64	997	1363	Updated from Excel upload	2025-07-20 18:29:50.652	33	1
1728	98	64	305	40	Updated from Excel upload	2025-07-20 18:29:50.673	33	1
1729	99	65	86	742	Updated from Excel upload	2025-07-20 18:29:50.695	33	1
1730	100	65	301	351	Updated from Excel upload	2025-07-20 18:29:50.714	33	1
1731	101	65	0	19.2	Updated from Excel upload	2025-07-20 18:29:50.743	33	1
1732	102	66	213	61	Updated from Excel upload	2025-07-20 18:29:50.764	33	1
1733	104	68	26	41	Updated from Excel upload	2025-07-20 18:29:50.822	33	1
1734	105	69	0	20	Updated from Excel upload	2025-07-20 18:29:50.844	33	1
1735	107	70	0	549	Updated from Excel upload	2025-07-20 18:29:50.875	33	1
1736	111	73	119	219.31	Updated from Excel upload	2025-07-20 18:29:51.004	33	1
1737	112	74	0	61	Updated from Excel upload	2025-07-20 18:29:51.03	33	1
1738	114	76	183	196	Updated from Excel upload	2025-07-20 18:29:51.051	33	1
1739	116	77	429	682.6	Updated from Excel upload	2025-07-20 18:29:51.097	33	1
1740	117	77	19	76	Updated from Excel upload	2025-07-20 18:29:51.114	33	1
1741	118	77	110	173	Updated from Excel upload	2025-07-20 18:29:51.236	33	1
1742	119	78	17	27	Updated from Excel upload	2025-07-20 18:29:51.259	33	1
1743	120	79	101	274	Updated from Excel upload	2025-07-20 18:29:51.281	33	1
1744	121	79	146.9	147.74	Updated from Excel upload	2025-07-20 18:29:51.299	33	1
1745	122	80	380.1	452.1	Updated from Excel upload	2025-07-20 18:29:51.316	33	1
1746	123	80	92	112	Updated from Excel upload	2025-07-20 18:29:51.333	33	1
1747	124	81	0	16.5	Updated from Excel upload	2025-07-20 18:29:51.349	33	1
1748	125	82	338	0	Updated from Excel upload	2025-07-20 18:29:51.365	33	1
1749	424	239	41.4	214.2	Updated from Excel upload	2025-07-20 18:29:52.921	33	1
1750	475	239	0	29	Created from Excel upload	2025-07-20 18:29:52.94	33	1
1751	426	240	793	224	Updated from Excel upload	2025-07-20 18:29:52.965	33	1
1752	425	240	225	43	Updated from Excel upload	2025-07-20 18:29:52.984	33	1
1753	427	241	442	122	Updated from Excel upload	2025-07-20 18:29:53.003	33	1
1754	428	241	234	122	Updated from Excel upload	2025-07-20 18:29:53.052	33	1
1755	129	86	46	71	Updated from Excel upload	2025-07-20 18:29:53.407	33	1
1756	130	87	190	175	Updated from Excel upload	2025-07-20 18:29:53.424	33	1
1757	134	91	0	4	Updated from Excel upload	2025-07-20 18:29:53.49	33	1
1758	135	91	2	10	Updated from Excel upload	2025-07-20 18:29:53.542	33	1
1759	433	243	5	76	Updated from Excel upload	2025-07-20 18:29:53.59	33	1
1760	434	244	799.6	655	Updated from Excel upload	2025-07-20 18:29:53.622	33	1
1761	437	245	53.7	73.5	Updated from Excel upload	2025-07-20 18:29:53.641	33	1
1762	436	245	62	113	Updated from Excel upload	2025-07-20 18:29:53.658	33	1
1763	438	246	42	51	Updated from Excel upload	2025-07-20 18:29:53.676	33	1
1764	439	247	244	0	Updated from Excel upload	2025-07-20 18:29:53.692	33	1
1765	440	247	15	46	Updated from Excel upload	2025-07-20 18:29:53.712	33	1
1766	476	258	0	3	Created from Excel upload	2025-07-20 18:29:53.748	33	1
1767	136	92	0	29.08	Updated from Excel upload	2025-07-20 18:29:57.156	33	1
1768	137	93	0	11.3	Updated from Excel upload	2025-07-20 18:29:57.171	33	1
1769	138	94	0	10.5	Updated from Excel upload	2025-07-20 18:29:57.19	33	1
1770	139	95	0	42	Updated from Excel upload	2025-07-20 18:29:57.21	33	1
1771	140	95	0	17.9	Updated from Excel upload	2025-07-20 18:29:57.23	33	1
1772	141	95	61	115	Updated from Excel upload	2025-07-20 18:29:57.247	33	1
1773	230	148	0	26.1	Updated from Excel upload	2025-07-20 18:29:57.265	33	1
1774	231	149	0	305	Updated from Excel upload	2025-07-20 18:29:57.284	33	1
1775	232	149	0	46	Updated from Excel upload	2025-07-20 18:29:57.308	33	1
1776	233	149	0	22.75	Updated from Excel upload	2025-07-20 18:29:57.326	33	1
1777	142	96	0	87.65	Updated from Excel upload	2025-07-20 18:29:57.345	33	1
1778	234	150	81.9	125.45	Updated from Excel upload	2025-07-20 18:29:57.363	33	1
1779	235	150	0	30.5	Updated from Excel upload	2025-07-20 18:29:57.379	33	1
1780	236	150	0	25.79	Updated from Excel upload	2025-07-20 18:29:57.434	33	1
1781	143	97	90	60	Updated from Excel upload	2025-07-20 18:29:57.521	33	1
1782	358	210	842	651	Updated from Excel upload	2025-07-20 18:29:57.556	33	1
1783	359	210	0	191	Updated from Excel upload	2025-07-20 18:29:57.6	33	1
1784	360	211	1759	1575	Updated from Excel upload	2025-07-20 18:29:57.618	33	1
1785	361	211	0	1000	Updated from Excel upload	2025-07-20 18:29:57.634	33	1
1786	362	212	2687.2	2026.12	Updated from Excel upload	2025-07-20 18:29:57.65	33	1
1787	363	212	1236	1039	Updated from Excel upload	2025-07-20 18:29:57.666	33	1
1788	364	213	45	119	Updated from Excel upload	2025-07-20 18:29:57.684	33	1
1789	366	214	333	297.8	Updated from Excel upload	2025-07-20 18:29:57.704	33	1
1790	367	214	0	36	Updated from Excel upload	2025-07-20 18:29:57.725	33	1
1791	368	215	3281	3395	Updated from Excel upload	2025-07-20 18:29:57.742	33	1
1792	369	215	0	712	Updated from Excel upload	2025-07-20 18:29:57.763	33	1
1793	370	216	3354	0	Updated from Excel upload	2025-07-20 18:29:57.82	33	1
1794	371	216	1014	819	Updated from Excel upload	2025-07-20 18:29:57.92	33	1
1795	372	216	0	514	Updated from Excel upload	2025-07-20 18:29:58.019	33	1
1796	373	216	138	130	Updated from Excel upload	2025-07-20 18:29:58.042	33	1
1797	374	217	0	238.9	Updated from Excel upload	2025-07-20 18:29:58.06	33	1
1798	375	218	0	2350	Updated from Excel upload	2025-07-20 18:29:58.077	33	1
1799	376	218	0	406	Updated from Excel upload	2025-07-20 18:29:58.094	33	1
1800	377	218	0	313	Updated from Excel upload	2025-07-20 18:29:58.121	33	1
1801	378	219	2157	1222.91	Updated from Excel upload	2025-07-20 18:29:58.153	33	1
1802	379	219	1122	1028	Updated from Excel upload	2025-07-20 18:29:58.17	33	1
1803	380	219	0	103	Updated from Excel upload	2025-07-20 18:29:58.186	33	1
1804	381	219	180	41.5	Updated from Excel upload	2025-07-20 18:29:58.202	33	1
1805	382	220	463.5	303.5	Updated from Excel upload	2025-07-20 18:29:58.224	33	1
1806	383	220	0	160.5	Updated from Excel upload	2025-07-20 18:29:58.24	33	1
1807	384	220	43	202	Updated from Excel upload	2025-07-20 18:29:58.325	33	1
1808	387	222	2162	2216	Updated from Excel upload	2025-07-20 18:29:58.35	33	1
1809	388	222	0	320	Updated from Excel upload	2025-07-20 18:29:58.366	33	1
1810	389	223	2469	1416	Updated from Excel upload	2025-07-20 18:29:58.383	33	1
1811	390	223	501	1015	Updated from Excel upload	2025-07-20 18:29:58.4	33	1
1812	391	224	0	262	Updated from Excel upload	2025-07-20 18:29:58.421	33	1
1813	393	225	0	45	Updated from Excel upload	2025-07-20 18:29:58.441	33	1
1814	394	226	0	99	Updated from Excel upload	2025-07-20 18:29:58.458	33	1
1815	395	226	0	155	Updated from Excel upload	2025-07-20 18:29:58.513	33	1
1816	396	227	2449	2656	Updated from Excel upload	2025-07-20 18:29:58.53	33	1
1817	397	227	605	269	Updated from Excel upload	2025-07-20 18:29:58.546	33	1
1818	398	227	0	207	Updated from Excel upload	2025-07-20 18:29:58.572	33	1
1819	399	227	131	77	Updated from Excel upload	2025-07-20 18:29:58.591	33	1
1820	400	228	0	183	Updated from Excel upload	2025-07-20 18:29:58.641	33	1
1821	401	229	240	200	Updated from Excel upload	2025-07-20 18:29:58.667	33	1
1822	402	229	0	160	Updated from Excel upload	2025-07-20 18:29:58.685	33	1
1823	403	229	0	40	Updated from Excel upload	2025-07-20 18:29:58.701	33	1
1824	404	230	0	80	Updated from Excel upload	2025-07-20 18:29:58.719	33	1
1825	406	231	96.5	40	Updated from Excel upload	2025-07-20 18:29:58.74	33	1
1826	408	232	63.5	26.5	Updated from Excel upload	2025-07-20 18:29:58.761	33	1
1827	409	232	0	37	Updated from Excel upload	2025-07-20 18:29:58.778	33	1
1828	410	232	0	19.24	Updated from Excel upload	2025-07-20 18:29:58.794	33	1
1829	411	233	460	40	Updated from Excel upload	2025-07-20 18:29:58.813	33	1
1830	412	233	15	23.5	Updated from Excel upload	2025-07-20 18:29:58.829	33	1
1831	415	235	64	65	Updated from Excel upload	2025-07-20 18:29:58.854	33	1
1832	416	236	0	10	Updated from Excel upload	2025-07-20 18:29:58.871	33	1
1833	417	237	0	8	Updated from Excel upload	2025-07-20 18:29:58.916	33	1
1834	418	237	0	42	Updated from Excel upload	2025-07-20 18:29:58.982	33	1
1835	237	151	2287	1968	Updated from Excel upload	2025-07-20 18:29:59.034	33	1
1836	238	151	0	319	Updated from Excel upload	2025-07-20 18:29:59.056	33	1
1837	239	152	0	294	Updated from Excel upload	2025-07-20 18:29:59.119	33	1
1838	240	152	0	480	Updated from Excel upload	2025-07-20 18:29:59.137	33	1
1839	241	153	3137	1206	Updated from Excel upload	2025-07-20 18:29:59.156	33	1
1840	242	153	0	1095	Updated from Excel upload	2025-07-20 18:29:59.173	33	1
1841	243	153	0	2042	Updated from Excel upload	2025-07-20 18:29:59.195	33	1
1842	244	154	5016.3	727	Updated from Excel upload	2025-07-20 18:29:59.249	33	1
1843	245	154	1012	914	Updated from Excel upload	2025-07-20 18:29:59.306	33	1
1844	246	154	0	416	Updated from Excel upload	2025-07-20 18:29:59.329	33	1
1845	247	154	206	575.5	Updated from Excel upload	2025-07-20 18:29:59.396	33	1
1846	250	156	57.9	64.87	Updated from Excel upload	2025-07-20 18:29:59.421	33	1
1847	251	157	96	65	Updated from Excel upload	2025-07-20 18:29:59.437	33	1
1848	252	158	4395.06	4358.06	Updated from Excel upload	2025-07-20 18:29:59.456	33	1
1849	253	158	103	208	Updated from Excel upload	2025-07-20 18:29:59.504	33	1
1850	254	158	0	944	Updated from Excel upload	2025-07-20 18:29:59.521	33	1
1851	255	159	0	605	Updated from Excel upload	2025-07-20 18:29:59.536	33	1
1852	256	159	0	400	Updated from Excel upload	2025-07-20 18:29:59.553	33	1
1853	257	160	7790	5132	Updated from Excel upload	2025-07-20 18:29:59.571	33	1
1854	258	160	202	2652	Updated from Excel upload	2025-07-20 18:29:59.587	33	1
1855	259	160	0	103	Updated from Excel upload	2025-07-20 18:29:59.603	33	1
1856	260	160	1603	243.5	Updated from Excel upload	2025-07-20 18:29:59.622	33	1
1857	262	161	0	44	Updated from Excel upload	2025-07-20 18:29:59.645	33	1
1858	263	161	0	60	Updated from Excel upload	2025-07-20 18:29:59.667	33	1
1859	264	162	96.4	107	Updated from Excel upload	2025-07-20 18:29:59.686	33	1
1860	265	162	15	15.2	Updated from Excel upload	2025-07-20 18:29:59.703	33	1
1861	266	163	0	593	Updated from Excel upload	2025-07-20 18:29:59.723	33	1
1862	267	163	0	103	Updated from Excel upload	2025-07-20 18:29:59.745	33	1
1863	268	164	13556.5	4751.9	Updated from Excel upload	2025-07-20 18:29:59.834	33	1
1864	269	164	1877	2243	Updated from Excel upload	2025-07-20 18:29:59.905	33	1
1865	270	164	0	622	Updated from Excel upload	2025-07-20 18:29:59.934	33	1
1866	271	164	1097	521	Updated from Excel upload	2025-07-20 18:29:59.959	33	1
1867	272	165	833	1031	Updated from Excel upload	2025-07-20 18:29:59.978	33	1
1868	273	165	128	519	Updated from Excel upload	2025-07-20 18:29:59.995	33	1
1869	274	166	1488.2	491	Updated from Excel upload	2025-07-20 18:30:00.014	33	1
1870	275	166	49	300	Updated from Excel upload	2025-07-20 18:30:00.102	33	1
1871	276	166	865	55	Updated from Excel upload	2025-07-20 18:30:00.183	33	1
1872	277	167	0	678	Updated from Excel upload	2025-07-20 18:30:00.204	33	1
1873	278	168	3525.4	4936.5	Updated from Excel upload	2025-07-20 18:30:00.222	33	1
1874	279	168	519	1450	Updated from Excel upload	2025-07-20 18:30:00.239	33	1
1875	280	168	279	287.5	Updated from Excel upload	2025-07-20 18:30:00.26	33	1
1876	282	170	1761	1268	Updated from Excel upload	2025-07-20 18:30:00.283	33	1
1877	283	170	0	741	Updated from Excel upload	2025-07-20 18:30:00.317	33	1
1878	284	170	0	163	Updated from Excel upload	2025-07-20 18:30:00.334	33	1
1879	285	170	0	267	Updated from Excel upload	2025-07-20 18:30:00.351	33	1
1880	286	171	0	1606.3	Updated from Excel upload	2025-07-20 18:30:00.369	33	1
1881	287	171	105	900	Updated from Excel upload	2025-07-20 18:30:00.391	33	1
1882	288	171	0	1346	Updated from Excel upload	2025-07-20 18:30:00.407	33	1
1883	289	171	102	33	Updated from Excel upload	2025-07-20 18:30:00.46	33	1
1884	290	172	253	396	Updated from Excel upload	2025-07-20 18:30:00.491	33	1
1885	291	173	2187.95	2188.55	Updated from Excel upload	2025-07-20 18:30:00.564	33	1
1886	292	173	0	7.5	Updated from Excel upload	2025-07-20 18:30:00.582	33	1
1887	293	173	163	268	Updated from Excel upload	2025-07-20 18:30:00.601	33	1
1888	294	174	269.1	274.85	Updated from Excel upload	2025-07-20 18:30:00.62	33	1
1889	295	175	0	200	Updated from Excel upload	2025-07-20 18:30:00.639	33	1
1890	296	176	0	80	Updated from Excel upload	2025-07-20 18:30:00.656	33	1
1891	297	176	20	0	Updated from Excel upload	2025-07-20 18:30:00.687	33	1
1892	299	177	0	120	Updated from Excel upload	2025-07-20 18:30:00.75	33	1
1893	300	177	0	15	Updated from Excel upload	2025-07-20 18:30:00.792	33	1
1894	301	178	0	10.1	Updated from Excel upload	2025-07-20 18:30:00.826	33	1
1895	302	179	0	7.3	Updated from Excel upload	2025-07-20 18:30:00.874	33	1
1896	303	179	32	40	Updated from Excel upload	2025-07-20 18:30:00.892	33	1
1897	304	180	0	16.5	Updated from Excel upload	2025-07-20 18:30:00.909	33	1
1898	305	181	61	76	Updated from Excel upload	2025-07-20 18:30:00.927	33	1
1899	306	182	222	80	Updated from Excel upload	2025-07-20 18:30:01.021	33	1
1900	307	182	160	0	Updated from Excel upload	2025-07-20 18:30:01.038	33	1
1901	308	183	5	15	Updated from Excel upload	2025-07-20 18:30:01.057	33	1
1902	309	184	0	21	Updated from Excel upload	2025-07-20 18:30:01.076	33	1
1903	144	98	0	9	Updated from Excel upload	2025-07-20 18:30:01.092	33	1
1904	146	100	0	35	Updated from Excel upload	2025-07-20 18:30:01.113	33	1
1905	147	101	32	37	Updated from Excel upload	2025-07-20 18:30:01.129	33	1
1906	148	102	0	201.7	Updated from Excel upload	2025-07-20 18:30:01.174	33	1
1907	149	103	0	247.5	Updated from Excel upload	2025-07-20 18:30:01.208	33	1
1908	150	104	0	16	Updated from Excel upload	2025-07-20 18:30:01.228	33	1
1909	152	106	0	8	Updated from Excel upload	2025-07-20 18:30:01.253	33	1
1910	153	107	0	19.3	Updated from Excel upload	2025-07-20 18:30:01.27	33	1
1911	154	108	31	40	Updated from Excel upload	2025-07-20 18:30:01.292	33	1
1912	155	109	0	39	Updated from Excel upload	2025-07-20 18:30:01.314	33	1
1913	157	111	517	587	Updated from Excel upload	2025-07-20 18:30:01.337	33	1
1914	160	113	17	39	Updated from Excel upload	2025-07-20 18:30:01.375	33	1
1915	163	115	3172	3516.5	Updated from Excel upload	2025-07-20 18:30:01.421	33	1
1916	164	116	0	123	Updated from Excel upload	2025-07-20 18:30:01.45	33	1
1917	165	117	0	85	Updated from Excel upload	2025-07-20 18:30:01.497	33	1
1918	166	118	102	214	Updated from Excel upload	2025-07-20 18:30:01.578	33	1
1919	167	119	277	330	Updated from Excel upload	2025-07-20 18:30:01.6	33	1
1920	168	120	0	60	Updated from Excel upload	2025-07-20 18:30:01.662	33	1
1921	310	185	0	11.9	Updated from Excel upload	2025-07-20 18:30:01.71	33	1
1922	311	186	200	700	Updated from Excel upload	2025-07-20 18:30:01.775	33	1
1923	312	186	290	200	Updated from Excel upload	2025-07-20 18:30:01.869	33	1
1924	313	186	0	40	Updated from Excel upload	2025-07-20 18:30:01.929	33	1
1925	169	121	189	313	Updated from Excel upload	2025-07-20 18:30:01.999	33	1
1926	170	121	0	50	Updated from Excel upload	2025-07-20 18:30:02.031	33	1
1927	314	187	0	50	Updated from Excel upload	2025-07-20 18:30:02.125	33	1
1928	315	188	13	66	Updated from Excel upload	2025-07-20 18:30:02.189	33	1
1929	316	188	0	200	Updated from Excel upload	2025-07-20 18:30:02.208	33	1
1930	317	188	0	200	Updated from Excel upload	2025-07-20 18:30:02.228	33	1
1931	318	188	0	7	Updated from Excel upload	2025-07-20 18:30:02.29	33	1
1932	319	189	899	1426	Updated from Excel upload	2025-07-20 18:30:02.313	33	1
1933	320	189	180	480	Updated from Excel upload	2025-07-20 18:30:02.366	33	1
1934	171	122	1076.9	1356.9	Updated from Excel upload	2025-07-20 18:30:02.391	33	1
1935	172	122	0	19	Updated from Excel upload	2025-07-20 18:30:02.454	33	1
1936	321	190	0	185	Updated from Excel upload	2025-07-20 18:30:02.474	33	1
1937	322	191	0	280	Updated from Excel upload	2025-07-20 18:30:02.5	33	1
1938	173	123	792	1276.8	Updated from Excel upload	2025-07-20 18:30:02.525	33	1
1939	174	123	0	40	Updated from Excel upload	2025-07-20 18:30:02.54	33	1
1940	175	123	0	47.6	Updated from Excel upload	2025-07-20 18:30:02.598	33	1
1941	325	193	0	502.78	Updated from Excel upload	2025-07-20 18:30:02.615	33	1
1942	326	193	370	157	Updated from Excel upload	2025-07-20 18:30:02.633	33	1
1943	327	193	0	213	Updated from Excel upload	2025-07-20 18:30:02.66	33	1
1944	176	124	290.6	800.6	Updated from Excel upload	2025-07-20 18:30:02.697	33	1
1945	177	124	200	120	Updated from Excel upload	2025-07-20 18:30:02.754	33	1
1946	178	124	0	160	Updated from Excel upload	2025-07-20 18:30:02.77	33	1
1947	179	124	46	37	Updated from Excel upload	2025-07-20 18:30:02.791	33	1
1948	328	194	0	10	Updated from Excel upload	2025-07-20 18:30:02.935	33	1
1949	329	195	0	150	Updated from Excel upload	2025-07-20 18:30:02.963	33	1
1950	330	196	0	73.6	Updated from Excel upload	2025-07-20 18:30:02.987	33	1
1951	180	125	26.6	511.6	Updated from Excel upload	2025-07-20 18:30:03.009	33	1
1952	181	125	141	163.3	Updated from Excel upload	2025-07-20 18:30:03.032	33	1
1953	184	127	17	138	Updated from Excel upload	2025-07-20 18:30:09.435	33	1
1954	186	128	211	395	Updated from Excel upload	2025-07-20 18:30:09.457	33	1
1955	187	129	202.26	364.26	Updated from Excel upload	2025-07-20 18:30:09.475	33	1
1956	188	129	0	157	Updated from Excel upload	2025-07-20 18:30:09.496	33	1
1957	189	129	9	61.1	Updated from Excel upload	2025-07-20 18:30:09.551	33	1
1958	190	130	232	294.5	Updated from Excel upload	2025-07-20 18:30:09.571	33	1
1959	191	131	8.7	15	Updated from Excel upload	2025-07-20 18:30:09.587	33	1
1960	464	251	1891	0	Updated from Excel upload	2025-07-20 18:30:09.611	33	1
1961	465	252	610	0	Updated from Excel upload	2025-07-20 18:30:09.633	33	1
1962	332	198	0	23	Updated from Excel upload	2025-07-20 18:30:09.789	33	1
1963	333	199	68	129	Updated from Excel upload	2025-07-20 18:30:09.805	33	1
1964	334	199	99	44	Updated from Excel upload	2025-07-20 18:30:09.822	33	1
1965	335	199	0	55	Updated from Excel upload	2025-07-20 18:30:09.839	33	1
1966	336	199	0	30	Updated from Excel upload	2025-07-20 18:30:09.859	33	1
1967	337	200	2379	122	Updated from Excel upload	2025-07-20 18:30:09.875	33	1
1968	338	201	0	7.9	Updated from Excel upload	2025-07-20 18:30:09.892	33	1
1969	339	202	86.45	130.65	Updated from Excel upload	2025-07-20 18:30:09.908	33	1
1970	340	202	0	6.5	Updated from Excel upload	2025-07-20 18:30:09.926	33	1
1971	341	202	0	11	Updated from Excel upload	2025-07-20 18:30:10.037	33	1
1972	342	203	1292.8	92	Updated from Excel upload	2025-07-20 18:30:10.102	33	1
1973	343	203	122	51	Updated from Excel upload	2025-07-20 18:30:10.124	33	1
1974	344	203	152	140	Updated from Excel upload	2025-07-20 18:30:10.143	33	1
1975	345	204	10	21	Updated from Excel upload	2025-07-20 18:30:10.196	33	1
1976	346	204	0	29	Updated from Excel upload	2025-07-20 18:30:10.213	33	1
1977	347	204	0	6	Updated from Excel upload	2025-07-20 18:30:10.231	33	1
1978	348	205	873.85	0	Updated from Excel upload	2025-07-20 18:30:10.246	33	1
1979	349	205	113	67	Updated from Excel upload	2025-07-20 18:30:10.292	33	1
1980	350	205	91	244	Updated from Excel upload	2025-07-20 18:30:10.314	33	1
1981	351	206	29.3	63.75	Updated from Excel upload	2025-07-20 18:30:10.334	33	1
1982	353	206	0	72	Updated from Excel upload	2025-07-20 18:30:10.361	33	1
1983	354	207	468	244	Updated from Excel upload	2025-07-20 18:30:10.377	33	1
1984	355	208	0	8.5	Updated from Excel upload	2025-07-20 18:30:10.393	33	1
1985	357	209	0	48.9	Updated from Excel upload	2025-07-20 18:30:10.421	33	1
1986	468	253	110	183	Updated from Excel upload	2025-07-20 18:30:10.57	33	1
1987	477	259	0	26	Created from Excel upload	2025-07-20 18:30:10.629	33	1
1988	478	259	0	39.96	Created from Excel upload	2025-07-20 18:30:10.807	33	1
1989	470	255	10	48.1	Updated from Excel upload	2025-07-20 18:30:10.882	33	1
1990	479	260	0	15.1	Created from Excel upload	2025-07-20 18:30:10.964	33	1
1991	473	256	86.9	305	Updated from Excel upload	2025-07-20 18:30:11.11	33	1
1992	474	257	220.84	285.3	Updated from Excel upload	2025-07-20 18:30:11.137	33	1
1993	\N	82	366	305	QtyPO updated from Excel (global)	2025-07-20 18:30:11.558	33	1
1994	\N	244	0	610	QtyPO updated from Excel (global)	2025-07-20 18:30:11.649	33	1
1995	\N	230	520	0	QtyPO updated from Excel (global)	2025-07-20 18:30:11.814	33	1
1996	\N	251	0	1830	QtyPO updated from Excel (global)	2025-07-20 18:30:12.155	33	1
1997	\N	252	0	610	QtyPO updated from Excel (global)	2025-07-20 18:30:12.17	33	1
1998	\N	200	0	2440	QtyPO updated from Excel (global)	2025-07-20 18:30:12.195	33	1
1999	\N	207	0	610	QtyPO updated from Excel (global)	2025-07-20 18:30:12.224	33	1
2000	\N	209	122	0	QtyPO updated from Excel (global)	2025-07-20 18:30:12.253	33	1
2001	199	97	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.447	33	1
2002	462	125	80	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.462	33	1
2003	463	250	21	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:30:12.476	33	1
2004	466	200	61	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.488	33	1
2005	467	207	122	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.502	33	1
2006	419	138	82	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.513	33	1
2007	420	146	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.525	33	1
2008	421	60	122	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.541	33	1
2009	422	70	61	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.552	33	1
2010	435	244	61	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.568	33	1
2011	442	148	26	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.582	33	1
2012	443	149	46	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.598	33	1
2013	444	150	30.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.613	33	1
2014	445	212	70	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.625	33	1
2015	446	223	197	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.641	33	1
2016	447	233	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.657	33	1
2017	448	235	320	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.7	33	1
2018	449	235	320	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.721	33	1
2019	450	159	1005	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.769	33	1
2020	451	173	7.5	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.783	33	1
2021	452	175	160	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.798	33	1
2022	453	178	10	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.809	33	1
2023	454	182	200	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.821	33	1
2024	455	185	11.9	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.834	33	1
2025	456	249	320	0	Stock nulled: ItemCode not found in Excel	2025-07-20 18:30:12.847	33	1
2026	457	121	116	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.86	33	1
2027	458	189	174	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.872	33	1
2028	459	122	120	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.887	33	1
2029	460	191	8	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.899	33	1
2030	461	123	320	0	Stock nulled: ItemCode+Warehouse not found in Excel	2025-07-20 18:30:12.91	33	1
\.


--
-- Data for Name: StockHistoryExcelUploadLog; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."StockHistoryExcelUploadLog" ("Id", "FilePath", "CreatedAt") FROM stdin;
1	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1749812551550.xlsx	2025-06-13 11:02:32.113
2	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750405030174.xlsx	2025-06-20 07:37:10.873
3	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750507363895.xlsx	2025-06-21 12:02:44.706
4	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750509605030.xlsx	2025-06-21 12:40:05.645
5	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750512511529.xlsx	2025-06-21 13:28:31.835
6	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750824111413.xlsx	2025-06-25 04:01:52.599
7	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750824140604.xlsx	2025-06-25 04:02:20.749
8	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1750833177928.xlsx	2025-06-25 06:32:58.606
9	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751120539818.xlsx	2025-06-28 14:22:20.477
10	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751120741992.xlsx	2025-06-28 14:25:42.909
11	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751355657844.xlsx	2025-07-01 07:40:58.552
12	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751356215488.xlsx	2025-07-01 07:50:16.196
13	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751356375483.xlsx	2025-07-01 07:52:56.017
14	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751703094314.xlsx	2025-07-05 08:11:34.977
15	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751714274784.xlsx	2025-07-05 11:17:55.545
16	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751714802612.xlsx	2025-07-05 11:26:43.387
17	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751714985576.xlsx	2025-07-05 11:29:46.066
18	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751715205266.xlsx	2025-07-05 11:33:25.819
19	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751715262415.xlsx	2025-07-05 11:34:22.823
20	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751715440728.xlsx	2025-07-05 11:37:21.442
21	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751715505214.xlsx	2025-07-05 11:38:25.895
22	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751715737666.xlsx	2025-07-05 11:42:18.408
23	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751716601773.xlsx	2025-07-05 11:56:42.644
24	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_1751717192203.xlsx	2025-07-05 12:06:32.941
25	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_unknown 2025-07-06 02.16.15.xlsx	2025-07-05 12:16:15.996
26	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_superadminnn 2025-07-05 19.26.48.xlsx	2025-07-05 12:26:48.436
27	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_superadminnn 2025-07-05 23.32.29.xlsx	2025-07-05 16:32:28.119
28	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_superadminnn 2025-07-05 23.51.50.xlsx	2025-07-05 16:51:46.29
29	C:\\xampp\\htdocs\\sunway\\sunway-stok\\back\\src\\controllers\\uploads\\excel\\stock_unknown 2025-07-05 23.52.30.xlsx	2025-07-05 16:52:22.615
30	/root/sunway/sunway-stok/back/dist/controllers/uploads/excel/stock_superadminnn 2025-07-19 12.49.14.xlsx	2025-07-19 12:49:11.181
31	/root/sunway/sunway-stok/back/dist/controllers/uploads/excel/stock_superadminnn 2025-07-20 18.28.35.xlsx	2025-07-20 18:28:32.504
32	/root/sunway/sunway-stok/back/dist/controllers/uploads/excel/stock_unknown 2025-07-20 18.29.25.xlsx	2025-07-20 18:29:08.069
33	/root/sunway/sunway-stok/back/dist/controllers/uploads/excel/stock_superadminnn 2025-07-20 18.29.46.xlsx	2025-07-20 18:29:44.029
34	/root/sunway/sunway-stok/back/dist/controllers/uploads/excel/stock_unknown 2025-07-20 18.30.53.xlsx	2025-07-20 18:30:25.342
\.


--
-- Data for Name: Tax; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Tax" ("Id", "Name", "Percentage", "IsActive", "CreatedAt", "UpdatedAt", "DeletedAt") FROM stdin;
1	11%	11	f	2025-06-18 10:07:09.475	2025-07-04 15:49:57.58	\N
2	11%	11	f	2025-07-04 15:49:57.586	2025-07-04 15:50:06.078	\N
3	11%	12	f	2025-07-04 15:50:06.082	2025-07-04 15:50:22.247	\N
4	11%	100	f	2025-07-04 15:50:22.249	2025-07-04 15:50:23.617	\N
5	11%	100	f	2025-07-04 15:50:23.619	2025-07-04 15:54:15.423	\N
6	11%	100	f	2025-07-04 15:54:15.425	2025-07-04 15:56:07.322	\N
7	11%	100	f	2025-07-04 15:56:07.325	2025-07-04 16:04:36.09	\N
8	11%	100	f	2025-07-04 16:04:36.095	2025-07-04 16:04:36.753	\N
9	11%	100	f	2025-07-04 16:04:36.756	2025-07-04 16:04:37.111	\N
10	11%	100	f	2025-07-04 16:04:37.113	2025-07-04 16:04:37.295	\N
11	11%	100	f	2025-07-04 16:04:37.297	2025-07-04 16:04:37.672	\N
12	11%	100	f	2025-07-04 16:04:37.677	2025-07-19 14:19:41.566	\N
13	11%	11	t	2025-07-19 14:19:41.596	2025-07-19 14:19:41.596	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."User" ("Id", "Email", "Name", "Password", "Username", "CreatedAt", "DeletedAt", "Token", "Image", "Address", "Birthdate", "Country", "Gender", "PhoneNumber", "Province", "DealerId") FROM stdin;
8	user@gmail.com	Test User	$2b$10$smmij4UYg9OCYUD0R6fyEe2prkCyQ0kPgE76WOhb9UKt.UEImNw46	user	2025-06-19 16:26:11.878	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjgsImlhdCI6MTc1MDM1MDM3MSwiZXhwIjoxNzUwMzUzOTcxfQ.HNxa-SpSZ7NFOtV23WUniLJb_taWLRRVlpgt80mjkZA	\N	123 Main Street	1990-01-01 00:00:00	USA	Male	1234567890	California	\N
10	minato6175@gmail.com	Togar	$2b$10$.MAFXwfdYo4PGCz.K/U2n.6xn8DQxNAE6DMrcXaxUvhKlAnJDJqfa	Togar	2025-07-17 08:48:21.384	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEwLCJpYXQiOjE3NTI3NDIxMzgsImV4cCI6MTc1Mjc0NTczOH0.KkHlhn4M6NGdMDPv3MKDedsbMUW8PsIhmdTYCu8UrZE	\N		2025-07-17 00:00:00	ID		089685352740	DKI Jakarta	1
9	dagonzaalfredo@gmail.com	alfredo dagonza	$2b$10$OCUB4QIWDalPi/UuE.YxOe.SpQPnYwPq.htHIL8cpLeOZmHR.zZcm	shobukid	2025-06-19 16:26:18.675	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1Mjk0NDEzNiwiZXhwIjoxNzUyOTQ3NzM2fQ.QzgPou_zZJxEiwLNBplgGcqsFBM03GEWFnBY966YUhM	\N		\N	ID		089685352740	DKI Jakarta	1
\.


--
-- Data for Name: UserForgotPasswordRequest; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."UserForgotPasswordRequest" ("Id", "UserId", "Token", "IsUsed", "ExpiresAt", "SenderEmail", "Status", "ErrorMessage", "CreatedAt", "EmailTemplateId") FROM stdin;
\.


--
-- Data for Name: UserSession; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."UserSession" ("Id", "UserId", "LoginTime", "LogoutTime", "Token") FROM stdin;
1	8	2025-06-19 16:26:11.885	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjgsImlhdCI6MTc1MDM1MDM3MSwiZXhwIjoxNzUwMzUzOTcxfQ.HNxa-SpSZ7NFOtV23WUniLJb_taWLRRVlpgt80mjkZA
2	9	2025-06-19 16:26:18.681	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MDM1MDM3OCwiZXhwIjoxNzUwMzUzOTc4fQ.hR8KAZWgz2LJAfpzWCR5IWgUWJnbiWdbVvSh_g4iXzI
3	9	2025-06-19 16:26:28.076	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MDM1MDM4OCwiZXhwIjoxNzUwMzUzOTg4fQ.P_XVAD5ZlAb25UA8FY_ESQQKnAbaHignbq0q-MkwO40
4	9	2025-06-19 19:29:50.501	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MDM2MTM5MCwiZXhwIjoxNzUwMzY0OTkwfQ._GT3hEkVQWiHXQz2BNEZO_vdpfg6nZLdFkiZNSO_8Gs
5	9	2025-06-25 06:17:37.917	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MDgzMjI1NywiZXhwIjoxNzUwODM1ODU3fQ.gEtX3B2aWgcQwHPFt07TYLP-IY9bPcVcXHzpcE5u5lA
6	9	2025-06-25 10:25:09.29	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MDg0NzEwOSwiZXhwIjoxNzUwODUwNzA5fQ._4hCOz3Lo6jWUsXjw6gCmYUkG5vXZJQ-ptn7xzWiNAs
7	9	2025-06-30 12:06:18.734	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTI4NTE3OCwiZXhwIjoxNzUxMjg4Nzc4fQ.oQkklHx2yo0s6QwOde51i4-ulmpwpTZRIinj22fvzCc
8	9	2025-06-30 12:43:12.525	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTI4NzM5MiwiZXhwIjoxNzUxMjkwOTkyfQ.CKigjwbZhM0fHoIo6ort9Q1hfBUvuIrTLkIAOLhNk2Q
9	9	2025-06-30 14:40:09.461	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTI5NDQwOSwiZXhwIjoxNzUxMjk4MDA5fQ.HZZq44yl8jLzdNRVBgaAkrS1NoufI1NvEuUnKe_UqGA
10	9	2025-06-30 15:29:38.288	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTI5NzM3OCwiZXhwIjoxNzUxMzAwOTc4fQ.5nd8Ejye5L9LRw3ShoJg1qbs4_im-Q05xxZWay6gvRI
11	9	2025-06-30 16:32:51.51	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTMwMTE3MSwiZXhwIjoxNzUxMzA0NzcxfQ.Bhjoe37KpZRw15bGsO3CUq96nirrcvP66JRg1vWgUPI
12	9	2025-07-01 06:17:39.182	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTM1MDY1OSwiZXhwIjoxNzUxMzU0MjU5fQ.rEi-tKwnWhPx01ZNrmja8e7W3Rj8uabS20_SQpM1OAY
13	9	2025-07-01 06:21:07.594	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTM1MDg2NywiZXhwIjoxNzUxMzU0NDY3fQ.8z9-yLcMTD_t0spmGcGsKCvN_JGeAhloI40mROHW9gk
14	9	2025-07-01 07:22:18.978	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTM1NDUzOCwiZXhwIjoxNzUxMzU4MTM4fQ.YyOs8yDVtY3RvCWzQ24-BA4G0UtR4krryQvuS-7SAn4
15	9	2025-07-01 07:25:05.483	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTM1NDcwNSwiZXhwIjoxNzUxMzU4MzA1fQ.Q1wXybs1kNq4OyGbFMq9d7GRvjNBLqG_-B_GfdttgNM
16	9	2025-07-01 08:24:24.909	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTM1ODI2NCwiZXhwIjoxNzUxMzYxODY0fQ.jDPqhQVq-yNSsz6x1ibfao1c1cbKN52pAfKXabHUvnY
17	9	2025-07-02 17:30:39.748	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTQ3NzQzOSwiZXhwIjoxNzUxNDgxMDM5fQ.EfeLnxuEfeoF-VnE8xazj6HSwrhm7QhHiAnFMAirbNQ
18	9	2025-07-02 18:14:05.178	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTQ4MDA0NSwiZXhwIjoxNzUxNDgzNjQ1fQ.NLpwK55c5tXsgeg-ym9nXMJneOvrwqidJIXmPabMhFY
19	9	2025-07-02 18:14:37.712	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTQ4MDA3NywiZXhwIjoxNzUxNDgzNjc3fQ.WFTI6VCjR4H4BAjAg8V2eOzQMkxRfEn5-CW9DaiYAxk
20	9	2025-07-02 18:18:33.624	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTQ4MDMxMywiZXhwIjoxNzUxNDgzOTEzfQ.f_MIcOrRA_QDZqCDbr1H6QBpUxc-5WqBUBT1xCMHczg
21	9	2025-07-05 17:01:44.39	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTczNDkwNCwiZXhwIjoxNzUxNzM4NTA0fQ.5ECYhr2rxubINUwPJBNXCgW_XOHnJTUdNzvQtwZ2I-Y
22	9	2025-07-05 18:25:24.543	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTczOTkyNCwiZXhwIjoxNzUxNzQzNTI0fQ.hi8Hs7nrLxvH7KhkGXXu72HCte86x2ljYZIK176NQvo
23	9	2025-07-05 19:28:29.225	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTc0MzcwOSwiZXhwIjoxNzUxNzQ3MzA5fQ.0Q5sm928EHJsf3Wm-pTFbbtMqnX0K-aDiTjG0cdtxbs
24	9	2025-07-06 16:14:00.487	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTgxODQ0MCwiZXhwIjoxNzUxODIyMDQwfQ.G993mGX1OPqaBGgZqdrGQKDwX8Z6gSjrlN4y7kbsciI
25	9	2025-07-06 16:24:55.349	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTgxOTA5NSwiZXhwIjoxNzUxODIyNjk1fQ.7ONGlrKXxsTSrb15l64FKjzfuD2bwU0LU6EurKhYizI
26	9	2025-07-06 16:30:03.799	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTgxOTQwMywiZXhwIjoxNzUxODIzMDAzfQ.swO3_sIIE2erow2XqYpchDEKAQ2bSYXJtjeBPyfH-Is
27	9	2025-07-07 07:22:51.24	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTg3Mjk3MSwiZXhwIjoxNzUxODc2NTcxfQ.mprF29WcbUwWn6DZwR2NGUE2owuwM7DTeEHro14yjyQ
28	9	2025-07-07 09:16:14.653	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MTg3OTc3NCwiZXhwIjoxNzUxODgzMzc0fQ.aqjVcw_uwbdclBaQJYdHRBmz-J3PCYLQ5vCxzx2bo8w
29	10	2025-07-17 08:48:21.41	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEwLCJpYXQiOjE3NTI3NDIxMDEsImV4cCI6MTc1Mjc0NTcwMX0.Tf1YvbMd2hT4QoIn_aLZa2EfDMfUv_Gns4MuYaQzq0U
30	10	2025-07-17 08:48:58.592	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEwLCJpYXQiOjE3NTI3NDIxMzgsImV4cCI6MTc1Mjc0NTczOH0.KkHlhn4M6NGdMDPv3MKDedsbMUW8PsIhmdTYCu8UrZE
31	9	2025-07-17 09:09:33.841	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1Mjc0MzM3MywiZXhwIjoxNzUyNzQ2OTczfQ.Oe2IdeaXpfuQrbGkyfsrMu71lDhZnjwK9wUQGs1_azY
32	9	2025-07-18 10:56:54.192	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MjgzNjIxNCwiZXhwIjoxNzUyODM5ODE0fQ.9qVvm4JUeQU9mIiJixraleXyNKe0xe_nzAP-2wrDEQk
33	9	2025-07-18 11:13:58.473	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MjgzNzIzOCwiZXhwIjoxNzUyODQwODM4fQ.GDnXMlK6gutvVKRlHqOEDK64AnkkODgoprCKfR-bm68
34	9	2025-07-19 08:05:49.337	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MjkxMjM0OSwiZXhwIjoxNzUyOTE1OTQ5fQ.Ds-SxJXW72XZ9j7dVNdL0v3Ig0_HgBz5goJVLxke5F4
35	9	2025-07-19 10:15:57.755	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MjkyMDE1NywiZXhwIjoxNzUyOTIzNzU3fQ.aGx4l1gqqLeLkG4cDjO_6ecrUJp1aKOLgrovs1hZsvU
36	9	2025-07-19 14:28:31.504	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MjkzNTMxMSwiZXhwIjoxNzUyOTM4OTExfQ.WzAzviHhCZ89hneKtbEj5rCQd-gcj96ksAnry13hcIQ
37	9	2025-07-19 15:41:25.046	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1MjkzOTY4NSwiZXhwIjoxNzUyOTQzMjg1fQ.PgA7FNYTds4-UbEUS_8w60SjnaRLSJtDDcH_DboTItk
38	9	2025-07-19 16:55:36.897	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjksImlhdCI6MTc1Mjk0NDEzNiwiZXhwIjoxNzUyOTQ3NzM2fQ.QzgPou_zZJxEiwLNBplgGcqsFBM03GEWFnBY966YUhM
\.


--
-- Data for Name: Warehouse; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Warehouse" ("Id", "Name", "BusinessUnit", "Location", "CreatedAt", "DeletedAt") FROM stdin;
1	Jakarta	20101	Jakarta	2025-06-12 18:20:07.799	\N
2	Batam	20102	Batam	2025-06-12 18:20:07.824	\N
3	Balikpapan	20801110	Balikpapan	2025-06-12 18:20:07.832	\N
34	Samarinda	20107	Samarinda	2025-06-25 06:32:58.665	\N
35	\N	20103	\N	2025-07-05 11:17:56.848	\N
\.


--
-- Data for Name: WarehouseStock; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."WarehouseStock" ("Id", "WarehouseId", "ItemCodeId", "QtyOnHand", "UpdatedAt", "CreatedAt", "DeletedAt") FROM stdin;
109	1	72	228	2025-07-05 11:17:57.597	2025-07-05 11:17:57.595	\N
128	1	85	171	2025-07-05 11:17:58.301	2025-07-05 11:17:58.3	\N
132	1	89	20	2025-07-05 11:17:58.338	2025-07-05 11:17:58.336	\N
49	1	39	419	2025-06-25 06:32:58.735	2025-06-25 06:32:58.733	\N
86	1	57	0	2025-07-05 16:32:30.405	2025-07-05 11:17:57.447	2025-07-05 11:17:57.447
85	1	56	0	2025-07-05 11:17:57.441	2025-07-05 11:17:57.44	2025-07-05 11:17:57.44
59	2	41	0	2025-07-01 16:05:49.873	2025-07-01 16:05:49.873	2025-07-01 16:05:53.918
58	1	41	0	2025-07-01 16:05:41.976	2025-07-01 16:05:41.976	2025-07-01 16:10:18.779
60	3	41	0	2025-07-01 16:10:29.817	2025-07-01 16:10:29.817	\N
145	1	99	300	2025-07-05 11:17:59.741	2025-07-05 11:17:59.739	\N
68	3	47	700	2025-07-05 16:32:30.37	2025-07-05 08:11:35.891	\N
113	3	75	40	2025-07-05 16:32:30.58	2025-07-05 11:17:57.623	\N
133	2	90	4	2025-07-05 16:32:31.433	2025-07-05 11:17:58.345	\N
115	2	76	61	2025-07-05 16:32:30.588	2025-07-05 11:17:57.636	\N
131	2	88	5	2025-07-05 16:32:31.426	2025-07-05 11:17:58.33	\N
50	2	39	0	2025-07-05 12:06:34.666	2025-06-25 06:32:58.738	\N
51	3	39	0	2025-07-05 12:06:34.67	2025-06-25 06:32:58.742	\N
93	2	61	183	2025-07-05 16:32:30.453	2025-07-05 11:17:57.492	\N
103	3	67	31	2025-07-05 16:32:30.521	2025-07-05 11:17:57.555	\N
106	3	69	21	2025-07-05 16:32:30.542	2025-07-05 11:17:57.575	\N
108	3	71	85	2025-07-05 16:32:30.554	2025-07-05 11:17:57.589	\N
110	2	72	41	2025-07-05 16:32:30.565	2025-07-05 11:17:57.601	\N
156	1	110	89.6	2025-07-05 11:17:59.83	2025-07-05 11:17:59.829	\N
161	1	114	225.4	2025-07-05 11:17:59.859	2025-07-05 11:17:59.858	\N
183	1	127	739.06	2025-07-05 11:18:01.937	2025-07-05 11:18:01.935	\N
185	1	128	1028.5	2025-07-05 11:18:01.95	2025-07-05 11:18:01.948	\N
197	1	134	0	2025-07-05 12:06:33.238	2025-07-05 12:06:33.236	2025-07-05 12:06:33.236
198	1	135	0	2025-07-05 12:06:33.255	2025-07-05 12:06:33.254	2025-07-05 12:06:33.254
158	2	111	127	2025-07-05 16:32:33.68	2025-07-05 11:17:59.838	\N
54	3	40	19500	2025-07-20 18:29:49.374	2025-07-01 07:40:58.598	\N
57	3	42	3000	2025-07-05 16:32:30.283	2025-07-01 07:52:56.059	\N
71	3	50	89	2025-07-20 18:29:46.5	2025-07-05 11:17:56.664	\N
37	34	35	800	2025-07-20 18:29:49.442	2025-06-25 06:32:58.67	\N
67	2	46	2000	2025-07-20 18:29:49.959	2025-07-05 08:11:35.883	\N
39	1	36	18.4	2025-07-20 18:29:49.57	2025-06-25 06:32:58.682	\N
52	1	40	2900	2025-07-20 18:29:49.337	2025-07-01 07:40:58.583	\N
117	2	77	76	2025-07-20 18:29:51.107	2025-07-05 11:17:57.649	\N
73	2	51	80	2025-07-20 18:29:47.052	2025-07-05 11:17:56.782	\N
75	2	52	80	2025-07-20 18:29:47.196	2025-07-05 11:17:56.816	\N
76	1	53	385.74	2025-07-20 18:29:47.313	2025-07-05 11:17:56.838	\N
77	2	53	0	2025-07-20 18:29:47.334	2025-07-05 11:17:56.843	2025-07-05 11:17:56.843
78	35	53	40	2025-07-20 18:29:47.351	2025-07-05 11:17:56.854	\N
79	1	54	320.84	2025-07-20 18:29:47.571	2025-07-05 11:17:56.871	\N
80	2	54	60	2025-07-20 18:29:47.59	2025-07-05 11:17:56.877	\N
81	1	55	196.3	2025-07-20 18:29:47.694	2025-07-05 11:17:56.894	\N
82	2	55	138.4	2025-07-20 18:29:47.742	2025-07-05 11:17:56.901	\N
84	3	55	99	2025-07-20 18:29:47.777	2025-07-05 11:17:56.911	\N
2	2	1	157.79	2025-07-20 18:29:49.292	2025-06-12 18:20:07.827	\N
55	1	42	2900	2025-07-20 18:29:49.483	2025-07-01 07:52:56.043	\N
56	2	42	1500	2025-07-20 18:29:49.545	2025-07-01 07:52:56.054	\N
40	2	36	229.3	2025-07-20 18:29:49.592	2025-06-25 06:32:58.689	\N
61	1	43	500	2025-07-20 18:29:49.629	2025-07-05 08:11:35.821	\N
41	3	36	922	2025-07-20 18:29:49.607	2025-06-25 06:32:58.693	\N
63	2	44	2000	2025-07-20 18:29:49.716	2025-07-05 08:11:35.838	\N
64	3	44	27000	2025-07-20 18:29:49.735	2025-07-05 08:11:35.844	\N
65	3	45	2000	2025-07-20 18:29:49.754	2025-07-05 08:11:35.853	\N
43	2	37	110	2025-07-20 18:29:49.846	2025-06-25 06:32:58.705	\N
45	1	38	154.23	2025-07-20 18:29:49.879	2025-06-25 06:32:58.714	\N
46	2	38	54.58	2025-07-20 18:29:49.894	2025-06-25 06:32:58.718	\N
47	34	38	500	2025-07-20 18:29:49.911	2025-06-25 06:32:58.723	\N
87	3	57	106	2025-07-20 18:29:50.09	2025-07-05 11:17:57.454	\N
88	1	58	63	2025-07-20 18:29:50.11	2025-07-05 11:17:57.462	\N
89	1	59	13	2025-07-20 18:29:50.39	2025-07-05 11:17:57.47	\N
92	1	61	753	2025-07-20 18:29:50.527	2025-07-05 11:17:57.488	\N
94	1	62	11	2025-07-20 18:29:50.558	2025-07-05 11:17:57.499	\N
96	2	63	6	2025-07-20 18:29:50.625	2025-07-05 11:17:57.509	\N
98	3	64	40	2025-07-20 18:29:50.666	2025-07-05 11:17:57.519	\N
99	1	65	742	2025-07-20 18:29:50.689	2025-07-05 11:17:57.526	\N
101	3	65	19.2	2025-07-20 18:29:50.729	2025-07-05 11:17:57.538	\N
104	3	68	41	2025-07-20 18:29:50.79	2025-07-05 11:17:57.562	\N
105	2	69	20	2025-07-20 18:29:50.837	2025-07-05 11:17:57.57	\N
112	2	74	61	2025-07-20 18:29:51.021	2025-07-05 11:17:57.616	\N
116	1	77	682.6	2025-07-20 18:29:51.064	2025-07-05 11:17:57.643	\N
118	3	77	173	2025-07-20 18:29:51.228	2025-07-05 11:17:57.653	\N
119	3	78	27	2025-07-20 18:29:51.25	2025-07-05 11:17:57.66	\N
120	1	79	274	2025-07-20 18:29:51.271	2025-07-05 11:17:57.668	\N
121	2	79	147.74	2025-07-20 18:29:51.292	2025-07-05 11:17:57.674	\N
122	1	80	452.1	2025-07-20 18:29:51.309	2025-07-05 11:17:57.686	\N
124	1	81	16.5	2025-07-20 18:29:51.342	2025-07-05 11:17:57.699	\N
130	1	87	175	2025-07-20 18:29:53.417	2025-07-05 11:17:58.314	\N
134	1	91	4	2025-07-20 18:29:53.482	2025-07-05 11:17:58.352	\N
136	34	92	29.08	2025-07-20 18:29:57.144	2025-07-05 11:17:59.435	\N
233	3	149	22.75	2025-07-20 18:29:57.318	2025-07-05 16:32:32.828	\N
144	3	98	9	2025-07-20 18:30:01.085	2025-07-05 11:17:59.732	\N
148	1	102	201.7	2025-07-20 18:30:01.168	2025-07-05 11:17:59.767	\N
44	3	37	580	2025-07-20 18:29:49.862	2025-06-25 06:32:58.709	\N
66	1	46	9300	2025-07-20 18:29:49.944	2025-07-05 08:11:35.876	\N
95	3	62	305	2025-07-20 18:29:50.604	2025-07-05 11:17:57.502	\N
129	1	86	71	2025-07-20 18:29:53.399	2025-07-05 11:17:58.306	\N
135	2	91	10	2025-07-20 18:29:53.499	2025-07-05 11:17:58.357	\N
141	3	95	115	2025-07-20 18:29:57.24	2025-07-05 11:17:59.468	\N
137	1	93	11.3	2025-07-20 18:29:57.165	2025-07-05 11:17:59.442	\N
139	1	95	42	2025-07-20 18:29:57.201	2025-07-05 11:17:59.458	\N
62	1	44	4000	2025-07-20 18:29:49.66	2025-07-05 08:11:35.832	\N
53	2	40	1500	2025-07-20 18:29:49.355	2025-07-01 07:40:58.592	\N
42	1	37	350	2025-07-20 18:29:49.83	2025-06-25 06:32:58.7	\N
90	2	59	80.25	2025-07-20 18:29:50.418	2025-07-05 11:17:57.474	\N
34	1	34	200	2025-07-20 18:29:49.391	2025-06-25 06:32:58.644	\N
140	2	95	17.9	2025-07-20 18:29:57.22	2025-07-05 11:17:59.463	\N
36	2	35	233	2025-07-20 18:29:49.426	2025-06-25 06:32:58.66	\N
97	1	64	1363	2025-07-20 18:29:50.645	2025-07-05 11:17:57.516	\N
102	3	66	61	2025-07-20 18:29:50.757	2025-07-05 11:17:57.547	\N
114	1	76	196	2025-07-20 18:29:51.044	2025-07-05 11:17:57.631	\N
111	1	73	219.31	2025-07-20 18:29:50.914	2025-07-05 11:17:57.608	\N
143	2	97	60	2025-07-20 18:29:57.513	2025-07-05 11:17:59.495	\N
38	3	35	2849	2025-07-20 18:29:49.459	2025-06-25 06:32:58.676	\N
146	1	100	35	2025-07-20 18:30:01.106	2025-07-05 11:17:59.746	\N
147	3	101	37	2025-07-20 18:30:01.122	2025-07-05 11:17:59.753	\N
149	3	103	247.5	2025-07-20 18:30:01.199	2025-07-05 11:17:59.779	\N
170	3	121	50	2025-07-20 18:30:02.009	2025-07-05 11:17:59.926	\N
142	2	96	87.65	2025-07-20 18:29:57.337	2025-07-05 11:17:59.482	\N
172	3	122	19	2025-07-20 18:30:02.446	2025-07-05 11:17:59.948	\N
151	3	105	46	2025-07-05 16:32:33.649	2025-07-05 11:17:59.792	\N
159	3	112	50	2025-07-05 16:32:33.684	2025-07-05 11:17:59.844	\N
162	2	114	164	2025-07-05 16:32:33.695	2025-07-05 11:17:59.863	\N
182	3	126	128.71	2025-07-05 16:32:36.513	2025-07-05 11:18:01.928	\N
207	1	138	716.5	2025-07-05 16:32:29.383	2025-07-05 16:32:29.382	\N
215	1	141	27.05	2025-07-05 16:32:29.453	2025-07-05 16:32:29.452	\N
219	1	143	8	2025-07-05 16:32:29.5	2025-07-05 16:32:29.498	\N
224	1	145	79.5	2025-07-05 16:32:29.553	2025-07-05 16:32:29.551	\N
227	1	147	122.3	2025-07-05 16:32:29.586	2025-07-05 16:32:29.585	\N
228	2	147	46.6	2025-07-05 16:32:29.593	2025-07-05 16:32:29.591	\N
248	1	155	27	2025-07-05 16:32:33.116	2025-07-05 16:32:33.115	\N
249	1	156	8	2025-07-05 16:32:33.126	2025-07-05 16:32:33.124	\N
261	1	161	9	2025-07-05 16:32:33.213	2025-07-05 16:32:33.212	\N
69	3	48	252	2025-07-20 18:29:46.462	2025-07-05 11:17:56.631	\N
200	1	136	3511	2025-07-20 18:29:46.745	2025-07-05 16:32:29.325	\N
201	2	136	1170	2025-07-20 18:29:46.765	2025-07-05 16:32:29.335	\N
205	34	137	60	2025-07-20 18:29:46.897	2025-07-05 16:32:29.366	\N
204	2	137	180	2025-07-20 18:29:46.82	2025-07-05 16:32:29.359	\N
208	34	138	82	2025-07-20 18:29:46.937	2025-07-05 16:32:29.387	\N
209	1	139	1439	2025-07-20 18:29:47.072	2025-07-05 16:32:29.406	\N
210	2	139	560	2025-07-20 18:29:47.09	2025-07-05 16:32:29.414	\N
214	3	140	172	2025-07-20 18:29:47.156	2025-07-05 16:32:29.443	\N
213	2	140	840	2025-07-20 18:29:47.14	2025-07-05 16:32:29.436	\N
74	1	52	2360	2025-07-20 18:29:47.178	2025-07-05 11:17:56.807	\N
216	1	142	300	2025-07-20 18:29:47.215	2025-07-05 16:32:29.473	\N
217	2	142	0	2025-07-20 18:29:47.233	2025-07-05 16:32:29.481	2025-07-05 16:32:29.481
218	3	142	81.5	2025-07-20 18:29:47.25	2025-07-05 16:32:29.487	\N
220	2	143	20	2025-07-20 18:29:47.274	2025-07-05 16:32:29.505	\N
225	2	145	77.3	2025-07-20 18:29:47.484	2025-07-05 16:32:29.557	\N
226	1	146	240	2025-07-20 18:29:47.607	2025-07-05 16:32:29.575	\N
229	3	147	42.7	2025-07-20 18:29:47.637	2025-07-05 16:32:29.597	\N
83	34	55	58	2025-07-20 18:29:47.76	2025-07-05 11:17:56.907	\N
192	1	132	419	2025-07-20 18:29:49.979	2025-07-05 11:29:47.551	\N
193	2	132	29.37	2025-07-20 18:29:49.998	2025-07-05 11:29:47.558	\N
194	3	132	4525	2025-07-20 18:29:50.013	2025-07-05 11:29:47.563	\N
195	1	133	8820	2025-07-20 18:29:50.03	2025-07-05 11:29:47.57	\N
196	2	133	2000	2025-07-20 18:29:50.049	2025-07-05 11:29:47.575	\N
100	2	65	351	2025-07-20 18:29:50.707	2025-07-05 11:17:57.533	\N
107	1	70	549	2025-07-20 18:29:50.868	2025-07-05 11:17:57.583	\N
123	2	80	112	2025-07-20 18:29:51.325	2025-07-05 11:17:57.691	\N
230	34	148	26.1	2025-07-20 18:29:57.257	2025-07-05 16:32:32.806	\N
235	34	150	30.5	2025-07-20 18:29:57.372	2025-07-05 16:32:32.853	\N
239	1	152	294	2025-07-20 18:29:59.087	2025-07-05 16:32:33.046	\N
242	2	153	1095	2025-07-20 18:29:59.166	2025-07-05 16:32:33.07	\N
246	34	154	416	2025-07-20 18:29:59.315	2025-07-05 16:32:33.1	\N
250	2	156	64.87	2025-07-20 18:29:59.413	2025-07-05 16:32:33.13	\N
252	1	158	4358.06	2025-07-20 18:29:59.447	2025-07-05 16:32:33.149	\N
253	2	158	208	2025-07-20 18:29:59.466	2025-07-05 16:32:33.155	\N
254	34	158	944	2025-07-20 18:29:59.513	2025-07-05 16:32:33.161	\N
258	2	160	2652	2025-07-20 18:29:59.58	2025-07-05 16:32:33.191	\N
259	34	160	103	2025-07-20 18:29:59.597	2025-07-05 16:32:33.196	\N
263	34	161	60	2025-07-20 18:29:59.66	2025-07-05 16:32:33.242	\N
265	2	162	15.2	2025-07-20 18:29:59.695	2025-07-05 16:32:33.258	\N
266	1	163	593	2025-07-20 18:29:59.715	2025-07-05 16:32:33.269	\N
269	2	164	2243	2025-07-20 18:29:59.854	2025-07-05 16:32:33.291	\N
270	34	164	622	2025-07-20 18:29:59.916	2025-07-05 16:32:33.297	\N
272	1	165	1031	2025-07-20 18:29:59.97	2025-07-05 16:32:33.312	\N
273	3	165	519	2025-07-20 18:29:59.988	2025-07-05 16:32:33.317	\N
152	3	106	8	2025-07-20 18:30:01.246	2025-07-05 11:17:59.8	\N
155	3	109	39	2025-07-20 18:30:01.302	2025-07-05 11:17:59.822	\N
163	3	115	3516.5	2025-07-20 18:30:01.411	2025-07-05 11:17:59.873	\N
164	3	116	123	2025-07-20 18:30:01.436	2025-07-05 11:17:59.88	\N
167	3	119	330	2025-07-20 18:30:01.593	2025-07-05 11:17:59.9	\N
168	3	120	60	2025-07-20 18:30:01.612	2025-07-05 11:17:59.906	\N
171	1	122	1356.9	2025-07-20 18:30:02.382	2025-07-05 11:17:59.943	\N
173	1	123	1276.8	2025-07-20 18:30:02.516	2025-07-05 11:17:59.962	\N
174	34	123	40	2025-07-20 18:30:02.534	2025-07-05 11:17:59.966	\N
177	2	124	120	2025-07-20 18:30:02.745	2025-07-05 11:17:59.989	\N
178	34	124	160	2025-07-20 18:30:02.764	2025-07-05 11:17:59.995	\N
180	1	125	511.6	2025-07-20 18:30:02.997	2025-07-05 11:18:00.014	\N
181	3	125	163.3	2025-07-20 18:30:03.019	2025-07-05 11:18:00.022	\N
184	3	127	138	2025-07-20 18:30:09.389	2025-07-05 11:18:01.941	\N
186	3	128	395	2025-07-20 18:30:09.449	2025-07-05 11:18:01.953	\N
187	1	129	364.26	2025-07-20 18:30:09.466	2025-07-05 11:18:01.962	\N
188	34	129	157	2025-07-20 18:30:09.484	2025-07-05 11:18:01.967	\N
191	3	131	15	2025-07-20 18:30:09.581	2025-07-05 11:18:01.986	\N
199	1	97	0	2025-07-20 18:30:12.439	2025-07-05 12:06:33.813	\N
175	3	123	47.6	2025-07-20 18:30:02.589	2025-07-05 11:17:59.97	\N
189	3	129	61.1	2025-07-20 18:30:09.539	2025-07-05 11:18:01.972	\N
236	3	150	25.79	2025-07-20 18:29:57.396	2025-07-05 16:32:32.86	\N
237	1	151	1968	2025-07-20 18:29:59.019	2025-07-05 16:32:33.027	\N
240	34	152	480	2025-07-20 18:29:59.13	2025-07-05 16:32:33.053	\N
241	1	153	1206	2025-07-20 18:29:59.147	2025-07-05 16:32:33.063	\N
153	3	107	19.3	2025-07-20 18:30:01.262	2025-07-05 11:17:59.807	\N
154	3	108	40	2025-07-20 18:30:01.285	2025-07-05 11:17:59.815	\N
160	3	113	39	2025-07-20 18:30:01.367	2025-07-05 11:17:59.851	\N
165	3	117	85	2025-07-20 18:30:01.465	2025-07-05 11:17:59.886	\N
166	3	118	214	2025-07-20 18:30:01.55	2025-07-05 11:17:59.894	\N
169	1	121	313	2025-07-20 18:30:01.975	2025-07-05 11:17:59.922	\N
176	1	124	800.6	2025-07-20 18:30:02.672	2025-07-05 11:17:59.984	\N
179	3	124	37	2025-07-20 18:30:02.78	2025-07-05 11:18:00	\N
203	1	137	1970	2025-07-20 18:29:46.801	2025-07-05 16:32:29.352	\N
206	3	137	342.5	2025-07-20 18:29:46.914	2025-07-05 16:32:29.373	\N
72	1	51	1956.9	2025-07-20 18:29:46.979	2025-07-05 11:17:56.776	\N
211	34	139	160	2025-07-20 18:29:47.105	2025-07-05 16:32:29.421	\N
212	1	140	2390	2025-07-20 18:29:47.123	2025-07-05 16:32:29.431	\N
221	34	143	51	2025-07-20 18:29:47.292	2025-07-05 16:32:29.512	\N
222	1	144	300	2025-07-20 18:29:47.443	2025-07-05 16:32:29.535	\N
48	3	38	1519	2025-07-20 18:29:49.928	2025-06-25 06:32:58.728	\N
231	1	149	305	2025-07-20 18:29:57.276	2025-07-05 16:32:32.816	\N
243	34	153	2042	2025-07-20 18:29:59.182	2025-07-05 16:32:33.076	\N
232	34	149	46	2025-07-20 18:29:57.293	2025-07-05 16:32:32.822	\N
245	2	154	914	2025-07-20 18:29:59.259	2025-07-05 16:32:33.093	\N
247	3	154	575.5	2025-07-20 18:29:59.373	2025-07-05 16:32:33.106	\N
234	1	150	125.45	2025-07-20 18:29:57.354	2025-07-05 16:32:32.846	\N
255	2	159	605	2025-07-20 18:29:59.53	2025-07-05 16:32:33.17	\N
257	1	160	5132	2025-07-20 18:29:59.563	2025-07-05 16:32:33.184	\N
260	3	160	243.5	2025-07-20 18:29:59.613	2025-07-05 16:32:33.203	\N
264	1	162	107	2025-07-20 18:29:59.677	2025-07-05 16:32:33.252	\N
268	1	164	4751.9	2025-07-20 18:29:59.783	2025-07-05 16:32:33.285	\N
271	3	164	521	2025-07-20 18:29:59.949	2025-07-05 16:32:33.303	\N
256	34	159	400	2025-07-20 18:29:59.545	2025-07-05 16:32:33.175	\N
281	1	169	7.8	2025-07-05 16:32:33.38	2025-07-05 16:32:33.379	\N
298	3	176	40	2025-07-05 16:32:33.503	2025-07-05 16:32:33.502	\N
323	2	191	60	2025-07-05 16:32:33.877	2025-07-05 16:32:33.875	\N
324	1	192	560.05	2025-07-05 16:32:33.887	2025-07-05 16:32:33.885	\N
331	3	197	61	2025-07-05 16:32:36.627	2025-07-05 16:32:36.625	\N
352	2	206	17	2025-07-05 16:32:36.834	2025-07-05 16:32:36.833	\N
356	3	208	6	2025-07-05 16:32:36.878	2025-07-05 16:32:36.876	\N
365	1	214	17	2025-07-05 16:51:50.785	2025-07-05 16:51:50.784	\N
385	1	221	637.7	2025-07-05 16:51:50.932	2025-07-05 16:51:50.931	\N
386	2	221	106	2025-07-05 16:51:50.938	2025-07-05 16:51:50.937	\N
360	1	211	1575	2025-07-20 18:29:57.611	2025-07-05 16:51:50.74	\N
362	1	212	2026.12	2025-07-20 18:29:57.644	2025-07-05 16:51:50.757	\N
363	2	212	1039	2025-07-20 18:29:57.66	2025-07-05 16:51:50.764	\N
364	3	213	119	2025-07-20 18:29:57.675	2025-07-05 16:51:50.774	\N
366	2	214	297.8	2025-07-20 18:29:57.698	2025-07-05 16:51:50.791	\N
367	34	214	36	2025-07-20 18:29:57.716	2025-07-05 16:51:50.798	\N
369	2	215	712	2025-07-20 18:29:57.752	2025-07-05 16:51:50.813	\N
372	34	216	514	2025-07-20 18:29:58.01	2025-07-05 16:51:50.835	\N
371	2	216	819	2025-07-20 18:29:57.832	2025-07-05 16:51:50.829	\N
374	2	217	238.9	2025-07-20 18:29:58.052	2025-07-05 16:51:50.85	\N
380	34	219	103	2025-07-20 18:29:58.179	2025-07-05 16:51:50.894	\N
382	2	220	303.5	2025-07-20 18:29:58.217	2025-07-05 16:51:50.908	\N
383	34	220	160.5	2025-07-20 18:29:58.234	2025-07-05 16:51:50.914	\N
387	1	222	2216	2025-07-20 18:29:58.344	2025-07-05 16:51:50.946	\N
388	35	222	320	2025-07-20 18:29:58.359	2025-07-05 16:51:50.952	\N
391	3	224	262	2025-07-20 18:29:58.413	2025-07-05 16:51:50.977	\N
390	2	223	1015	2025-07-20 18:29:58.392	2025-07-05 16:51:50.968	\N
275	2	166	300	2025-07-20 18:30:00.031	2025-07-05 16:32:33.333	\N
276	3	166	55	2025-07-20 18:30:00.165	2025-07-05 16:32:33.339	\N
277	1	167	678	2025-07-20 18:30:00.195	2025-07-05 16:32:33.348	\N
279	2	168	1450	2025-07-20 18:30:00.231	2025-07-05 16:32:33.362	\N
280	3	168	287.5	2025-07-20 18:30:00.249	2025-07-05 16:32:33.368	\N
282	1	170	1268	2025-07-20 18:30:00.276	2025-07-05 16:32:33.388	\N
283	2	170	741	2025-07-20 18:30:00.299	2025-07-05 16:32:33.394	\N
288	34	171	1346	2025-07-20 18:30:00.401	2025-07-05 16:32:33.426	\N
287	2	171	900	2025-07-20 18:30:00.381	2025-07-05 16:32:33.42	\N
291	1	173	2188.55	2025-07-20 18:30:00.527	2025-07-05 16:32:33.451	\N
292	34	173	7.5	2025-07-20 18:30:00.574	2025-07-05 16:32:33.458	\N
294	3	174	274.85	2025-07-20 18:30:00.61	2025-07-05 16:32:33.472	\N
295	34	175	200	2025-07-20 18:30:00.632	2025-07-05 16:32:33.482	\N
297	2	176	0	2025-07-20 18:30:00.665	2025-07-05 16:32:33.496	2025-07-05 16:32:33.496
299	34	177	120	2025-07-20 18:30:00.743	2025-07-05 16:32:33.513	\N
303	3	179	40	2025-07-20 18:30:00.883	2025-07-05 16:32:33.544	\N
304	3	180	16.5	2025-07-20 18:30:00.902	2025-07-05 16:32:33.553	\N
306	1	182	80	2025-07-20 18:30:01.014	2025-07-05 16:32:33.571	\N
307	2	182	0	2025-07-20 18:30:01.032	2025-07-05 16:32:33.577	2025-07-05 16:32:33.577
308	1	183	15	2025-07-20 18:30:01.047	2025-07-05 16:32:33.587	\N
309	3	184	21	2025-07-20 18:30:01.068	2025-07-05 16:32:33.596	\N
312	2	186	200	2025-07-20 18:30:01.832	2025-07-05 16:32:33.762	\N
313	34	186	40	2025-07-20 18:30:01.891	2025-07-05 16:32:33.768	\N
316	2	188	200	2025-07-20 18:30:02.2	2025-07-05 16:32:33.806	\N
320	2	189	480	2025-07-20 18:30:02.356	2025-07-05 16:32:33.834	\N
322	1	191	280	2025-07-20 18:30:02.492	2025-07-05 16:32:33.867	\N
335	34	199	55	2025-07-20 18:30:09.831	2025-07-05 16:32:36.663	\N
334	2	199	44	2025-07-20 18:30:09.814	2025-07-05 16:32:36.656	\N
338	3	201	7.9	2025-07-20 18:30:09.884	2025-07-05 16:32:36.695	\N
340	2	202	6.5	2025-07-20 18:30:09.918	2025-07-05 16:32:36.716	\N
343	2	203	51	2025-07-20 18:30:10.115	2025-07-05 16:32:36.747	\N
344	3	203	140	2025-07-20 18:30:10.136	2025-07-05 16:32:36.756	\N
345	1	204	21	2025-07-20 18:30:10.157	2025-07-05 16:32:36.769	\N
346	2	204	29	2025-07-20 18:30:10.206	2025-07-05 16:32:36.778	\N
349	2	205	67	2025-07-20 18:30:10.256	2025-07-05 16:32:36.804	\N
350	3	205	244	2025-07-20 18:30:10.305	2025-07-05 16:32:36.812	\N
351	1	206	63.75	2025-07-20 18:30:10.324	2025-07-05 16:32:36.824	\N
353	3	206	72	2025-07-20 18:30:10.354	2025-07-05 16:32:36.842	\N
355	1	208	8.5	2025-07-20 18:30:10.387	2025-07-05 16:32:36.868	\N
278	1	168	4936.5	2025-07-20 18:30:00.214	2025-07-05 16:32:33.357	\N
285	34	170	267	2025-07-20 18:30:00.344	2025-07-05 16:32:33.405	\N
286	1	171	1606.3	2025-07-20 18:30:00.361	2025-07-05 16:32:33.414	\N
289	3	171	33	2025-07-20 18:30:00.418	2025-07-05 16:32:33.432	\N
293	3	173	268	2025-07-20 18:30:00.592	2025-07-05 16:32:33.463	\N
296	1	176	80	2025-07-20 18:30:00.649	2025-07-05 16:32:33.49	\N
300	3	177	15	2025-07-20 18:30:00.765	2025-07-05 16:32:33.52	\N
301	34	178	10.1	2025-07-20 18:30:00.804	2025-07-05 16:32:33.529	\N
302	1	179	7.3	2025-07-20 18:30:00.862	2025-07-05 16:32:33.538	\N
305	1	181	76	2025-07-20 18:30:00.92	2025-07-05 16:32:33.561	\N
150	1	104	16	2025-07-20 18:30:01.217	2025-07-05 11:17:59.786	\N
310	34	185	11.9	2025-07-20 18:30:01.689	2025-07-05 16:32:33.745	\N
311	1	186	700	2025-07-20 18:30:01.756	2025-07-05 16:32:33.756	\N
314	3	187	50	2025-07-20 18:30:02.075	2025-07-05 16:32:33.791	\N
315	1	188	66	2025-07-20 18:30:02.136	2025-07-05 16:32:33.8	\N
317	34	188	200	2025-07-20 18:30:02.217	2025-07-05 16:32:33.813	\N
318	3	188	7	2025-07-20 18:30:02.238	2025-07-05 16:32:33.819	\N
319	1	189	1426	2025-07-20 18:30:02.305	2025-07-05 16:32:33.828	\N
325	1	193	502.78	2025-07-20 18:30:02.606	2025-07-05 16:32:33.914	\N
327	34	193	213	2025-07-20 18:30:02.643	2025-07-05 16:32:33.928	\N
328	2	194	10	2025-07-20 18:30:02.885	2025-07-05 16:32:33.959	\N
329	3	195	150	2025-07-20 18:30:02.948	2025-07-05 16:32:33.968	\N
330	1	196	73.6	2025-07-20 18:30:02.979	2025-07-05 16:32:33.976	\N
332	3	198	23	2025-07-20 18:30:09.781	2025-07-05 16:32:36.636	\N
333	1	199	129	2025-07-20 18:30:09.798	2025-07-05 16:32:36.649	\N
336	3	199	30	2025-07-20 18:30:09.852	2025-07-05 16:32:36.671	\N
337	1	200	122	2025-07-20 18:30:09.868	2025-07-05 16:32:36.682	\N
339	1	202	130.65	2025-07-20 18:30:09.901	2025-07-05 16:32:36.708	\N
341	34	202	11	2025-07-20 18:30:09.939	2025-07-05 16:32:36.727	\N
342	1	203	92	2025-07-20 18:30:10.049	2025-07-05 16:32:36.739	\N
347	34	204	6	2025-07-20 18:30:10.222	2025-07-05 16:32:36.786	\N
348	1	205	0	2025-07-20 18:30:10.24	2025-07-05 16:32:36.797	2025-07-05 16:32:36.797
354	1	207	244	2025-07-20 18:30:10.371	2025-07-05 16:32:36.856	\N
357	1	209	48.9	2025-07-20 18:30:10.407	2025-07-05 16:32:36.889	\N
368	1	215	3395	2025-07-20 18:29:57.735	2025-07-05 16:51:50.808	\N
370	1	216	0	2025-07-20 18:29:57.809	2025-07-05 16:51:50.823	2025-07-05 16:51:50.823
373	3	216	130	2025-07-20 18:29:58.033	2025-07-05 16:51:50.841	\N
375	1	218	2350	2025-07-20 18:29:58.07	2025-07-05 16:51:50.86	\N
376	2	218	406	2025-07-20 18:29:58.087	2025-07-05 16:51:50.866	\N
377	35	218	313	2025-07-20 18:29:58.105	2025-07-05 16:51:50.872	\N
378	1	219	1222.91	2025-07-20 18:29:58.145	2025-07-05 16:51:50.882	\N
381	3	219	41.5	2025-07-20 18:29:58.195	2025-07-05 16:51:50.899	\N
384	3	220	202	2025-07-20 18:29:58.25	2025-07-05 16:51:50.921	\N
389	1	223	1416	2025-07-20 18:29:58.375	2025-07-05 16:51:50.961	\N
274	1	166	491	2025-07-20 18:30:00.006	2025-07-05 16:32:33.326	\N
358	1	210	651	2025-07-20 18:29:57.548	2025-07-05 16:51:50.714	\N
392	1	225	48.66	2025-07-05 16:51:50.988	2025-07-05 16:51:50.987	\N
405	2	230	0	2025-07-05 16:51:51.083	2025-07-05 16:51:51.082	2025-07-05 16:51:51.082
407	1	232	6.94	2025-07-05 16:51:51.103	2025-07-05 16:51:51.102	\N
413	1	234	40	2025-07-05 16:51:51.143	2025-07-05 16:51:51.142	\N
414	3	234	40	2025-07-05 16:51:51.149	2025-07-05 16:51:51.148	\N
284	35	170	163	2025-07-20 18:30:00.326	2025-07-05 16:32:33.4	\N
469	3	254	8	2025-07-20 18:28:57.048	2025-07-20 18:28:57.047	\N
35	1	35	989	2025-07-20 18:29:49.409	2025-06-25 06:32:58.653	\N
91	1	60	427	2025-07-20 18:29:50.472	2025-07-05 11:17:57.481	\N
423	3	238	19.8	2025-07-20 18:28:41.792	2025-07-20 18:28:41.791	\N
429	2	242	20.35	2025-07-20 18:28:42.565	2025-07-20 18:28:42.564	\N
430	3	242	85	2025-07-20 18:28:42.622	2025-07-20 18:28:42.621	\N
431	1	243	7	2025-07-20 18:28:42.681	2025-07-20 18:28:42.68	\N
432	2	243	156.1	2025-07-20 18:28:42.704	2025-07-20 18:28:42.703	\N
441	3	248	61.2	2025-07-20 18:28:43.061	2025-07-20 18:28:43.06	\N
398	34	227	207	2025-07-20 18:29:58.556	2025-07-05 16:51:51.028	\N
397	2	227	269	2025-07-20 18:29:58.54	2025-07-05 16:51:51.022	\N
400	2	228	183	2025-07-20 18:29:58.632	2025-07-05 16:51:51.044	\N
402	2	229	160	2025-07-20 18:29:58.678	2025-07-05 16:51:51.06	\N
406	3	231	40	2025-07-20 18:29:58.733	2025-07-05 16:51:51.092	\N
408	2	232	26.5	2025-07-20 18:29:58.753	2025-07-05 16:51:51.107	\N
409	34	232	37	2025-07-20 18:29:58.77	2025-07-05 16:51:51.113	\N
412	3	233	23.5	2025-07-20 18:29:58.822	2025-07-05 16:51:51.133	\N
415	3	235	65	2025-07-20 18:29:58.848	2025-07-05 16:51:51.159	\N
416	3	236	10	2025-07-20 18:29:58.863	2025-07-05 16:51:51.17	\N
262	2	161	44	2025-07-20 18:29:59.637	2025-07-05 16:32:33.217	\N
471	2	255	15.2	2025-07-20 18:28:57.246	2025-07-20 18:28:57.245	\N
472	2	256	21	2025-07-20 18:28:57.279	2025-07-20 18:28:57.278	\N
394	2	226	99	2025-07-20 18:29:58.451	2025-07-05 16:51:51.002	\N
395	35	226	155	2025-07-20 18:29:58.474	2025-07-05 16:51:51.008	\N
396	1	227	2656	2025-07-20 18:29:58.522	2025-07-05 16:51:51.016	\N
399	3	227	77	2025-07-20 18:29:58.581	2025-07-05 16:51:51.035	\N
401	1	229	200	2025-07-20 18:29:58.659	2025-07-05 16:51:51.053	\N
403	34	229	40	2025-07-20 18:29:58.694	2025-07-05 16:51:51.066	\N
404	1	230	80	2025-07-20 18:29:58.71	2025-07-05 16:51:51.076	\N
410	3	232	19.24	2025-07-20 18:29:58.787	2025-07-05 16:51:51.119	\N
411	1	233	40	2025-07-20 18:29:58.804	2025-07-05 16:51:51.128	\N
417	1	237	8	2025-07-20 18:29:58.887	2025-07-05 16:51:51.18	\N
418	34	237	42	2025-07-20 18:29:58.974	2025-07-05 16:51:51.187	\N
238	2	151	319	2025-07-20 18:29:59.048	2025-07-05 16:32:33.035	\N
361	2	211	1000	2025-07-20 18:29:57.627	2025-07-05 16:51:50.747	\N
244	1	154	727	2025-07-20 18:29:59.24	2025-07-05 16:32:33.087	\N
70	3	49	791.5	2025-07-20 18:29:46.481	2025-07-05 11:17:56.65	\N
202	34	136	551	2025-07-20 18:29:46.782	2025-07-05 16:32:29.341	\N
223	3	144	40	2025-07-20 18:29:47.461	2025-07-05 16:32:29.542	\N
1	1	1	1119	2025-07-20 18:29:49.273	2025-06-12 18:20:07.811	\N
3	3	1	8589	2025-07-20 18:29:49.317	2025-06-12 18:20:07.835	\N
125	1	82	0	2025-07-20 18:29:51.358	2025-07-05 11:17:57.707	2025-07-05 11:17:57.707
424	1	239	214.2	2025-07-20 18:29:52.906	2025-07-20 18:28:41.829	\N
475	2	239	29	2025-07-20 18:29:52.933	2025-07-20 18:29:52.932	\N
426	1	240	224	2025-07-20 18:29:52.958	2025-07-20 18:28:41.898	\N
425	2	240	43	2025-07-20 18:29:52.977	2025-07-20 18:28:41.866	\N
427	1	241	122	2025-07-20 18:29:52.993	2025-07-20 18:28:41.939	\N
428	2	241	122	2025-07-20 18:29:53.019	2025-07-20 18:28:41.965	\N
433	3	243	76	2025-07-20 18:29:53.579	2025-07-20 18:28:42.728	\N
434	1	244	655	2025-07-20 18:29:53.61	2025-07-20 18:28:42.765	\N
437	1	245	73.5	2025-07-20 18:29:53.634	2025-07-20 18:28:42.878	\N
436	2	245	113	2025-07-20 18:29:53.652	2025-07-20 18:28:42.85	\N
438	1	246	51	2025-07-20 18:29:53.669	2025-07-20 18:28:42.921	\N
439	1	247	0	2025-07-20 18:29:53.684	2025-07-20 18:28:42.966	\N
440	3	247	46	2025-07-20 18:29:53.705	2025-07-20 18:28:43.022	\N
476	1	258	3	2025-07-20 18:29:53.74	2025-07-20 18:29:53.738	\N
138	3	94	10.5	2025-07-20 18:29:57.181	2025-07-05 11:17:59.45	\N
359	2	210	191	2025-07-20 18:29:57.566	2025-07-05 16:51:50.73	\N
379	2	219	1028	2025-07-20 18:29:58.163	2025-07-05 16:51:50.888	\N
393	3	225	45	2025-07-20 18:29:58.435	2025-07-05 16:51:50.992	\N
251	3	157	65	2025-07-20 18:29:59.431	2025-07-05 16:32:33.14	\N
267	2	163	103	2025-07-20 18:29:59.733	2025-07-05 16:32:33.275	\N
290	3	172	396	2025-07-20 18:30:00.479	2025-07-05 16:32:33.442	\N
157	1	111	587	2025-07-20 18:30:01.329	2025-07-05 11:17:59.834	\N
321	1	190	185	2025-07-20 18:30:02.466	2025-07-05 16:32:33.856	\N
326	2	193	157	2025-07-20 18:30:02.624	2025-07-05 16:32:33.922	\N
190	1	130	294.5	2025-07-20 18:30:09.561	2025-07-05 11:18:01.978	\N
464	1	251	0	2025-07-20 18:30:09.602	2025-07-20 18:28:56.11	\N
465	1	252	0	2025-07-20 18:30:09.623	2025-07-20 18:28:56.151	\N
468	1	253	183	2025-07-20 18:30:10.56	2025-07-20 18:28:56.99	\N
477	1	259	26	2025-07-20 18:30:10.623	2025-07-20 18:30:10.622	\N
478	3	259	39.96	2025-07-20 18:30:10.684	2025-07-20 18:30:10.683	\N
470	1	255	48.1	2025-07-20 18:30:10.875	2025-07-20 18:28:57.209	\N
479	3	260	15.1	2025-07-20 18:30:10.942	2025-07-20 18:30:10.941	\N
473	1	256	305	2025-07-20 18:30:11.045	2025-07-20 18:28:57.302	\N
474	1	257	285.3	2025-07-20 18:30:11.128	2025-07-20 18:28:57.407	\N
462	2	125	0	2025-07-20 18:30:12.454	2025-07-20 18:28:49.952	\N
463	3	250	0	2025-07-20 18:30:12.469	2025-07-20 18:28:55.964	\N
466	2	200	0	2025-07-20 18:30:12.481	2025-07-20 18:28:56.434	\N
467	2	207	0	2025-07-20 18:30:12.495	2025-07-20 18:28:56.821	\N
419	2	138	0	2025-07-20 18:30:12.506	2025-07-20 18:28:36.163	\N
420	2	146	0	2025-07-20 18:30:12.518	2025-07-20 18:28:36.852	\N
421	3	60	0	2025-07-20 18:30:12.534	2025-07-20 18:28:39.441	\N
422	2	70	0	2025-07-20 18:30:12.546	2025-07-20 18:28:39.856	\N
435	2	244	0	2025-07-20 18:30:12.559	2025-07-20 18:28:42.79	\N
442	2	148	0	2025-07-20 18:30:12.574	2025-07-20 18:28:46.568	\N
443	2	149	0	2025-07-20 18:30:12.586	2025-07-20 18:28:46.591	\N
444	2	150	0	2025-07-20 18:30:12.603	2025-07-20 18:28:46.631	\N
445	3	212	0	2025-07-20 18:30:12.618	2025-07-20 18:28:46.852	\N
446	3	223	0	2025-07-20 18:30:12.633	2025-07-20 18:28:47.171	\N
447	2	233	0	2025-07-20 18:30:12.65	2025-07-20 18:28:47.41	\N
448	1	235	0	2025-07-20 18:30:12.693	2025-07-20 18:28:47.463	\N
449	2	235	0	2025-07-20 18:30:12.707	2025-07-20 18:28:47.488	\N
450	1	159	0	2025-07-20 18:30:12.725	2025-07-20 18:28:47.802	\N
451	2	173	0	2025-07-20 18:30:12.776	2025-07-20 18:28:48.365	\N
452	1	175	0	2025-07-20 18:30:12.789	2025-07-20 18:28:48.541	\N
453	2	178	0	2025-07-20 18:30:12.802	2025-07-20 18:28:48.612	\N
454	3	182	0	2025-07-20 18:30:12.814	2025-07-20 18:28:48.851	\N
455	2	185	0	2025-07-20 18:30:12.827	2025-07-20 18:28:49.212	\N
456	3	249	0	2025-07-20 18:30:12.839	2025-07-20 18:28:49.426	\N
457	2	121	0	2025-07-20 18:30:12.852	2025-07-20 18:28:49.454	\N
458	3	189	0	2025-07-20 18:30:12.865	2025-07-20 18:28:49.588	\N
459	2	122	0	2025-07-20 18:30:12.88	2025-07-20 18:28:49.614	\N
460	3	191	0	2025-07-20 18:30:12.892	2025-07-20 18:28:49.662	\N
461	2	123	0	2025-07-20 18:30:12.903	2025-07-20 18:28:49.741	\N
\.


--
-- Data for Name: WholesalePrice; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."WholesalePrice" ("Id", "MinQuantity", "MaxQuantity", "PriceId", "CreatedAt", "DeletedAt") FROM stdin;
1	20	300	13	2025-07-05 17:11:42.641	2025-07-06 16:00:51.61
2	1	400	15	2025-07-06 16:01:09.698	\N
3	5	10	42	2025-07-19 14:41:46.451	\N
\.


--
-- Data for Name: _DealerSales; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."_DealerSales" ("A", "B") FROM stdin;
1	4
1	5
\.


--
-- Data for Name: _ProductToProductCategory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."_ProductToProductCategory" ("A", "B") FROM stdin;
1	2
14	7
25	10
8	2
9	2
12	2
36	2
33	11
32	11
31	11
24	1
23	10
27	10
22	9
21	9
18	1
17	8
15	15
13	2
10	2
7	1
28	10
38	15
16	14
39	7
37	15
19	15
20	15
40	8
42	8
41	8
11	2
26	9
29	10
35	15
30	10
43	8
34	13
44	6
46	16
47	16
48	17
49	17
50	17
51	17
52	17
53	17
54	19
55	19
56	19
57	20
58	20
59	21
60	21
61	21
62	21
63	21
64	21
65	22
66	22
67	22
68	23
69	23
70	23
71	24
72	24
73	24
74	24
75	24
76	24
77	24
78	25
79	26
80	26
81	27
82	27
83	27
84	27
85	28
86	29
45	16
87	31
88	31
89	31
90	31
91	31
92	31
93	31
94	31
95	31
96	31
97	31
98	31
99	32
100	32
101	32
102	32
103	32
104	32
105	32
106	33
107	33
108	33
109	33
110	33
111	34
112	34
113	34
114	34
115	34
116	34
117	34
118	34
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
22e2060a-7a08-4e03-b766-082634074967	f3941ca6ea98bf4d6e5b85751af772ed3248e867e8a5c958a7b617acc5d9f52b	2025-06-10 10:43:34.238673+00	20250610095742_admin	\N	\N	2025-06-10 10:43:33.961309+00	1
19c7b5e7-1383-4a47-a191-31047126d723	cff2d80a5b2df30937f07adb80ea3c31274fa069fb0d4c9cf1131a2d0825dc8a	2025-06-10 10:43:38.307695+00	20250610104338_user	\N	\N	2025-06-10 10:43:38.295332+00	1
6ed0c440-30ed-4f2e-9cb5-c2955e6fd5c2	7ae380d03beed2110e804eaedc57a4a6d56a956f914715392e5bffbb3ecea552	2025-06-16 11:03:49.329538+00	20250616110349_karakter_admin_user_dealer	\N	\N	2025-06-16 11:03:49.280473+00	1
1c902805-a94b-4da9-a145-84de66890ce4	5a62ee96e6c9332c33db954a56a4dd892c369c063bcc8996b7d99d067da266ed	2025-06-18 16:04:58.197244+00	20250618160458_role_alter_character_limit	\N	\N	2025-06-18 16:04:58.163938+00	1
06e97c71-29dd-4f9d-af4a-a13a1c517181	c4a0dc3d44921f42df411e3c75b36d3e49e25265259936090d40c05f500fb1b3	2025-06-19 16:19:31.742876+00	20250619161931_token_issue	\N	\N	2025-06-19 16:19:31.73876+00	1
636877b1-7843-48bf-b170-9479a9b3b9f2	0a43416385d2413398062935dfffd492325ff01b305f7278fc7888abd2aed755	2025-06-19 16:25:05.990295+00	20250619162505_token_issue	\N	\N	2025-06-19 16:25:05.986341+00	1
f6480245-8765-44a0-b13c-7498a94680a0	a6b5534b0406972afc8c5302861e4c45ff8143ad570f895565b7f27acea32e53	2025-07-02 08:54:00.686752+00	20250702085400_device_log	\N	\N	2025-07-02 08:54:00.679947+00	1
f1029229-ad99-4739-adbd-387b0418b1b1	37a0d53b3a54da891006362ca4a987826d6062112e12fe61355376f599aed56e	2025-07-02 09:25:10.865211+00	20250702092510_add_useragent_to_adminsession	\N	\N	2025-07-02 09:25:10.853897+00	1
17237da0-8c39-4495-b5d3-9140ac8f49c7	3b4b2f2d2b3353ac208414d4b8649541f2938767607d575e5c76e334442ce823	2025-07-17 09:04:05.615252+00	20250715180027_float_salesorderdetail	\N	\N	2025-07-17 09:04:05.374454+00	1
a0118b9b-2760-409f-ab35-ff68dc920f4e	74c12ae99b264f7d65d53d9d57fd1135a300e9d66991f25c2cedcc6cd1945b74	2025-07-17 09:04:05.731411+00	20250715194626_float_cartitem	\N	\N	2025-07-17 09:04:05.626444+00	1
c1e054b4-f04c-4a23-a8fc-352b9653548b	4535e2a1cd1f42cb98adbed9687caefdd64117866ea16d016c9ba8f172fe2eb8	2025-07-17 09:04:05.865809+00	20250716161037_admin_notification	\N	\N	2025-07-17 09:04:05.738948+00	1
c51af414-5a2f-42cc-b192-c13d1d960dd2	3b84fb1684c68b0caf840999665ddecc88a07aae986bba22b32926e2c1f7b6f4	2025-07-17 09:04:05.891793+00	20250716162805_emailtemplatetype	\N	\N	2025-07-17 09:04:05.873444+00	1
9ceb5b66-535f-4ac1-abb6-9e3f6cc15afc	2b16a88a9082eb9aa929106b80a08aaface480d4cf0e77a862771198d0f53281	2025-07-17 09:04:05.921874+00	20250717035600_sales_order	\N	\N	2025-07-17 09:04:05.902466+00	1
acd64673-b1fc-4fdb-9c35-0bd722c2531f	192d4945f94d6ac55c33a96c2620dd2b7312591b5fce43d492befbce0c45fea1	2025-07-17 09:04:05.984481+00	20250717064035_product_specification	\N	\N	2025-07-17 09:04:05.930763+00	1
\.


--
-- Name: AdminForgotPasswordRequest_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminForgotPasswordRequest_Id_seq"', 2, true);


--
-- Name: AdminNotification_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminNotification_Id_seq"', 65, true);


--
-- Name: AdminRole_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminRole_Id_seq"', 7, true);


--
-- Name: AdminSession_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminSession_Id_seq"', 115, true);


--
-- Name: Admin_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Admin_Id_seq"', 6, true);


--
-- Name: CartItem_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."CartItem_Id_seq"', 35, true);


--
-- Name: Cart_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Cart_Id_seq"', 25, true);


--
-- Name: DealerWarehouse_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."DealerWarehouse_Id_seq"', 4, true);


--
-- Name: Dealer_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Dealer_Id_seq"', 3, true);


--
-- Name: EmailConfig_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailConfig_Id_seq"', 398, true);


--
-- Name: EmailSalesOrderRecipient_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailSalesOrderRecipient_Id_seq"', 2, true);


--
-- Name: EmailSalesOrder_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailSalesOrder_Id_seq"', 134, true);


--
-- Name: EmailTemplate_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailTemplate_Id_seq"', 4, true);


--
-- Name: EventImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EventImage_id_seq"', 1, false);


--
-- Name: Event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Event_id_seq"', 1, false);


--
-- Name: ItemCodeImage_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ItemCodeImage_Id_seq"', 1, false);


--
-- Name: ItemCode_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ItemCode_Id_seq"', 260, true);


--
-- Name: MenuFeature_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."MenuFeature_Id_seq"', 31, true);


--
-- Name: Menu_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Menu_Id_seq"', 13, true);


--
-- Name: PartNumber_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."PartNumber_Id_seq"', 795, true);


--
-- Name: PriceCategory_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."PriceCategory_Id_seq"', 4, true);


--
-- Name: PriceHistory_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."PriceHistory_Id_seq"', 1, false);


--
-- Name: Price_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Price_Id_seq"', 42, true);


--
-- Name: ProductBrand_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductBrand_Id_seq"', 1, false);


--
-- Name: ProductCategoryImage_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductCategoryImage_Id_seq"', 8, true);


--
-- Name: ProductCategory_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductCategory_Id_seq"', 37, true);


--
-- Name: ProductImage_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductImage_Id_seq"', 7, true);


--
-- Name: ProductSpecificationFile_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductSpecificationFile_Id_seq"', 11, true);


--
-- Name: Product_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Product_Id_seq"', 118, true);


--
-- Name: RoleMenuAccess_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."RoleMenuAccess_Id_seq"', 52, true);


--
-- Name: RoleMenuFeatureAccess_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."RoleMenuFeatureAccess_Id_seq"', 124, true);


--
-- Name: SalesOrderDetail_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."SalesOrderDetail_Id_seq"', 217, true);


--
-- Name: SalesOrderFile_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."SalesOrderFile_Id_seq"', 10, true);


--
-- Name: SalesOrder_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."SalesOrder_Id_seq"', 23, true);


--
-- Name: Sales_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Sales_Id_seq"', 6, true);


--
-- Name: StockHistoryExcelUploadLog_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."StockHistoryExcelUploadLog_Id_seq"', 34, true);


--
-- Name: StockHistory_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."StockHistory_Id_seq"', 2030, true);


--
-- Name: Tax_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Tax_Id_seq"', 13, true);


--
-- Name: UserForgotPasswordRequest_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."UserForgotPasswordRequest_Id_seq"', 1, false);


--
-- Name: UserSession_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."UserSession_Id_seq"', 38, true);


--
-- Name: User_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."User_Id_seq"', 10, true);


--
-- Name: WarehouseStock_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."WarehouseStock_Id_seq"', 479, true);


--
-- Name: Warehouse_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Warehouse_Id_seq"', 35, true);


--
-- Name: WholesalePrice_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."WholesalePrice_Id_seq"', 3, true);


--
-- Name: AdminForgotPasswordRequest AdminForgotPasswordRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminForgotPasswordRequest"
    ADD CONSTRAINT "AdminForgotPasswordRequest_pkey" PRIMARY KEY ("Id");


--
-- Name: AdminNotification AdminNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminNotification"
    ADD CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("Id");


--
-- Name: AdminRole AdminRole_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminRole"
    ADD CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("Id");


--
-- Name: AdminSession AdminSession_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminSession"
    ADD CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("Id");


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("Id");


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY ("Id");


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY ("Id");


--
-- Name: DealerWarehouse DealerWarehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."DealerWarehouse"
    ADD CONSTRAINT "DealerWarehouse_pkey" PRIMARY KEY ("Id");


--
-- Name: Dealer Dealer_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_pkey" PRIMARY KEY ("Id");


--
-- Name: EmailConfig EmailConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailConfig"
    ADD CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("Id");


--
-- Name: EmailSalesOrderRecipient EmailSalesOrderRecipient_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrderRecipient"
    ADD CONSTRAINT "EmailSalesOrderRecipient_pkey" PRIMARY KEY ("Id");


--
-- Name: EmailSalesOrder EmailSalesOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrder"
    ADD CONSTRAINT "EmailSalesOrder_pkey" PRIMARY KEY ("Id");


--
-- Name: EmailTemplate EmailTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("Id");


--
-- Name: EventImage EventImage_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EventImage"
    ADD CONSTRAINT "EventImage_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: ItemCodeImage ItemCodeImage_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCodeImage"
    ADD CONSTRAINT "ItemCodeImage_pkey" PRIMARY KEY ("Id");


--
-- Name: ItemCode ItemCode_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCode"
    ADD CONSTRAINT "ItemCode_pkey" PRIMARY KEY ("Id");


--
-- Name: MenuFeature MenuFeature_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."MenuFeature"
    ADD CONSTRAINT "MenuFeature_pkey" PRIMARY KEY ("Id");


--
-- Name: Menu Menu_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Menu"
    ADD CONSTRAINT "Menu_pkey" PRIMARY KEY ("Id");


--
-- Name: PartNumber PartNumber_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PartNumber"
    ADD CONSTRAINT "PartNumber_pkey" PRIMARY KEY ("Id");


--
-- Name: PriceCategory PriceCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PriceCategory"
    ADD CONSTRAINT "PriceCategory_pkey" PRIMARY KEY ("Id");


--
-- Name: PriceHistory PriceHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PriceHistory"
    ADD CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("Id");


--
-- Name: Price Price_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Price"
    ADD CONSTRAINT "Price_pkey" PRIMARY KEY ("Id");


--
-- Name: ProductBrand ProductBrand_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductBrand"
    ADD CONSTRAINT "ProductBrand_pkey" PRIMARY KEY ("Id");


--
-- Name: ProductCategoryImage ProductCategoryImage_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductCategoryImage"
    ADD CONSTRAINT "ProductCategoryImage_pkey" PRIMARY KEY ("Id");


--
-- Name: ProductCategory ProductCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("Id");


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("Id");


--
-- Name: ProductSpecificationFile ProductSpecificationFile_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductSpecificationFile"
    ADD CONSTRAINT "ProductSpecificationFile_pkey" PRIMARY KEY ("Id");


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("Id");


--
-- Name: RoleMenuAccess RoleMenuAccess_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuAccess"
    ADD CONSTRAINT "RoleMenuAccess_pkey" PRIMARY KEY ("Id");


--
-- Name: RoleMenuFeatureAccess RoleMenuFeatureAccess_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuFeatureAccess"
    ADD CONSTRAINT "RoleMenuFeatureAccess_pkey" PRIMARY KEY ("Id");


--
-- Name: SalesOrderDetail SalesOrderDetail_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail"
    ADD CONSTRAINT "SalesOrderDetail_pkey" PRIMARY KEY ("Id");


--
-- Name: SalesOrderFile SalesOrderFile_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderFile"
    ADD CONSTRAINT "SalesOrderFile_pkey" PRIMARY KEY ("Id");


--
-- Name: SalesOrder SalesOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("Id");


--
-- Name: Sales Sales_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Sales"
    ADD CONSTRAINT "Sales_pkey" PRIMARY KEY ("Id");


--
-- Name: StockHistoryExcelUploadLog StockHistoryExcelUploadLog_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistoryExcelUploadLog"
    ADD CONSTRAINT "StockHistoryExcelUploadLog_pkey" PRIMARY KEY ("Id");


--
-- Name: StockHistory StockHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("Id");


--
-- Name: Tax Tax_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Tax"
    ADD CONSTRAINT "Tax_pkey" PRIMARY KEY ("Id");


--
-- Name: UserForgotPasswordRequest UserForgotPasswordRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserForgotPasswordRequest"
    ADD CONSTRAINT "UserForgotPasswordRequest_pkey" PRIMARY KEY ("Id");


--
-- Name: UserSession UserSession_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_pkey" PRIMARY KEY ("Id");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("Id");


--
-- Name: WarehouseStock WarehouseStock_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WarehouseStock"
    ADD CONSTRAINT "WarehouseStock_pkey" PRIMARY KEY ("Id");


--
-- Name: Warehouse Warehouse_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Warehouse"
    ADD CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("Id");


--
-- Name: WholesalePrice WholesalePrice_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WholesalePrice"
    ADD CONSTRAINT "WholesalePrice_pkey" PRIMARY KEY ("Id");


--
-- Name: _DealerSales _DealerSales_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."_DealerSales"
    ADD CONSTRAINT "_DealerSales_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _ProductToProductCategory _ProductToProductCategory_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."_ProductToProductCategory"
    ADD CONSTRAINT "_ProductToProductCategory_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AdminForgotPasswordRequest_Token_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "AdminForgotPasswordRequest_Token_key" ON public."AdminForgotPasswordRequest" USING btree ("Token");


--
-- Name: Admin_Id_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "Admin_Id_key" ON public."Admin" USING btree ("Id");


--
-- Name: Cart_UserId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "Cart_UserId_key" ON public."Cart" USING btree ("UserId");


--
-- Name: DealerWarehouse_DealerId_WarehouseId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "DealerWarehouse_DealerId_WarehouseId_key" ON public."DealerWarehouse" USING btree ("DealerId", "WarehouseId");


--
-- Name: EmailConfig_Email_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "EmailConfig_Email_key" ON public."EmailConfig" USING btree ("Email");


--
-- Name: MenuFeature_MenuId_Feature_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "MenuFeature_MenuId_Feature_key" ON public."MenuFeature" USING btree ("MenuId", "Feature");


--
-- Name: RoleMenuAccess_RoleId_MenuId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "RoleMenuAccess_RoleId_MenuId_key" ON public."RoleMenuAccess" USING btree ("RoleId", "MenuId");


--
-- Name: RoleMenuFeatureAccess_RoleId_MenuFeatureId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "RoleMenuFeatureAccess_RoleId_MenuFeatureId_key" ON public."RoleMenuFeatureAccess" USING btree ("RoleId", "MenuFeatureId");


--
-- Name: SalesOrderFile_SalesOrderId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "SalesOrderFile_SalesOrderId_key" ON public."SalesOrderFile" USING btree ("SalesOrderId");


--
-- Name: Sales_AdminId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "Sales_AdminId_key" ON public."Sales" USING btree ("AdminId");


--
-- Name: UserForgotPasswordRequest_Token_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "UserForgotPasswordRequest_Token_key" ON public."UserForgotPasswordRequest" USING btree ("Token");


--
-- Name: WarehouseStock_WarehouseId_ItemCodeId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "WarehouseStock_WarehouseId_ItemCodeId_key" ON public."WarehouseStock" USING btree ("WarehouseId", "ItemCodeId");


--
-- Name: _DealerSales_B_index; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE INDEX "_DealerSales_B_index" ON public."_DealerSales" USING btree ("B");


--
-- Name: _ProductToProductCategory_B_index; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE INDEX "_ProductToProductCategory_B_index" ON public."_ProductToProductCategory" USING btree ("B");


--
-- Name: AdminForgotPasswordRequest AdminForgotPasswordRequest_AdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminForgotPasswordRequest"
    ADD CONSTRAINT "AdminForgotPasswordRequest_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES public."Admin"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AdminForgotPasswordRequest AdminForgotPasswordRequest_EmailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminForgotPasswordRequest"
    ADD CONSTRAINT "AdminForgotPasswordRequest_EmailTemplateId_fkey" FOREIGN KEY ("EmailTemplateId") REFERENCES public."EmailTemplate"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AdminNotification AdminNotification_AdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminNotification"
    ADD CONSTRAINT "AdminNotification_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES public."Admin"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AdminNotification AdminNotification_SalesOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminNotification"
    ADD CONSTRAINT "AdminNotification_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES public."SalesOrder"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AdminSession AdminSession_AdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminSession"
    ADD CONSTRAINT "AdminSession_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES public."Admin"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Admin Admin_RoleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES public."AdminRole"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_CartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_CartId_fkey" FOREIGN KEY ("CartId") REFERENCES public."Cart"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DealerWarehouse DealerWarehouse_DealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."DealerWarehouse"
    ADD CONSTRAINT "DealerWarehouse_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES public."Dealer"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DealerWarehouse DealerWarehouse_WarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."DealerWarehouse"
    ADD CONSTRAINT "DealerWarehouse_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES public."Warehouse"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Dealer Dealer_PriceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_PriceCategoryId_fkey" FOREIGN KEY ("PriceCategoryId") REFERENCES public."PriceCategory"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailSalesOrderRecipient EmailSalesOrderRecipient_SalesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrderRecipient"
    ADD CONSTRAINT "EmailSalesOrderRecipient_SalesId_fkey" FOREIGN KEY ("SalesId") REFERENCES public."Sales"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailSalesOrder EmailSalesOrder_EmailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrder"
    ADD CONSTRAINT "EmailSalesOrder_EmailTemplateId_fkey" FOREIGN KEY ("EmailTemplateId") REFERENCES public."EmailTemplate"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailSalesOrder EmailSalesOrder_SalesOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EmailSalesOrder"
    ADD CONSTRAINT "EmailSalesOrder_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES public."SalesOrder"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EventImage EventImage_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."EventImage"
    ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ItemCodeImage ItemCodeImage_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCodeImage"
    ADD CONSTRAINT "ItemCodeImage_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ItemCode ItemCode_BrandCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCode"
    ADD CONSTRAINT "ItemCode_BrandCodeId_fkey" FOREIGN KEY ("BrandCodeId") REFERENCES public."ProductBrand"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ItemCode ItemCode_PartNumberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ItemCode"
    ADD CONSTRAINT "ItemCode_PartNumberId_fkey" FOREIGN KEY ("PartNumberId") REFERENCES public."PartNumber"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MenuFeature MenuFeature_MenuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."MenuFeature"
    ADD CONSTRAINT "MenuFeature_MenuId_fkey" FOREIGN KEY ("MenuId") REFERENCES public."Menu"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PartNumber PartNumber_ProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PartNumber"
    ADD CONSTRAINT "PartNumber_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES public."Product"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PriceHistory PriceHistory_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."PriceHistory"
    ADD CONSTRAINT "PriceHistory_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Price Price_DealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Price"
    ADD CONSTRAINT "Price_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES public."Dealer"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Price Price_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Price"
    ADD CONSTRAINT "Price_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Price Price_PriceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Price"
    ADD CONSTRAINT "Price_PriceCategoryId_fkey" FOREIGN KEY ("PriceCategoryId") REFERENCES public."PriceCategory"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductCategoryImage ProductCategoryImage_ProductCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductCategoryImage"
    ADD CONSTRAINT "ProductCategoryImage_ProductCategoryId_fkey" FOREIGN KEY ("ProductCategoryId") REFERENCES public."ProductCategory"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductCategory ProductCategory_ParentCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductCategory"
    ADD CONSTRAINT "ProductCategory_ParentCategoryId_fkey" FOREIGN KEY ("ParentCategoryId") REFERENCES public."ProductCategory"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductImage ProductImage_ProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES public."Product"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProductSpecificationFile ProductSpecificationFile_ProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."ProductSpecificationFile"
    ADD CONSTRAINT "ProductSpecificationFile_ProductId_fkey" FOREIGN KEY ("ProductId") REFERENCES public."Product"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoleMenuAccess RoleMenuAccess_MenuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuAccess"
    ADD CONSTRAINT "RoleMenuAccess_MenuId_fkey" FOREIGN KEY ("MenuId") REFERENCES public."Menu"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoleMenuAccess RoleMenuAccess_RoleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuAccess"
    ADD CONSTRAINT "RoleMenuAccess_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES public."AdminRole"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoleMenuFeatureAccess RoleMenuFeatureAccess_MenuFeatureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuFeatureAccess"
    ADD CONSTRAINT "RoleMenuFeatureAccess_MenuFeatureId_fkey" FOREIGN KEY ("MenuFeatureId") REFERENCES public."MenuFeature"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RoleMenuFeatureAccess RoleMenuFeatureAccess_RoleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuFeatureAccess"
    ADD CONSTRAINT "RoleMenuFeatureAccess_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES public."AdminRole"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrderDetail SalesOrderDetail_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail"
    ADD CONSTRAINT "SalesOrderDetail_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrderDetail SalesOrderDetail_PriceCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail"
    ADD CONSTRAINT "SalesOrderDetail_PriceCategoryId_fkey" FOREIGN KEY ("PriceCategoryId") REFERENCES public."PriceCategory"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesOrderDetail SalesOrderDetail_SalesOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail"
    ADD CONSTRAINT "SalesOrderDetail_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES public."SalesOrder"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrderDetail SalesOrderDetail_TaxId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail"
    ADD CONSTRAINT "SalesOrderDetail_TaxId_fkey" FOREIGN KEY ("TaxId") REFERENCES public."Tax"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesOrderDetail SalesOrderDetail_WarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderDetail"
    ADD CONSTRAINT "SalesOrderDetail_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES public."Warehouse"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SalesOrderFile SalesOrderFile_SalesOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrderFile"
    ADD CONSTRAINT "SalesOrderFile_SalesOrderId_fkey" FOREIGN KEY ("SalesOrderId") REFERENCES public."SalesOrder"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrder SalesOrder_DealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES public."Dealer"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrder SalesOrder_SalesId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_SalesId_fkey" FOREIGN KEY ("SalesId") REFERENCES public."Sales"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SalesOrder SalesOrder_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."SalesOrder"
    ADD CONSTRAINT "SalesOrder_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sales Sales_AdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."Sales"
    ADD CONSTRAINT "Sales_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES public."Admin"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockHistory StockHistory_AdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_AdminId_fkey" FOREIGN KEY ("AdminId") REFERENCES public."Admin"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockHistory StockHistory_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockHistory StockHistory_UploadLogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_UploadLogId_fkey" FOREIGN KEY ("UploadLogId") REFERENCES public."StockHistoryExcelUploadLog"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockHistory StockHistory_WarehouseStockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."StockHistory"
    ADD CONSTRAINT "StockHistory_WarehouseStockId_fkey" FOREIGN KEY ("WarehouseStockId") REFERENCES public."WarehouseStock"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserForgotPasswordRequest UserForgotPasswordRequest_EmailTemplateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserForgotPasswordRequest"
    ADD CONSTRAINT "UserForgotPasswordRequest_EmailTemplateId_fkey" FOREIGN KEY ("EmailTemplateId") REFERENCES public."EmailTemplate"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserForgotPasswordRequest UserForgotPasswordRequest_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserForgotPasswordRequest"
    ADD CONSTRAINT "UserForgotPasswordRequest_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserSession UserSession_UserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."UserSession"
    ADD CONSTRAINT "UserSession_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES public."User"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_DealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_DealerId_fkey" FOREIGN KEY ("DealerId") REFERENCES public."Dealer"("Id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WarehouseStock WarehouseStock_ItemCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WarehouseStock"
    ADD CONSTRAINT "WarehouseStock_ItemCodeId_fkey" FOREIGN KEY ("ItemCodeId") REFERENCES public."ItemCode"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WarehouseStock WarehouseStock_WarehouseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WarehouseStock"
    ADD CONSTRAINT "WarehouseStock_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES public."Warehouse"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WholesalePrice WholesalePrice_PriceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."WholesalePrice"
    ADD CONSTRAINT "WholesalePrice_PriceId_fkey" FOREIGN KEY ("PriceId") REFERENCES public."Price"("Id") ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: _DealerSales _DealerSales_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."_DealerSales"
    ADD CONSTRAINT "_DealerSales_A_fkey" FOREIGN KEY ("A") REFERENCES public."Dealer"("Id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _DealerSales _DealerSales_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."_DealerSales"
    ADD CONSTRAINT "_DealerSales_B_fkey" FOREIGN KEY ("B") REFERENCES public."Sales"("Id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToProductCategory _ProductToProductCategory_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."_ProductToProductCategory"
    ADD CONSTRAINT "_ProductToProductCategory_A_fkey" FOREIGN KEY ("A") REFERENCES public."Product"("Id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToProductCategory _ProductToProductCategory_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."_ProductToProductCategory"
    ADD CONSTRAINT "_ProductToProductCategory_B_fkey" FOREIGN KEY ("B") REFERENCES public."ProductCategory"("Id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: shobuki
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

