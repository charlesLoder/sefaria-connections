const deepFlatten = arr => [].concat(...arr.map(v => (Array.isArray(v) ? deepFlatten(v) : v)));

const filterData = (data, opts, type) => !!opts[type] ? data.filter(link => link[type] === opts[type]) : data;

const compare = (a, b) => {
    const sourceRefA = a.sourceRef.toUpperCase();
    const sourceRefB = b.sourceRef.toUpperCase();
    let comparison = 0;
    if (sourceRefA > sourceRefB) {
        comparison = 1;
    } else {
        comparison = -1;
    }
    return comparison;
}

export const getData = (api, ref, firstOpts, secondOpts) => {
    const firstDegLinks = api.getLinks(ref)
        .then(links => filterData(links, firstOpts, 'type'))
        .catch(err => console.log(err));
    const secDegLinks = firstDegLinks.then(links => links.map(link => api.getLinks(link.ref)))
        .then(links => Promise.all(links))
        .then(arrRefs => deepFlatten(arrRefs))
        .then(links => filterData(links, secondOpts, 'category'))
        .then(arr => arr.filter(reference => reference.ref != ref))
        .catch(err => console.error(err));
    return Promise.all([ref, firstDegLinks, secDegLinks])
}

export const sortData = (data, cb = compare) => {
    const [ref, firstDeg, secDeg] = data;
    const firstSort = firstDeg.sort(cb);
    const secSort = secDeg.sort(cb);
    return Promise.all([ref, firstSort, secSort]);
}
