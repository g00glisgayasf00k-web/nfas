// Auto-generated types matching the Supabase schema
// Run `npm run db:types` to regenerate from your live database

export type UserRole = 'customer' | 'fitter' | 'affiliate' | 'admin'
export type JobStatus = 'open' | 'claimed' | 'closed' | 'cancelled'
export type FitterStatus = 'contacted' | 'booked' | 'completed' | 'no_response' | 'cancelled'
export type DocStatus = 'pending' | 'approved' | 'rejected'
export type ReviewerRole = 'customer' | 'fitter'

export interface Profile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  display_name: string
  email: string
  telephone: string | null
  address_line1: string | null
  address_line2: string | null
  town: string | null
  postcode: string | null
  bio: string | null
  avatar_url: string | null
  credits: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface FitterDocument {
  id: string
  fitter_id: string
  doc_type: 'public_liability' | 'dbs' | 'driving_licence' | 'photo'
  storage_path: string
  status: DocStatus
  reviewed_at: string | null
  reviewed_by: string | null
  notes: string | null
  created_at: string
}

export interface FitterArea {
  id: string
  fitter_id: string
  postcode: string
  lat: number
  lng: number
  radius_mi: number
  updated_at: string
}

export interface CreditPack {
  id: string
  name: string
  credits: number
  price_pence: number
  badge: string | null
  is_one_time: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface CreditTransaction {
  id: string
  fitter_id: string
  amount: number
  reason: 'pack_purchase' | 'lead_unlock' | 'refund' | 'admin_grant'
  job_id: string | null
  stripe_payment_intent: string | null
  created_at: string
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  base_time_min: number
  base_price: number
  is_active: boolean
  sort_order: number
}

export interface Job {
  id: string
  customer_id: string
  title: string
  status: JobStatus
  address_line1: string | null
  town: string
  postcode: string
  lat: number | null
  lng: number | null
  notes: string | null
  preferred_date: string | null
  total_items: number
  est_time_min: number
  est_price: number
  credit_cost: number
  affiliate_id: string | null
  created_at: string
  updated_at: string
}

export interface JobItem {
  id: string
  job_id: string
  inventory_id: string | null
  name: string
  quantity: number
  time_min: number
  unit_price: number
  sort_order: number
}

export interface LeadUnlock {
  id: string
  job_id: string
  fitter_id: string
  credits_spent: number
  fitter_status: FitterStatus | null
  unlocked_at: string
}

export interface Message {
  id: string
  job_id: string
  sender_id: string
  receiver_id: string
  body: string
  read_at: string | null
  created_at: string
}

export interface Review {
  id: string
  job_id: string
  reviewer_id: string
  reviewee_id: string
  reviewer_role: ReviewerRole
  rating: number
  comment: string | null
  created_at: string
}

export interface AffiliateEarning {
  id: string
  affiliate_id: string
  job_id: string
  job_value: number
  rate: number
  earned: number
  paid_at: string | null
  created_at: string
}

// ── Joined / enriched types used in the UI ──────────────────

export interface JobWithItems extends Job {
  job_items: JobItem[]
}

export interface JobWithCustomer extends Job {
  customer: Pick<Profile, 'id' | 'display_name' | 'email' | 'telephone'>
}

export interface JobWithFitter extends Job {
  lead_unlock: LeadUnlock & {
    fitter: Pick<Profile, 'id' | 'display_name' | 'email' | 'telephone' | 'avatar_url' | 'bio' | 'is_verified'>
  }
}

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
}

export interface ReviewWithReviewer extends Review {
  reviewer: Pick<Profile, 'id' | 'display_name' | 'avatar_url'>
  job: Pick<Job, 'id' | 'title'>
}

export interface FitterWithStats extends Profile {
  area: FitterArea | null
  avg_rating: number | null
  review_count: number
}

// ── Form types ───────────────────────────────────────────────

export interface PostJobFormData {
  items: Array<{
    inventory_id: string | null
    name: string
    quantity: number
    time_min: number
    unit_price: number
  }>
  address_line1: string
  town: string
  postcode: string
  use_profile_address: boolean
  notes: string
  preferred_date: string
}

export interface RegisterFitterFormData {
  first_name: string
  last_name: string
  email: string
  telephone: string
  address_line1: string
  address_line2: string
  town: string
  postcode: string
  bio: string
  password: string
  confirm_password: string
  terms_agreed: boolean
}

export interface RegisterCustomerFormData {
  first_name: string
  last_name: string
  email: string
  telephone: string
  address_line1: string
  address_line2: string
  town: string
  postcode: string
  password: string
  confirm_password: string
}
