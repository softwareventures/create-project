import {FsStage, insert, InsertResult} from "../fs-stage/fs-stage";
import {filterTemplateIgnore} from "../template/filter-ignore";
import {Project} from "../project/project";

export function writePrettierIgnore(project: Project): (fsStage: FsStage) => Promise<InsertResult> {
    return async fsStage =>
        filterTemplateIgnore(
            "prettierignore.template",
            line =>
                (line !== "/dist" || project.target === "webapp") &&
                (line !== "*.js" || project.target === "npm") &&
                (line !== "*.d.ts" || project.target === "npm") &&
                (line !== "*.js.map" || project.target === "npm") &&
                (line !== "!/types/*.d.ts" || project.target === "npm")
        ).then(file => insert(fsStage, ".prettierignore", file));
}
