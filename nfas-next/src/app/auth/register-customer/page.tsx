'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface FormData {
  first_name: string; last_name: string; email: string
  telephone: string; address_line1: string; address_line2: string
  town: string; postcode: string; password: string; confirm_password: string
}

const INIT: FormData = { first_name:'',last_name:'',email:'',telephone:'',address_line1:'',address_line2:'',town:'',postcode:'',password:'',confirm_password:'' }

export default function RegisterCustomerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState<FormData>(INIT)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs: string[] = []
    if (!form.first_name) errs.push('First name is required.')
    if (!form.last_name)  errs.push('Last name is required.')
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.push('A valid email is required.')
    if (!form.telephone)  errs.push('Telephone is required.')
    if (!form.address_line1) errs.push('Address is required.')
    if (!form.town)       errs.push('Town / City is required.')
    if (!form.postcode)   errs.push('Postcode is required.')
    if (form.password.length < 8) errs.push('Password must be at least 8 characters.')
    if (form.password !== form.confirm_password) errs.push('Passwords do not match.')
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (errs.length) { setErrors(errs); return }
    setLoading(true); setErrors([])

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: 'customer',
          first_name: form.first_name,
          last_name: form.last_name,
        }
      }
    })

    if (error) { setErrors([error.message]); setLoading(false); return }
    if (!data.user) { setErrors(['Something went wrong. Please try again.']); setLoading(false); return }

    // Save extra profile data
    await supabase.from('profiles').update({
      telephone: form.telephone,
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      town: form.town,
      postcode: form.postcode.toUpperCase(),
    }).eq('id', data.user.id)

    router.push('/dashboard/customer')
    router.refresh()
    // Fire welcome email (non-blocking)
    fetch('/api/auth/register', { method: 'POST' }).catch(() => {})
  }

  const Field = ({ label, name, type='text', placeholder='', required=false }: { label:string; name:keyof FormData; type?:string; placeholder?:string; required?:boolean }) => (
    <div>
      <label className="block text-sm font-semibold text-brand-navy mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} value={form[name]} onChange={set(name)} required={required} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-brand-navy">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="font-heading text-white font-extrabold text-lg tracking-tight">
            National <span className="text-brand-amber">Flatpack</span> Assembly
          </Link>
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors">Already have an account? Log in →</Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-5 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-brand-navy mb-2">Create your account</h1>
            <p className="text-sm text-gray-500">Post jobs and track your assembly requests.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {errors.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                <ul className="space-y-1">
                  {errors.map((e,i) => <li key={i} className="text-sm text-red-700">• {e}</li>)}
                </ul>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" name="first_name" required />
                <Field label="Last Name"  name="last_name"  required />
              </div>
              <Field label="Email Address" name="email" type="email" placeholder="you@example.com" required />
              <Field label="Telephone"    name="telephone" type="tel" placeholder="07700 900000" required />
              <Field label="Address Line 1" name="address_line1" required />
              <Field label="Address Line 2 (optional)" name="address_line2" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Town / City" name="town" required />
                <Field label="Postcode"    name="postcode" required />
              </div>
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3">
                <Field label="Password"         name="password"         type="password" required />
                <Field label="Confirm Password" name="confirm_password" type="password" required />
              </div>
              <p className="text-xs text-gray-400">Minimum 8 characters.</p>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-brand-amber text-brand-navy hover:bg-amber-400 transition-colors disabled:opacity-60 mt-2">
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Are you a fitter?{' '}
            <Link href="/auth/register-fitter" className="font-semibold text-brand-navy hover:underline">Register as a fitter →</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
