-- ============================================================
-- NFAS Seed Data
-- Run after the main migration to populate inventory + packs
-- ============================================================

-- ── Inventory Items ──────────────────────────────────────────

insert into inventory_items (name, category, base_time_min, base_price, sort_order) values
  -- Wardrobes
  ('IKEA PAX Frame (Standard)',  'Wardrobe', 45, 35.00, 1),
  ('IKEA PAX Frame (Corner)',    'Wardrobe', 60, 45.00, 2),
  ('IKEA PAX Frame 236cm',       'Wardrobe', 50, 40.00, 3),
  ('2-Door Wardrobe (Other)',    'Wardrobe', 60, 40.00, 4),
  ('3-Door Wardrobe (Other)',    'Wardrobe', 75, 55.00, 5),
  ('Sliding Door Wardrobe',      'Wardrobe', 90, 65.00, 6),

  -- Beds
  ('Single Bed Frame',           'Bed Frame', 45, 35.00, 1),
  ('Double Bed Frame',           'Bed Frame', 50, 40.00, 2),
  ('King Size Bed Frame',        'Bed Frame', 60, 50.00, 3),
  ('Ottoman Bed Frame',          'Bed Frame', 75, 60.00, 4),
  ('Bunk Bed',                   'Bed Frame', 90, 65.00, 5),
  ('Cabin Bed / Mid Sleeper',    'Bed Frame', 80, 60.00, 6),

  -- Chest of Drawers / Dressers
  ('3-Drawer Chest',             'Chest of Drawers', 30, 25.00, 1),
  ('4-Drawer Chest',             'Chest of Drawers', 35, 28.00, 2),
  ('5-Drawer Chest',             'Chest of Drawers', 40, 32.00, 3),
  ('IKEA HEMNES (6 drawers)',    'Chest of Drawers', 50, 38.00, 4),
  ('IKEA MALM (6 drawers)',      'Chest of Drawers', 45, 35.00, 5),

  -- Shelving
  ('IKEA KALLAX (1x4)',          'Shelving & Storage', 25, 20.00, 1),
  ('IKEA KALLAX (2x2)',          'Shelving & Storage', 25, 20.00, 2),
  ('IKEA KALLAX (2x4)',          'Shelving & Storage', 35, 28.00, 3),
  ('IKEA KALLAX (4x4)',          'Shelving & Storage', 50, 40.00, 4),
  ('IKEA BILLY Bookcase',        'Shelving & Storage', 25, 20.00, 5),
  ('Freestanding Bookcase',      'Shelving & Storage', 30, 22.00, 6),
  ('Wall-Mounted Shelving Unit', 'Shelving & Storage', 45, 35.00, 7),

  -- Desks & Office
  ('Computer Desk (Straight)',   'Desk & Office', 30, 25.00, 1),
  ('Corner Desk (L-shaped)',     'Desk & Office', 50, 40.00, 2),
  ('Standing Desk',              'Desk & Office', 45, 35.00, 3),
  ('Office Chair',               'Desk & Office', 20, 15.00, 4),
  ('Pedestal / Filing Cabinet',  'Desk & Office', 20, 15.00, 5),

  -- Dining
  ('Dining Table (4-seater)',    'Dining & Living', 45, 35.00, 1),
  ('Dining Table (6-seater)',    'Dining & Living', 55, 45.00, 2),
  ('Dining Chair (each)',        'Dining & Living', 10,  8.00, 3),
  ('TV Unit / Media Cabinet',    'Dining & Living', 35, 28.00, 4),
  ('Sideboard / Buffet Unit',    'Dining & Living', 40, 32.00, 5),
  ('Coffee Table',               'Dining & Living', 20, 15.00, 6),

  -- Kitchen
  ('Base Cabinet (each)',        'Kitchen', 25, 20.00, 1),
  ('Wall Cabinet (each)',        'Kitchen', 20, 16.00, 2),
  ('Tall Larder / Pantry Unit',  'Kitchen', 40, 30.00, 3),
  ('Kitchen Island',             'Kitchen', 60, 50.00, 4);

-- ── Credit Packs ─────────────────────────────────────────────

insert into credit_packs (name, credits, price_pence, badge, is_one_time, sort_order) values
  ('Starter Pack',  1,  250,  null,         true,  1),  -- £2.50 intro
  ('Basic',         5, 1000,  null,         false, 2),  -- £10 = £2/credit
  ('Value',        10, 1750,  'Best Value', false, 3),  -- £17.50 = £1.75/credit
  ('Professional', 25, 3750,  null,         false, 4),  -- £37.50 = £1.50/credit
  ('Trade',        50, 6000,  'Trade',      false, 5);  -- £60 = £1.20/credit
