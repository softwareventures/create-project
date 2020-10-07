import {argv, cwd} from "process";
import {last} from "@softwareventures/array";
import {Command} from "commander";
import {name, version} from "../package.json";
import {cliInit} from "./init";

export default function cli(): void {
    const program = new Command()
        .storeOptionsAsProperties(false)
        .passCommandToAction(false)
        .name(last(name.split("/")) ?? "")
        .version(version);

    program
        .command("init [destination]")
        .option("--scope <scope>")
        .option("--name <name>")
        .option("--github-owner <owner>")
        .option("--github-project <name>")
        .option("--webapp")
        .action((destination, options) => cliInit(destination ?? cwd(), options));

    program.parse(argv);
}
