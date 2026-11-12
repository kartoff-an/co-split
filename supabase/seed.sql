-- CO-SPLIT DEVELOPMENT SEED DATA

-- 1. TEST USERS

-- LOCAL DEVELOPMENT ONLY
-- Test password for all accounts: CoSplit123!

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,

    -- User metadata
    raw_app_meta_data,
    raw_user_meta_data,

    -- Timestamps
    created_at,
    updated_at,

    -- Auth token fields: initialize as empty strings
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    reauthentication_token,
    phone_change,
    phone_change_token,

    is_sso_user,
    is_anonymous
)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'luca@cosplit.test',
    crypt('CoSplit123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Luca","name":"Luca"}'::jsonb,
    now(),
    now(),
    '', '', '', '', '', '', '', '',
    false,
    false
),
(
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'tony@cosplit.test',
    crypt('CoSplit123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Tony","name":"Tony"}'::jsonb,
    now(),
    now(),
    '', '', '', '', '', '', '', '',
    false,
    false
),
(
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'sophia@cosplit.test',
    crypt('CoSplit123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sophia","name":"Sophia"}'::jsonb,
    now(),
    now(),
    '', '', '', '', '', '', '', '',
    false,
    false
),
(
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'max@cosplit.test',
    crypt('CoSplit123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Max","name":"Max"}'::jsonb,
    now(),
    now(),
    '', '', '', '', '', '', '', '',
    false,
    false
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,

    confirmation_token = '',
    recovery_token = '',
    email_change = '',
    email_change_token_new = '',
    email_change_token_current = '',
    reauthentication_token = '',
    phone_change = '',
    phone_change_token = '',

    created_at = COALESCE(auth.users.created_at, EXCLUDED.created_at),
    updated_at = now();


-- Create email identities for password authentication.

INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"luca@cosplit.test","email_verified":true}'::jsonb,
    'email',
    now(),
    now()
),
(
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"tony@cosplit.test","email_verified":true}'::jsonb,
    'email',
    now(),
    now()
),
(
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    '{"sub":"33333333-3333-3333-3333-333333333333","email":"sophia@cosplit.test","email_verified":true}'::jsonb,
    'email',
    now(),
    now()
),
(
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    '{"sub":"44444444-4444-4444-4444-444444444444","email":"max@cosplit.test","email_verified":true}'::jsonb,
    'email',
    now(),
    now()
)
ON CONFLICT (provider_id, provider) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    identity_data = EXCLUDED.identity_data,
    created_at = COALESCE(
        auth.identities.created_at,
        EXCLUDED.created_at
    ),
    updated_at = now();


-- Ensure public profiles exist.
-- Safe whether or not the auth trigger is installed.

INSERT INTO public.user_profiles (
    id,
    display_name,
    email
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Luca',
    'luca@cosplit.test'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Tony',
    'tony@cosplit.test'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Sophia',
    'sophia@cosplit.test'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Max',
    'max@cosplit.test'
)
ON CONFLICT (id) DO UPDATE
SET
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email;


-- 2. WORKSPACES

INSERT INTO public.workspaces (
    id,
    name,
    owner_id,
    allowed_members,
    currency
)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Apartment',
    '11111111-1111-1111-1111-111111111111',
    10,
    'PHP'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Bohol Trip',
    '22222222-2222-2222-2222-222222222222',
    10,
    'PHP'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Weekend Crew',
    '33333333-3333-3333-3333-333333333333',
    10,
    'PHP'
)
ON CONFLICT (id) DO NOTHING;


-- 3. WORKSPACE MEMBERS

-- Apartment: Luca, Tony, Sophia, Max
-- Bohol Trip: Luca, Tony, Max
-- Weekend Crew: Sophia, Max

INSERT INTO public.members (
    workspace_id,
    user_id
)
VALUES
-- Apartment
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444'
),

-- Bohol Trip
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444'
),

-- Weekend Crew
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444'
)
ON CONFLICT (workspace_id, user_id) DO NOTHING;


-- 4. EXPENSES

-- Apartment expenses
-- Members: Luca, Tony, Sophia, Max

INSERT INTO public.expenses (
    workspace_id,
    description,
    amount,
    category,
    paid_by,
    created_by,
    split_members,
    timestamp
)
VALUES

-- 1. Luca pays groceries, shared by everyone
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Weekly groceries',
    1850.00,
    'Food',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '14 days'
),

-- 2. Tony pays electricity
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Electricity bill',
    3200.00,
    'Utilities',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '13 days'
),

-- 3. Sophia pays internet, Luca records it
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Monthly internet',
    1499.00,
    'Utilities',
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '12 days'
),

-- 4. Max pays cleaning supplies
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Cleaning supplies',
    650.00,
    'Household',
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '11 days'
),

-- 5. Sophia pays for dinner, shared by everyone
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Friday night dinner',
    2400.00,
    'Food',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '10 days'
),

-- 6. Luca pays water bill, Tony records it
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Water bill',
    420.00,
    'Utilities',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '9 days'
),

-- Bohol Trip expenses
-- Members: Luca, Tony, Max

-- 7. Tony pays accommodation
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Bohol accommodation',
    7800.00,
    'Travel',
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '8 days'
),

-- 8. Max pays ferry tickets, Luca records it
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Ferry tickets',
    2250.00,
    'Transportation',
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '7 days'
),

-- 9. Luca pays fuel
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Road trip fuel',
    1600.00,
    'Transportation',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '6 days'
),

-- 10. Tony pays lunch, Max records it
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Lunch at seaside restaurant',
    1350.00,
    'Food',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '5 days'
),

-- 11. Max pays attraction tickets
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Island hopping tickets',
    900.00,
    'Entertainment',
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    ARRAY[
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '4 days'
),

-- Weekend Crew expenses
-- Members: Sophia, Max

-- 12. Sophia pays brunch
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Weekend brunch',
    1850.00,
    'Food',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    ARRAY[
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '3 days'
),

-- 13. Max pays coffee, Sophia records it
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Coffee and dessert',
    540.00,
    'Food',
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    ARRAY[
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '2 days'
),

-- 14. Sophia pays groceries, Max records it
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Snacks and groceries',
    2200.00,
    'Food',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    ARRAY[
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now() - interval '1 day'
),

-- 15. Max pays taxi
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Taxi fare',
    760.00,
    'Transportation',
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    ARRAY[
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    ]::uuid[],
    now()
);


-- END OF CO-SPLIT SEED DATA
