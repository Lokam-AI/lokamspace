--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Homebrew)

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: audio_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audio_file (
    id integer NOT NULL,
    call_id integer NOT NULL,
    file_path text NOT NULL,
    file_format character varying(10),
    duration_sec integer,
    file_size_bytes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audio_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audio_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audio_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audio_file_id_seq OWNED BY public.audio_file.id;


--
-- Name: audio_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audio_files (
    id integer NOT NULL,
    call_id integer NOT NULL,
    file_path text NOT NULL,
    file_format character varying(10),
    duration_sec integer,
    file_size_bytes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audio_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audio_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audio_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audio_files_id_seq OWNED BY public.audio_files.id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    user_id integer NOT NULL,
    entity character varying(50) NOT NULL,
    entity_id character varying(50) NOT NULL,
    action character varying(10) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    old_value jsonb,
    new_value jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: booking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    campaign_id integer,
    scheduled_time timestamp with time zone NOT NULL,
    status character varying(20) NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: booking_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.booking_id_seq OWNED BY public.booking.id;


--
-- Name: call; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.call (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    service_record_id integer,
    campaign_id integer,
    agent_id integer,
    customer_number character varying(20) NOT NULL,
    direction character varying(10) NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration_sec integer,
    status character varying(20) NOT NULL,
    recording_url text,
    nps_score integer,
    call_reason character varying(100),
    feedback_summary text,
    is_demo boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: call_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.call_feedback (
    id integer NOT NULL,
    call_id integer NOT NULL,
    content text NOT NULL,
    detractors text,
    positives text,
    action_items text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone
);


--
-- Name: call_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.call_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: call_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.call_feedback_id_seq OWNED BY public.call_feedback.id;


--
-- Name: call_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.call_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: call_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.call_id_seq OWNED BY public.call.id;


--
-- Name: calls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calls (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    service_record_id integer,
    campaign_id integer,
    agent_id integer,
    customer_number character varying(20) NOT NULL,
    direction character varying(10) NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration_sec integer,
    status character varying(20) NOT NULL,
    recording_url text,
    nps_score integer,
    call_reason character varying(100),
    feedback_summary text,
    is_demo boolean NOT NULL,
    call_ended_at timestamp with time zone,
    cost double precision,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calls_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.calls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: calls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.calls_id_seq OWNED BY public.calls.id;


--
-- Name: campaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    organization_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: campaign_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.campaign_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: campaign_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.campaign_id_seq OWNED BY public.campaign.id;


--
-- Name: d_m_s_integration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_m_s_integration (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    config jsonb NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    timeout_seconds integer
);


--
-- Name: d_m_s_integration_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_m_s_integration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_m_s_integration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_m_s_integration_id_seq OWNED BY public.d_m_s_integration.id;


--
-- Name: inquiry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    customer_name character varying(100) NOT NULL,
    email character varying(150),
    phone character varying(20),
    message text NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    topic character varying(100)
);


--
-- Name: inquiry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inquiry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inquiry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inquiry_id_seq OWNED BY public.inquiry.id;


--
-- Name: k_p_i; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_p_i (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    description text,
    target_value numeric(12,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: k_p_i_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_p_i_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_p_i_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_p_i_id_seq OWNED BY public.k_p_i.id;


--
-- Name: knowledge_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knowledge_file (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size integer NOT NULL,
    file_type character varying(50) NOT NULL,
    description text,
    uploaded_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: knowledge_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knowledge_file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knowledge_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knowledge_file_id_seq OWNED BY public.knowledge_file.id;


--
-- Name: organization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_feedback character varying(20),
    description text,
    location text,
    call_concurrency_limit integer NOT NULL,
    service_types character varying(255)[],
    focus_areas character varying(255)[],
    hipaa_compliant boolean NOT NULL,
    pci_compliant boolean NOT NULL,
    plan_id integer,
    credit_balance numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_booking character varying(20),
    phone_inquiry character varying(20),
    location_city character varying(255),
    location_value character varying(100),
    service_center_description text
);


--
-- Name: payment_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_history (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    plan_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_date timestamp with time zone DEFAULT now() NOT NULL,
    method character varying(50),
    status character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payment_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payment_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payment_history_id_seq OWNED BY public.payment_history.id;


--
-- Name: plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(12,2) NOT NULL,
    description text,
    credit_limit numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: plan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.plan_id_seq OWNED BY public.plan.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: schedule_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_config (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    campaign_id integer,
    config_json jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schedule_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schedule_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schedule_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schedule_config_id_seq OWNED BY public.schedule_config.id;


--
-- Name: service_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_record (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    campaign_id integer,
    customer_name character varying(100) NOT NULL,
    customer_phone character varying(20) NOT NULL,
    vehicle_info character varying(100),
    service_type character varying(50),
    status character varying(20) NOT NULL,
    appointment_date timestamp with time zone,
    feedback text,
    rating smallint,
    created_by integer,
    modified_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    service_advisor_id integer,
    service_advisor_name character varying(100),
    overall_feedback text,
    positive_mentions character varying[],
    areas_to_improve character varying[],
    is_demo boolean DEFAULT false NOT NULL,
    recording_url character varying(255),
    nps_score double precision,
    summary text,
    duration_sec integer
);


--
-- Name: service_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_record_id_seq OWNED BY public.service_record.id;


--
-- Name: setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.setting (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category character varying(50) DEFAULT 'general'::character varying NOT NULL,
    description text
);


--
-- Name: setting_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.setting_id_seq OWNED BY public.setting.id;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag (
    id integer NOT NULL,
    organization_id uuid NOT NULL,
    name character varying(50) NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tag_id_seq OWNED BY public.tag.id;


--
-- Name: transcript; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transcript (
    id integer NOT NULL,
    call_id integer NOT NULL,
    role character varying(20) NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transcript_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transcript_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transcript_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transcript_id_seq OWNED BY public.transcript.id;


--
-- Name: transcripts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transcripts (
    id integer NOT NULL,
    call_id integer NOT NULL,
    role character varying(50) NOT NULL,
    message text NOT NULL,
    "time" double precision,
    end_time double precision,
    duration double precision,
    created_at timestamp without time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: transcripts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transcripts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transcripts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transcripts_id_seq OWNED BY public.transcripts.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    organization_id uuid NOT NULL,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: audio_file id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_file ALTER COLUMN id SET DEFAULT nextval('public.audio_file_id_seq'::regclass);


--
-- Name: audio_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_files ALTER COLUMN id SET DEFAULT nextval('public.audio_files_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: booking id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking ALTER COLUMN id SET DEFAULT nextval('public.booking_id_seq'::regclass);


--
-- Name: call id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call ALTER COLUMN id SET DEFAULT nextval('public.call_id_seq'::regclass);


--
-- Name: call_feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_feedback ALTER COLUMN id SET DEFAULT nextval('public.call_feedback_id_seq'::regclass);


--
-- Name: calls id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls ALTER COLUMN id SET DEFAULT nextval('public.calls_id_seq'::regclass);


--
-- Name: campaign id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign ALTER COLUMN id SET DEFAULT nextval('public.campaign_id_seq'::regclass);


--
-- Name: d_m_s_integration id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_m_s_integration ALTER COLUMN id SET DEFAULT nextval('public.d_m_s_integration_id_seq'::regclass);


--
-- Name: inquiry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry ALTER COLUMN id SET DEFAULT nextval('public.inquiry_id_seq'::regclass);


--
-- Name: k_p_i id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_p_i ALTER COLUMN id SET DEFAULT nextval('public.k_p_i_id_seq'::regclass);


--
-- Name: knowledge_file id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_file ALTER COLUMN id SET DEFAULT nextval('public.knowledge_file_id_seq'::regclass);


--
-- Name: payment_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history ALTER COLUMN id SET DEFAULT nextval('public.payment_history_id_seq'::regclass);


--
-- Name: plan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan ALTER COLUMN id SET DEFAULT nextval('public.plan_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: schedule_config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_config ALTER COLUMN id SET DEFAULT nextval('public.schedule_config_id_seq'::regclass);


--
-- Name: service_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record ALTER COLUMN id SET DEFAULT nextval('public.service_record_id_seq'::regclass);


--
-- Name: setting id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting ALTER COLUMN id SET DEFAULT nextval('public.setting_id_seq'::regclass);


--
-- Name: tag id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag ALTER COLUMN id SET DEFAULT nextval('public.tag_id_seq'::regclass);


--
-- Name: transcript id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcript ALTER COLUMN id SET DEFAULT nextval('public.transcript_id_seq'::regclass);


--
-- Name: transcripts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcripts ALTER COLUMN id SET DEFAULT nextval('public.transcripts_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: audio_file audio_file_call_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_file
    ADD CONSTRAINT audio_file_call_id_key UNIQUE (call_id);


--
-- Name: audio_file audio_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_file
    ADD CONSTRAINT audio_file_pkey PRIMARY KEY (id);


--
-- Name: audio_files audio_files_call_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_files
    ADD CONSTRAINT audio_files_call_id_key UNIQUE (call_id);


--
-- Name: audio_files audio_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_files
    ADD CONSTRAINT audio_files_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (id);


--
-- Name: call_feedback call_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_feedback
    ADD CONSTRAINT call_feedback_pkey PRIMARY KEY (id);


--
-- Name: call call_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_pkey PRIMARY KEY (id);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: campaign campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign
    ADD CONSTRAINT campaign_pkey PRIMARY KEY (id);


--
-- Name: d_m_s_integration d_m_s_integration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_m_s_integration
    ADD CONSTRAINT d_m_s_integration_pkey PRIMARY KEY (id);


--
-- Name: inquiry inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT inquiry_pkey PRIMARY KEY (id);


--
-- Name: k_p_i k_p_i_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_p_i
    ADD CONSTRAINT k_p_i_pkey PRIMARY KEY (id);


--
-- Name: knowledge_file knowledge_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_file
    ADD CONSTRAINT knowledge_file_pkey PRIMARY KEY (id);


--
-- Name: organization organization_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_email_key UNIQUE (email);


--
-- Name: organization organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_id_key UNIQUE (id);


--
-- Name: organization organization_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_name_key UNIQUE (name);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (id);


--
-- Name: plan plan_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_name_key UNIQUE (name);


--
-- Name: plan plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan
    ADD CONSTRAINT plan_pkey PRIMARY KEY (id);


--
-- Name: role role_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_name_key UNIQUE (name);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: schedule_config schedule_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_config
    ADD CONSTRAINT schedule_config_pkey PRIMARY KEY (id);


--
-- Name: service_record service_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record
    ADD CONSTRAINT service_record_pkey PRIMARY KEY (id);


--
-- Name: setting setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT setting_pkey PRIMARY KEY (id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: transcript transcript_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcript
    ADD CONSTRAINT transcript_pkey PRIMARY KEY (id);


--
-- Name: transcripts transcripts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcripts
    ADD CONSTRAINT transcripts_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: ix_call_feedback_call_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_call_feedback_call_id ON public.call_feedback USING btree (call_id);


--
-- Name: ix_transcripts_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_transcripts_id ON public.transcripts USING btree (id);


--
-- Name: audio_file audio_file_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_file
    ADD CONSTRAINT audio_file_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(id);


--
-- Name: audio_files audio_files_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audio_files
    ADD CONSTRAINT audio_files_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id);


--
-- Name: audit_log audit_log_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: audit_log audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: booking booking_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaign(id);


--
-- Name: booking booking_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);


--
-- Name: booking booking_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public."user"(id);


--
-- Name: booking booking_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: call call_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public."user"(id);


--
-- Name: call call_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaign(id);


--
-- Name: call_feedback call_feedback_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_feedback
    ADD CONSTRAINT call_feedback_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(id) ON DELETE CASCADE;


--
-- Name: call call_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: call call_service_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call
    ADD CONSTRAINT call_service_record_id_fkey FOREIGN KEY (service_record_id) REFERENCES public.service_record(id);


--
-- Name: calls calls_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public."user"(id);


--
-- Name: calls calls_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaign(id);


--
-- Name: calls calls_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: calls calls_service_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_service_record_id_fkey FOREIGN KEY (service_record_id) REFERENCES public.service_record(id);


--
-- Name: campaign campaign_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign
    ADD CONSTRAINT campaign_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);


--
-- Name: campaign campaign_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign
    ADD CONSTRAINT campaign_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public."user"(id);


--
-- Name: campaign campaign_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign
    ADD CONSTRAINT campaign_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: d_m_s_integration d_m_s_integration_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_m_s_integration
    ADD CONSTRAINT d_m_s_integration_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: inquiry inquiry_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry
    ADD CONSTRAINT inquiry_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: k_p_i k_p_i_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_p_i
    ADD CONSTRAINT k_p_i_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: knowledge_file knowledge_file_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_file
    ADD CONSTRAINT knowledge_file_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: knowledge_file knowledge_file_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knowledge_file
    ADD CONSTRAINT knowledge_file_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public."user"(id);


--
-- Name: organization organization_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plan(id);


--
-- Name: payment_history payment_history_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: payment_history payment_history_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plan(id);


--
-- Name: payment_history payment_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);


--
-- Name: schedule_config schedule_config_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_config
    ADD CONSTRAINT schedule_config_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaign(id);


--
-- Name: schedule_config schedule_config_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_config
    ADD CONSTRAINT schedule_config_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: service_record service_record_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record
    ADD CONSTRAINT service_record_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaign(id);


--
-- Name: service_record service_record_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record
    ADD CONSTRAINT service_record_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);


--
-- Name: service_record service_record_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record
    ADD CONSTRAINT service_record_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public."user"(id);


--
-- Name: service_record service_record_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record
    ADD CONSTRAINT service_record_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: service_record service_record_service_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_record
    ADD CONSTRAINT service_record_service_advisor_id_fkey FOREIGN KEY (service_advisor_id) REFERENCES public."user"(id);


--
-- Name: setting setting_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT setting_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: tag tag_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);


--
-- Name: tag tag_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- Name: transcript transcript_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcript
    ADD CONSTRAINT transcript_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.call(id);


--
-- Name: transcripts transcripts_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transcripts
    ADD CONSTRAINT transcripts_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE;


--
-- Name: user user_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organization(id);


--
-- PostgreSQL database dump complete
--

