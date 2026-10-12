export interface Contact extends ContactSummary {
  email?: string | null;
  phone?: string | null;
}

export interface ContactSummary {
  id: string;
  name: string;
  role: string | null;
}
