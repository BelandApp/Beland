-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  description text,
  transaction_hash text,
  block_number integer,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT actions_pkey PRIMARY KEY (id),
  CONSTRAINT FK_314aaf9c37b61b0a1267c1f4b59 FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.admins (
  admin_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  assigned_at timestamp with time zone DEFAULT now(),
  content_permission boolean NOT NULL DEFAULT true,
  user_permission boolean NOT NULL DEFAULT true,
  moderation_permission boolean NOT NULL DEFAULT true,
  finance_permission boolean NOT NULL DEFAULT true,
  analytics_permission boolean NOT NULL DEFAULT true,
  settings_permission boolean NOT NULL DEFAULT true,
  leader_management_permission boolean NOT NULL DEFAULT true,
  company_management_permission boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (admin_id),
  CONSTRAINT FK_2b901dd818a2a6486994d915a68 FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.bank_account_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bank_account_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_name text NOT NULL,
  bank_code character varying NOT NULL,
  account_type_id uuid NOT NULL,
  cbu character varying NOT NULL,
  alias text,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bank_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT FK_29146c4a8026c77c712e01d922b FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT FK_799340cb97c2a26cd1814ac90fc FOREIGN KEY (account_type_id) REFERENCES public.bank_account_types(id)
);
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  cart_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT FK_30e89257a105eab7648a35c7fce FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT FK_6385a745d9e12a89b859bb25623 FOREIGN KEY (cart_id) REFERENCES public.carts(id)
);
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE,
  total_amount numeric NOT NULL DEFAULT '0'::numeric,
  total_items integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  address_id uuid,
  group_id uuid,
  group_ip uuid,
  payment_type_id uuid,
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT FK_2ec1c94a977b940d85a4f498aea FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT FK_64d39f6b86964e5ce06f9fecf50 FOREIGN KEY (address_id) REFERENCES public.user_addresses(id),
  CONSTRAINT FK_664193e2d42d1b188a7b3d0b50f FOREIGN KEY (group_ip) REFERENCES public.groups(id),
  CONSTRAINT FK_0b3fe6feaf85c266d9c4005201a FOREIGN KEY (payment_type_id) REFERENCES public.payment_types(id)
);
CREATE TABLE public.charities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  display_name character varying,
  registration_number character varying NOT NULL UNIQUE,
  description text,
  website character varying,
  email character varying NOT NULL,
  phone character varying,
  address character varying,
  logo_url character varying,
  wallet_id uuid UNIQUE,
  user_id uuid NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT charities_pkey PRIMARY KEY (id),
  CONSTRAINT FK_f4d22dadb80086b25c0e12e9b3c FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT FK_67791ce53cb9c75a58496c2a750 FOREIGN KEY (wallet_id) REFERENCES public.wallets(id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  type text NOT NULL,
  value numeric NOT NULL,
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  redeemed_by_user_id uuid,
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT FK_2326117d6ad81572d73c73fcb17 FOREIGN KEY (redeemed_by_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.group_invitations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  group_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  invited_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'PENDING'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT group_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_group_invitations_group FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT fk_group_invitations_sender FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT fk_group_invitations_invited_user FOREIGN KEY (invited_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  role text NOT NULL DEFAULT 'MEMBER'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  group_id uuid,
  user_id uuid,
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT FK_20a555b299f75843aa53ff8b0ee FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT FK_2c840df5db52dc6b4a1b0b69c6e FOREIGN KEY (group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  location text,
  location_url text,
  date_time timestamp with time zone,
  status text NOT NULL DEFAULT 'ACTIVE'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  leader_id uuid NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT FK_fdb67d577cb1623e0d11a3fa6b0 FOREIGN KEY (leader_id) REFERENCES public.users(id)
);
CREATE TABLE public.inventory_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quantity_available integer NOT NULL DEFAULT 0,
  offer_label text,
  promotion_expires_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id uuid NOT NULL,
  CONSTRAINT inventory_items_pkey PRIMARY KEY (id),
  CONSTRAINT FK_8e17955a29e8b63bb8cec3d32c5 FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.merchants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_name character varying NOT NULL,
  legal_name character varying,
  ruc character varying,
  category character varying,
  description text,
  phone character varying,
  email character varying,
  address character varying,
  city character varying,
  province character varying,
  country character varying,
  latitude numeric,
  longitude numeric,
  website character varying,
  is_active boolean NOT NULL DEFAULT true,
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT merchants_pkey PRIMARY KEY (id),
  CONSTRAINT FK_698f612a3134c503f711479a4e5 FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.migrations (
  id integer NOT NULL DEFAULT nextval('migrations_id_seq'::regclass),
  timestamp bigint NOT NULL,
  name character varying NOT NULL,
  CONSTRAINT migrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT FK_9263386c35b6b242540f9493b00 FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT FK_145532db85752b29c57d2b7b1f1 FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text NOT NULL DEFAULT 'PENDING'::text,
  total_amount numeric NOT NULL DEFAULT '0'::numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  total_items integer NOT NULL DEFAULT 0,
  group_id uuid,
  leader_id uuid NOT NULL,
  group_ip uuid,
  address_id uuid,
  address_ip uuid,
  leader_ip uuid,
  payment_type_id uuid NOT NULL,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT FK_6420df7a9dc858a12d1c3f12416 FOREIGN KEY (payment_type_id) REFERENCES public.payment_types(id),
  CONSTRAINT FK_6a648e7450e6be2eddfefe79c0c FOREIGN KEY (address_ip) REFERENCES public.user_addresses(id),
  CONSTRAINT FK_6a4e2e91f771d5c19e0ae10252b FOREIGN KEY (leader_ip) REFERENCES public.users(id),
  CONSTRAINT FK_f6828c894e0e6c5733452cfc5f2 FOREIGN KEY (group_ip) REFERENCES public.groups(id)
);
CREATE TABLE public.payment_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  description character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  amount_paid numeric NOT NULL,
  transaction_hash text,
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT FK_b2f7b823a21562eeca20e72b006 FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT FK_427785468fb7d2733f59e7d7d39 FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.prize_redemptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text NOT NULL,
  redemption_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  userId uuid,
  prizeId uuid,
  CONSTRAINT prize_redemptions_pkey PRIMARY KEY (id),
  CONSTRAINT FK_7c40bfd9517df0aa875026703b5 FOREIGN KEY (userId) REFERENCES public.users(id),
  CONSTRAINT FK_7704b2cd9e65abdea8def84e12a FOREIGN KEY (prizeId) REFERENCES public.prizes(id)
);
CREATE TABLE public.prizes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  cost numeric NOT NULL,
  image_url text,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT prizes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recycle_prices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  material_type character varying NOT NULL,
  becoin_value numeric NOT NULL DEFAULT '0'::numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recycle_prices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.recycled_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  product_id uuid NOT NULL,
  scanned_by_user_id uuid NOT NULL,
  CONSTRAINT recycled_items_pkey PRIMARY KEY (id),
  CONSTRAINT FK_7f2b1b844405ac9bba63334035b FOREIGN KEY (scanned_by_user_id) REFERENCES public.users(id),
  CONSTRAINT FK_69d4cabd205e8c98c6f42d2edb9 FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.roles (
  role_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.transaction_states (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transaction_states_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transaction_types (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transaction_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  wallet_id uuid NOT NULL,
  type_id uuid NOT NULL,
  status_id uuid NOT NULL,
  amount numeric NOT NULL,
  post_balance numeric NOT NULL,
  related_wallet_id uuid,
  reference text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT FK_bf1cb034a93b703e528b926a75d FOREIGN KEY (type_id) REFERENCES public.transaction_types(id),
  CONSTRAINT FK_0b171330be0cb621f8d73b87a9e FOREIGN KEY (wallet_id) REFERENCES public.wallets(id),
  CONSTRAINT FK_819b9b741319d533ea9e5617eb0 FOREIGN KEY (status_id) REFERENCES public.transaction_states(id)
);
CREATE TABLE public.user_addresses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  addressLine1 character varying NOT NULL,
  addressLine2 character varying,
  city character varying NOT NULL,
  state character varying,
  country character varying NOT NULL,
  postalCode character varying,
  latitude numeric,
  longitude numeric,
  isDefault boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  deleted_at timestamp without time zone,
  CONSTRAINT user_addresses_pkey PRIMARY KEY (id),
  CONSTRAINT FK_7a5100ce0548ef27a6f1533a5ce FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_cards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  email character varying NOT NULL,
  phoneNumber character varying NOT NULL,
  documentId character varying NOT NULL,
  optionalParameter4 character varying NOT NULL,
  cardBrand character varying NOT NULL,
  cardType character varying NOT NULL,
  lastDigits integer NOT NULL,
  cardToken character varying NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_cards_pkey PRIMARY KEY (id),
  CONSTRAINT FK_fd1dbad94a6a2ccfc149c819076 FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  oauth_provider text,
  email text NOT NULL UNIQUE,
  username text,
  full_name text,
  profile_picture_url text,
  current_balance numeric DEFAULT '0'::numeric,
  role_name text NOT NULL DEFAULT 'USER'::text,
  role_id uuid,
  auth0_id text,
  address text,
  phone numeric,
  country text,
  city text,
  isblocked boolean NOT NULL DEFAULT false,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  password text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT FK_a2cecd1a3531c0b041e29ba46e1 FOREIGN KEY (role_id) REFERENCES public.roles(role_id)
);
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  address text,
  private_key_encrypted text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  alias text,
  qr text,
  becoin_balance numeric NOT NULL DEFAULT '0'::numeric,
  locked_balance numeric NOT NULL DEFAULT '0'::numeric,
  bank_account_id uuid UNIQUE,
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT FK_94dae15c154c2b28813e04750c7 FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id),
  CONSTRAINT FK_92558c08091598f7a4439586cda FOREIGN KEY (user_id) REFERENCES public.users(id)
);