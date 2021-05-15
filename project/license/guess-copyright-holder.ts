import {ProjectOptions} from "../project";

const byUsername = new Map([
    ["softwareventures", "Software Ventures Limited"],
    ["eccosolutions", "ecco solutions ltd"]
]);

export function guessCopyrightHolder(options: ProjectOptions): string | undefined {
    return (
        options.copyrightHolder ??
        byUsername.get(options.npmPackage?.scope ?? "") ??
        byUsername.get(options.gitHost?.user ?? "") ??
        options.author?.name
    );
}
