--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17rc1

-- ./pg_dump --schema-only --schema=public {POSTGRES_URL} > ~/schema.db

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.attachments (
    id bigint NOT NULL,
    name character varying(255),
    link character varying(1000),
    type character varying(255)
);


ALTER TABLE public.attachments OWNER TO "default";

--
-- Name: channels; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.channels (
    id bigint NOT NULL,
    name character varying(32),
    colour bigint
);


ALTER TABLE public.channels OWNER TO "default";

--
-- Name: messages; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.messages (
    authorname character varying(40),
    authorimage character varying(128),
    content character varying(4000),
    channel character varying(256),
    "time" character varying(10),
    uuid character varying(64) NOT NULL,
    guildid bigint,
    userid character varying(255),
    attachments character varying(4000),
    edited boolean
);


ALTER TABLE public.messages OWNER TO "default";

--
-- Name: roles; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(32),
    colour bigint
);


ALTER TABLE public.roles OWNER TO "default";

--
-- Name: users; Type: TABLE; Schema: public; Owner: default
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(32),
    colour bigint
);


ALTER TABLE public.users OWNER TO "default";

--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (uuid);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: default
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

