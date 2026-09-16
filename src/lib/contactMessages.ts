import { supabase, isSupabaseConfigured } from './supabase';
import { affectedRows } from './supabaseService';

// ----------------------------------------------------------------------
// CONTACT MESSAGES (written by /api/contact, managed from the AdminPanel)
// Kept out of supabaseService so it ships in the lazily loaded admin chunk
// instead of the bundle every visitor downloads.
// ----------------------------------------------------------------------

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  message: string;
  language: 'es' | 'en' | null;
  email_sent: boolean;
  is_read: boolean;
  created_at: string;
}

export async function fetchContactMessages(): Promise<ContactMessage[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, project_type, message, language, email_sent, is_read, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Error fetching contact messages:', error);
    return null;
  }
  return data as ContactMessage[];
}

export async function setContactMessageRead(id: string, isRead: boolean): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const { data, error } = await supabase
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', id)
    .select('id');
  if (error) {
    console.error('Error updating contact message:', error);
    return false;
  }
  return affectedRows('Update contact message', data);
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  const { data, error } = await supabase.from('contact_messages').delete().eq('id', id).select('id');
  if (error) {
    console.error('Error deleting contact message:', error);
    return false;
  }
  return affectedRows('Delete contact message', data);
}
