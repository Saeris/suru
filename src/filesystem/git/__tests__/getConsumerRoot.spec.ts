import path from "path";
import { getConsumerRoot } from "../getConsumerRoot";

describe(`consumerRoot`, () => {
  it(`returns the consumer's root directory`, async () => {
    const root = await getConsumerRoot(); //?
    expect(root.endsWith(`suru`)).toBeTruthy();
    const notRootDir = jest
      .spyOn(process, `cwd`)
      .mockReturnValue(path.join(process.cwd(), `/src/commands`));
    process.cwd(); //?
    const calledOutsideOfRoot = await getConsumerRoot(); //?
    expect(calledOutsideOfRoot.endsWith(`suru`)).toBeTruthy();
    notRootDir.mockRestore();
  });
});
