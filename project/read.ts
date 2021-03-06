import {resolve} from "path";
import chain from "@softwareventures/chain";
import {todayUtc} from "@softwareventures/date";
import {mapNullableFn, mapNullFn} from "@softwareventures/nullable";
import {gitHostFromUrl} from "../git/git-host";
import {parseAndCorrectSpdxExpression} from "../license/spdx/correct";
import {allAsyncResults, mapResultFn, Result} from "../result/result";
import {readNodeVersions, ReadNodeVersionsFailureReason} from "../node/read";
import {guessCopyrightHolder} from "../license/guess-copyright-holder";
import {statProjectFile} from "./stat-file";
import {Project} from "./project";
import {ReadJsonFailureReason, readProjectJson} from "./read-json";

export type ReadProjectResult = Result<ReadProjectFailureReason, Project>;

export type ReadProjectFailureReason = ReadJsonFailureReason | ReadNodeVersionsFailureReason;

export async function readProject(path: string): Promise<ReadProjectResult> {
    path = resolve(path);

    const project = {path};

    const packageJson = readProjectJson(project, "package.json");

    const npmPackage = packageJson
        .then(mapResultFn(packageJson => packageJson?.name ?? ""))
        .then(mapResultFn(name => /^(?:(@.*?)\/)?(.*)$/.exec(name) ?? ["", "", ""]))
        .then(mapResultFn(([_, scope, name]) => ({scope, name})));

    const gitHost = packageJson
        .then(mapResultFn(packageJson => packageJson?.repository))
        .then(mapResultFn(gitHostFromUrl));

    const target = statProjectFile(project, "webpack.config.js")
        .catch(reason => {
            if (reason.code === "ENOENT") {
                return undefined;
            } else {
                throw reason;
            }
        })
        .then(stats => (stats?.isFile() ? "webapp" : "npm"));

    const author = packageJson
        .then(mapResultFn(packageJson => packageJson?.author))
        .then(
            mapResultFn(author =>
                typeof author === "object"
                    ? {name: String(author?.name), email: String(author?.email)}
                    : typeof author === "string"
                    ? chain(/^\s*(.*?)(?:\s+<\s*(.*)\s*>)?\s*$/.exec(author) ?? []).map(
                          ([_, name, email]) => ({name, email})
                      ).value
                    : {}
            )
        );

    const spdxLicense = packageJson
        .then(
            mapResultFn(packageJson =>
                typeof packageJson?.license === "string" ? packageJson?.license : null
            )
        )
        .then(mapResultFn(mapNullableFn(parseAndCorrectSpdxExpression)))
        .then(mapResultFn(mapNullFn(() => undefined)));

    const today = todayUtc();

    const node = readNodeVersions(project, today);

    return target.then(async target =>
        allAsyncResults([npmPackage, gitHost, author, spdxLicense, node]).then(
            mapResultFn(([npmPackage, gitHost, author, spdxLicense, node]) => ({
                path,
                npmPackage,
                gitHost,
                node,
                target,
                author,
                license: {
                    spdxLicense,
                    year: today.year,
                    copyrightHolder: guessCopyrightHolder({npmPackage, gitHost, author})
                }
            }))
        )
    );
}
