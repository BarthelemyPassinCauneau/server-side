export function FetchServerColumnData(API) {
    return new Promise((resolve, reject) => {
        fetch(API)
            .then(res => res.json())
            .then(res => resolve(res));
    });
}