import { CreateUserData, GetDoctorData, UpdateAppointmentNotesData, UpdateAppointmentNotesVariables, ListServicesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useGetDoctor(options?: useDataConnectQueryOptions<GetDoctorData>): UseDataConnectQueryResult<GetDoctorData, undefined>;
export function useGetDoctor(dc: DataConnect, options?: useDataConnectQueryOptions<GetDoctorData>): UseDataConnectQueryResult<GetDoctorData, undefined>;

export function useUpdateAppointmentNotes(options?: useDataConnectMutationOptions<UpdateAppointmentNotesData, FirebaseError, UpdateAppointmentNotesVariables>): UseDataConnectMutationResult<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
export function useUpdateAppointmentNotes(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateAppointmentNotesData, FirebaseError, UpdateAppointmentNotesVariables>): UseDataConnectMutationResult<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;

export function useListServices(options?: useDataConnectQueryOptions<ListServicesData>): UseDataConnectQueryResult<ListServicesData, undefined>;
export function useListServices(dc: DataConnect, options?: useDataConnectQueryOptions<ListServicesData>): UseDataConnectQueryResult<ListServicesData, undefined>;
