-- Estrutura das tabelas usadas pelo CineMarvel, sem dados de usuários.
-- Execute em um banco vazio. A tabela sessoes é criada pelo connect-pg-simple.
BEGIN;
SET LOCAL search_path TO public;

CREATE TABLE usuarios (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    nome varchar(100) NOT NULL,
    email varchar(255) NOT NULL,
    senha_hash text NOT NULL,
    papel varchar(20) DEFAULT 'usuario' NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    criado_em timestamptz DEFAULT now() NOT NULL,
    atualizado_em timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT usuarios_papel_check CHECK (((papel)::text = ANY ((ARRAY['usuario'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
);

CREATE TABLE conteudos_catalogo (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    tipo_conteudo varchar(20) NOT NULL,
    tmdb_id bigint NOT NULL,
    titulo varchar(255) NOT NULL,
    sinopse text,
    data_lancamento date,
    poster_path text,
    nota_media numeric(3, 1),
    ativo boolean DEFAULT true NOT NULL,
    criado_por bigint NOT NULL,
    criado_em timestamptz DEFAULT now() NOT NULL,
    atualizado_em timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT conteudos_catalogo_nota_media_check CHECK (((nota_media >= (0)::numeric) AND (nota_media <= (10)::numeric))),
    CONSTRAINT conteudos_catalogo_tipo_conteudo_check CHECK (((tipo_conteudo)::text = ANY ((ARRAY['filme'::character varying, 'serie'::character varying])::text[]))),
    CONSTRAINT conteudos_catalogo_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES usuarios(id),
    CONSTRAINT conteudos_catalogo_pkey PRIMARY KEY (id),
    CONSTRAINT conteudo_tmdb_unico UNIQUE (tipo_conteudo, tmdb_id)
);
CREATE INDEX idx_catalogo_ativo ON public.conteudos_catalogo (ativo);
CREATE INDEX idx_catalogo_tipo ON public.conteudos_catalogo (tipo_conteudo);
CREATE INDEX idx_catalogo_titulo ON public.conteudos_catalogo (titulo);

CREATE TABLE midias (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    titulo varchar(255) NOT NULL,
    descricao text,
    google_drive_file_id text NOT NULL,
    imagem_url text,
    ativo boolean DEFAULT true NOT NULL,
    criado_por bigint NOT NULL,
    criado_em timestamptz DEFAULT now() NOT NULL,
    atualizado_em timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT midias_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES usuarios(id),
    CONSTRAINT midias_pkey PRIMARY KEY (id),
    CONSTRAINT midias_google_drive_file_id_key UNIQUE (google_drive_file_id)
);
CREATE INDEX idx_midias_ativo ON public.midias (ativo);

CREATE TABLE conteudo_midias (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    conteudo_id bigint NOT NULL,
    midia_id bigint NOT NULL,
    criado_em timestamptz DEFAULT now() NOT NULL,
    ordem integer DEFAULT 1 NOT NULL,
    temporada integer,
    episodio integer,
    CONSTRAINT conteudo_midias_ordem_check CHECK ((ordem >= 1)),
    CONSTRAINT conteudo_midias_temporada_episodio_check CHECK ((((temporada IS NULL) AND (episodio IS NULL)) OR ((temporada >= 0) AND (episodio >= 1)))),
    CONSTRAINT conteudo_midias_conteudo_fkey FOREIGN KEY (conteudo_id) REFERENCES conteudos_catalogo(id) ON DELETE CASCADE,
    CONSTRAINT conteudo_midias_midia_fkey FOREIGN KEY (midia_id) REFERENCES midias(id) ON DELETE CASCADE,
    CONSTRAINT conteudo_midias_pkey PRIMARY KEY (id),
    CONSTRAINT conteudo_midias_midia_unica UNIQUE (midia_id),
    CONSTRAINT conteudo_midias_unico UNIQUE (conteudo_id, midia_id)
);
CREATE UNIQUE INDEX conteudo_midias_episodio_unico ON public.conteudo_midias (conteudo_id, temporada, episodio) WHERE ((temporada IS NOT NULL) AND (episodio IS NOT NULL));
CREATE INDEX idx_conteudo_midias_midia ON public.conteudo_midias (midia_id);

CREATE TABLE favoritos (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    usuario_id bigint NOT NULL,
    tipo_conteudo varchar(20) NOT NULL,
    conteudo_id text NOT NULL,
    criado_em timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT favoritos_tipo_conteudo_check CHECK (((tipo_conteudo)::text = ANY ((ARRAY['filme'::character varying, 'serie'::character varying, 'video'::character varying])::text[]))),
    CONSTRAINT favoritos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT favoritos_pkey PRIMARY KEY (id),
    CONSTRAINT favorito_unico UNIQUE (usuario_id, tipo_conteudo, conteudo_id)
);
CREATE INDEX idx_favoritos_conteudo ON public.favoritos (tipo_conteudo, conteudo_id);
CREATE INDEX idx_favoritos_usuario ON public.favoritos (usuario_id);

CREATE TABLE comentarios (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    usuario_id bigint NOT NULL,
    tipo_conteudo varchar(20) NOT NULL,
    conteudo_id text NOT NULL,
    texto text NOT NULL,
    status varchar(20) DEFAULT 'aprovado' NOT NULL,
    moderado_por bigint,
    moderado_em timestamptz,
    criado_em timestamptz DEFAULT now() NOT NULL,
    atualizado_em timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT comentarios_status_check CHECK (((status)::text = ANY ((ARRAY['pendente'::character varying, 'aprovado'::character varying, 'oculto'::character varying])::text[]))),
    CONSTRAINT comentarios_texto_check CHECK (((char_length(TRIM(BOTH FROM texto)) >= 1) AND (char_length(TRIM(BOTH FROM texto)) <= 3000))),
    CONSTRAINT comentarios_tipo_conteudo_check CHECK (((tipo_conteudo)::text = ANY ((ARRAY['filme'::character varying, 'serie'::character varying, 'video'::character varying])::text[]))),
    CONSTRAINT comentarios_moderado_por_fkey FOREIGN KEY (moderado_por) REFERENCES usuarios(id),
    CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT comentarios_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_comentarios_conteudo ON public.comentarios (tipo_conteudo, conteudo_id);
CREATE INDEX idx_comentarios_status ON public.comentarios (status);

COMMIT;
