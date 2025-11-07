import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Appointment_Key {
  id: UUIDString;
  __typename?: 'Appointment_Key';
}

export interface Clinic_Key {
  id: UUIDString;
  __typename?: 'Clinic_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface Doctor_Key {
  id: UUIDString;
  __typename?: 'Doctor_Key';
}

export interface GetDoctorData {
  doctor?: {
    id: UUIDString;
    bio?: string | null;
    specialty: string;
  } & Doctor_Key;
}

export interface ListServicesData {
  services: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    durationMinutes: number;
  } & Service_Key)[];
}

export interface MedicalRecord_Key {
  id: UUIDString;
  __typename?: 'MedicalRecord_Key';
}

export interface Service_Key {
  id: UUIDString;
  __typename?: 'Service_Key';
}

export interface UpdateAppointmentNotesData {
  appointment_update?: Appointment_Key | null;
}

export interface UpdateAppointmentNotesVariables {
  id: UUIDString;
  notes?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetDoctorRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetDoctorData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetDoctorData, undefined>;
  operationName: string;
}
export const getDoctorRef: GetDoctorRef;

export function getDoctor(): QueryPromise<GetDoctorData, undefined>;
export function getDoctor(dc: DataConnect): QueryPromise<GetDoctorData, undefined>;

interface UpdateAppointmentNotesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentNotesVariables): MutationRef<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAppointmentNotesVariables): MutationRef<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
  operationName: string;
}
export const updateAppointmentNotesRef: UpdateAppointmentNotesRef;

export function updateAppointmentNotes(vars: UpdateAppointmentNotesVariables): MutationPromise<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
export function updateAppointmentNotes(dc: DataConnect, vars: UpdateAppointmentNotesVariables): MutationPromise<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;

interface ListServicesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListServicesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListServicesData, undefined>;
  operationName: string;
}
export const listServicesRef: ListServicesRef;

export function listServices(): QueryPromise<ListServicesData, undefined>;
export function listServices(dc: DataConnect): QueryPromise<ListServicesData, undefined>;

