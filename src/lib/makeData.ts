import { faker } from "@faker-js/faker";
import { z } from "zod";

export const ZodPerson = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number(),
  registrationDate: z.date(),
});

const range = (len: number) => {
  const arr: number[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newPerson = (): z.infer<typeof ZodPerson> => {
  return {
    id: faker.database.mongodbObjectId(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: faker.number.int({ min: 16, max: 40 }),
    registrationDate: faker.date.past({ years: 2 }),
  };
};

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): z.infer<typeof ZodPerson>[] => {
    const len = lens[depth]!;
    return range(len).map((): z.infer<typeof ZodPerson> => {
      return {
        ...newPerson(),
      };
    });
  };

  return makeDataLevel();
}
