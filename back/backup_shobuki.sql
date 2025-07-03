--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 17.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
    'READ',
    'WRITE',
    'FULL'
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
    'FORGOT_PASSWORD_ADMIN'
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
    "Address" text,
    "Birthdate" timestamp(3) without time zone,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Email" text NOT NULL,
    "Gender" text,
    "Id" integer NOT NULL,
    "Image" text,
    "Name" text,
    "Password" text NOT NULL,
    "PhoneNumber" text,
    "RoleId" integer NOT NULL,
    "Token" text,
    "Username" text NOT NULL
);


ALTER TABLE public."Admin" OWNER TO shobuki;

--
-- Name: AdminForgotPasswordRequest; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."AdminForgotPasswordRequest" (
    "Id" integer NOT NULL,
    "AdminId" integer NOT NULL,
    "Token" text NOT NULL,
    "IsUsed" boolean DEFAULT false NOT NULL,
    "ExpiresAt" timestamp(3) without time zone NOT NULL,
    "SenderEmail" text,
    "Status" public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "ErrorMessage" text,
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
-- Name: AdminRole; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."AdminRole" (
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "Description" text
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
    "AdminId" integer NOT NULL,
    "Id" integer NOT NULL,
    "LoginTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LogoutTime" timestamp(3) without time zone
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
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL
);


ALTER TABLE public."Cart" OWNER TO shobuki;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."CartItem" (
    "CartId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Id" integer NOT NULL,
    "Quantity" integer NOT NULL,
    "ItemCodeId" integer NOT NULL
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
    "CompanyName" text NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "Id" integer NOT NULL,
    "Region" text,
    "DeletedAt" timestamp(3) without time zone,
    "PriceCategoryId" integer,
    "Address" text,
    "PhoneNumber" text,
    fax text,
    "StoreCode" text NOT NULL
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
    "RecipientEmail" text NOT NULL,
    "Subject" text NOT NULL,
    "Body" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "UpdatedAt" timestamp(3) without time zone,
    "ApprovedAt" timestamp(3) without time zone,
    "Status" public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "SenderEmail" text,
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
    "UpdatedAt" timestamp(3) without time zone,
    "DeletedAt" timestamp(3) without time zone,
    "TemplateType" public."EmailTemplateType"
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
    "PartNumberId" integer,
    "AllowItemCodeSelection" boolean DEFAULT false NOT NULL,
    "MinOrderQuantity" integer,
    "OrderStep" integer,
    "QtyPO" double precision
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
    "Name" text NOT NULL,
    "Path" text NOT NULL,
    "Description" text,
    "Feature" text
);


ALTER TABLE public."Menu" OWNER TO shobuki;

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
    "Dash" integer,
    "InnerDiameter" double precision,
    "OuterDiameter" double precision,
    "WorkingPressure" double precision,
    "BurstingPressure" double precision,
    "BendingRadius" double precision,
    "HoseWeight" double precision,
    "ProductId" integer,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Description" text
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
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DealerId" integer,
    "DeletedAt" timestamp(3) without time zone,
    "Id" integer NOT NULL,
    "Price" double precision NOT NULL,
    "PriceCategoryId" integer,
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
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Description" text,
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
    "CodeName" text
);


ALTER TABLE public."Product" OWNER TO shobuki;

--
-- Name: ProductBrand; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."ProductBrand" (
    "ProductBrandName" text,
    "Id" integer NOT NULL,
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
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Id" integer NOT NULL,
    "Name" text NOT NULL,
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
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Id" integer NOT NULL,
    "Image" text,
    "ProductId" integer NOT NULL
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
    "Access" public."AccessLevel" DEFAULT 'READ'::public."AccessLevel" NOT NULL
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
    "DealerId" integer NOT NULL,
    "UserId" integer NOT NULL,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "TransactionToken" text NOT NULL,
    "Note" text,
    "CustomerPoNumber" text,
    "DeliveryOrderNumber" text,
    "FOB" text,
    "JdeSalesOrderNumber" text,
    "PaymentTerm" integer,
    "SalesId" integer NOT NULL,
    "SalesOrderNumber" text,
    "Status" public."SalesOrderStatus" DEFAULT 'PENDING_APPROVAL'::public."SalesOrderStatus" NOT NULL
);


ALTER TABLE public."SalesOrder" OWNER TO shobuki;

--
-- Name: SalesOrderDetail; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."SalesOrderDetail" (
    "Id" integer NOT NULL,
    "Quantity" integer NOT NULL,
    "Price" double precision NOT NULL,
    "PriceCategoryId" integer,
    "ItemCodeId" integer NOT NULL,
    "SalesOrderId" integer NOT NULL,
    "FinalPrice" double precision NOT NULL,
    "WarehouseId" integer,
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
    "Address" text,
    "Birthdate" timestamp(3) without time zone,
    "Country" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "Email" text NOT NULL,
    "Gender" text,
    "Id" integer NOT NULL,
    "Image" text,
    "Name" text,
    "Password" text NOT NULL,
    "PhoneNumber" text,
    "Province" text,
    "Token" text,
    "Username" text NOT NULL,
    "DealerId" integer
);


ALTER TABLE public."User" OWNER TO shobuki;

--
-- Name: UserForgotPasswordRequest; Type: TABLE; Schema: public; Owner: shobuki
--

CREATE TABLE public."UserForgotPasswordRequest" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "Token" text NOT NULL,
    "IsUsed" boolean DEFAULT false NOT NULL,
    "ExpiresAt" timestamp(3) without time zone NOT NULL,
    "SenderEmail" text,
    "Status" public."EmailStatus" DEFAULT 'PENDING'::public."EmailStatus" NOT NULL,
    "ErrorMessage" text,
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
    "LoginTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "LogoutTime" timestamp(3) without time zone,
    "Token" text,
    "UserId" integer NOT NULL
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
    "Location" text,
    "CreatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "DeletedAt" timestamp(3) without time zone,
    "BusinessUnit" text NOT NULL
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
-- Name: RoleMenuAccess Id; Type: DEFAULT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."RoleMenuAccess" ALTER COLUMN "Id" SET DEFAULT nextval('public."RoleMenuAccess_Id_seq"'::regclass);


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

COPY public."Admin" ("Address", "Birthdate", "CreatedAt", "DeletedAt", "Email", "Gender", "Id", "Image", "Name", "Password", "PhoneNumber", "RoleId", "Token", "Username") FROM stdin;
123 Sales Street	1990-01-01 00:00:00	2025-04-30 12:01:09.414	\N	superadmin@gmail.com	Male	2	2.jpg	Sales Admin	$2b$10$wLNS3Wf/rE/9zd..vZvUSOsSqgfFjlB89.o87l/NCXbcZpn.0WYSi	123456789	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbklkIjoyLCJSb2xlIjoic3VwZXJhZG1pbiIsIlNhbGVzSWQiOjEsImlhdCI6MTc0ODEwMTU0OSwiZXhwIjoxNzQ4MTM3NTQ5fQ.xN_hBwB90VHyXptGt2XAWx6cgPwnHziPUWfy2zOPmcc	superadmin
	2025-05-07 00:00:00	2025-05-07 04:00:52.942	\N	hendra@gmail.com	Male	3	\N	hendra	$2b$10$mc55V8i4bbcKbtug7F5zH.eCKrTgR.76kxzFERGujbBmuCwzGWNTm		1	\N	hendra
Pademangan 1 Gang 15 No 1\n	2025-05-20 00:00:00	2025-05-20 09:17:14.132	\N	minato6175@gmail.com	Male	4	\N	alfredo dagonza	$2b$10$dQx6Ftx4fSOhkfpLbrDfSOqq/.sU0NLk.OvYqY5w33fF7bg/B8XUm	089685352740	1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbklkIjo0LCJSb2xlIjoic3VwZXJhZG1pbiIsIlNhbGVzSWQiOjQsImlhdCI6MTc0NzczMzI2NywiZXhwIjoxNzQ3NzY5MjY3fQ.g-akY2F30e3NGX7F9nUWVh0oLgAnm-wsDg12_8LU8Xs	alfredo
\.


--
-- Data for Name: AdminForgotPasswordRequest; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminForgotPasswordRequest" ("Id", "AdminId", "Token", "IsUsed", "ExpiresAt", "SenderEmail", "Status", "ErrorMessage", "CreatedAt", "EmailTemplateId") FROM stdin;
\.


--
-- Data for Name: AdminRole; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminRole" ("Id", "Name", "Description") FROM stdin;
1	superadmin	....
\.


--
-- Data for Name: AdminSession; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."AdminSession" ("AdminId", "Id", "LoginTime", "LogoutTime") FROM stdin;
2	1	2025-04-30 12:01:15.155	2025-05-07 03:50:45.866
2	2	2025-04-30 16:57:54.807	2025-05-07 03:50:45.866
2	3	2025-05-01 06:53:31.588	2025-05-07 03:50:45.866
2	4	2025-05-01 18:26:14.552	2025-05-07 03:50:45.866
2	5	2025-05-02 07:05:11.171	2025-05-07 03:50:45.866
2	6	2025-05-02 10:37:24.283	2025-05-07 03:50:45.866
2	7	2025-05-02 17:04:40.875	2025-05-07 03:50:45.866
2	8	2025-05-02 17:14:06.903	2025-05-07 03:50:45.866
2	9	2025-05-03 06:10:00.214	2025-05-07 03:50:45.866
2	10	2025-05-03 10:05:51.135	2025-05-07 03:50:45.866
2	11	2025-05-03 10:18:04.008	2025-05-07 03:50:45.866
2	12	2025-05-03 10:26:19.462	2025-05-07 03:50:45.866
2	13	2025-05-04 06:45:57.206	2025-05-07 03:50:45.866
2	14	2025-05-04 11:32:26.67	2025-05-07 03:50:45.866
2	15	2025-05-05 09:59:19.431	2025-05-07 03:50:45.866
2	16	2025-05-06 13:31:43.407	2025-05-07 03:50:45.866
2	17	2025-05-06 19:45:28.162	2025-05-07 03:50:45.866
2	18	2025-05-06 19:46:15.064	2025-05-07 03:50:45.866
2	19	2025-05-07 03:32:32.751	2025-05-07 03:50:45.866
2	20	2025-05-07 03:35:44.788	2025-05-07 03:50:45.866
2	21	2025-05-07 03:36:55.963	2025-05-07 03:50:45.866
2	22	2025-05-07 03:37:18.099	2025-05-07 03:50:45.866
2	23	2025-05-07 03:37:54.022	2025-05-07 03:50:45.866
2	24	2025-05-07 03:40:06.176	2025-05-07 03:50:45.866
2	25	2025-05-07 03:51:21.998	2025-05-19 11:03:05.926
2	26	2025-05-07 09:40:26.53	2025-05-19 11:03:05.926
2	27	2025-05-07 09:56:11.29	2025-05-19 11:03:05.926
2	28	2025-05-07 11:14:01.521	2025-05-19 11:03:05.926
2	29	2025-05-07 11:14:24.857	2025-05-19 11:03:05.926
2	30	2025-05-07 11:14:32.98	2025-05-19 11:03:05.926
2	31	2025-05-07 11:15:20.471	2025-05-19 11:03:05.926
2	32	2025-05-07 13:17:59.244	2025-05-19 11:03:05.926
2	33	2025-05-08 06:35:01.424	2025-05-19 11:03:05.926
2	34	2025-05-08 08:57:22.784	2025-05-19 11:03:05.926
2	35	2025-05-08 08:59:14.761	2025-05-19 11:03:05.926
2	36	2025-05-08 09:57:44.102	2025-05-19 11:03:05.926
2	37	2025-05-09 05:27:13.12	2025-05-19 11:03:05.926
2	38	2025-05-09 09:51:04.057	2025-05-19 11:03:05.926
2	39	2025-05-09 10:37:43.206	2025-05-19 11:03:05.926
2	40	2025-05-10 05:56:05.214	2025-05-19 11:03:05.926
2	41	2025-05-12 06:15:49.779	2025-05-19 11:03:05.926
2	42	2025-05-16 14:05:01.701	2025-05-19 11:03:05.926
2	43	2025-05-16 14:06:56.454	2025-05-19 11:03:05.926
2	44	2025-05-18 17:35:37.616	2025-05-19 11:03:05.926
2	45	2025-05-19 04:08:56.035	2025-05-19 11:03:05.926
2	46	2025-05-19 10:43:19.887	2025-05-19 11:03:05.926
2	47	2025-05-19 11:00:37.25	2025-05-19 11:03:05.926
2	48	2025-05-19 11:05:16.76	2025-05-20 04:44:08.58
2	49	2025-05-19 11:18:23.568	2025-05-20 04:44:08.58
2	50	2025-05-19 11:18:23.57	2025-05-20 04:44:08.58
2	51	2025-05-19 11:18:23.61	2025-05-20 04:44:08.58
2	52	2025-05-19 11:18:25.887	2025-05-20 04:44:08.58
2	53	2025-05-19 11:18:26.349	2025-05-20 04:44:08.58
2	54	2025-05-19 11:18:33.612	2025-05-20 04:44:08.58
2	55	2025-05-19 11:18:35.972	2025-05-20 04:44:08.58
2	56	2025-05-19 11:18:36.051	2025-05-20 04:44:08.58
2	57	2025-05-19 11:18:36.294	2025-05-20 04:44:08.58
2	58	2025-05-19 11:18:36.294	2025-05-20 04:44:08.58
2	59	2025-05-19 11:18:36.662	2025-05-20 04:44:08.58
2	60	2025-05-19 12:08:36.202	2025-05-20 04:44:08.58
2	61	2025-05-19 12:08:36.24	2025-05-20 04:44:08.58
2	62	2025-05-19 12:08:37.557	2025-05-20 04:44:08.58
2	63	2025-05-19 12:09:21.84	2025-05-20 04:44:08.58
2	64	2025-05-19 12:13:31.475	2025-05-20 04:44:08.58
2	65	2025-05-20 03:42:13.576	2025-05-20 04:44:08.58
2	66	2025-05-20 04:44:17.138	2025-05-20 09:20:22.605
2	67	2025-05-20 04:59:12.664	2025-05-20 09:20:22.605
2	68	2025-05-20 05:19:51.172	2025-05-20 09:20:22.605
2	69	2025-05-20 07:22:39.42	2025-05-20 09:20:22.605
2	70	2025-05-20 07:23:30.631	2025-05-20 09:20:22.605
2	71	2025-05-20 09:13:45.95	2025-05-20 09:20:22.605
2	73	2025-05-20 09:21:26.765	2025-05-20 09:26:57.848
2	74	2025-05-20 09:26:11.55	2025-05-20 09:26:57.848
2	75	2025-05-20 09:27:03.504	\N
4	72	2025-05-20 09:20:33.064	2025-05-20 09:27:21.066
4	76	2025-05-20 09:27:47.849	\N
2	77	2025-05-21 10:41:54.518	\N
2	78	2025-05-21 11:01:39.722	\N
2	79	2025-05-21 13:53:32.798	\N
2	80	2025-05-22 03:19:16.766	\N
2	81	2025-05-24 06:50:46.208	\N
2	82	2025-05-24 15:45:49.581	\N
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Cart" ("CreatedAt", "DeletedAt", "Id", "UserId") FROM stdin;
2025-05-24 10:06:29.609	\N	36	1
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."CartItem" ("CartId", "CreatedAt", "DeletedAt", "Id", "Quantity", "ItemCodeId") FROM stdin;
36	2025-05-24 10:06:29.609	\N	62	100	1
36	2025-05-24 10:07:22.826	\N	63	5	7
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Dealer" ("CompanyName", "CreatedAt", "Id", "Region", "DeletedAt", "PriceCategoryId", "Address", "PhoneNumber", fax, "StoreCode") FROM stdin;
cv maju abadi	2025-05-01 17:06:36.144	2	jakarta	2025-05-09 10:08:33.661	1	\N	\N	\N	101
cv maju abadi	2025-05-09 10:21:05.071	5	Jakarta	\N	1	\N	\N	\N	101
cv maju abadi	2025-05-09 10:22:01.615	6	jakarta	2025-05-09 10:22:25.482	1	\N	\N	\N	101
cv maju abadi	2025-05-09 10:26:25.6	7	Jakarta	2025-05-09 10:27:01.603	1	\N	\N	\N	101
cv maju abadie	2025-05-09 10:27:09.123	8	Jakarta	2025-05-09 10:27:23.215	1	\N	\N	\N	101
cv maju abadi	2025-05-09 10:45:16.452	11	jakarta	\N	1	\N	\N	\N	101
cv fortune jaya	2025-05-09 10:30:07.915	9	Jakarta	\N	2	\N	\N	\N	102
\.


--
-- Data for Name: DealerWarehouse; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."DealerWarehouse" ("Id", "DealerId", "WarehouseId", "Priority") FROM stdin;
2	2	4	1
4	2	3	\N
12	11	1	\N
13	11	2	\N
14	11	3	\N
\.


--
-- Data for Name: EmailConfig; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailConfig" ("Id", "Email", "Password", "Host", "Port", "Secure", "IsActive", "CreatedAt", "UpdatedAt", "DeletedAt") FROM stdin;
1	dagonzaalfredo@gmail.com	bouspepemhuktotj	smtp.gmail.com	587	f	t	2025-05-07 13:26:31.147	2025-05-08 09:06:56.214	\N
\.


--
-- Data for Name: EmailSalesOrder; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailSalesOrder" ("Id", "SalesOrderId", "RecipientEmail", "Subject", "Body", "CreatedAt", "DeletedAt", "UpdatedAt", "ApprovedAt", "Status", "SenderEmail", "EmailTemplateId") FROM stdin;
1	9	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-06 19:56:51.162	\N	\N	2025-05-06 19:56:51.158	SENT	\N	\N
2	9	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/07/MAY/2025	\n  Nomor Sales Order: SS-01/101/07/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-07 16:54:49.373	\N	\N	2025-05-07 16:54:49.368	SENT	\N	\N
3	9	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/07/MAY/2025	\n  Nomor Sales Order: SS-01/101/07/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-07 16:54:50.869	\N	\N	2025-05-07 16:54:50.867	SENT	\N	\N
4	9	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/07/MAY/2025	\n  Nomor Sales Order: SS-02/101/07/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-07 17:02:47.216	\N	\N	2025-05-07 17:02:47.214	SENT	\N	\N
5	10	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:47:44.424	\N	\N	\N	FAILED	\N	\N
6	10	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:47:44.438	\N	\N	\N	FAILED	\N	\N
7	10	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:47:44.425	\N	\N	\N	FAILED	\N	\N
8	10	togarast@sunway.com.my	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:52:33.604	\N	\N	\N	FAILED	\N	\N
9	10	evan@sunway.com.my	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:52:33.607	\N	\N	\N	FAILED	\N	\N
10	10	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:52:33.624	\N	\N	\N	FAILED	\N	\N
11	9	evan@sunway.com.my	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:53:50.777	\N	\N	\N	FAILED	\N	\N
12	9	togarast@sunway.com.my	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:53:50.781	\N	\N	\N	FAILED	\N	\N
13	9	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:53:50.779	\N	\N	\N	FAILED	\N	\N
14	9	minato6175@gmail.com	[SALES ORDER] - SS-01/101/08/MAY/2025	\n  Nomor Sales Order: SS-01/101/08/MAY/2025\n  Tanggal Order: 5/7/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 06:53:50.778	\N	\N	\N	FAILED	\N	\N
15	8	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:06:11.891	\N	\N	\N	FAILED	\N	\N
16	8	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:06:11.907	\N	\N	\N	FAILED	\N	\N
17	8	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:06:11.946	\N	\N	\N	FAILED	\N	\N
18	8	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:06:12.362	\N	\N	\N	FAILED	\N	\N
19	11	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:32:56.356	\N	\N	\N	FAILED	\N	\N
20	11	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:32:56.372	\N	\N	\N	FAILED	\N	\N
21	11	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:32:56.359	\N	\N	\N	FAILED	\N	\N
22	11	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:32:56.967	\N	\N	\N	FAILED	\N	\N
23	7	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:33:53.818	\N	\N	\N	FAILED	\N	\N
24	7	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:33:53.821	\N	\N	\N	FAILED	\N	\N
25	7	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:33:53.823	\N	\N	\N	FAILED	\N	\N
26	7	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:33:53.864	\N	\N	\N	FAILED	\N	\N
27	6	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:06.487	\N	\N	\N	FAILED	\N	\N
28	6	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:06.488	\N	\N	\N	FAILED	\N	\N
29	6	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:06.489	\N	\N	\N	FAILED	\N	\N
30	6	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/5/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:06.49	\N	\N	\N	FAILED	\N	\N
31	4	dagonzaalfredo@gmail.com	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:46.102	\N	\N	\N	FAILED	\N	\N
32	4	togarast@sunway.com.my	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:46.104	\N	\N	\N	FAILED	\N	\N
33	4	minato6175@gmail.com	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:46.106	\N	\N	\N	FAILED	\N	\N
34	4	evan@sunway.com.my	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 07:35:46.906	\N	\N	\N	FAILED	\N	\N
35	12	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:41.501	\N	\N	\N	FAILED	\N	\N
36	12	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:41.506	\N	\N	\N	FAILED	\N	\N
37	12	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:41.504	\N	\N	\N	FAILED	\N	\N
38	12	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:41.503	\N	\N	\N	FAILED	\N	\N
39	12	togarast@sunway.com.my	[SALES ORDER] - SS-03/101/08/MAY/2025	\n  Nomor Sales Order: SS-03/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:45.939	\N	\N	\N	FAILED	\N	\N
40	12	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-03/101/08/MAY/2025	\n  Nomor Sales Order: SS-03/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:45.942	\N	\N	\N	FAILED	\N	\N
41	12	minato6175@gmail.com	[SALES ORDER] - SS-03/101/08/MAY/2025	\n  Nomor Sales Order: SS-03/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:46.942	\N	\N	\N	FAILED	\N	\N
53	2	togarast@sunway.com.my	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:48:10.151	\N	\N	\N	FAILED	\N	\N
54	2	minato6175@gmail.com	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:48:10.157	\N	\N	\N	FAILED	\N	\N
42	12	evan@sunway.com.my	[SALES ORDER] - SS-03/101/08/MAY/2025	\n  Nomor Sales Order: SS-03/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:46.943	\N	\N	\N	FAILED	\N	\N
43	12	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:48.681	\N	\N	\N	FAILED	\N	\N
44	12	minato6175@gmail.com	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:49.672	\N	\N	\N	FAILED	\N	\N
45	12	togarast@sunway.com.my	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:49.674	\N	\N	\N	FAILED	\N	\N
46	12	evan@sunway.com.my	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:49.676	\N	\N	\N	FAILED	\N	\N
47	2	dagonzaalfredo@gmail.com	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:55.834	\N	\N	\N	FAILED	\N	\N
48	2	togarast@sunway.com.my	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:56.807	\N	\N	\N	FAILED	\N	\N
49	2	minato6175@gmail.com	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:56.808	\N	\N	\N	FAILED	\N	\N
50	2	evan@sunway.com.my	[SALES ORDER] - 	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:47:56.815	\N	\N	\N	FAILED	\N	\N
51	2	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:48:09.146	\N	\N	\N	FAILED	\N	\N
52	2	evan@sunway.com.my	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 08:48:10.149	\N	\N	\N	FAILED	\N	\N
55	5	evan@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 09:07:04.728	\N	\N	2025-05-08 09:07:04.727	SENT	\N	\N
56	5	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 09:07:04.858	\N	\N	2025-05-08 09:07:04.856	SENT	\N	\N
57	5	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 09:07:05.464	\N	\N	2025-05-08 09:07:05.463	SENT	\N	\N
58	5	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/2/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-08 09:07:06.571	\N	\N	2025-05-08 09:07:06.569	SENT	\N	\N
59	16	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:01:56.183	\N	\N	2025-05-20 05:01:56.178	SENT	\N	\N
60	16	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:01:56.706	\N	\N	2025-05-20 05:01:56.705	SENT	\N	\N
61	16	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:01:57.269	\N	\N	2025-05-20 05:01:57.268	SENT	\N	\N
62	16	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/20/MAY/2025	\n  Nomor Sales Order: SS-01/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:01:59.662	\N	\N	2025-05-20 05:01:59.66	SENT	\N	\N
63	16	minato6175@gmail.com	[SALES ORDER] - SS-01/101/20/MAY/2025	\n  Nomor Sales Order: SS-01/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:00.779	\N	\N	2025-05-20 05:02:00.777	SENT	\N	\N
64	16	togarast@sunway.com.my	[SALES ORDER] - SS-01/101/20/MAY/2025	\n  Nomor Sales Order: SS-01/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:01.588	\N	\N	2025-05-20 05:02:01.587	SENT	\N	\N
65	16	togarast@sunway.com.my	[SALES ORDER] - SS-02/101/20/MAY/2025	\n  Nomor Sales Order: SS-02/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:36.613	\N	\N	2025-05-20 05:02:36.612	SENT	\N	\N
66	16	minato6175@gmail.com	[SALES ORDER] - SS-02/101/20/MAY/2025	\n  Nomor Sales Order: SS-02/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:36.849	\N	\N	2025-05-20 05:02:36.848	SENT	\N	\N
67	16	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-02/101/20/MAY/2025	\n  Nomor Sales Order: SS-02/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:38.575	\N	\N	2025-05-20 05:02:38.574	SENT	\N	\N
68	16	minato6175@gmail.com	[SALES ORDER] - SS-01/101/20/MAY/2025	\n  Nomor Sales Order: SS-01/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:41.614	\N	\N	2025-05-20 05:02:41.613	SENT	\N	\N
69	16	togarast@sunway.com.my	[SALES ORDER] - SS-01/101/20/MAY/2025	\n  Nomor Sales Order: SS-01/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:43.108	\N	\N	2025-05-20 05:02:43.107	SENT	\N	\N
70	16	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/20/MAY/2025	\n  Nomor Sales Order: SS-01/101/20/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:02:43.545	\N	\N	2025-05-20 05:02:43.543	SENT	\N	\N
71	15	togarast@sunway.com.my	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:06:24.164	\N	\N	2025-05-20 05:06:24.163	SENT	\N	\N
72	15	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:06:24.425	\N	\N	2025-05-20 05:06:24.423	SENT	\N	\N
73	15	minato6175@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:06:24.799	\N	\N	2025-05-20 05:06:24.798	SENT	\N	\N
74	12	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:07:06.715	\N	\N	2025-05-20 05:07:06.709	SENT	\N	\N
75	12	togarast@sunway.com.my	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:07:06.923	\N	\N	2025-05-20 05:07:06.916	SENT	\N	\N
76	12	minato6175@gmail.com	[SALES ORDER] - SS-04/101/08/MAY/2025	\n  Nomor Sales Order: SS-04/101/08/MAY/2025\n  Tanggal Order: 5/8/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 05:07:07.09	\N	\N	2025-05-20 05:07:07.083	SENT	\N	\N
77	18	dagonzaalfredo@gmail.com	[SALES ORDER] - null	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv fortune jaya\n  Sales Representative: alfredo dagonza\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-20 09:38:23.651	\N	\N	2025-05-20 09:38:23.648	SENT	\N	\N
78	17	minato6175@gmail.com	[SALES ORDER] - SS-01/101/21/MAY/2025	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-21 13:53:56.728	\N	\N	2025-05-21 13:53:56.723	SENT	\N	\N
79	17	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/21/MAY/2025	\n  Nomor Sales Order: -\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-21 13:53:56.874	\N	\N	2025-05-21 13:53:56.872	SENT	\N	\N
80	17	dagonzaalfredo@gmail.com	[SALES ORDER] - SS-01/101/21/MAY/2025	\n  Nomor Sales Order: SS-01/101/21/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-21 14:09:26.943	\N	\N	2025-05-21 14:09:26.942	SENT	\N	\N
81	17	minato6175@gmail.com	[SALES ORDER] - SS-01/101/21/MAY/2025	\n  Nomor Sales Order: SS-01/101/21/MAY/2025\n  Tanggal Order: 5/20/2025\n  Nama Pelanggan: cv maju abadi\n  Sales Representative: Sales Admin\n  Nomor DO: -\n  Nomor Sales Order JDE: - \n  \n  \n  PT. SUNWAY TREK MASINDO\n  Jl. Kosambi Timur No.47\n  Komplek Pergudangan Sentra Kosambi Blok H1 No.A\n  15211 Dadap – Tangerang, Indonesia\n  \n  📞 Tel: +62 55955445\n  📠 Fax: +62 55963153\n  📱 Mobile: +62 81398388788\n  ✉️ Email: steven@sunway.com.my\n  🌐 Web: www.sunway.com.sg\n  \n  \n  ⚠️ This is an auto-generated e-mail\n  The information contained in or attached to this message is intended only for the recipients it is addressed to. If you are not the intended recipient (or responsible for the delivery of the message to such person), any use, disclosure, or copying of this information is unauthorized and prohibited.\n  \n  This information may be confidential or subject to legal privilege. Please advise immediately if you or your employer do not consent to internet email for messages of this kind. Opinions, conclusions, and other information in this message that do not relate to the official business of Sunway Group of Companies shall be understood as neither given nor endorsed by it.\n  \n  For more information about Sunway Group, please visit:\n  🌍 www.sunway.com.my\n  \n  Sunway Group is committed to upholding the highest standards of integrity, business conduct, and professionalism in line with core values of Integrity, Humility, and Excellence.\n  \n  We espouse a zero-tolerance policy towards bribery and corruption in our business dealings with all stakeholders. The Sunway Anti-Bribery and Corruption (ABC) policy governs and ensures strict compliance with the "No Gift" policy at all times.\n  \n  📄 Read more about our policies here:\n  🔗 Sunway Group Policy | 🔗 Sunway REIT Policy\n      	2025-05-21 14:09:27.223	\N	\N	2025-05-21 14:09:27.222	SENT	\N	\N
\.


--
-- Data for Name: EmailSalesOrderRecipient; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailSalesOrderRecipient" ("Id", "SalesId", "RecipientEmail", "CreatedAt", "DeletedAt") FROM stdin;
1	1	dagonzaalfredo@gmail.com	2025-05-08 16:17:54.805	\N
4	1	minato6175@gmail.com	2025-05-08 16:17:54.805	\N
5	4	dagonzaalfredo@gmail.com	2025-05-20 09:37:43.989	\N
\.


--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."EmailTemplate" ("Id", "Name", "Subject", "Body", "CreatedAt", "UpdatedAt", "DeletedAt", "TemplateType") FROM stdin;
1	Reset Password User	Link Reset Password Anda	<p>Klik <a href='{{link}}'>di sini</a> untuk reset password Anda, {{user}}</p>	2025-05-07 13:41:02.473	\N	2025-05-07 13:41:52.411	FORGOT_PASSWORD_USER
2	Reset Password Userr	Link Reset Password Anda	<p>Klik <a href='{{link}}'>di sini</a> untuk reset password Anda, {{user}}</p>	2025-05-07 13:41:52.418	\N	2025-05-07 13:42:41.34	FORGOT_PASSWORD_USER
3	fffffffwdeew	ffffff	Halo {{user}},<br /><br />\nKami menerima permintaan untuk reset password Anda.<br />\nKlik link berikut untuk mereset password Anda:<br />\n<a href="{{link}}" target="_blank">{{link}}</a><br /><br />\nAbaikan email ini jika Anda tidak meminta perubahan.<br /><br />\nSalam hangat,<br />\nTim Kami	2025-05-07 13:42:41.343	\N	\N	FORGOT_PASSWORD_USER
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

COPY public."ItemCode" ("Id", "CreatedAt", "DeletedAt", "Name", "BrandCodeId", "OEM", "Weight", "PartNumberId", "AllowItemCodeSelection", "MinOrderQuantity", "OrderStep", "QtyPO") FROM stdin;
13	2025-05-06 20:39:29.526	\N	AH300-0075-YW	\N		\N	9	f	\N	\N	0
14	2025-05-06 20:39:53.977	\N	AH300-0100-BK	\N		\N	10	f	\N	\N	0
3	2025-05-03 05:30:34.125	\N	AH600-0075	\N		\N	4	f	\N	\N	0
2	2025-05-02 10:09:31.807	\N	AH300-0025-BK-SJ	\N		\N	2	f	0	0	0
4	2025-05-06 20:21:09.029	\N	AH300-0031	\N		\N	5	f	\N	\N	\N
5	2025-05-06 20:21:50.199	\N	AH300-0038-BK	\N		\N	6	f	\N	\N	0
6	2025-05-06 20:22:02.145	\N	AH300-0038-BK-SJ	\N		\N	6	f	\N	\N	0
12	2025-05-06 20:39:19.633	\N	AH300-0075-BK-SJ	\N		\N	9	f	\N	\N	0
7	2025-05-06 20:37:58.744	\N	AH300-0050-BK	\N		\N	7	f	\N	\N	0
15	2025-05-06 20:39:59.971	\N	AH300-0100-BK-SJ	\N		\N	10	f	\N	\N	0
16	2025-05-20 07:32:36.861	\N	R1T-04-D	\N		\N	12	f	\N	\N	0
8	2025-05-06 20:38:08.437	\N	AH300-0050-BK-SJ	\N		\N	7	f	\N	\N	0
9	2025-05-06 20:38:19.924	\N	AH300-0050-YW-SJ	\N		\N	7	f	\N	\N	0
17	2025-05-20 07:32:48.852	\N	R1T-04-D2	\N		\N	12	f	\N	\N	0
10	2025-05-06 20:38:44.733	\N	AH300-0063-BK	\N		\N	8	f	\N	\N	0
19	2025-05-20 07:33:15.76	\N	R1T-04-SF-JX	\N		\N	12	f	\N	\N	0
11	2025-05-06 20:39:11.488	\N	AH300-0075-BK	\N		\N	9	f	\N	\N	0
20	2025-05-20 07:33:30.101	\N	R1T-04-SF-S	\N		\N	12	f	\N	\N	0
18	2025-05-20 07:33:03.039	\N	R1T-04-SF-JD	\N		\N	12	f	\N	\N	1452
1	2025-04-30 12:17:20.979	\N	AH300-0025-BK	\N		\N	2	f	100	0	0
\.


--
-- Data for Name: ItemCodeImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ItemCodeImage" ("Id", "Image", "ItemCodeId", "CreatedAt", "DeletedAt") FROM stdin;
\.


--
-- Data for Name: Menu; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Menu" ("Id", "Name", "Path", "Description", "Feature") FROM stdin;
\.


--
-- Data for Name: PartNumber; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."PartNumber" ("Id", "Name", "Dash", "InnerDiameter", "OuterDiameter", "WorkingPressure", "BurstingPressure", "BendingRadius", "HoseWeight", "ProductId", "CreatedAt", "DeletedAt", "Description") FROM stdin;
3	AH600-0050	\N	\N	\N	\N	\N	\N	\N	3	2025-05-03 05:29:40.078	\N	\N
4	AH600-0075	\N	\N	\N	\N	\N	\N	\N	3	2025-05-03 05:30:23.6	\N	\N
5	AH300-0031	\N	8	15	300	900	64	0.18	2	2025-05-06 20:20:36.142	\N	\N
6	AH300-0038	\N	10	18	300	900	80	0.21	2	2025-05-06 20:21:22.682	\N	\N
9	AH300-0075	\N	19	29	300	900	152	0.44	2	2025-05-06 20:38:55.656	\N	\N
10	AH300-0100	\N	25	36	300	900	200	0.53	2	2025-05-06 20:39:39.779	\N	\N
8	AH300-0063	\N	15	24	300	900	128	0.27	2	2025-05-06 20:38:30.479	\N	\N
7	AH300-0050	\N	12	21	300	900	104	0.22	2	2025-05-06 20:37:29.8	\N	\N
2	AH300-0025	\N	6	13	300	900	48	0.15	2	2025-04-30 12:17:08.019	\N	\N
1	AH1200-0200	\N	50.8	70	1200	4800	612	3.68	1	2025-04-30 12:11:09.919	\N	
11	AH1200-0300	\N	76.2	98	1200	4800	910	5.99	1	2025-05-20 07:28:00.389	\N	
12	R1T-04	-4	6.4	13.4	3265	13060	100	0.225	25	2025-05-20 07:30:34.924	\N	
15	R1T-08	-6	9.5	17.4	2610	10440	130	0.415	25	2025-05-20 07:37:39.94	\N	
14	R1T-06	-6	9.5	17.4	2610	10440	5.1	0.34	25	2025-05-20 07:34:41.977	\N	
13	R1T-05	-5	7.9	15	3120	12480	105	0.26	25	2025-05-20 07:31:58.1	\N	
\.


--
-- Data for Name: Price; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Price" ("CreatedAt", "DealerId", "DeletedAt", "Id", "Price", "PriceCategoryId", "ItemCodeId") FROM stdin;
2025-05-05 14:56:48.152	2	2025-05-05 14:58:53.468	5	2000	\N	3
2025-05-05 14:57:40.534	2	2025-05-05 14:58:54.4	6	2000	\N	3
2025-05-05 14:59:24.267	2	2025-05-05 14:59:32.803	8	20000	\N	3
2025-05-05 14:59:09.214	2	2025-05-05 14:59:33.48	7	20000	\N	3
2025-05-05 14:59:49.71	2	2025-05-05 15:00:24.405	9	20000	\N	3
2025-05-05 15:00:27.733	2	2025-05-05 15:00:51.989	10	20000	\N	3
2025-05-05 15:00:35.37	2	2025-05-05 15:00:52.865	11	20000	\N	3
2025-05-05 15:01:17.557	2	2025-05-05 15:01:22.044	13	20000	\N	3
2025-05-05 15:01:06.079	2	2025-05-05 15:01:25.296	12	20000	\N	3
2025-05-05 15:01:27.741	2	2025-05-05 15:01:44.363	14	20000	\N	3
2025-05-02 08:36:20.913	\N	2025-05-05 15:37:58.561	1	5000	1	1
2025-05-02 14:18:29.395	\N	2025-05-05 15:40:04.585	2	5000	1	2
2025-05-05 16:29:20.673	2	2025-05-05 16:39:39.885	16	2000	\N	2
2025-05-05 16:29:38.881	2	2025-05-05 16:39:42.97	17	2000	\N	1
2025-05-06 13:32:13.017	\N	2025-05-06 13:32:47.182	18	21000	1	1
2025-05-06 20:08:56.035	\N	\N	19	30000	2	2
2025-05-06 20:12:40.198	\N	\N	21	40000	3	2
2025-05-06 20:09:07.143	2	2025-05-08 07:22:57.667	20	300001	\N	2
2025-05-20 09:51:06.477	9	\N	23	50000	\N	2
2025-05-21 11:04:27.217	\N	\N	24	50000	1	5
2025-05-19 19:07:58.83	\N	\N	22	50000	1	1
2025-05-21 11:05:35.8	\N	\N	25	50000	1	7
2025-05-21 11:05:53.242	\N	\N	26	77250	1	10
2025-05-21 11:06:19.528	\N	\N	27	114750	1	13
2025-05-21 11:06:31.54	\N	\N	28	147750	1	14
2025-05-05 16:21:08.14	\N	\N	15	50000	1	2
\.


--
-- Data for Name: PriceCategory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."PriceCategory" ("Id", "Name", "CreatedAt", "DeletedAt") FROM stdin;
1	S1	2025-05-02 08:36:14.791	\N
2	S2	2025-05-05 15:12:32.699	\N
3	S3	2025-05-05 15:12:36.413	\N
4	S4	2025-05-05 15:12:39.944	\N
\.


--
-- Data for Name: PriceHistory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."PriceHistory" ("Id", "Price", "UpdatedAt", "ItemCodeId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Product" ("CreatedAt", "DeletedAt", "Description", "Id", "Name", "CodeName") FROM stdin;
2025-04-30 12:10:45.34	\N	High Temperature Compressed Air Specifically Designed For Use In The Mining And Drilling Industry. Braided Construction\nFor Diameters 38mm & 51mm. Spiral Construction For Diameter 76mm.\nTemperature Range : -40˚C to +120˚C With Peaks Of 232˚C\nWorking Pressure : 1,200 PSI\nTube : Black Bromobutyl - Oil Mist And High Temperature Resistant\nReinforcement : High Tensile Steel Braids / Cords\nCover : Blue EPDM - Abrasion And Ozone Resistant - Pin Pricked\nCoils : 61mt (200ft) Continuous Length; Other Length Available On Request\nBranding : Blue Cover With Embossed Tape\n 'SUNFLEX AH1200 HEAVY DUTY AIR HOSE WPSI 1200'	1	Air / Water - AH1200	HEAVY DUTY AIR HOSE HOSE 1200 PSI
2025-05-03 05:29:23.314	\N		3	Air / Water - AH600	
2025-05-06 20:40:43.827	\N		4	Air / Water - AH300 (1" & below) Yellow Cover	
2025-05-06 20:40:52.751	\N		5	Air / Water - AH300 (up to 4" ID) Black Cover	
2025-05-06 20:41:04.389	\N		6	Air / Water - AH300 (up to 4" ID) Yellow Cover	
2025-05-06 20:41:11.739	\N		7	Air / Water - AH301 (1" & below) Black Cover	
2025-05-06 20:41:19.391	\N		8	Air / Water - AH600	
2025-05-06 20:41:25.538	\N		9	Air / Water - Contractor	
2025-05-06 20:41:33.484	\N		10	Air / Water - WDH300	
2025-05-06 20:41:38.949	\N		11	Air / Water - WSD150	
2025-05-06 20:41:44.353	\N		12	Air / Water - WSD150 SP	
2025-05-06 20:42:44.959	\N		13	Asphalt - AHT150	
2025-05-06 20:42:51.109	\N		14	Asphalt - AHT220	
2025-05-06 20:42:57.521	\N		15	Asphalt - AHT295	
2025-05-06 20:43:36.986	\N		16	Cement / Bulk Material - CDH150	
2025-05-06 20:43:43.025	\N		17	Cement / Bulk Material - CFD75	
2025-05-06 20:43:49.192	\N		18	Cement / Bulk Material - CPH1232	
2025-05-06 20:43:54.248	\N		19	Cement / Bulk Material - CSD150	
2025-05-06 20:43:59.236	\N		20	Cement / Bulk Material - CTH150	
2025-05-06 20:44:05.04	\N		21	Grouting Hose - BT600	
2025-05-06 20:44:45.988	\N		22	Chemical - UHMWPE250	
2025-05-06 20:44:52.175	\N		23	Chemical - XLPE150	
2025-05-06 20:44:57.371	\N		24	Chemical - XLPE250	
2025-05-06 20:45:45.877	\N		25	R1T (1 wire braided hydraulic hose)	
2025-05-06 20:46:28.617	2025-05-06 20:46:32.197		26	2 Wires	
2025-05-06 20:47:38.297	\N		27	2K (2 wire braided hydraulic hose) - Compact	
2025-05-06 20:47:44.747	\N		28	R2T (2 wire braided hydraulic hose)	
2025-05-06 20:47:56.583	\N		29	4SH (4 spiral wire hydraulic hose)	
2025-05-06 20:48:03.632	\N		30	4SP (4 spiral wire hydraulic hose)	
2025-05-06 20:48:11.85	\N		31	R12 (4 spiral wire hydraulic hose)	
2025-05-06 20:48:17.837	\N		32	R13 (4 / 6 spiral wire hydraulic hose)	
2025-05-06 20:48:28.04	\N		33	R15 (4 / 6 spiral wire hydraulic hose)	
2025-05-06 20:48:44.798	\N		34	AFX (SS braided teflon hose)	
2025-05-06 20:48:52.046	\N		35	CLWB (SS braided teflon hose)	
2025-05-06 20:48:59.464	2025-05-06 20:49:33.611		36	TWK (SS braided teflon hose)\t Thermoplastic	
2025-05-06 20:49:42.186	\N		37	TWK (SS braided teflon hose)	
2025-05-06 20:50:02.117	\N		38	352 (Very High Pressure Hose)	
2025-05-06 20:50:08.903	\N		39	714 - 1 Wire Airless Paint Spray (Thermoplastic Hose)	
2025-05-06 20:50:14.255	\N		40	R7 (single braid thermoplastic hose)	
2025-05-06 20:50:20.931	\N		41	R7 Twin-Hose (single braid thermoplastic hose)	
2025-05-06 20:50:27.376	\N		42	R8 (single braid thermoplastic hose)	
2025-05-06 20:50:31.851	\N		43	R8 Twin-Hose (single braid thermoplastic hose)	
2025-05-06 20:50:37.062	\N		44	TEST HOSE (Very High Pressure Hose)	
2025-05-06 20:50:47.272	\N		45	R3 (2 textile braided hydraulic hose)	
2025-05-06 20:50:54.895	\N		46	R5 (1 wire / 2 textile braided hydraulic hose)	
2025-05-06 20:51:00.641	\N		47	R6 (1 textile braided hydraulic hose)	
2025-05-06 21:01:15.283	2025-05-06 21:01:31.943		48	X-Series R1T (1 wire braided hydraulic hose)	
2025-05-06 21:01:34.919	\N		49	X-Series R2T (2 wire braided hydraulic hose)	
2025-05-06 21:01:42.79	\N		50	X-Series R1T (1 wire braided hydraulic hose)	
2025-05-06 21:01:51.98	\N		51	X-Series 4SH (4 spiral wire hydraulic hose)	
2025-05-06 21:01:59.478	\N		52	X-Series 4SP (4 spiral wire hydraulic hose)	
2025-05-06 21:02:05.554	\N		53	X-Series R15 (4 / 6 spiral wire hydraulic hose)\t	
2025-05-06 21:02:10.686	\N		54	X6KP (4/6 Steel Wire Spiral Hose)	
2025-04-30 12:16:44.972	\N	<p>A General Purpose Air Hose Engineered For Medium To Heavy Duty Application. It's Strong Yet Flexible Construction Guarantees A Long Life And Easy Handling.</p><p><br></p><p><strong>Temperature Range</strong> : -10˚C (+14˚F) to +80˚C (+176˚F)</p><p><strong>Tube</strong> : Black, Smooth, TPR Material, Oil Mist Resistant</p><p><strong>Reinforcement</strong> : High Strength Synthetic Cord</p><p><strong>Cover</strong> : Black, Smooth TPR Material, Weather And Abrasion</p><p><strong>Resistant Coils</strong> : 100mt (330ft) Continuous Length; Other Length Available On</p><p><strong>Request Branding</strong> : Inkjet White</p><p>'SUNFLEX AH300 AIR/WATER HOSE WPSI 300'</p>	2	Air / Water - AH300 (1" & below) Black Cover	AH300 (FROM SIZE 1/4" TO 1") AIR/WATER HOSE 300 PSI 
\.


--
-- Data for Name: ProductBrand; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductBrand" ("ProductBrandName", "Id", "ProductBrandCode") FROM stdin;
\.


--
-- Data for Name: ProductCategory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductCategory" ("CreatedAt", "DeletedAt", "Id", "Name", "ParentCategoryId") FROM stdin;
2025-04-30 12:09:24.9	\N	2	Air/ Water	1
2025-04-30 12:05:02.898	\N	1	Industrial Hose	\N
2025-05-06 20:42:21.825	\N	3	Asphalt	1
2025-05-06 20:43:24.321	\N	4	Cement / Bulk Material	1
2025-05-06 20:44:32.262	\N	5	Chemical	1
2025-05-06 20:45:33.932	\N	7	1 Wire	6
2025-05-06 20:46:40.118	\N	8	2 Wires	6
2025-05-06 20:46:50.799	\N	9	4 / 6 Wires	6
2025-05-06 20:47:02.935	\N	10	Teflon	6
2025-05-06 20:47:12.602	\N	11	Thermoplastic	6
2025-05-06 20:47:22.174	\N	12	Textile Braided	6
2025-05-06 20:45:15.496	\N	6	Hydraulic Hose	\N
2025-05-06 21:00:42.21	\N	14	1 Wire	13
2025-05-06 21:00:50.822	\N	15	2 Wires	13
2025-05-06 21:01:01.658	\N	16	4 / 6 Wires	13
2025-05-06 21:00:19.731	\N	13	Hydraulic Hose - X-Series	\N
2025-05-06 21:03:07.972	\N	17	Composite Hose	\N
2025-05-06 21:03:25.5	\N	18	Compotec Brand	17
\.


--
-- Data for Name: ProductCategoryImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductCategoryImage" ("Id", "Image", "ProductCategoryId", "CreatedAt", "DeletedAt") FROM stdin;
1	category_1_1746561725483.jpg	1	2025-05-06 20:02:05.486	\N
2	category_6_1746565194150.jpg	6	2025-05-06 20:59:54.152	\N
3	category_13_1746565352390.jpg	13	2025-05-06 21:02:32.393	\N
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."ProductImage" ("CreatedAt", "DeletedAt", "Id", "Image", "ProductId") FROM stdin;
2025-05-06 20:18:35.768	\N	1	product_2_1746562715765.png	2
2025-05-20 07:24:54.468	\N	2	product_1_1747725894464.png	1
2025-05-20 07:31:02.586	\N	3	product_25_1747726262582.png	25
\.


--
-- Data for Name: RoleMenuAccess; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."RoleMenuAccess" ("Id", "RoleId", "MenuId", "Access") FROM stdin;
\.


--
-- Data for Name: Sales; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Sales" ("Id", "AdminId") FROM stdin;
1	2
3	3
4	4
\.


--
-- Data for Name: SalesOrder; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."SalesOrder" ("Id", "DealerId", "UserId", "CreatedAt", "DeletedAt", "TransactionToken", "Note", "CustomerPoNumber", "DeliveryOrderNumber", "FOB", "JdeSalesOrderNumber", "PaymentTerm", "SalesId", "SalesOrderNumber", "Status") FROM stdin;
18	9	2	2025-05-20 09:19:32.853	\N		\N	\N	\N	\N	\N	\N	4	SS-03/102/20/MAY/2025	NEEDS_REVISION
17	11	1	2025-05-20 05:20:51.688	\N		\N	\N	\N	\N	\N	\N	1	SS-01/101/21/MAY/2025	NEEDS_REVISION
10	2	1	2025-05-08 06:46:53.969	\N		\N	\N	\N	\N	\N	\N	1	SS-01/101/08/MAY/2025	APPROVED_EMAIL_SENT
9	2	1	2025-05-06 19:37:45.983	\N		\N	\N	\N	\N	\N	\N	1	SS-02/101/08/MAY/2025	APPROVED_EMAIL_SENT
8	2	1	2025-05-05 15:41:04.815	\N		\N	\N	\N	\N	\N	\N	1	SS-02/101/08/MAY/2025	APPROVED_EMAIL_SENT
11	2	1	2025-05-08 07:29:02.003	\N		\N	\N	\N	\N	\N	\N	1	SS-02/101/08/MAY/2025	APPROVED_EMAIL_SENT
7	2	1	2025-05-05 15:40:17.008	\N		\N	\N	\N	\N	\N	\N	1	SS-03/101/08/MAY/2025	APPROVED_EMAIL_SENT
6	2	1	2025-05-05 15:39:20.683	\N		\N	\N	\N	\N	\N	\N	1	SS-03/101/08/MAY/2025	APPROVED_EMAIL_SENT
4	2	1	2025-05-02 15:13:55.883	\N		\N	\N	\N	\N		\N	1	SS-03/101/08/MAY/2025	APPROVED_EMAIL_SENT
2	2	1	2025-05-02 14:18:49.106	\N		\N	\N	\N	\N		\N	1	SS-04/101/08/MAY/2025	APPROVED_EMAIL_SENT
5	2	1	2025-05-02 15:47:39.553	\N		\N	\N	\N	\N	\N	\N	1	SS-04/101/08/MAY/2025	APPROVED_EMAIL_SENT
15	11	1	2025-05-20 04:31:03.597	\N		\N	\N	\N	\N	\N	\N	1	SS-02/101/20/MAY/2025	APPROVED_EMAIL_SENT
12	2	1	2025-05-08 07:42:14.769	\N		\N	\N	\N	\N	\N	\N	1	SS-03/101/20/MAY/2025	APPROVED_EMAIL_SENT
16	11	1	2025-05-20 04:34:22.416	2025-05-20 05:13:20.174		\N	\N	\N	\N	\N	\N	1	SS-02/101/20/MAY/2025	APPROVED_EMAIL_SENT
14	11	1	2025-05-19 17:10:15.121	2025-05-20 05:17:57.918		\N	\N	\N	\N	\N	\N	1	\N	PENDING_APPROVAL
13	11	1	2025-05-19 17:09:29.905	2025-05-20 05:18:00.571		\N	\N	\N	\N	\N	\N	1	\N	PENDING_APPROVAL
3	2	1	2025-05-02 15:05:49.064	2025-05-20 05:18:03.67		\N	\N	\N	\N	\N	\N	1	\N	PENDING_APPROVAL
\.


--
-- Data for Name: SalesOrderDetail; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."SalesOrderDetail" ("Id", "Quantity", "Price", "PriceCategoryId", "ItemCodeId", "SalesOrderId", "FinalPrice", "WarehouseId", "FulfillmentStatus", "TaxId") FROM stdin;
3	14	5000	1	1	5	5000	3	READY	\N
31	1400	5000	\N	1	2	7770000.000000001	\N	READY	2
32	140	50000	\N	1	2	7770000.000000001	\N	READY	2
33	1	200	\N	3	2	222	\N	READY	2
36	14	5000	\N	1	4	77700	\N	READY	2
37	14	5000	1	1	6	5550.000000000001	3	READY	2
38	14	5000	1	1	7	5550.000000000001	3	READY	2
39	14	5000	1	1	8	5550.000000000001	3	READY	2
45	14	300001	\N	2	10	4200014	\N	READY	\N
46	14	20000	\N	1	9	280000	\N	READY	\N
47	2	30000	\N	2	9	60000	\N	READY	\N
48	600	20000	1	2	11	22200	3	READY	2
52	100	30000	\N	1	16	3000000	\N	READY	\N
53	200	20000	\N	2	12	4000000	\N	READY	\N
60	100	30000	\N	2	18	3000000	\N	READY	\N
61	100	30000	\N	1	17	3000000	\N	READY	\N
\.


--
-- Data for Name: SalesOrderFile; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."SalesOrderFile" ("Id", "SalesOrderId", "ExcelFile", "PdfFile", "CreatedAt", "UpdatedAt") FROM stdin;
3	5	salesorder_5.xlsx	salesorder_5.pdf	2025-05-02 15:47:39.692	2025-05-02 15:47:39.692
1	2	salesorder_2.xlsx	salesorder_2.pdf	2025-05-02 14:18:49.705	2025-05-05 14:22:51.465
2	4	salesorder_4.xlsx	salesorder_4.pdf	2025-05-02 15:13:56.011	2025-05-05 14:23:24.089
4	6	salesorder_6.xlsx	salesorder_6.pdf	2025-05-05 15:39:20.852	2025-05-05 15:39:20.852
5	7	salesorder_7.xlsx	salesorder_7.pdf	2025-05-05 15:40:17.071	2025-05-05 15:40:17.071
6	8	salesorder_8.xlsx	salesorder_8.pdf	2025-05-05 15:41:04.857	2025-05-05 15:41:04.857
8	10	salesorder_10.xlsx	salesorder_10.pdf	2025-05-08 06:46:54.118	2025-05-08 06:52:25.347
7	9	salesorder_9.xlsx	salesorder_9.pdf	2025-05-06 19:37:46.263	2025-05-08 06:53:41.737
9	11	salesorder_11.xlsx	salesorder_11.pdf	2025-05-08 07:29:02.06	2025-05-08 07:29:02.06
11	16	salesorder_16.xlsx	salesorder_16.pdf	2025-05-20 04:34:22.565	2025-05-20 05:02:27.483
10	12	salesorder_12.xlsx	salesorder_12.pdf	2025-05-08 07:42:14.818	2025-05-20 05:06:53.912
13	18	salesorder_18.xlsx	salesorder_18.pdf	2025-05-20 09:19:33.085	2025-05-24 11:44:09.297
12	17	salesorder_17.xlsx	salesorder_17.pdf	2025-05-20 05:20:51.883	2025-05-24 11:44:17.79
\.


--
-- Data for Name: Tax; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Tax" ("Id", "Name", "Percentage", "IsActive", "CreatedAt", "UpdatedAt", "DeletedAt") FROM stdin;
1	2025	11	f	2025-05-03 09:06:22.752	2025-05-03 09:06:44.558	\N
2	2026	11	t	2025-05-03 09:06:44.563	2025-05-03 09:06:44.563	\N
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."User" ("Address", "Birthdate", "Country", "CreatedAt", "DeletedAt", "Email", "Gender", "Id", "Image", "Name", "Password", "PhoneNumber", "Province", "Token", "Username", "DealerId") FROM stdin;
	2025-05-02 00:00:00	AU	2025-05-01 18:27:20.586	\N	dagonzaalfredo@gmail.com		1	user_1746592906207.png	aldo	$2b$10$lmyUTTZm4qb6zdLEqls9xuh2sSVIpTetW2.BUjbtxnZM.r2rC.Eyu		Northern Territory	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0ODA3OTM0NSwiZXhwIjoxNzQ4MDgyOTQ1fQ.45f059G9njl3s9kjhxpVVATyAvmoXk5ERpVwiuKpau0	dagonza	11
	2025-05-20 00:00:00	ID	2025-05-20 09:18:48.668	\N	minato6175@gmail.com		2	\N	alfredo dagonza	$2b$10$RfkQCGKre9s1MrJAyKhAj.KP.j.78LXRMDbPImV1m0jNsJ7v2GTMu	089685352740	DKI Jakarta	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjIsImlhdCI6MTc0NzczMjc1MCwiZXhwIjoxNzQ3NzM2MzUwfQ.aOPrMO4QkeX_uD1lB7-dmI3nFUoQtDZAvm8xEeoHf2Y	alfredo	9
\.


--
-- Data for Name: UserForgotPasswordRequest; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."UserForgotPasswordRequest" ("Id", "UserId", "Token", "IsUsed", "ExpiresAt", "SenderEmail", "Status", "ErrorMessage", "CreatedAt", "EmailTemplateId") FROM stdin;
1	1	18477f6b-354f-4340-9106-2d5a5e345eb6	t	2025-05-07 14:46:12.718	ratatopesper@gmail.com	SENT	\N	2025-05-07 13:46:12.727	3
2	1	e8525018-9d3a-481e-918b-e1a0c84e99a6	t	2025-05-07 14:50:53.842	ratatopesper@gmail.com	SENT	\N	2025-05-07 13:50:53.846	3
3	1	bae3702c-2d5f-4e9e-ab04-9b4685ff35d0	f	2025-05-07 15:07:58.784	ratatopesper@gmail.com	PENDING	\N	2025-05-07 14:07:58.794	3
4	1	fabb3ab6-03a6-4365-a781-0062388fa06f	f	2025-05-07 15:15:00.178	ratatopesper@gmail.com	PENDING	\N	2025-05-07 14:15:00.187	3
5	1	9cab20ec-18a9-45a8-99c6-b62a53af1c72	f	2025-05-07 15:15:43.307	ratatopesper@gmail.com	PENDING	\N	2025-05-07 14:15:43.312	3
6	1	9c93545f-8df6-4c3e-a131-9f446ba45f61	t	2025-05-07 15:27:10.554	ratatopesper@gmail.com	SENT	\N	2025-05-07 14:27:10.562	3
7	1	ead5a4cc-0f42-4dd0-a559-e43fb6722ec9	f	2025-05-07 17:24:15.189	ratatopesper@gmail.com	PENDING	\N	2025-05-07 16:24:15.203	3
8	1	2dec7e32-540b-4871-8c89-1ba4c55c617c	t	2025-05-07 17:27:53.475	ratatopesper@gmail.com	SENT	\N	2025-05-07 16:27:53.48	3
9	1	c46346cd-d015-4422-87a5-fc2c49ff3d4c	t	2025-05-07 17:35:21.026	ratatopesper@gmail.com	SENT	\N	2025-05-07 16:35:21.036	3
10	1	452417e7-17be-4e53-b1d1-b956542b70ce	t	2025-05-07 17:36:22.138	ratatopesper@gmail.com	SENT	\N	2025-05-07 16:36:22.144	3
11	1	3fd7d3d6-6ffc-4347-a534-b47bb1c45d0c	t	2025-05-07 17:39:53.831	ratatopesper@gmail.com	SENT	\N	2025-05-07 16:39:53.835	3
12	1	4184cb9f-830b-43a9-9978-ca41c79758c1	f	2025-05-07 18:24:45.05	ratatopesper@gmail.com	PENDING	\N	2025-05-07 17:24:45.06	3
13	1	2ef66b57-7dd3-451c-967e-dd14ac1421d2	f	2025-05-08 07:31:08.278	ratatopesper@gmail.com	PENDING	\N	2025-05-08 06:31:08.305	3
14	1	b4b09ce0-59ca-423e-80e6-741cca85df9e	f	2025-05-08 07:31:49.914	ratatopesper@gmail.com	PENDING	\N	2025-05-08 06:31:49.919	3
15	1	f292d7aa-ca5f-4aeb-9163-7d9f37cf69b9	f	2025-05-08 07:31:56.094	ratatopesper@gmail.com	PENDING	\N	2025-05-08 06:31:56.098	3
16	1	10959931-c03d-44e3-8a44-62958bd8e120	f	2025-05-08 07:32:23.068	ratatopesper@gmail.com	PENDING	\N	2025-05-08 06:32:23.077	3
17	1	e7900414-4681-4680-b928-bf5455bc1050	f	2025-05-08 07:52:02.308	dagonzaalfredo@gmail.com	PENDING	\N	2025-05-08 06:52:02.315	3
\.


--
-- Data for Name: UserSession; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."UserSession" ("Id", "LoginTime", "LogoutTime", "Token", "UserId") FROM stdin;
1	2025-05-01 18:27:20.594	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjEyNDA0MCwiZXhwIjoxNzQ2MTI3NjQwfQ.I7igXSD98FDVvKArerWRsiE3jFNvDnQEezk_4VQj1ow	1
2	2025-05-01 18:47:35.111	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjEyNTI1NSwiZXhwIjoxNzQ2MTI4ODU1fQ.-E3AzzgTp8o36_KMtRqxtMLRDvnbLRn4KYrjsjNWF9w	1
3	2025-05-02 08:35:36.431	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjE3NDkzNiwiZXhwIjoxNzQ2MTc4NTM2fQ.FmM5M92MJG-nYkEuq9qFeQqzXsUUnCL3hVEJNbzJBhc	1
4	2025-05-02 09:36:52.688	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjE3ODYxMiwiZXhwIjoxNzQ2MTgyMjEyfQ.SnHp4ZITimvDC3s3DQlMPfxcjVYNGtjE4VpNn0dTf24	1
5	2025-05-02 10:38:23.251	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjE4MjMwMywiZXhwIjoxNzQ2MTg1OTAzfQ.wmtuWLk4HDNknPti04IxuYmVeTp852koBNcP92mgoRw	1
6	2025-05-02 12:08:15.25	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjE4NzY5NSwiZXhwIjoxNzQ2MTkxMjk1fQ.KCFH-X5wJuVk1dxk_UX2yYSl_r7YoV8fcn-jl0z_rqM	1
7	2025-05-02 13:25:09.236	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjE5MjMwOSwiZXhwIjoxNzQ2MTk1OTA5fQ.PBv8-UOZ1K4UZAdkzLDdmpegTqBmn3ZkYPk7ULV_K1k	1
8	2025-05-02 14:17:33.79	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjE5NTQ1MywiZXhwIjoxNzQ2MTk5MDUzfQ.Hy-rO7OdCS22MP_kVNrCWbxXBTTCh-W3ER9osqq5NF4	1
9	2025-05-02 15:47:31.317	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjIwMDg1MSwiZXhwIjoxNzQ2MjA0NDUxfQ.3ZRVpjmvdL8BgfKNCsyiVj3ZlWkcY90LF677iS87pzk	1
10	2025-05-03 10:39:54.914	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjI2ODc5NCwiZXhwIjoxNzQ2MjcyMzk0fQ.efyN0GB4gmSQ8bzXHMdTyn0l5aw6SEGznu_SNFjXTgk	1
11	2025-05-03 15:48:12.185	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjI4NzI5MiwiZXhwIjoxNzQ2MjkwODkyfQ.UzxNHGSXQ85kVQrxERTe-lug_wQ6_RQRJzBPd5lB2Fo	1
12	2025-05-03 17:05:07.765	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjI5MTkwNywiZXhwIjoxNzQ2Mjk1NTA3fQ.I63S5Q80jhwloA35qM3RtxZkgdW_yd4n4rrirTJSRlw	1
13	2025-05-04 06:01:16.606	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjMzODQ3NiwiZXhwIjoxNzQ2MzQyMDc2fQ._BsMqdQ6_js-LFN-tSMuESvt_iRMK3ajNJD0HXbnxBw	1
14	2025-05-04 06:32:53.805	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjM0MDM3MywiZXhwIjoxNzQ2MzQzOTczfQ.AlBXLyZ4ujzwMzxI3ZxsOh7kJewAML425Jr9twzjs-k	1
15	2025-05-05 15:23:31.458	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjQ1ODYxMSwiZXhwIjoxNzQ2NDYyMjExfQ.lv6efwo5U2gi35cIUAKjhWt8VwO9aWz40skwmgUqmnw	1
16	2025-05-05 16:20:40.148	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjQ2MjA0MCwiZXhwIjoxNzQ2NDY1NjQwfQ.ELvfWCEcZqBUBjckLqrokrm14fuPGuN6dyrGxOvRsq8	1
17	2025-05-05 17:30:04.364	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjQ2NjIwNCwiZXhwIjoxNzQ2NDY5ODA0fQ.IzZP5EBc14aNlo6uDPps6o_CAGaLI_g4xGU9u7-Sx30	1
18	2025-05-06 01:17:05.745	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjQ5NDIyNSwiZXhwIjoxNzQ2NDk3ODI1fQ.1-VwJpfFFc5486vIvHq-WOf3mIfcMamkKbHNaOsQdRQ	1
19	2025-05-06 10:19:42.757	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjUyNjc4MiwiZXhwIjoxNzQ2NTMwMzgyfQ.oVoNJEZliuvVT_N_XGej8wpQ48qyOVt3Uibq2UnIu2M	1
20	2025-05-06 12:01:15.992	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjUzMjg3NSwiZXhwIjoxNzQ2NTM2NDc1fQ.iP0ev2DSBW3m3mLfhK8u2B3lRU7NhqlgxVFfh7K8hyw	1
21	2025-05-06 13:01:22.528	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjUzNjQ4MiwiZXhwIjoxNzQ2NTQwMDgyfQ.n2PAPhFCbr1LslUUUdu9-ks8Emwa3w_c1Xw91cpOpmo	1
22	2025-05-06 14:43:59.332	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjU0MjYzOSwiZXhwIjoxNzQ2NTQ2MjM5fQ.V757lvJX3byU20T2x6IMHdagA-bmaKdjYqTRqz0bhhc	1
23	2025-05-06 19:09:22.252	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjU1ODU2MiwiZXhwIjoxNzQ2NTYyMTYyfQ.-Hc_Feccaw_80CV2S8fRCDHSI47M6xsom24tpjKx-0A	1
24	2025-05-07 04:21:22.561	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjU5MTY4MiwiZXhwIjoxNzQ2NTk1MjgyfQ.7JvyyI5OrXevr6DuIkNjb0XYnCtyRyv_R2wgG4F6zng	1
25	2025-05-07 16:36:51.839	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjYzNTgxMSwiZXhwIjoxNzQ2NjM5NDExfQ.En1FL_sywWyt8UNj6nt4eDqiKBRGgvt16yyy5IrlGOc	1
26	2025-05-07 16:40:24.755	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjYzNjAyNCwiZXhwIjoxNzQ2NjM5NjI0fQ.KErUQMTiYl20CqA9HowDL6MFpI7_6piOR4phwapHRBA	1
27	2025-05-07 17:25:49.643	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjYzODc0OSwiZXhwIjoxNzQ2NjQyMzQ5fQ.hzE4qmoD2X_AE6dOuNba-YA_iyApLqLYkmmeTU2VbEs	1
28	2025-05-08 06:46:19.162	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjY4Njc3OSwiZXhwIjoxNzQ2NjkwMzc5fQ._kYBzGeH2wCaxAUyW0phOtdRfFNcqsVHc0d4rDaebdU	1
29	2025-05-08 06:55:12.433	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjY4NzMxMiwiZXhwIjoxNzQ2NjkwOTEyfQ.mNLVw5XyJHQc5-_mzrIXqKBwRZGlZ6OeuS46RDz65oM	1
30	2025-05-08 08:26:25.981	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NjY5Mjc4NSwiZXhwIjoxNzQ2Njk2Mzg1fQ.b0Az0RSmEdyKyIvxlW8ijjnBCmiUpveYkG-x0aabmGU	1
31	2025-05-19 15:51:39.259	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzY2OTg5OSwiZXhwIjoxNzQ3NjczNDk5fQ.b2FdbcO0M514UisdCGjCCk1j1q-oCGzHIW8Fx8q7QOg	1
32	2025-05-19 15:52:28.511	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzY2OTk0OCwiZXhwIjoxNzQ3NjczNTQ4fQ.2xYYMsCA4UEVlgBwroTs8Ct7GASrdvwb83kbnDv_rhs	1
33	2025-05-19 17:10:04.223	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzY3NDYwNCwiZXhwIjoxNzQ3Njc4MjA0fQ.a_2qXcN4rhVuUHFSNgK6OuOU0dvhLb4bfxz2K9TeaEw	1
34	2025-05-19 18:40:29.86	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzY4MDAyOSwiZXhwIjoxNzQ3NjgzNjI5fQ.PVmoNoCqsSufPTobp6U7gFSl0IjTQWlomZ7dTchElzM	1
35	2025-05-20 04:30:43.233	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzcxNTQ0MywiZXhwIjoxNzQ3NzE5MDQzfQ.e9FPnKoik6xMdX8b7qdlq7t22o-zwgbzgMeOgtSdPuk	1
36	2025-05-20 09:08:19.306	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzczMjA5OSwiZXhwIjoxNzQ3NzM1Njk5fQ.WGLrLbDCOXZdmxhXwvoWUQGKCxVT4qI-b8Czl9FA6bM	1
37	2025-05-20 09:18:48.674	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjIsImlhdCI6MTc0NzczMjcyOCwiZXhwIjoxNzQ3NzM2MzI4fQ.jfzhjoZqXdg1ar0I2G6KufIvrwtDJf1FA80_0UMM50Q	2
38	2025-05-20 09:19:10.501	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjIsImlhdCI6MTc0NzczMjc1MCwiZXhwIjoxNzQ3NzM2MzUwfQ.aOPrMO4QkeX_uD1lB7-dmI3nFUoQtDZAvm8xEeoHf2Y	2
39	2025-05-21 10:58:52.976	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0NzgyNTEzMiwiZXhwIjoxNzQ3ODI4NzMyfQ.BHLLRSMFRZDsAaqZ07Vj8y8pQrIDjKDtCEim8jtJF_s	1
40	2025-05-24 09:35:45.726	\N	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOjEsImlhdCI6MTc0ODA3OTM0NSwiZXhwIjoxNzQ4MDgyOTQ1fQ.45f059G9njl3s9kjhxpVVATyAvmoXk5ERpVwiuKpau0	1
\.


--
-- Data for Name: Warehouse; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."Warehouse" ("Id", "Name", "Location", "CreatedAt", "DeletedAt", "BusinessUnit") FROM stdin;
1	Jakarta	Jakarta	2025-04-30 12:26:00.159	\N	20101
4	Samarinda	Samarinda	2025-05-07 17:36:53.948	\N	20107
2	Balikpapan	Batam	2025-04-30 12:26:00.186	\N	20102
3	Batam	Batam	2025-04-30 12:26:00.2	\N	20801110
\.


--
-- Data for Name: WarehouseStock; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."WarehouseStock" ("Id", "WarehouseId", "ItemCodeId", "QtyOnHand", "UpdatedAt", "CreatedAt", "DeletedAt") FROM stdin;
21	1	10	100	2025-05-20 09:43:02.002	2025-05-07 17:36:54.017	\N
24	1	11	2679.73	2025-05-20 09:43:02.007	2025-05-07 17:36:54.032	\N
28	1	12	3400	2025-05-20 09:43:02.011	2025-05-07 17:36:54.054	\N
31	1	14	9509	2025-05-20 09:43:02.015	2025-05-07 17:36:54.07	\N
34	1	15	3790	2025-05-20 09:43:02.019	2025-05-07 17:36:54.087	\N
36	1	3	119	2025-05-20 09:43:02.023	2025-05-07 17:36:54.099	\N
37	1	16	842	2025-05-20 09:43:02.029	2025-05-20 09:40:49.072	\N
38	1	17	2265	2025-05-20 09:43:02.034	2025-05-20 09:40:49.083	\N
39	1	18	3821.2	2025-05-20 09:43:02.04	2025-05-20 09:40:49.089	\N
2	2	1	0	2025-05-20 09:43:02.054	2025-04-30 12:26:00.191	\N
3	3	1	0	2025-05-20 09:43:02.057	2025-04-30 12:26:00.204	\N
5	2	2	0	2025-05-20 09:43:02.059	2025-05-02 10:09:54.433	\N
6	3	2	0	2025-05-20 09:43:02.061	2025-05-02 10:09:54.44	\N
8	2	5	0	2025-05-20 09:43:02.064	2025-05-07 17:36:53.944	\N
9	4	5	0	2025-05-20 09:43:02.066	2025-05-07 17:36:53.952	\N
40	1	20	17	2025-05-20 09:40:49.097	2025-05-20 09:40:49.096	\N
10	3	5	0	2025-05-20 09:43:02.068	2025-05-07 17:36:53.958	\N
12	2	6	0	2025-05-20 09:43:02.07	2025-05-07 17:36:53.969	\N
4	1	2	2900	2025-05-20 09:42:52.814	2025-05-02 10:09:54.422	2025-05-19 17:25:31.565
13	3	6	0	2025-05-20 09:43:02.072	2025-05-07 17:36:53.975	\N
15	2	7	0	2025-05-20 09:43:02.075	2025-05-07 17:36:53.986	\N
16	3	7	0	2025-05-20 09:43:02.077	2025-05-07 17:36:53.991	\N
18	2	8	0	2025-05-20 09:43:02.081	2025-05-07 17:36:54.002	\N
19	3	8	0	2025-05-20 09:43:02.083	2025-05-07 17:36:54.007	\N
20	3	9	0	2025-05-20 09:43:02.086	2025-05-07 17:36:54.012	\N
22	2	10	0	2025-05-20 09:43:02.088	2025-05-07 17:36:54.022	\N
23	3	10	0	2025-05-20 09:43:02.091	2025-05-07 17:36:54.027	\N
25	2	11	0	2025-05-20 09:43:02.093	2025-05-07 17:36:54.037	\N
26	4	11	0	2025-05-20 09:43:02.097	2025-05-07 17:36:54.043	\N
27	3	11	0	2025-05-20 09:43:02.099	2025-05-07 17:36:54.049	\N
29	2	12	0	2025-05-20 09:43:02.102	2025-05-07 17:36:54.06	\N
30	3	13	0	2025-05-20 09:43:02.104	2025-05-07 17:36:54.065	\N
32	2	14	0	2025-05-20 09:43:02.107	2025-05-07 17:36:54.075	\N
33	3	14	0	2025-05-20 09:43:02.11	2025-05-07 17:36:54.081	\N
35	2	15	0	2025-05-20 09:43:02.113	2025-05-07 17:36:54.093	\N
41	2	16	0	2025-05-20 09:43:02.116	2025-05-20 09:42:52.963	\N
42	2	17	0	2025-05-20 09:43:02.119	2025-05-20 09:42:52.973	\N
43	2	18	0	2025-05-20 09:43:02.121	2025-05-20 09:42:52.984	\N
44	3	19	0	2025-05-20 09:43:02.124	2025-05-20 09:42:52.99	\N
45	2	20	0	2025-05-20 09:43:02.126	2025-05-20 09:42:52.996	\N
46	4	20	0	2025-05-20 09:43:02.128	2025-05-20 09:42:52.999	\N
1	1	1	4389	2025-05-20 09:43:01.976	2025-04-30 12:26:00.173	\N
7	1	5	238	2025-05-20 09:43:01.983	2025-05-07 17:36:53.935	\N
11	1	6	2400	2025-05-20 09:43:01.988	2025-05-07 17:36:53.963	\N
14	1	7	6918.4	2025-05-20 09:43:01.992	2025-05-07 17:36:53.98	\N
17	1	8	450	2025-05-20 09:43:01.997	2025-05-07 17:36:53.996	\N
\.


--
-- Data for Name: WholesalePrice; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."WholesalePrice" ("Id", "MinQuantity", "MaxQuantity", "PriceId", "CreatedAt", "DeletedAt") FROM stdin;
\.


--
-- Data for Name: _DealerSales; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."_DealerSales" ("A", "B") FROM stdin;
2	1
5	1
7	1
8	1
11	1
9	4
\.


--
-- Data for Name: _ProductToProductCategory; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public."_ProductToProductCategory" ("A", "B") FROM stdin;
1	2
2	2
3	2
4	2
5	2
6	2
7	2
8	2
9	2
10	2
11	2
12	2
13	3
14	3
15	3
16	4
17	4
18	4
19	4
20	4
21	4
22	5
23	5
24	5
25	7
26	6
27	8
28	8
29	9
30	9
31	9
32	9
33	9
34	10
35	10
36	10
37	10
38	11
39	11
40	11
41	11
42	11
43	11
44	11
45	12
46	12
47	12
48	13
49	15
50	14
51	16
52	16
53	16
54	16
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: shobuki
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f9e5e581-df2b-47a5-b691-77138186fc1c	914ed15fe86cae9248a37d413f16cd11e54c0bf1ac09ca5deda97d2baf24935c	2025-04-30 16:16:43.577453+07	20250209180245_m_m_dealer_user	\N	\N	2025-04-30 16:16:43.569201+07	1
3fcf80d9-00bd-4cc9-bc75-4179fbba6621	e2f8aeab53eed70d3d1d112331bedab3848717dab09766730db538af8848ba9c	2025-04-30 16:16:42.991272+07	20241116133935_update_barcode	\N	\N	2025-04-30 16:16:42.78924+07	1
75471e29-cc51-4b7f-a55f-6ff7f2edce44	a0aa0c21c7f3169a795b7eb69e4a88748b8e1a46e0174fd0da06370f804b3a18	2025-04-30 16:16:43.523246+07	20250131163031_cart_fix	\N	\N	2025-04-30 16:16:43.520615+07	1
bd838116-3dd3-44f4-8d38-bf7f1364635a	c53b0d12c6c161f297720373e5bad14989bbbf6992ecec04cc3be453c4e4d098	2025-04-30 16:16:43.080896+07	20250104062633_reset_database	\N	\N	2025-04-30 16:16:42.992036+07	1
a25cd114-f605-4f8e-b368-c840b9b99f95	25638e1d00459f4624ec285296bf3692cbd682b869fc9d5a130fe3d8e6cbe906	2025-04-30 16:16:43.413497+07	20250120172430_baru	\N	\N	2025-04-30 16:16:43.082075+07	1
1ac02cfb-4c8d-4812-ad22-ecf2d58d7bd7	adfd2e31e9764a9717e74a63199af0fc57edf9b409b277cbb6f15622c4a72250	2025-04-30 16:16:43.422058+07	20250120180708_baru_new	\N	\N	2025-04-30 16:16:43.414614+07	1
484868da-c2dc-41dd-be5a-af238cd44733	011567f2534d48c39d32c635c479ac83d45519b9c4dff7f391157763cb5ecf40	2025-04-30 16:16:43.525896+07	20250131164950_productid_delete_pada_productreal	\N	\N	2025-04-30 16:16:43.523823+07	1
bf8382df-9d8c-4e05-9bb7-492b84b52645	393fb4368060819de2491155c5ecf8804663b47bea0823121bcb9e1d9eaaba8b	2025-04-30 16:16:43.426127+07	20250121153221_productbrandcode_add	\N	\N	2025-04-30 16:16:43.422992+07	1
ccb7f876-b058-4996-aa93-bec2b55aadf5	ed489e069293cce5a23122820ed4ca7d940e83161c837e634d992af024160118	2025-04-30 16:16:43.429335+07	20250121153632_producbrand_optional	\N	\N	2025-04-30 16:16:43.426899+07	1
5ee00826-6474-408c-a769-9f6ba8aa10e5	8ef934add20ca1f658e491ead0ae3085009290ae01aab0569b967bb2923100d8	2025-04-30 16:16:43.647064+07	20250216170803_emaio	\N	\N	2025-04-30 16:16:43.630268+07	1
189be548-5d53-4058-ac22-3fad4428ff89	9017f63d68bca8da0d520edce6910d3b2c67505b27a6850fb6a39ee7a3bbd9a8	2025-04-30 16:16:43.435652+07	20250123152553_pricecategory_dealer_optional	\N	\N	2025-04-30 16:16:43.429981+07	1
4c7d4408-4c05-4f7f-84c6-a40da4d4d681	957d95fe76094e50e4225f6545e9f22df1053a2486a770719f4fe5e935a2d404	2025-04-30 16:16:43.529024+07	20250201071450_name_product	\N	\N	2025-04-30 16:16:43.526596+07	1
c8e722a0-6d1c-492c-900f-b305ed6de80c	3a7cbc42354734f9898200280af4ad834312afc51bd1fa8d91d0b13ead9bfb22	2025-04-30 16:16:43.441581+07	20250125085115_optional_userid	\N	\N	2025-04-30 16:16:43.436514+07	1
7d96401d-474d-4316-9e5f-44c15992710c	4766c0fe4fa0c6de06070a0dd8e5d9752148acfa2afd3f27ca2919a4fe6d21d9	2025-04-30 16:16:43.445684+07	20250125095816_update_1_many_dealer_user	\N	\N	2025-04-30 16:16:43.442099+07	1
0e65a949-d17f-48d0-b978-fbf4f9975c7d	c3d6e5123f3da2df411cc1883cde42b6c15113ea6c52dc117d3defbc0ddb1786	2025-04-30 16:16:43.580412+07	20250210054332_deletedat_dealer	\N	\N	2025-04-30 16:16:43.578+07	1
4a2918f2-cb8f-4f9d-87ea-7ec37671ead8	248ac36d4ee4d30f46f628ad1cef51a705212fb3cdcf2cf523f8857a2020f6fd	2025-04-30 16:16:43.449935+07	20250125101023_no_userid_for_dealer	\N	\N	2025-04-30 16:16:43.446191+07	1
381af8b0-a755-419a-8413-18082d5550d7	64d349e814c2353fa5b0b2815c2068804a0e3e0142d965476c7852c729519cef	2025-04-30 16:16:43.531739+07	20250201074303_note_module_salesorder	\N	\N	2025-04-30 16:16:43.52968+07	1
c11e9f47-161d-4a25-8492-ea2828b4f7ec	b9832db99026ebde7c77fa1639e844606eadb3ea91eab7f9c5205d5dc34c2672	2025-04-30 16:16:43.492783+07	20250128050108_unique_dan_product_change	\N	\N	2025-04-30 16:16:43.450593+07	1
cc3401d5-e205-4857-b171-6c0ecc1cc522	9c515996f7cd3f08709fa20191eaa4a59a781264c6d0c0d136e0eb55820aea37	2025-04-30 16:16:43.505235+07	20250130061858_productcategoryimage	\N	\N	2025-04-30 16:16:43.49355+07	1
edb2413f-5e4a-440e-9144-fc3c8270e691	96c8871be0cf7428d7b4b42fc3cf314d34c70d92774fdebf1184ca52a310baee	2025-04-30 16:16:43.519732+07	20250131120038_penambahan_database_partnumber_baru	\N	\N	2025-04-30 16:16:43.506091+07	1
581263b2-e0e5-45e1-aa77-809c3d364de7	351db18b9fe48292b9eabf019b3967cafbf39188e89ec596849319bdb36f0b75	2025-04-30 16:16:43.535322+07	20250202175732_logging_partnumber	\N	\N	2025-04-30 16:16:43.5326+07	1
a2ed5dcd-864e-4589-aeb6-b518cf848ceb	a00658466c9ba9b5e683b1a46b4141661042f88afa5701b5e83d74a9884eb8ca	2025-04-30 16:16:43.620449+07	20250213100350_dealerid_price_null	\N	\N	2025-04-30 16:16:43.616677+07	1
f71eb51f-816a-4ad6-ab64-29a3bee562fd	88ec900f1d055f92c1f2b94731c4bc0e527893dcb349461a144d39d4af0f7953	2025-04-30 16:16:43.539805+07	20250203031306_opsional_partnumber_product	\N	\N	2025-04-30 16:16:43.536341+07	1
ab99b0b1-a9c2-4d62-b8c4-5c4078464f05	0bb9a5b01ea85d6f04ae326628cd7327ea7a1c59072e64770e7f506de811ddf9	2025-04-30 16:16:43.58784+07	20250210184456_dealersales	\N	\N	2025-04-30 16:16:43.581086+07	1
59e5836f-218a-47b6-9453-5a14db581b55	516ff1f7e79aa633a9dcd1cbd42d5920facbdbb8bf29263b74b8b21be7ec7240	2025-04-30 16:16:43.565408+07	20250206183224_change_nama_productreal_itemcode	\N	\N	2025-04-30 16:16:43.540443+07	1
95191149-6ff9-412e-b475-3cf80ab79dbb	95ccbf32ac76bb3178fdcab68a46c13beeefea3c8c221de25ad09a864e8049fe	2025-04-30 16:16:43.568645+07	20250206185039_d	\N	\N	2025-04-30 16:16:43.566378+07	1
37519ea8-4608-458b-ad9e-5161641066a7	30b85a188b67f20c2c46278e68d6bf989d653925202e6bbb7c023f7f5e67a7fe	2025-04-30 16:16:43.600448+07	20250210200446_penyatuan_dealer_sales	\N	\N	2025-04-30 16:16:43.588389+07	1
97e422ac-88d8-49d1-8fed-9fe3189cc79c	c9d25163b3638e617a7e0a785697c6519d06a7fc0e7615ea86bcd18825e66222	2025-04-30 16:16:43.623234+07	20250214183607_company_name_must	\N	\N	2025-04-30 16:16:43.621074+07	1
fbc1c010-bb46-4bda-a88a-5e612eb11fa4	a12531b2773e70f5ed1a16407d6fa537d967848da2574ca5a285b50a34f0eb75	2025-04-30 16:16:43.60942+07	20250212031900_relasi_dealer_price	\N	\N	2025-04-30 16:16:43.601593+07	1
1b6da072-250b-48a0-8512-9befc73b7d98	91320ef95e76e6a786d612e66715001722ef861102d127e4fd70fde4a248e626	2025-04-30 16:16:43.615745+07	20250213071300_pricecategory_dealer	\N	\N	2025-04-30 16:16:43.610086+07	1
836cdd2c-846f-4d6d-8a61-1773069b5d4b	5b97be3f95ac3f2e2b8a162f0da4e98f4358e0725088acb56b32126fcccbb94f	2025-04-30 16:16:43.659053+07	20250217151438_dealer_fix	\N	\N	2025-04-30 16:16:43.657085+07	1
eb82645f-4662-4b8f-bd0a-1aad6c3af8e0	41205989b08ffc0791a9d24beec77cfba5cef0480c02ed105e1639351105db15	2025-04-30 16:16:43.629546+07	20250216080437_relation_salesorder	\N	\N	2025-04-30 16:16:43.623772+07	1
9d05ab6a-a414-4f2b-8ed7-15bc5a4dae56	91127298ef0613d7a9a8c8080cdd9d8a65d4335bb5e1d7092a969fa8cfa54c70	2025-04-30 16:16:43.656291+07	20250216180417_salescategory_fix_2	\N	\N	2025-04-30 16:16:43.654225+07	1
f8f2ef8c-3a91-4537-8e91-b4d738ac89e7	f064743393f8337b1b3148fa2b8538845f75b2bfdb6f7c1cdab57f06639c6af3	2025-04-30 16:16:43.650303+07	20250216171905_emailsalesorder	\N	\N	2025-04-30 16:16:43.647875+07	1
c3544d0f-491e-48bd-a440-dcf0ae8c33e8	8834bb5cc8018e60b667516d2b5b1871ef9c516d4972e2b6e5840d381f7c0693	2025-04-30 16:16:43.653663+07	20250216180150_salescategory_fix	\N	\N	2025-04-30 16:16:43.651256+07	1
5b0edd12-a5c4-4cd1-9415-a60dc459238e	58586d9a97118f0615065eeddc765ce776c243bc4efc32de6fad7123d070db96	2025-04-30 16:16:43.665836+07	20250217161110_userdealer_fix	\N	\N	2025-04-30 16:16:43.659568+07	1
eb5e386e-0572-41a5-8024-1c97a478c0e9	bf2458d393e70a353826b73ef188e24060bb10a7f741777e8eeb175fbd94097e	2025-04-30 16:16:43.674016+07	20250218180139_user_cart	\N	\N	2025-04-30 16:16:43.666506+07	1
a6d4a0f4-85c1-46ac-b9f0-c3a45db1cb70	babeea6a1000c377e22b2958a2ff02f6675f28159e712376506bf941fbb264e0	2025-04-30 16:16:43.715844+07	20250224095331_itemcode_image	\N	\N	2025-04-30 16:16:43.674532+07	1
845236b3-7318-4e5f-8960-e8831f012f69	f1d4a012cbf7fc8caf9c335716e2dc42801eb672a6e0cb1b9295b9e26a8c5d03	2025-04-30 16:16:43.724045+07	20250308161405_emailtemplate	\N	\N	2025-04-30 16:16:43.717149+07	1
0373f4b6-bd99-424e-9ad2-6b4066d8cb8e	6e40b1f91e8e566bb5863cf855d01fb8ea3a85f1daf31b722c3ca905e78a4d9d	2025-04-30 16:16:43.738402+07	20250309153756_file_salesorder	\N	\N	2025-04-30 16:16:43.724887+07	1
d4942d6d-e0b8-4368-af0d-2bd495bf70d6	2c5f876c4a2c9e4871577f9f1cb93d0fe27ce95ae39ce78fb673158b25458d86	2025-04-30 16:16:43.833803+07	20250427064624_hhhhh	\N	\N	2025-04-30 16:16:43.830873+07	1
063e2db4-9a9d-48fe-b5e5-5dcb3dfb686c	f5f2c2e574a80d0699e220f89465aef7658e71d98bd6d4913671cb479c13e0dc	2025-04-30 16:16:43.741985+07	20250310121757_alias_product_and_partnumber	\N	\N	2025-04-30 16:16:43.739125+07	1
273d4108-d198-41ef-a4a8-27b492a4f4c9	75ac75646839ce0a63f8f0141a2e4d26a2285252c4c81a5b7fe010a35a101b54	2025-04-30 16:16:43.744693+07	20250310132804_finalprice_salesorder	\N	\N	2025-04-30 16:16:43.742516+07	1
bce1cf9b-a86f-470b-a201-c03e7be63d1d	61744d83f7e104d301ee58ed9a1bf306d8cf51bddc8fc8cf60d59a30b9d98aa0	2025-04-30 16:16:43.747817+07	20250312084749_price_grosir	\N	\N	2025-04-30 16:16:43.745247+07	1
fffd337a-a7a9-437b-9ca6-39f79b0e7404	1536adafbc3a69674eaf6000ece5696463f06858cf9f15af01c032899fcf3c44	2025-04-30 16:16:43.837943+07	20250429153703_salesorderwarehouse	\N	\N	2025-04-30 16:16:43.834692+07	1
47223569-fea5-4fe8-8d44-e5646b27ac61	a0250aa428ea383f970933da8816f0a3ccd5faeacdd82dd51e562c76eac1d206	2025-04-30 16:16:43.756412+07	20250312091556_wholesaleprice	\N	\N	2025-04-30 16:16:43.748665+07	1
091b264d-f0a4-4186-a8e6-02a715e4020f	f1291e0adbc0757ae2fcb1f89244affbc964354588ac30716ecea757f38327be	2025-04-30 16:16:43.75913+07	20250312093827_wholesaleprice	\N	\N	2025-04-30 16:16:43.756984+07	1
d228199f-675b-4135-8d6e-20f55876e5bb	7e84c933f2c86f31a8591f57c93e36185e6f09389c64558959a037250d07de9f	2025-05-01 00:07:24.546519+07	20250430170724_stock	\N	\N	2025-05-01 00:07:24.530509+07	1
713213b1-05b7-486e-aace-2cee2f24d9b3	268d28a28cb0241ed684b773da8e2604a0a53c075969747c9d35ace8185c86ec	2025-04-30 16:16:43.761742+07	20250312120843_pricegrosir_normalisaasi	\N	\N	2025-04-30 16:16:43.759871+07	1
a664b6b2-b553-4801-aade-21e1b942c843	8740c17334a7003d1d7469c05227a040fa094a5bb30fdb5c50087ba2e78719c5	2025-04-30 16:16:43.84317+07	20250430041821_stock_status	\N	\N	2025-04-30 16:16:43.838785+07	1
fcb90bee-9de4-4b54-b83d-a93dab33357e	414be6210e0b643cd400353b30a4b135223d7103bf66f86077add4eab965bad2	2025-04-30 16:16:43.776801+07	20250415033458_produk_excel	\N	\N	2025-04-30 16:16:43.76228+07	1
69b26fa0-6bc1-4c5e-823b-8709a18119d2	cb0f2a9ca8502f0a9e3a2ff0e0b999ec15014d5acc540d7323aa16f05f94b819	2025-04-30 16:16:43.795129+07	20250426172411_stock	\N	\N	2025-04-30 16:16:43.777587+07	1
db61b996-9c88-43e8-ab40-f6fe06a360b0	fd5c18af8080abf5d5764732fdd1fe8dc3be250264c05d96085d69cbc6634756	2025-04-30 16:16:43.798122+07	20250426173457_k	\N	\N	2025-04-30 16:16:43.795913+07	1
c641f62c-93df-423c-b782-d77984b03c44	f1ba6ffe1670d29f569a3d02ee7c3e63d128ee3119d44e0a9b9dc7259fc16ea7	2025-04-30 16:16:43.848415+07	20250430043518_enum	\N	\N	2025-04-30 16:16:43.843933+07	1
3a02015c-5e8d-46ce-b2c6-857f15db8b06	b99bb3b252aeac4d8807fc5233014529ac92f903339153ac19101cd8782da557	2025-04-30 16:16:43.801727+07	20250426174000_min_order	\N	\N	2025-04-30 16:16:43.79887+07	1
cfb519e3-c347-4132-bbed-8217aca214e3	112e523183127c9f26088355ec94fab3e471b79e2ce14751f4f32225109a0035	2025-04-30 16:16:43.824661+07	20250427035621_warehouse	\N	\N	2025-04-30 16:16:43.802754+07	1
0eaad4b9-0f5d-4e73-ab2c-3f04086dc004	09c86a278b3756d0bf0f13d5b78fe284b5bc7181cdfc357d27886a621f79b5c9	2025-05-09 12:33:10.772862+07	20250509053310_hhh_sales_category_gone	\N	\N	2025-05-09 12:33:10.755423+07	1
ebc53aa2-8222-4dc7-88ae-596067b6aaa2	71d3c13b8892e15d4267e0a540944762fde064ada630ec4603ccbf661b2d6a67	2025-04-30 16:16:43.82763+07	20250427040438_gggggggg	\N	\N	2025-04-30 16:16:43.825467+07	1
7ccdbd2f-81e6-402e-b659-c98c5e74da01	5312fc11c77e64eef3201d4476dad33bc69962315de98bb7c990fb4fc8f2c347	2025-04-30 16:16:43.859172+07	20250430065851_tax	\N	\N	2025-04-30 16:16:43.849325+07	1
712a8607-6807-426c-a6fe-08b9ebe3c188	02c3d012e9823dbc32a317b9b725f1f6b3fb0c209c896232bd33f6addca44063	2025-04-30 16:16:43.830206+07	20250427042844_businessunit	\N	\N	2025-04-30 16:16:43.828141+07	1
21cef349-90be-4730-b566-d37037bebfbf	4abcfb4da3f5b66b2482397cc53475f300e0e4c2bbed44744c9aff1a8e106629	2025-05-01 17:13:59.464782+07	20250501101359_storecode_absolute	\N	\N	2025-05-01 17:13:59.457841+07	1
9fcdb1b8-5759-482e-98db-72e9b44cfc68	996e77bab829d67887fcbf97615371d92b8e97e3889d3a90c6376a9be74145e3	2025-04-30 16:16:43.862584+07	20250430071204_status_salesorder	\N	\N	2025-04-30 16:16:43.859786+07	1
a12fced0-6074-473a-898c-d4095330e6d0	90fe9f2a843dfb4329411c3139c91960c1e399d89552455a0172e9b7a6b928d6	2025-05-05 12:15:35.993911+07	20250505051535_email	\N	\N	2025-05-05 12:15:35.970056+07	1
821a0cf4-b5e4-4c3e-b1dc-702f29ff3ea7	1906b30563e435184df12b193a3d1fce64a93697b3975bb75ee8a24e2c112780	2025-04-30 16:16:43.86567+07	20250430085207_warehousestock	\N	\N	2025-04-30 16:16:43.863102+07	1
a7043af9-da99-4604-a6cd-def7b9f6f9cb	acd31c2a726f88eb0615e582532372ed73349919b352d513e8cbe55a806c7949	2025-05-04 14:18:06.874112+07	20250504071806_email	\N	\N	2025-05-04 14:18:06.841412+07	1
67df85fc-44db-4876-9f95-2f2d17516db5	5fd8d4ca38ab8b70ced94b8382dca58bba1b3723d29eeb6b6a412da69a389044	2025-04-30 16:16:43.87013+07	20250430091258_add_itemcodeid_to_stockhistory	\N	\N	2025-04-30 16:16:43.866434+07	1
ac8bc451-63b2-4fab-9928-0a1637738632	f622787cd2f70e67be7ab7fe03f366577fc4571d12a5c16c47b27faab0ec9140	2025-04-30 21:53:20.13057+07	20250430145320_int_float	\N	\N	2025-04-30 21:53:20.093173+07	1
f38266c4-8cdd-4966-8da2-a7b8253378a5	39b91a6c1b3c88d493d88a328983e68550057184a5e589a42eeffeb3f639487f	2025-05-04 16:11:08.736034+07	20250504091108_role	\N	\N	2025-05-04 16:11:08.681535+07	1
320b1c2c-ba0b-451b-b6d4-2e680a6ba30c	244785a5c73a1a75c9efc158c9a05f701905907335306c197613aaa38e8eece4	2025-05-04 18:41:53.282446+07	20250504114153_forgot_password	\N	\N	2025-05-04 18:41:53.23057+07	1
5ed544d8-e92f-40c3-bfb6-0cefbbbedb0a	a0b193d0ca8d89103360e35c7890bd21528eb9ed6d27d3f747a6c97cd361cba5	2025-05-05 12:34:08.251975+07	20250505053408_stock_history	\N	\N	2025-05-05 12:34:08.206249+07	1
eb726ae4-ee49-46be-a7b2-cbe76df65dd2	e2a68291068d03aa972df91afad90e3ebed41b18c35a75a18becadd9dfcf0f15	2025-05-05 11:57:45.670175+07	20250505045745_email	\N	\N	2025-05-05 11:57:45.654014+07	1
5bed2eb6-a737-4646-aef9-fddfc39beba7	6b4ccb2b5e57e7dc5772d1a718516a153eb26c7dfa4c9ef4f775baa551452152	2025-05-08 16:17:54.815189+07	20250508091754_emailsalesorderecipient	\N	\N	2025-05-08 16:17:54.80235+07	1
61a496ec-93a1-4804-b2af-c4c2f558c672	a1032c7627e68fadcade0591ad613f6066a7ec23844e9d6a2298fe4650dc7423	2025-05-20 10:31:47.880541+07	20250520033147_djjdjd	\N	\N	2025-05-20 10:31:47.876004+07	1
9a829d45-31b1-4eaf-8237-8f586c0f430c	4a62dee5ff7b197991b2899d4b74b1ae267d52afdd95542196ffca36d0a9212b	2025-05-09 13:39:58.08469+07	20250509063958_dealer_warehouse	\N	\N	2025-05-09 13:39:58.048249+07	1
c460414c-ade3-4d38-99b1-09ebf29a8aa0	8ef9aed087e71a7220fa4e6931af0c548116cb3440e050361434a9dcf14ee2e4	2025-05-20 10:26:44.809062+07	20250520032644_ga_penting	\N	\N	2025-05-20 10:26:44.796957+07	1
bfa78120-3096-4bbd-8f03-b137b9c110ec	203ea5c41ffad9d18078fce70925d1212f8f2403a00eb6a4f8d6c30785630dd9	2025-05-10 02:37:18.220174+07	20250509193718_menu	\N	\N	2025-05-10 02:37:18.200275+07	1
09c7c672-310b-4c07-9a34-43da52805298	695b7c23c136c9cc35accc702db68c138179f25258cc43593569cab60a2ccafb	2025-05-24 20:27:49.885955+07	20250524132749_stock_admin	\N	\N	2025-05-24 20:27:49.858086+07	1
\.


--
-- Name: AdminForgotPasswordRequest_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminForgotPasswordRequest_Id_seq"', 1, false);


--
-- Name: AdminRole_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminRole_Id_seq"', 1, true);


--
-- Name: AdminSession_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."AdminSession_Id_seq"', 82, true);


--
-- Name: Admin_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Admin_Id_seq"', 4, true);


--
-- Name: CartItem_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."CartItem_Id_seq"', 63, true);


--
-- Name: Cart_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Cart_Id_seq"', 36, true);


--
-- Name: DealerWarehouse_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."DealerWarehouse_Id_seq"', 14, true);


--
-- Name: Dealer_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Dealer_Id_seq"', 11, true);


--
-- Name: EmailConfig_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailConfig_Id_seq"', 1, true);


--
-- Name: EmailSalesOrderRecipient_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailSalesOrderRecipient_Id_seq"', 5, true);


--
-- Name: EmailSalesOrder_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailSalesOrder_Id_seq"', 81, true);


--
-- Name: EmailTemplate_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."EmailTemplate_Id_seq"', 3, true);


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

SELECT pg_catalog.setval('public."ItemCode_Id_seq"', 20, true);


--
-- Name: Menu_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Menu_Id_seq"', 1, false);


--
-- Name: PartNumber_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."PartNumber_Id_seq"', 15, true);


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

SELECT pg_catalog.setval('public."Price_Id_seq"', 28, true);


--
-- Name: ProductBrand_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductBrand_Id_seq"', 1, false);


--
-- Name: ProductCategoryImage_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductCategoryImage_Id_seq"', 3, true);


--
-- Name: ProductCategory_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductCategory_Id_seq"', 18, true);


--
-- Name: ProductImage_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."ProductImage_Id_seq"', 3, true);


--
-- Name: Product_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Product_Id_seq"', 54, true);


--
-- Name: RoleMenuAccess_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."RoleMenuAccess_Id_seq"', 1, false);


--
-- Name: SalesOrderDetail_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."SalesOrderDetail_Id_seq"', 61, true);


--
-- Name: SalesOrderFile_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."SalesOrderFile_Id_seq"', 13, true);


--
-- Name: SalesOrder_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."SalesOrder_Id_seq"', 18, true);


--
-- Name: Sales_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Sales_Id_seq"', 4, true);


--
-- Name: Tax_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Tax_Id_seq"', 2, true);


--
-- Name: UserForgotPasswordRequest_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."UserForgotPasswordRequest_Id_seq"', 17, true);


--
-- Name: UserSession_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."UserSession_Id_seq"', 40, true);


--
-- Name: User_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."User_Id_seq"', 2, true);


--
-- Name: WarehouseStock_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."WarehouseStock_Id_seq"', 46, true);


--
-- Name: Warehouse_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."Warehouse_Id_seq"', 4, true);


--
-- Name: WholesalePrice_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: shobuki
--

SELECT pg_catalog.setval('public."WholesalePrice_Id_seq"', 8, true);


--
-- Name: AdminForgotPasswordRequest AdminForgotPasswordRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: shobuki
--

ALTER TABLE ONLY public."AdminForgotPasswordRequest"
    ADD CONSTRAINT "AdminForgotPasswordRequest_pkey" PRIMARY KEY ("Id");


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
-- Name: RoleMenuAccess_RoleId_MenuId_key; Type: INDEX; Schema: public; Owner: shobuki
--

CREATE UNIQUE INDEX "RoleMenuAccess_RoleId_MenuId_key" ON public."RoleMenuAccess" USING btree ("RoleId", "MenuId");


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

