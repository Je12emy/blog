---
title: "tPRC makes full stack development fun"
description: "Full-stack development sometimes feels awful, tRPC makes it so easy you won't go back"
pubDate: "Jan 23 2023"
---

Full stack development is a very interesting practice, you control what happens in both the back-end and front-end, you would think this would allow your tooling to be nicely integrated, but what actually happens is a great divide between these two spectrums. 

What I mean is, communication between your front-end and back-end isn’t entirely Type-safe. Your front-end isn’t 100% what will come back from your back-end, and in the case of Typescript front-ends you rely on typecasting.

```tsx
const response = await fetch("htttps://example.com/api/patient/1")
return await response.json() as Patient
```

There are many areas where you aren’t sure what you will get in return, for example:

- Network requests.
- Database requests
- The file system.
- User input.

There are a bunch of strategies to improve type safety like

- Code generation: Which are types generated from a source of truth like a `Graph QL` schema or an Open API definition.
- Type guards and type assertion: Which is code we write to  to check for types at runtime.

What if we could ensure type safety all the way from the back-end into our front-end? This is what `tRPC` aims to achieve. 

### What is `tRPC`?

`tRPC` allows you to define what your back-end is capable of through functions, which can then be called directly from your front-end. It is a protocol which exposes your back-end functions to your front-end, whose definitions come from typescript. To understand how it works, let’s compare it with the other types of back-ends.

With `REST` you would send a request to the corresponding end-point and then said associated function will be executed. However, you are not sure if the response will have the expected shape you expect, and you rely on type casting.

![A Rest backend](/blog-images/rest-diagram.png)

With GraphQL you do know the shape of your data, and through code-gen you are able to get type safety in your front-end. However, you have to maintain a schema which defines everything your backend is capable off.

![A GraphQL backend](/blog-images/graphql-diagram.png)

Finally, with tRPC your front-end is able to call a function in your back-end which then returns the appropriate response, Typescript ensures you will receive the correct data shape both at compile and run-time.

![A tRPC backend](/blog-images/trpc-diagram.png)

t could be said that tRPC brings together your front-end and back-end in order to provide the best possible developer experience and ergonomics, thus allowing you to ship new features as fast as possible.

### Why Should I use `tRPC`?

The beauty of `tRPC`, is that it’s just functions, which makes it the simplest way to define an API. This simplicity allows you to stay agile and ship features as fast and reliably as possible. Let’s look at some code to show you what I mean.

Consider the following Next App with a simple CRUD.

![A simple trpc CRUD app](/blog-images/patient-app-home.png)

In here, I need to implement some missing endpoints for Updating, Creating and Deleting a patient. In our back-end, we can simply define a new function which uses our `ORM`.

```tsx
export const patientRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        bloodType: bloodTypeSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.patient.create({
        data: input,
      });
    }),
});
```

There’s a bit to unpack here, but first we define this function input through a zod schema in the `input` function. Then we create resolver in the `mutation` function, which has access to the input and a context object. This may not look too special until now, but how does this look like in the front-end?

```tsx
type Props = {
  onClose: () => void;
};

export const CreatePatient: FC<Props> = ({ onClose: handleClose }) => {
  const utils = api.useContext();
	//                            v You call the function directly
  const createPatientMutation = api.patient.create.useMutation({
    onSuccess: () => {
      utils.patient.all.invalidate();
      handleClose();
    },
  });

  return (
    <>
      <SidePanelWithBackDrop title="Create Patient" onClose={handleClose}>
        <div className="m-4">
          <PatientForm
            onSubmit={(data) => {
              createPatientMutation.mutate(data);
            }}
          />
        </div>
      </SidePanelWithBackDrop>
    </>
  );
};
```

Notice how we don’t have to deal with `fetch` nor calling our generated schema with a GraphQL client. We simply call this function using an included [wrapper](https://trpc.io/docs/react-query) around [Tanstack Query](https://tanstack.com/query/latest).


![A simple trpc CRUD app "create patient" view](/blog-images/patient-app-create.png)

### When should/could I use `tRPC`?

Generally peaking, there are some good and bad use cases for `tRPC`.

Use `tRPC` when:

- You are already using a Typescript back-end and front-end.
    - Take into consideration if Node is a good fit for your type of workload, IO workloads are ideal.
    - On mono repositories, you can share this types easily.
- On fast and agile teams, where you don’t want the overhead of maintaining a schema in order to achieve type safety.
- The people who write the back-end are also the people who consume it.

Don’t use `tRPC` when:

- You are already invested in `GraphQL`.
- Your front-end and back-end teams are separated by choice.
    - This is a great use case for `GraphQL`.
- Your front-end and back-end teams use different programming languages.
- You have to deal with nested and recursive data.
- You need some sort of microservice communication.
- You want to deploy a public API’s.
    - It is tailored for private consumption mostly.
        - Still, there are packages to generate an Open API spec.

Consider `tRPC` just another tool under your arsenal, it isn’t a silver bullet for all your problems. It aims to solve some specific use cases where Graph QL and REST don’t deliver.
