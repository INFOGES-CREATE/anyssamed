# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetDoctor*](#getdoctor)
  - [*ListServices*](#listservices)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateAppointmentNotes*](#updateappointmentnotes)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetDoctor
You can execute the `GetDoctor` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getDoctor(): QueryPromise<GetDoctorData, undefined>;

interface GetDoctorRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetDoctorData, undefined>;
}
export const getDoctorRef: GetDoctorRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDoctor(dc: DataConnect): QueryPromise<GetDoctorData, undefined>;

interface GetDoctorRef {
  ...
  (dc: DataConnect): QueryRef<GetDoctorData, undefined>;
}
export const getDoctorRef: GetDoctorRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDoctorRef:
```typescript
const name = getDoctorRef.operationName;
console.log(name);
```

### Variables
The `GetDoctor` query has no variables.
### Return Type
Recall that executing the `GetDoctor` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDoctorData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetDoctorData {
  doctor?: {
    id: UUIDString;
    bio?: string | null;
    specialty: string;
  } & Doctor_Key;
}
```
### Using `GetDoctor`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDoctor } from '@dataconnect/generated';


// Call the `getDoctor()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDoctor();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDoctor(dataConnect);

console.log(data.doctor);

// Or, you can use the `Promise` API.
getDoctor().then((response) => {
  const data = response.data;
  console.log(data.doctor);
});
```

### Using `GetDoctor`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDoctorRef } from '@dataconnect/generated';


// Call the `getDoctorRef()` function to get a reference to the query.
const ref = getDoctorRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDoctorRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.doctor);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.doctor);
});
```

## ListServices
You can execute the `ListServices` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listServices(): QueryPromise<ListServicesData, undefined>;

interface ListServicesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListServicesData, undefined>;
}
export const listServicesRef: ListServicesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listServices(dc: DataConnect): QueryPromise<ListServicesData, undefined>;

interface ListServicesRef {
  ...
  (dc: DataConnect): QueryRef<ListServicesData, undefined>;
}
export const listServicesRef: ListServicesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listServicesRef:
```typescript
const name = listServicesRef.operationName;
console.log(name);
```

### Variables
The `ListServices` query has no variables.
### Return Type
Recall that executing the `ListServices` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListServicesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListServicesData {
  services: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    durationMinutes: number;
  } & Service_Key)[];
}
```
### Using `ListServices`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listServices } from '@dataconnect/generated';


// Call the `listServices()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listServices();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listServices(dataConnect);

console.log(data.services);

// Or, you can use the `Promise` API.
listServices().then((response) => {
  const data = response.data;
  console.log(data.services);
});
```

### Using `ListServices`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listServicesRef } from '@dataconnect/generated';


// Call the `listServicesRef()` function to get a reference to the query.
const ref = listServicesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listServicesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.services);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.services);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateAppointmentNotes
You can execute the `UpdateAppointmentNotes` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateAppointmentNotes(vars: UpdateAppointmentNotesVariables): MutationPromise<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;

interface UpdateAppointmentNotesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAppointmentNotesVariables): MutationRef<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
}
export const updateAppointmentNotesRef: UpdateAppointmentNotesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAppointmentNotes(dc: DataConnect, vars: UpdateAppointmentNotesVariables): MutationPromise<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;

interface UpdateAppointmentNotesRef {
  ...
  (dc: DataConnect, vars: UpdateAppointmentNotesVariables): MutationRef<UpdateAppointmentNotesData, UpdateAppointmentNotesVariables>;
}
export const updateAppointmentNotesRef: UpdateAppointmentNotesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAppointmentNotesRef:
```typescript
const name = updateAppointmentNotesRef.operationName;
console.log(name);
```

### Variables
The `UpdateAppointmentNotes` mutation requires an argument of type `UpdateAppointmentNotesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAppointmentNotesVariables {
  id: UUIDString;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `UpdateAppointmentNotes` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAppointmentNotesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAppointmentNotesData {
  appointment_update?: Appointment_Key | null;
}
```
### Using `UpdateAppointmentNotes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentNotes, UpdateAppointmentNotesVariables } from '@dataconnect/generated';

// The `UpdateAppointmentNotes` mutation requires an argument of type `UpdateAppointmentNotesVariables`:
const updateAppointmentNotesVars: UpdateAppointmentNotesVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `updateAppointmentNotes()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAppointmentNotes(updateAppointmentNotesVars);
// Variables can be defined inline as well.
const { data } = await updateAppointmentNotes({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAppointmentNotes(dataConnect, updateAppointmentNotesVars);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
updateAppointmentNotes(updateAppointmentNotesVars).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

### Using `UpdateAppointmentNotes`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAppointmentNotesRef, UpdateAppointmentNotesVariables } from '@dataconnect/generated';

// The `UpdateAppointmentNotes` mutation requires an argument of type `UpdateAppointmentNotesVariables`:
const updateAppointmentNotesVars: UpdateAppointmentNotesVariables = {
  id: ..., 
  notes: ..., // optional
};

// Call the `updateAppointmentNotesRef()` function to get a reference to the mutation.
const ref = updateAppointmentNotesRef(updateAppointmentNotesVars);
// Variables can be defined inline as well.
const ref = updateAppointmentNotesRef({ id: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAppointmentNotesRef(dataConnect, updateAppointmentNotesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.appointment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.appointment_update);
});
```

