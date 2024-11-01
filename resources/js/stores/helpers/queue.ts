export function createFlatQueue(
    blocks: PublicFormBlockModel[],
    parent_block: string | null = null,
): PublicFormBlockModel[] {
    return blocks
        .filter((block) => block.parent_block === parent_block)
        .flatMap((block) => {
            const queueItem = block;
            if (block.type === "group") {
                const children = blocks.filter(
                    (b) => b.parent_block === block.id,
                );
                return [queueItem, ...createFlatQueue(children, block.id)];
            }
            return [queueItem];
        });
}

type FindBlocksOptions = {
    filterGroups?: boolean;
    includeTarget?: boolean;
};

export function findAllBlocksBeforeTarget(
    tree: TreeNode[],
    targetId: string,
    options: FindBlocksOptions = {},
): FormBlockModel[] {
    const { filterGroups = true, includeTarget = false } = options;
    const result: FormBlockModel[] = [];
    let found = false;

    function traverse(node: TreeNode) {
        if (found) return;

        result.push(node.block);

        if (node.block.uuid === targetId) {
            found = true;
            return;
        }

        for (const child of node.children) {
            traverse(child);
            if (found) break;
        }
    }

    for (const rootNode of tree) {
        traverse(rootNode);
        if (found) break;
    }

    // Remove the target block if not included
    if (found && !includeTarget) {
        result.pop();
    }

    // Filter groups if needed
    return filterGroups
        ? result.filter((block) => block.type !== "group")
        : result;
}
