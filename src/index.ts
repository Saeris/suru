import { Builtins, Cli } from "clipanion";
import { Check } from "./commands/check";
import { Convert } from "./commands/convert";
import { Find } from "./commands/find";
import { Lint } from "./commands/lint";
import { Pack } from "./commands/pack";
import { Test } from "./commands/test";

const cli = new Cli({
  binaryLabel: `suru`,
  binaryName: `suru`,
  binaryVersion: `1.0.0`,
  enableCapture: true
});

cli.register(Check);
cli.register(Convert);
cli.register(Find);
cli.register(Lint);
cli.register(Pack);
cli.register(Test);

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.VersionCommand);
cli.register(Builtins.HelpCommand);

export { cli };
