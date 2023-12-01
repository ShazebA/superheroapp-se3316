export function validateInput(input) {
    return input && input.trim().length > 0;
}

export function validateHeroIds(input) {
    if (!input || input.trim().length === 0) {
        return false;
    }

    const ids = input.split(',');
    for (let id of ids) {
        id = id.trim();
        if (!id.match(/^\d+$/)) {
            return false;
        }
    }
    return true;
}