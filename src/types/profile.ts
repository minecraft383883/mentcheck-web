export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  emergencyContact: EmergencyContact;
}
